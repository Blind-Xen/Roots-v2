<?php
/**
 * register.php
 * ─────────────────────────────────────────────────────────────
 * REST-like API endpoint consumed by Registration.js
 *
 * Actions (query-string):
 *   POST  ?action=farmer   – Register a new farmer
 *   POST  ?action=nonfarm  – Register a new non-farmer
 *   POST  ?action=login    – Login any user
 *   POST  ?action=logout   – Revoke current session token
 *   GET   ?action=farmers  – Admin: list all farmers
 *   PUT   ?action=verify   – Admin: verify / reject a farmer
 *   GET   ?action=id_image – Admin: stream farmer ID file
 * ─────────────────────────────────────────────────────────────
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once __DIR__ . '/db_connect.php';   // $pdo available here

$action = $_GET['action'] ?? '';

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════

/** Send a JSON response and exit. */
function respond(bool $ok, $data = null, string $error = ''): void {
    echo json_encode($ok
        ? ['success' => true,  'data'  => $data]
        : ['success' => false, 'error' => $error]
    );
    exit;
}

/** Decode the raw JSON request body. */
function jsonBody(): array {
    if (isset($GLOBALS['_cachedBody'])) return $GLOBALS['_cachedBody'];
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

/**
 * Normalize a PH phone number to 11-digit 09XXXXXXXXX format.
 * Accepts:
 *   "9171234567"   (10 digits, no leading 0)  → "09171234567"
 *   "09171234567"  (already 11 digits)         → "09171234567"
 *   "+639171234567" (international)            → "09171234567"
 *   "639171234567"  (country code, no +)       → "09171234567"
 */
function normalizePhone(string $raw): string {
    $digits = preg_replace('/\D/', '', $raw);          // strip all non-digits
    if (strlen($digits) === 12 && str_starts_with($digits, '63')) {
        $digits = '0' . substr($digits, 2);            // 639... → 09...
    } elseif (strlen($digits) === 10 && !str_starts_with($digits, '0')) {
        $digits = '0' . $digits;                       // 917... → 0917...
    }
    return $digits;
}

/**
 * Generate a cryptographically random session token and insert
 * it into user_sessions.  Returns the token string.
 *
 * Session lifetime: 24 hours (adjust SESSION_TTL_HOURS as needed).
 */
define('SESSION_TTL_HOURS', 24);

function createSession(PDO $pdo, int $userId): string {
    $token     = bin2hex(random_bytes(32));          // 64-char hex string
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_TTL_HOURS * 3600);

    $pdo->prepare(
        'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
    )->execute([$userId, $token, $expiresAt]);

    return $token;
}

/**
 * Validate a Bearer token against user_sessions.
 * Returns the user row (user_id, user_type, firstname, lastname, is_active)
 * or NULL when the token is missing / expired / belongs to an inactive user.
 */
function resolveToken(PDO $pdo, string $token): ?array {
    $stmt = $pdo->prepare(
        'SELECT u.user_id, u.user_type, u.firstname, u.lastname, u.is_active
           FROM user_sessions s
           JOIN users u ON u.user_id = s.user_id
          WHERE s.token = ?
            AND s.expires_at > NOW()
            AND u.is_active = 1
          LIMIT 1'
    );
    $stmt->execute([$token]);
    $row = $stmt->fetch();
    return $row ?: null;
}

/**
 * Extract the Bearer token from the Authorization header,
 * falling back to REDIRECT_HTTP_AUTHORIZATION, getallheaders(),
 * and finally a JSON body field '_token'.
 */
function extractBearerToken(): string {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION']
               ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
               ?? '';

    if (!$authHeader && function_exists('getallheaders')) {
        $all        = array_change_key_case(getallheaders(), CASE_LOWER);
        $authHeader = $all['authorization'] ?? '';
    }

    if (str_starts_with($authHeader, 'Bearer ')) {
        return substr($authHeader, 7);
    }

    // Last-resort: token embedded in JSON body (e.g. some PUT clients)
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $GLOBALS['_cachedBody'] = $body;   // cache so jsonBody() can reuse it
    return $body['_token'] ?? '';
}

/**
 * Require a valid admin session.  Halts with 401/403 on failure.
 * Returns the admin's user row on success.
 */
function requireAdmin(PDO $pdo): array {
    $token = extractBearerToken();

    if (!$token) {
        http_response_code(401);
        respond(false, null, 'Unauthorized.');
    }

    $user = resolveToken($pdo, $token);

    if (!$user) {
        http_response_code(401);
        respond(false, null, 'Invalid or expired session. Please log in again.');
    }

    if ($user['user_type'] !== 'admin') {
        http_response_code(403);
        respond(false, null, 'Forbidden. Admin access required.');
    }

    return $user;
}

/**
 * Look up a barangay_id from ref_barangays by name OR by numeric ID.
 * Returns NULL when not found.
 */
function resolveBarangayId(PDO $pdo, string $barangay, int $locationId = 1): ?int {
    if ($barangay === '') return null;
    // Accept a plain integer ID sent directly from the frontend
    if (ctype_digit($barangay)) {
        $stmt = $pdo->prepare(
            'SELECT barangay_id FROM ref_barangays WHERE barangay_id = ? AND location_id = ? LIMIT 1'
        );
        $stmt->execute([(int)$barangay, $locationId]);
    } else {
        $stmt = $pdo->prepare(
            'SELECT barangay_id FROM ref_barangays WHERE LOWER(barangay_name) = LOWER(?) AND location_id = ? LIMIT 1'
        );
        $stmt->execute([$barangay, $locationId]);
    }
    $row = $stmt->fetch();
    return $row ? (int)$row['barangay_id'] : null;
}


/**
 * Look up a crop_id from ref_crops by name (case-insensitive, strips emoji prefix).
 * Returns NULL when the crop name is empty or not found.
 */
function resolveCropId(PDO $pdo, string $cropName): ?int {
    if ($cropName === '') return null;
    // Strip leading emoji/symbol prefix  e.g. "🌾 Palay / Rice" → "Palay / Rice"
    $clean = trim(preg_replace('/^\S+\s+/', '', $cropName));
    $stmt  = $pdo->prepare('SELECT crop_id FROM ref_crops WHERE LOWER(crop_name) = LOWER(?) LIMIT 1');
    $stmt->execute([$clean]);
    $row = $stmt->fetch();
    return $row ? (int)$row['crop_id'] : null;
}

/**
 * Look up an id_type_id from ref_id_types by name (case-insensitive).
 * Returns NULL when empty or not found.
 */
function resolveIdTypeId(PDO $pdo, string $idTypeName): ?int {
    if ($idTypeName === '') return null;
    $stmt = $pdo->prepare('SELECT id_type_id FROM ref_id_types WHERE LOWER(id_type_name) = LOWER(?) LIMIT 1');
    $stmt->execute([$idTypeName]);
    $row = $stmt->fetch();
    return $row ? (int)$row['id_type_id'] : null;
}

/**
 * Handle the uploaded government ID file.
 * Returns the relative file path on success, or NULL if no file was sent.
 * Calls respond() and exits on upload error.
 */
function handleIdUpload(string $phone): ?string {
    if (!isset($_FILES['id_file'])) return null;

    $file = $_FILES['id_file'];

    if ($file['error'] === UPLOAD_ERR_NO_FILE) return null;

    if ($file['error'] !== UPLOAD_ERR_OK) {
        respond(false, null, 'File upload error code: ' . $file['error']);
    }

    $uploadDir = __DIR__ . '/uploads/ids/';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        respond(false, null, 'Server error: could not create upload directory.');
    }

    $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
    if (!in_array($ext, $allowed)) {
        respond(false, null, 'Invalid file type. Please upload an image or PDF.');
    }

    $safeFile = 'id_' . preg_replace('/\D/', '', $phone) . '_' . time() . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $uploadDir . $safeFile)) {
        respond(false, null, 'Server error: could not save uploaded ID file.');
    }

    return 'uploads/ids/' . $safeFile;
}


// ════════════════════════════════════════════════════════════
//  ACTION: fetch barangays  (public, GET)
//  Usage:  register.php?action=barangays
//          register.php?action=barangays&location_id=1
// ════════════════════════════════════════════════════════════
if ($action === 'barangays' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $locationId = isset($_GET['location_id']) ? (int)$_GET['location_id'] : 1;

    $stmt = $pdo->prepare(
        'SELECT barangay_id, barangay_name
           FROM ref_barangays
          WHERE location_id = ?
          ORDER BY barangay_name ASC'
    );
    $stmt->execute([$locationId]);
    respond(true, $stmt->fetchAll());
}


// ════════════════════════════════════════════════════════════
//  ACTION: farmer registration
// ════════════════════════════════════════════════════════════
if ($action === 'farmer' && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $firstname  = trim($_POST['firstname']  ?? '');
    $lastname   = trim($_POST['lastname']   ?? '');
    $phone      = normalizePhone(trim($_POST['phone'] ?? ''));   // ← normalize before validation
    $password   = $_POST['password']        ?? '';
    $email      = trim($_POST['email']      ?? '');
    $crop       = trim($_POST['crop']       ?? '');
    $area       = isset($_POST['area']) && $_POST['area'] !== '' ? (float)$_POST['area'] : null;
    $idTypeName = trim($_POST['id_type']    ?? '');
    $locationId = isset($_POST['location_id']) ? (int)$_POST['location_id'] : 1;

    // Validate required fields
    if (!$firstname || !$lastname || strlen($phone) !== 11 || strlen($password) < 6) {
        respond(false, null,
            'Missing or invalid required fields. ' .
            'Got phone [' . $phone . '] (' . strlen($phone) . ' digits). ' .
            'Must be 11 digits in 09XXXXXXXXX format.'
        );
    }

    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(false, null, 'Invalid email address format.');
    }
    $emailToSave = $email !== '' ? $email : null;

    $barangayRaw = trim($_POST['barangay_id'] ?? $_POST['barangay'] ?? '');
    $locationId  = isset($_POST['location_id']) ? (int)$_POST['location_id'] : 1;
    $barangayId  = resolveBarangayId($pdo, $barangayRaw, $locationId);

    if ($barangayRaw !== '' && $barangayId === null) {
        respond(false, null, 'Invalid barangay selected. Please choose from the list.');
    }

    $idFilePath = handleIdUpload($phone);
    $cropId     = resolveCropId($pdo, $crop);
    $idTypeId   = resolveIdTypeId($pdo, $idTypeName);
    $hash       = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare(
            'CALL sp_register_farmer(?,?,?,?,?,?,?,?,?,?,?, @uid, @msg)'
        );
        $stmt->execute([
            $firstname, $lastname, $phone, $hash,
            $emailToSave, $barangayId, $locationId,
            $cropId, $area, $idTypeId, $idFilePath
        ]);
        $row = $pdo->query('SELECT @uid AS uid, @msg AS msg')->fetch();
    } catch (PDOException $e) {
        respond(false, null, 'Database error: ' . $e->getMessage());
    }

    if ((int)$row['uid'] === 0) {
        respond(false, null, $row['msg']);
    }

    $userId = (int)$row['uid'];
    $token  = createSession($pdo, $userId);

    respond(true, [
        'user_id' => $userId,
        'token'   => $token,
        'status'  => 'pending',
        'message' => $row['msg'],
    ]);
}


// ════════════════════════════════════════════════════════════
//  ACTION: non-farmer registration
// ════════════════════════════════════════════════════════════
if ($action === 'nonfarm' && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $body         = jsonBody();
    $firstname    = trim($body['firstname']    ?? '');
    $lastname     = trim($body['lastname']     ?? '');
    $phone        = normalizePhone(trim($body['phone'] ?? ''));   // ← normalize before validation
    $password     = $body['password']          ?? '';
    $email        = trim($body['email']        ?? '');
    $municipality = trim($body['municipality'] ?? $body['city'] ?? '');
    $barangay     = trim($body['barangay']     ?? '') ?: null;

    if (!$firstname || !$lastname || strlen($phone) !== 11 || strlen($password) < 6 || !$municipality) {
        respond(false, null,
            'Missing or invalid required fields. ' .
            'Got phone [' . $phone . '] (' . strlen($phone) . ' digits). ' .
            'Must be 11 digits in 09XXXXXXXXX format.'
        );
    }

    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(false, null, 'Invalid email address format.');
    }
    $emailToSave = $email !== '' ? $email : null;

    $hash = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare(
            'CALL sp_register_nonfarm(?,?,?,?,?,?,?, @uid, @msg)'
        );
        $stmt->execute([$firstname, $lastname, $phone, $hash, $emailToSave, $municipality, $barangay]);
        $row = $pdo->query('SELECT @uid AS uid, @msg AS msg')->fetch();
    } catch (PDOException $e) {
        respond(false, null, 'Database error: ' . $e->getMessage());
    }

    if ((int)$row['uid'] === 0) {
        respond(false, null, $row['msg']);
    }

    $userId = (int)$row['uid'];
    $token  = createSession($pdo, $userId);

    respond(true, [
        'user_id' => $userId,
        'token'   => $token,
        'message' => $row['msg'],
    ]);
}


// ════════════════════════════════════════════════════════════
//  ACTION: login
// ════════════════════════════════════════════════════════════
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $body     = jsonBody();
    $phone    = normalizePhone(trim($body['phone'] ?? ''));   // ← normalize before validation
    $password = $body['password']      ?? '';

    if (!$phone || !$password) {
        respond(false, null, 'Phone and password are required.');
    }

    // Fetch user by phone — admin, farmer, and nonfarm all live in the users table
    $stmt = $pdo->prepare(
        'SELECT user_id, password_hash, user_type, firstname, lastname, email, is_active
           FROM users WHERE phone = ? LIMIT 1'
    );
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if (!$user)                                               respond(false, null, 'Phone number not found.');
    if (!$user['is_active'])                                  respond(false, null, 'Account is deactivated.');
    if (!password_verify($password, $user['password_hash'])) respond(false, null, 'Incorrect password.');

    // Create a fresh session token in user_sessions
    $token = createSession($pdo, $user['user_id']);

    // For admin: also return the static token stored in user_sessions (used by JS for verify calls)
    // The JS ADMIN_USER.token = 'admin_static_token' is already in user_sessions from the DB seed.
    // We issue a fresh token above; the JS will use whichever token is returned here.

    // Fetch type-specific profile fields
    $extra = [];
    if ($user['user_type'] === 'farmer') {
        $s = $pdo->prepare(
            'SELECT fp.status, fp.farm_area_ha,
                    rb.barangay_name AS barangay,
                    rc.crop_name     AS crop,
                    rl.municipality, rl.province
               FROM farmer_profiles fp
               LEFT JOIN ref_barangays rb ON rb.barangay_id = fp.barangay_id
               LEFT JOIN ref_crops     rc ON rc.crop_id     = fp.crop_id
               LEFT JOIN ref_locations rl ON rl.location_id = fp.location_id
              WHERE fp.user_id = ?'
        );
        $s->execute([$user['user_id']]);
        $extra = $s->fetch() ?: [];
    } elseif ($user['user_type'] === 'nonfarm') {
        $s = $pdo->prepare(
            'SELECT municipality, barangay FROM nonfarm_profiles WHERE user_id = ?'
        );
        $s->execute([$user['user_id']]);
        $extra = $s->fetch() ?: [];
    }

    respond(true, array_merge([
        'user_id'   => $user['user_id'],
        'firstname' => $user['firstname'],
        'lastname'  => $user['lastname'],
        'phone'     => $phone,
        'email'     => $user['email'] ?? null,
        'type'      => $user['user_type'],
        'token'     => $token,
    ], $extra));
}


// ════════════════════════════════════════════════════════════
//  ACTION: logout  (revoke current session token)
// ════════════════════════════════════════════════════════════
if ($action === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $token = extractBearerToken();

    if ($token) {
        $pdo->prepare('DELETE FROM user_sessions WHERE token = ?')->execute([$token]);
    }

    respond(true, null);   // always succeed — idempotent
}


// ════════════════════════════════════════════════════════════
//  ACTION: list all farmers  (admin only, GET)
// ════════════════════════════════════════════════════════════
if ($action === 'farmers' && $_SERVER['REQUEST_METHOD'] === 'GET') {

    requireAdmin($pdo);

    $stmt = $pdo->query(
        'SELECT user_id, firstname, lastname, phone, email,
                status, registered_at,
                barangay, municipality, province,
                crop, farm_area_ha,
                id_type, id_file_path,
                verified_at, rejection_note
           FROM vw_farmers
          ORDER BY registered_at DESC'
    );

    respond(true, $stmt->fetchAll());
}


// ════════════════════════════════════════════════════════════
//  ACTION: list all non-farmers  (admin only, GET)
// ════════════════════════════════════════════════════════════
if ($action === 'nonfarmers' && $_SERVER['REQUEST_METHOD'] === 'GET') {

    requireAdmin($pdo);

    $stmt = $pdo->query(
        'SELECT user_id, firstname, lastname, phone, email,
                city, barangay, created_at
           FROM vw_nonfarmers
          ORDER BY created_at DESC'
    );

    respond(true, $stmt->fetchAll());
}


// ════════════════════════════════════════════════════════════
//  ACTION: verify / reject farmer  (admin only, PUT)
// ════════════════════════════════════════════════════════════
if ($action === 'verify' && $_SERVER['REQUEST_METHOD'] === 'PUT') {

    $admin = requireAdmin($pdo);

    $body      = jsonBody();
    $userId    = (int)($body['user_id']       ?? 0);
    $newStatus = $body['action']              ?? '';
    $note      = trim($body['rejection_note'] ?? '');

    if (!$userId || !in_array($newStatus, ['verified', 'rejected', 'pending'])) {
        respond(false, null, 'Invalid user_id or action.');
    }

    try {
        $stmt = $pdo->prepare(
            'CALL sp_verify_farmer(?,?,?,?, @success, @msg)'
        );
        $stmt->execute([$admin['user_id'], $userId, $newStatus, $note ?: null]);
        $row = $pdo->query('SELECT @success AS success, @msg AS msg')->fetch();
    } catch (PDOException $e) {
        respond(false, null, 'Database error: ' . $e->getMessage());
    }

    if (!(int)$row['success']) {
        respond(false, null, $row['msg']);
    }

    $farmerRow = $pdo->prepare(
        'SELECT u.email, CONCAT(u.firstname, " ", u.lastname) AS full_name
           FROM users u WHERE u.user_id = ?'
    );
    $farmerRow->execute([$userId]);
    $farmer = $farmerRow->fetch();

    if (!empty($farmer['email'])) {
        sendVerificationEmail($farmer['email'], $farmer['full_name'], $newStatus, $note);
    }

    respond(true, ['message' => $row['msg']]);
}


// ════════════════════════════════════════════════════════════
//  ACTION: serve farmer ID image  (admin only, GET)
// ════════════════════════════════════════════════════════════
if ($action === 'id_image' && $_SERVER['REQUEST_METHOD'] === 'GET') {

    $token = '';
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (str_starts_with($authHeader, 'Bearer ')) {
        $token = substr($authHeader, 7);
    } elseif (!empty($_GET['token'])) {
        $token = trim($_GET['token']);
    }

    if (!$token) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Unauthorized.']);
        exit;
    }

    $user = resolveToken($pdo, $token);
    if (!$user || $user['user_type'] !== 'admin') {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Forbidden.']);
        exit;
    }

    $requested = ltrim($_GET['file'] ?? '', '/');
    $realBase  = realpath(__DIR__ . '/uploads/ids');
    $realFile  = realpath(__DIR__ . '/' . $requested);

    if (!$realBase || !$realFile || !str_starts_with($realFile, $realBase) || !is_file($realFile)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'File not found.']);
        exit;
    }

    $ext     = strtolower(pathinfo($realFile, PATHINFO_EXTENSION));
    $mimeMap = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'pdf'  => 'application/pdf',
    ];
    $mime = $mimeMap[$ext] ?? 'application/octet-stream';

    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($realFile));
    header('Cache-Control: private, max-age=3600');
    header('Content-Disposition: inline; filename="' . basename($realFile) . '"');
    readfile($realFile);
    exit;
}


// ════════════════════════════════════════════════════════════
//  HELPER: Send verification status email
// ════════════════════════════════════════════════════════════
function sendVerificationEmail(string $toEmail, string $toName, string $status, string $note): void {

    $smtpUser = 'your_email@gmail.com';
    $fromName = 'DA Farmers Registry';

    if ($status === 'verified') {
        $subject = '✅ Your Farmer Registration Has Been Approved';
        $body    = "
            <p>Dear <strong>{$toName}</strong>,</p>
            <p>Great news! Your farmer registration has been
               <strong style='color:green;'>verified and approved</strong>
               by the administrator.</p>
            <p>You may now log in and access all features available to verified farmers.</p>
            <br><p>Thank you,<br><strong>{$fromName}</strong></p>
        ";
    } elseif ($status === 'rejected') {
        $reason  = $note ?: 'No reason provided.';
        $subject = '❌ Your Farmer Registration Was Rejected';
        $body    = "
            <p>Dear <strong>{$toName}</strong>,</p>
            <p>We regret to inform you that your farmer registration has been
               <strong style='color:red;'>rejected</strong>.</p>
            <p><strong>Reason:</strong> {$reason}</p>
            <p>If you believe this is a mistake, please contact the administrator.</p>
            <br><p>Thank you,<br><strong>{$fromName}</strong></p>
        ";
    } else {
        return;
    }

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: {$fromName} <{$smtpUser}>\r\n";
    $headers .= "Reply-To: {$smtpUser}\r\n";

    @mail($toEmail, $subject, $body, $headers);
}


// ════════════════════════════════════════════════════════════
//  Fallback
// ════════════════════════════════════════════════════════════
respond(false, null, 'Unknown action or method.');