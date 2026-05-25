<?php
// ======================================================
// api/add_listing.php
// Saves a new produce listing + handles photo upload
// Method: POST (multipart/form-data)
// ======================================================
 
require_once 'db.php';
header('Content-Type: application/json');
 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}
 
// Get form fields (now using $_POST since we have file upload)
$user_id     = isset($_POST['user_id'])      ? (int)$_POST['user_id']        : 0;
$crop_name   = isset($_POST['crop_name'])    ? trim($_POST['crop_name'])      : '';
$category    = isset($_POST['category'])     ? trim($_POST['category'])       : '';
$price_per_kg= isset($_POST['price_per_kg']) ? (float)$_POST['price_per_kg'] : 0;
$quantity_kg = isset($_POST['quantity_kg'])  ? (float)$_POST['quantity_kg']  : 0;
$description = isset($_POST['description'])  ? trim($_POST['description'])    : '';
$location    = isset($_POST['location'])     ? trim($_POST['location'])       : '';
 
// Validate required fields
if (!$user_id)    { echo json_encode(['success'=>false,'message'=>'user_id is required']); exit; }
if (!$crop_name)  { echo json_encode(['success'=>false,'message'=>'Produce name is required']); exit; }
if (!$category)   { echo json_encode(['success'=>false,'message'=>'Category is required']); exit; }
if (!$price_per_kg){ echo json_encode(['success'=>false,'message'=>'Price is required']); exit; }
if (!$quantity_kg) { echo json_encode(['success'=>false,'message'=>'Quantity is required']); exit; }
 
if (!in_array($category, ['fruit','vegetable','root'])) {
    echo json_encode(['success'=>false,'message'=>'Invalid category']);
    exit;
}
 
try {
    // Verify this is a verified farmer
    $check = $pdo->prepare("SELECT id FROM core_users WHERE id = ? AND role = 'farmer' AND is_verified = 1");
    $check->execute([$user_id]);
    if (!$check->fetch()) {
        echo json_encode(['success'=>false,'message'=>'Only DA-verified farmers can post listings']);
        exit;
    }
 
    // Handle photo upload
    $image_url = '';
 
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $file     = $_FILES['photo'];
        $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed  = ['jpg','jpeg','png','webp'];
 
        if (!in_array($ext, $allowed)) {
            echo json_encode(['success'=>false,'message'=>'Only JPG, PNG, WEBP photos allowed']);
            exit;
        }
 
        if ($file['size'] > 5 * 1024 * 1024) {
            echo json_encode(['success'=>false,'message'=>'Photo must be under 5MB']);
            exit;
        }
 
        // Save to images/ folder
        $filename  = time() . '_' . preg_replace('/[^a-z0-9.]/', '', strtolower($file['name']));
        $uploadDir = dirname(__DIR__) . '/images/';
 
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
 
        if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            $image_url = 'images/' . $filename;
        }
    }
 
    // Insert listing
    $stmt = $pdo->prepare("
        INSERT INTO fv_listings 
        (user_id, crop_name, category, price_per_kg, quantity_kg, description, location, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $user_id, $crop_name, $category,
        $price_per_kg, $quantity_kg,
        $description, $location, $image_url
    ]);
 
    echo json_encode([
        'success'    => true,
        'message'    => 'Listing posted!',
        'listing_id' => $pdo->lastInsertId(),
        'image_url'  => $image_url
    ]);
 
} catch (PDOException $e) {
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>