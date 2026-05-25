<?php
// ══════════════════════════════════════════════
// admin_api.php — TanimBase Admin API (roots_db)
//
// Receives multipart/form-data via $_POST + $_FILES
// Action routed via ?action= query string
// ══════════════════════════════════════════════

// Suppress notices/warnings so they don't corrupt JSON
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'db.php';

$action = trim($_GET['action'] ?? '');

if (!$action) {
    echo json_encode(['success' => false, 'error' => 'No action specified.']);
    exit;
}

// ══════════════════════════════════════════════
// IMAGE UPLOAD
// ══════════════════════════════════════════════
function handleImageUpload() {
    if (empty($_FILES['image']['name'])) return null;

    $file    = $_FILES['image'];
    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $maxSize = 5 * 1024 * 1024;

    if (!in_array($file['type'], $allowed))
        return ['error' => 'Invalid file type. Use JPG, PNG, WEBP, or GIF.'];

    if ($file['size'] > $maxSize)
        return ['error' => 'File too large. Max 5MB.'];

    $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $base     = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename = strtolower($base) . '.' . $ext;
    $dir      = 'uploads/plants/';

    if (!is_dir($dir)) mkdir($dir, 0755, true);

    if (!move_uploaded_file($file['tmp_name'], $dir . $filename))
        return ['error' => 'Failed to save uploaded file.'];

    return $filename;
}

function deleteImage($filename) {
    if (!$filename) return;
    $path = 'uploads/plants/' . $filename;
    if (file_exists($path)) unlink($path);
}

// ══════════════════════════════════════════════
// HELPER: POST value with fallback
// ══════════════════════════════════════════════
function post($key, $default = '') {
    return isset($_POST[$key]) ? trim($_POST[$key]) : $default;
}

// ══════════════════════════════════════════════
// HELPER: Save tags → plant_category_map
// ══════════════════════════════════════════════
function saveTags($conn, $plantId, $tagsCsv) {
    // Delete existing
    $del = mysqli_prepare($conn, 'DELETE FROM plant_category_map WHERE plant_id = ?');
    mysqli_stmt_bind_param($del, 'i', $plantId);
    mysqli_stmt_execute($del);

    if (!$tagsCsv) return;

    $tags = array_filter(array_map('trim', explode(',', $tagsCsv)));
    foreach ($tags as $tag) {
        // Get categoryID
        $s = mysqli_prepare($conn, 'SELECT categoryID FROM plant_categories WHERE tag = ?');
        mysqli_stmt_bind_param($s, 's', $tag);
        mysqli_stmt_execute($s);
        $row = mysqli_fetch_assoc(mysqli_stmt_get_result($s));
        if (!$row) continue;

        $ins = mysqli_prepare($conn,
            'INSERT IGNORE INTO plant_category_map (plant_id, categoryID) VALUES (?, ?)'
        );
        mysqli_stmt_bind_param($ins, 'ii', $plantId, $row['categoryID']);
        mysqli_stmt_execute($ins);
    }
}

// ══════════════════════════════════════════════
// HELPER: Upsert plant_content
// ══════════════════════════════════════════════
function saveContent($conn, $plantId) {
    $desc = post('description');

    // Parse uses — one per line → JSON array
    $usesLines = array_values(array_filter(
        array_map('trim', explode("\n", post('uses')))
    ));
    $usesJson = json_encode($usesLines, JSON_UNESCAPED_UNICODE);

    $s = mysqli_prepare($conn,
        'INSERT INTO plant_content (plant_id, description, uses)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description), uses = VALUES(uses)'
    );
    mysqli_stmt_bind_param($s, 'iss', $plantId, $desc, $usesJson);
    mysqli_stmt_execute($s);
}

// ══════════════════════════════════════════════
// HELPER: Upsert plant_care_simple
// ══════════════════════════════════════════════
function saveCareSimple($conn, $plantId) {
    $water      = post('care_water');
    $light      = post('care_light');
    $soil       = post('care_soil');
    $growth     = post('care_growth');
    $difficulty = post('care_difficulty');

    // difficulty must be null (not empty string) for ENUM column
    $validDiff = ['Very easy', 'Easy', 'Moderate', 'Hard'];
    $diff      = in_array($difficulty, $validDiff) ? $difficulty : null;

    // Store null-safe in a variable — mysqli bind_param requires references
    $diffBind = $diff;

    $s = mysqli_prepare($conn,
        'INSERT INTO plant_care_simple (plant_id, water, light, soil, growth, difficulty)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           water      = VALUES(water),
           light      = VALUES(light),
           soil       = VALUES(soil),
           growth     = VALUES(growth),
           difficulty = VALUES(difficulty)'
    );
    mysqli_stmt_bind_param($s, 'isssss', $plantId, $water, $light, $soil, $growth, $diffBind);
    mysqli_stmt_execute($s);
}

// ══════════════════════════════════════════════
// HELPER: Upsert plant_care_guide
// ══════════════════════════════════════════════
function saveCareGuide($conn, $plantId) {
    $planting    = post('care_planting');
    $watering    = post('care_watering');
    $pruning     = post('care_pruning');
    $fertilizing = post('care_fertilizing');

    $s = mysqli_prepare($conn,
        'INSERT INTO plant_care_guide (plant_id, planting, watering, pruning, fertilizing)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           planting    = VALUES(planting),
           watering    = VALUES(watering),
           pruning     = VALUES(pruning),
           fertilizing = VALUES(fertilizing)'
    );
    mysqli_stmt_bind_param($s, 'issss', $plantId, $planting, $watering, $pruning, $fertilizing);
    mysqli_stmt_execute($s);
}

// ══════════════════════════════════════════════
// ACTION: ADD
// ══════════════════════════════════════════════
if ($action === 'add') {

    $localName = post('local_name');
    if (!$localName) {
        echo json_encode(['success' => false, 'error' => 'Local name is required.']);
        exit;
    }

    // Image
    $imgResult = handleImageUpload();
    if (is_array($imgResult)) {
        echo json_encode(['success' => false, 'error' => $imgResult['error']]);
        exit;
    }
    $image = $imgResult; // filename or null

    // Insert plant_info
    $s = mysqli_prepare($conn,
        'INSERT INTO plant_info
            (local_name, sci_name, family, also_known, emoji, image,
             regions, height, lifespan, flower_color, harvest_time, warnings, video_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    $sciName     = post('sci_name');
    $family      = post('family');
    $alsoKnown   = post('also_known');
    $emoji       = post('emoji') ?: '🌿';
    $regions     = post('regions');
    $height      = post('height');
    $lifespan    = post('lifespan');
    $flowerColor = post('flower_color');
    $harvestTime = post('harvest_time');
    $warnings    = post('warnings');
    $videoUrl    = post('video_url');

    mysqli_stmt_bind_param($s, 'sssssssssssss',
        $localName, $sciName, $family, $alsoKnown,
        $emoji, $image,
        $regions, $height, $lifespan, $flowerColor, $harvestTime, $warnings, $videoUrl
    );

    if (!mysqli_stmt_execute($s)) {
        deleteImage($image);
        $errno = mysqli_stmt_errno($s);
        $err   = $errno === 1062
            ? "A plant named \"$localName\" already exists."
            : mysqli_stmt_error($s);
        echo json_encode(['success' => false, 'error' => $err]);
        exit;
    }

    $newId = mysqli_insert_id($conn);

    saveTags($conn, $newId, post('tags'));
    saveContent($conn, $newId);
    saveCareSimple($conn, $newId);
    saveCareGuide($conn, $newId);

    echo json_encode(['success' => true, 'id' => $newId]);

// ══════════════════════════════════════════════
// ACTION: UPDATE
// ══════════════════════════════════════════════
} elseif ($action === 'update') {

    $id = (int) post('id');
    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'Missing plant ID.']);
        exit;
    }

    // Image
    $imgResult = handleImageUpload();
    if (is_array($imgResult)) {
        echo json_encode(['success' => false, 'error' => $imgResult['error']]);
        exit;
    }
    $newImage = $imgResult;

    // Delete old image if replaced
    if ($newImage) {
        $fs = mysqli_prepare($conn, 'SELECT image FROM plant_info WHERE plant_id = ?');
        mysqli_stmt_bind_param($fs, 'i', $id);
        mysqli_stmt_execute($fs);
        $old = mysqli_fetch_assoc(mysqli_stmt_get_result($fs));
        if ($old && $old['image']) deleteImage($old['image']);
    }

    $localName   = post('local_name');
    $sciName     = post('sci_name');
    $family      = post('family');
    $alsoKnown   = post('also_known');
    $emoji       = post('emoji') ?: '🌿';
    $regions     = post('regions');
    $height      = post('height');
    $lifespan    = post('lifespan');
    $flowerColor = post('flower_color');
    $harvestTime = post('harvest_time');
    $warnings    = post('warnings');
    $videoUrl    = post('video_url');

    if ($newImage) {
        $s = mysqli_prepare($conn,
            'UPDATE plant_info SET
                local_name=?, sci_name=?, family=?, also_known=?,
                emoji=?, image=?,
                regions=?, height=?, lifespan=?,
                flower_color=?, harvest_time=?, warnings=?, video_url=?
             WHERE plant_id=?'
        );
        mysqli_stmt_bind_param($s, 'sssssssssssssi',
            $localName, $sciName, $family, $alsoKnown,
            $emoji, $newImage,
            $regions, $height, $lifespan, $flowerColor, $harvestTime, $warnings, $videoUrl,
            $id
        );
    } else {
        $s = mysqli_prepare($conn,
            'UPDATE plant_info SET
                local_name=?, sci_name=?, family=?, also_known=?,
                emoji=?,
                regions=?, height=?, lifespan=?,
                flower_color=?, harvest_time=?, warnings=?, video_url=?
             WHERE plant_id=?'
        );
        mysqli_stmt_bind_param($s, 'ssssssssssssi',
            $localName, $sciName, $family, $alsoKnown,
            $emoji,
            $regions, $height, $lifespan, $flowerColor, $harvestTime, $warnings, $videoUrl,
            $id
        );
    }

    if (!mysqli_stmt_execute($s)) {
        if ($newImage) deleteImage($newImage);
        echo json_encode(['success' => false, 'error' => mysqli_stmt_error($s)]);
        exit;
    }

    saveTags($conn, $id, post('tags'));
    saveContent($conn, $id);
    saveCareSimple($conn, $id);
    saveCareGuide($conn, $id);

    echo json_encode(['success' => true]);

// ══════════════════════════════════════════════
// ACTION: DELETE
// CASCADE handles all child rows automatically
// ══════════════════════════════════════════════
} elseif ($action === 'delete') {

    $id = (int) ($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'Missing plant ID.']);
        exit;
    }

    // Fetch image before deleting row
    $fs = mysqli_prepare($conn, 'SELECT image FROM plant_info WHERE plant_id = ?');
    mysqli_stmt_bind_param($fs, 'i', $id);
    mysqli_stmt_execute($fs);
    $row = mysqli_fetch_assoc(mysqli_stmt_get_result($fs));

    $s = mysqli_prepare($conn, 'DELETE FROM plant_info WHERE plant_id = ?');
    mysqli_stmt_bind_param($s, 'i', $id);

    if (mysqli_stmt_execute($s)) {
        if ($row && $row['image']) deleteImage($row['image']);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_stmt_error($s)]);
    }

} else {
    echo json_encode(['success' => false, 'error' => 'Unknown action.']);
}

mysqli_close($conn);
?>