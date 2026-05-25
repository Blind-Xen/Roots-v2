<?php
// ============================================================
// livestock-api.php — Roots Livestock Module REST API
// Place this file alongside your livestock.html in XAMPP's
// htdocs folder (e.g. htdocs/roots/livestock-api.php)
//
// ENDPOINTS (all called from livestock-script.js):
//   GET    ?action=listings              → fetch all active listings
//   GET    ?action=listing&id=X         → fetch one listing
//   POST   ?action=listing              → create new listing
//   PUT    ?action=listing&id=X         → update listing
//   DELETE ?action=listing&id=X         → soft-delete listing
//   POST   ?action=upload_photo         → upload photo for listing
//   GET    ?action=conversations        → get conversations for a user
//   GET    ?action=messages&id=X        → get messages in conversation
//   POST   ?action=message              → send a message
//   POST   ?action=order                → create a buy/trade/service order
//   GET    ?action=notifications&user=X → get notifications for user
//   POST   ?action=report               → file a report on a listing
//   GET    ?action=farmers              → get all farmers (admin)
//   POST   ?action=verify_farmer        → DA-verify a farmer (admin)
//   POST   ?action=suspend_farmer       → suspend a farmer (admin)
//   GET    ?action=admin_listings        → all listings for admin table
//   POST   ?action=admin_remove_listing → admin soft-deletes a listing
//   POST   ?action=dismiss_report       → admin dismisses a report
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ── Route to the right handler ──────────────────────────────
switch ($action) {

    // ── LISTINGS ──────────────────────────────────────────────
    case 'listings':
        if ($method === 'GET') handleGetListings();
        break;

    case 'profile_stats':
        if ($method === 'GET') handleGetProfileStats();
        break;

    case 'listing':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if      ($method === 'GET')    handleGetListing($id);
        else if ($method === 'POST')   handleCreateListing();
        else if ($method === 'PUT')    handleUpdateListing($id);
        else if ($method === 'DELETE') handleDeleteListing($id);
        break;

    // ── PHOTOS ───────────────────────────────────────────────
    case 'upload_photo':
        if ($method === 'POST') handleUploadPhoto();
        break;

    // ── CONVERSATIONS & MESSAGES ──────────────────────────────
    case 'conversations':
        if ($method === 'GET') handleGetConversations();
        break;

    case 'messages':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($method === 'GET') handleGetMessages($id);
        break;

    case 'message':
        if ($method === 'POST') handleSendMessage();
        break;

    // ── ORDERS ───────────────────────────────────────────────
    case 'order':
        if ($method === 'POST') handleCreateOrder();
        break;

    // ── NOTIFICATIONS ─────────────────────────────────────────
    case 'notifications':
        if ($method === 'GET') handleGetNotifications();
        break;

    // ── REPORTS ──────────────────────────────────────────────
    case 'report':
        if ($method === 'POST') handleCreateReport();
        break;

    // ── ADMIN ─────────────────────────────────────────────────
    case 'farmers':
        if ($method === 'GET') handleGetFarmers();
        break;

    case 'verify_farmer':
        if ($method === 'POST') handleVerifyFarmer();
        break;

    case 'suspend_farmer':
        if ($method === 'POST') handleSuspendFarmer();
        break;

    case 'admin_listings':
        if ($method === 'GET') handleAdminListings();
        break;

    case 'admin_remove_listing':
        if ($method === 'POST') handleAdminRemoveListing();
        break;

    case 'dismiss_report':
        if ($method === 'POST') handleDismissReport();
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => "Unknown action: $action"]);
}


// ================================================================
// LISTINGS
// ================================================================

function handleGetProfileStats(): void {
    $db     = getDB();
    $userId = (int)($_GET['user_id'] ?? 1);

    // Animals = sum of heads in ACTIVE listings by this user
    $animalsStmt = $db->prepare("
        SELECT COALESCE(SUM(animal_count), 0) AS animals
        FROM livestock_listings
        WHERE user_id = ? AND status = 'active'
    ");
    $animalsStmt->bind_param('i', $userId);
    $animalsStmt->execute();
    $animals = (int)($animalsStmt->get_result()->fetch_assoc()['animals'] ?? 0);

    // Sold = number of SOLD listings by this user
    $soldStmt = $db->prepare("
        SELECT COUNT(*) AS sold
        FROM livestock_listings
        WHERE user_id = ? AND status = 'sold'
    ");
    $soldStmt->bind_param('i', $userId);
    $soldStmt->execute();
    $sold = (int)($soldStmt->get_result()->fetch_assoc()['sold'] ?? 0);

    // Rating = average of all review ratings across this user's listings
    $ratingStmt = $db->prepare("
        SELECT
          COUNT(r.id) AS rating_count,
          COALESCE(AVG(r.rating), NULL) AS avg_rating
        FROM livestock_listings l
        LEFT JOIN livestock_reviews r ON r.listing_id = l.id
        WHERE l.user_id = ? AND l.status != 'deleted'
    ");
    $ratingStmt->bind_param('i', $userId);
    $ratingStmt->execute();
    $rRow = $ratingStmt->get_result()->fetch_assoc() ?: [];

    $ratingCount = (int)($rRow['rating_count'] ?? 0);
    $avgRatingRaw = $rRow['avg_rating'];
    $avgRating = ($avgRatingRaw === null) ? null : round((float)$avgRatingRaw, 1);

    echo json_encode([
        'stats' => [
            'animals' => $animals,
            'sold' => $sold,
            'rating' => $avgRating,
            'ratingCount' => $ratingCount
        ]
    ]);
}

function handleGetListings(): void {
    $db = getDB();

    $type   = $_GET['type']    ?? '';
    $status = $_GET['status']  ?? 'active';
    $search = $_GET['search']  ?? '';
    $userId = (int)($_GET['user_id'] ?? 1);

    // Build WHERE clause — note: is_mine uses IF() in SELECT, not a WHERE param
    $where  = ['l.status = ?'];
    $params = [$status];
    $types  = 's';

    if ($type && $type !== 'all') {
        $where[]  = 'l.animal_type = ?';
        $params[] = $type;
        $types   .= 's';
    }
    if ($search) {
        $where[]  = '(l.title LIKE ? OR l.breed LIKE ? OR u.name LIKE ? OR l.location_barangay LIKE ?)';
        $like     = "%$search%";
        $params   = array_merge($params, [$like, $like, $like, $like]);
        $types   .= 'ssss';
    }

    $whereSQL = implode(' AND ', $where);

    // is_mine: compare l.user_id against $userId using IF()
    $sql = "
        SELECT
            l.*,
            IF(l.user_id = $userId, 1, 0) AS is_mine,
            u.name        AS seller_name,
            u.emoji       AS seller_emoji,
            u.da_verified,
            COALESCE(AVG(r.rating), 0) AS seller_rating,
            GROUP_CONCAT(p.photo_url ORDER BY p.is_primary DESC, p.id ASC SEPARATOR '||') AS photo_urls
        FROM livestock_listings l
        JOIN users u ON u.id = l.user_id
        LEFT JOIN livestock_reviews r ON r.listing_id = l.id
        LEFT JOIN livestock_photos p  ON p.listing_id = l.id
        WHERE $whereSQL
        GROUP BY l.id
        ORDER BY l.created_at DESC
    ";

    $stmt = $db->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = formatListing($row);
    }

    echo json_encode(['listings' => $rows, 'count' => count($rows)]);
}

function handleGetListing(int $id): void {
    if ($id <= 0) { jsonError('Missing listing id', 400); return; }
    $db = getDB();
    $userId = (int)($_GET['user_id'] ?? 1);

    $sql = "
        SELECT l.*, IF(l.user_id = {$userId}, 1, 0) AS is_mine, u.name AS seller_name, u.emoji AS seller_emoji, u.da_verified,
               COALESCE(AVG(r.rating), 0) AS seller_rating,
               GROUP_CONCAT(p.photo_url ORDER BY p.is_primary DESC, p.id ASC SEPARATOR '||') AS photo_urls
        FROM livestock_listings l
        JOIN users u ON u.id = l.user_id
        LEFT JOIN livestock_reviews r ON r.listing_id = l.id
        LEFT JOIN livestock_photos p  ON p.listing_id = l.id
        WHERE l.id = ?
        GROUP BY l.id
    ";

    $stmt = $db->prepare($sql);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row) { jsonError('Listing not found', 404); return; }
    echo json_encode(['listing' => formatListing($row)]);
}

function handleCreateListing(): void {
    $db   = getDB();
    $body = jsonBody();

    // Required fields
    $required = ['animal_type', 'title', 'price', 'location_barangay', 'user_id'];
    foreach ($required as $f) {
        if (empty($body[$f]) && $body[$f] !== 0) {
            jsonError("Missing required field: $f", 400);
            return;
        }
    }

    $stmt = $db->prepare("
        INSERT INTO livestock_listings
          (user_id, animal_type, custom_animal_name, title, breed,
           animal_count, count_unit, weight_kg, age_description,
           price, is_negotiable, listing_type, vaccine_status,
           location_barangay, location_purok, location_landmark, notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ");

    $userId      = (int)($body['user_id']            ?? 1);
    $animalType  = $body['animal_type']               ?? 'other';
    $customName  = $body['custom_animal_name']        ?? null;
    $title       = $body['title']                     ?? '';
    $breed       = $body['breed']                     ?? null;
    $count       = (int)($body['count']               ?? 1);
    $countUnit   = $body['count_unit']                ?? 'head';
    $weight      = (float)($body['weight']            ?? 0);
    $age         = $body['age']                       ?? null;
    $price       = (float)($body['price']             ?? 0);
    $negotiable  = (int)($body['price_negotiable']    ?? 0);
    $listingType = $body['listing_type']              ?? 'sell';
    $vaccStatus  = $body['vaccine_status']            ?? 'unknown';
    $barangay    = $body['location_barangay']         ?? '';
    $purok       = $body['location_purok']            ?? null;
    $landmark    = $body['location_landmark']         ?? null;
    $notes       = $body['notes']                     ?? null;

    $stmt->bind_param('issssissddiisssss',
        $userId, $animalType, $customName, $title, $breed,
        $count, $countUnit, $weight, $age,
        $price, $negotiable, $listingType, $vaccStatus,
        $barangay, $purok, $landmark, $notes
    );

    if (!$stmt->execute()) {
        jsonError('Failed to create listing: ' . $stmt->error, 500);
        return;
    }

    $newId = $db->insert_id;

    // Auto-create a notification for the farmer
    $notifMsg = "Your listing \"$title\" is now live! Buyers in Oroquieta can see it.";
    $notifStmt = $db->prepare("INSERT INTO livestock_notifications (user_id, type, reference_id, message) VALUES (?,?,?,?)");
    $type = 'listing_posted';
    $notifStmt->bind_param('isis', $userId, $type, $newId, $notifMsg);
    $notifStmt->execute();

    echo json_encode(['success' => true, 'id' => $newId]);
}

function handleUpdateListing(int $id): void {
    if ($id <= 0) { jsonError('Missing listing id', 400); return; }
    $db   = getDB();
    $body = jsonBody();

    $stmt = $db->prepare("
        UPDATE livestock_listings SET
          animal_type        = ?,
          custom_animal_name = ?,
          title              = ?,
          breed              = ?,
          animal_count       = ?,
          count_unit         = ?,
          weight_kg          = ?,
          age_description    = ?,
          price              = ?,
          is_negotiable      = ?,
          listing_type       = ?,
          vaccine_status     = ?,
          location_barangay  = ?,
          location_purok     = ?,
          location_landmark  = ?,
          notes              = ?,
          status             = ?
        WHERE id = ?
    ");

    $animalType  = $body['animal_type']            ?? 'other';
    $customName  = $body['custom_animal_name']     ?? null;
    $title       = $body['title']                  ?? '';
    $breed       = $body['breed']                  ?? null;
    $count       = (int)($body['count']            ?? 1);
    $countUnit   = $body['count_unit']             ?? 'head';
    $weight      = (float)($body['weight']         ?? 0);
    $age         = $body['age']                    ?? null;
    $price       = (float)($body['price']          ?? 0);
    $negotiable  = (int)($body['price_negotiable'] ?? 0);
    $listingType = $body['listing_type']           ?? 'sell';
    $vaccStatus  = $body['vaccine_status']         ?? 'unknown';
    $barangay    = $body['location_barangay']      ?? '';
    $purok       = $body['location_purok']         ?? null;
    $landmark    = $body['location_landmark']      ?? null;
    $notes       = $body['notes']                  ?? null;
    $status      = $body['status']                 ?? 'active';

    $stmt->bind_param('ssssissddiissssssi',
        $animalType, $customName, $title, $breed,
        $count, $countUnit, $weight, $age,
        $price, $negotiable, $listingType, $vaccStatus,
        $barangay, $purok, $landmark, $notes, $status, $id
    );

    if (!$stmt->execute()) {
        jsonError('Failed to update listing: ' . $stmt->error, 500);
        return;
    }

    echo json_encode(['success' => true]);
}

function handleDeleteListing(int $id): void {
    if ($id <= 0) { jsonError('Missing listing id', 400); return; }
    $db   = getDB();
    $stmt = $db->prepare("UPDATE livestock_listings SET status = 'deleted' WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
}

// ================================================================
// PHOTO UPLOAD
// ================================================================

function handleUploadPhoto(): void {
    $db        = getDB();
    $listingId = (int)($_POST['listing_id'] ?? 0);

    if ($listingId <= 0) { jsonError('Missing listing_id', 400); return; }
    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        jsonError('No photo uploaded or upload error', 400);
        return;
    }

    $file     = $_FILES['photo'];
    $allowed  = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $mimeType = mime_content_type($file['tmp_name']);

    if (!in_array($mimeType, $allowed)) {
        jsonError('Invalid file type. Only JPG, PNG, GIF, WEBP allowed.', 400);
        return;
    }

    if ($file['size'] > 15 * 1024 * 1024) {
        jsonError('File too large. Maximum 15MB.', 400);
        return;
    }

    // Check existing photo count for this listing
    $countStmt = $db->prepare("SELECT COUNT(*) AS cnt FROM livestock_photos WHERE listing_id = ?");
    $countStmt->bind_param('i', $listingId);
    $countStmt->execute();
    $cnt = $countStmt->get_result()->fetch_assoc()['cnt'];
    if ($cnt >= 5) {
        jsonError('Maximum 5 photos per listing.', 400);
        return;
    }

    // Create upload directory if it doesn't exist
    $uploadDir = __DIR__ . '/uploads/livestock/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext      = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $filename = 'listing_' . $listingId . '_' . uniqid() . '.' . strtolower($ext);
    $destPath = $uploadDir . $filename;
    $photoUrl = 'uploads/livestock/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        jsonError('Failed to save photo.', 500);
        return;
    }

    // First photo for this listing becomes the primary
    $isPrimary = ($cnt === 0) ? 1 : 0;

    $stmt = $db->prepare("INSERT INTO livestock_photos (listing_id, photo_url, is_primary) VALUES (?,?,?)");
    $stmt->bind_param('isi', $listingId, $photoUrl, $isPrimary);
    $stmt->execute();

    echo json_encode(['success' => true, 'photo_url' => $photoUrl]);
}

// ================================================================
// CONVERSATIONS & MESSAGES
// ================================================================

function handleGetConversations(): void {
    $db     = getDB();
    $userId = (int)($_GET['user_id'] ?? 1); // default to user 1 for demo

    $stmt = $db->prepare("
        SELECT c.*,
               l.title AS listing_title,
               l.animal_type,
               buyer.name   AS buyer_name,
               buyer.emoji  AS buyer_emoji,
               seller.name  AS seller_name,
               seller.emoji AS seller_emoji,
               (SELECT message_text FROM livestock_messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.sent_at DESC LIMIT 1) AS last_message,
               (SELECT sent_at FROM livestock_messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.sent_at DESC LIMIT 1) AS last_message_time,
               (SELECT COUNT(*) FROM livestock_messages m
                WHERE m.conversation_id = c.id AND m.is_read = 0 AND m.sender_id != ?) AS unread_count
        FROM livestock_conversations c
        JOIN livestock_listings l ON l.id = c.listing_id
        JOIN users buyer          ON buyer.id  = c.buyer_id
        JOIN users seller         ON seller.id = c.seller_id
        WHERE c.buyer_id = ? OR c.seller_id = ?
        ORDER BY c.last_message_at DESC
    ");
    $stmt->bind_param('iii', $userId, $userId, $userId);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['conversations' => $rows]);
}

function handleGetMessages(int $convoId): void {
    if ($convoId <= 0) { jsonError('Missing conversation id', 400); return; }
    $db = getDB();

    // Mark messages as read for the requesting user
    $userId = (int)($_GET['user_id'] ?? 1);
    $markRead = $db->prepare("UPDATE livestock_messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?");
    $markRead->bind_param('ii', $convoId, $userId);
    $markRead->execute();

    $stmt = $db->prepare("
        SELECT m.*, u.name AS sender_name, u.emoji AS sender_emoji
        FROM livestock_messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = ?
        ORDER BY m.sent_at ASC
    ");
    $stmt->bind_param('i', $convoId);
    $stmt->execute();
    $messages = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['messages' => $messages]);
}

function handleSendMessage(): void {
    $db   = getDB();
    $body = jsonBody();

    $listingId  = (int)($body['listing_id']  ?? 0);
    $senderId   = (int)($body['sender_id']   ?? 0);
    $receiverId = (int)($body['receiver_id'] ?? 0);
    $text       = trim($body['message']      ?? '');

    if (!$listingId || !$senderId || !$receiverId || !$text) {
        jsonError('Missing required fields: listing_id, sender_id, receiver_id, message', 400);
        return;
    }

    // Get or create conversation
    $convoStmt = $db->prepare("
        SELECT id FROM livestock_conversations
        WHERE listing_id = ?
          AND ((buyer_id = ? AND seller_id = ?) OR (buyer_id = ? AND seller_id = ?))
    ");
    $convoStmt->bind_param('iiiii', $listingId, $senderId, $receiverId, $receiverId, $senderId);
    $convoStmt->execute();
    $convo = $convoStmt->get_result()->fetch_assoc();

    if ($convo) {
        $convoId = $convo['id'];
        // Touch last_message_at
        $db->prepare("UPDATE livestock_conversations SET last_message_at = NOW() WHERE id = ?")->execute();
    } else {
        // Determine buyer/seller from listing
        $listingStmt = $db->prepare("SELECT user_id FROM livestock_listings WHERE id = ?");
        $listingStmt->bind_param('i', $listingId);
        $listingStmt->execute();
        $listing = $listingStmt->get_result()->fetch_assoc();
        $sellerId = $listing ? (int)$listing['user_id'] : $receiverId;
        $buyerId  = ($senderId === $sellerId) ? $receiverId : $senderId;

        $newConvo = $db->prepare("INSERT INTO livestock_conversations (listing_id, buyer_id, seller_id) VALUES (?,?,?)");
        $newConvo->bind_param('iii', $listingId, $buyerId, $sellerId);
        $newConvo->execute();
        $convoId = $db->insert_id;
    }

    // Insert message
    $msgStmt = $db->prepare("INSERT INTO livestock_messages (conversation_id, sender_id, message_text) VALUES (?,?,?)");
    $msgStmt->bind_param('iis', $convoId, $senderId, $text);
    $msgStmt->execute();
    $msgId = $db->insert_id;

    // Send notification to receiver
    $notifMsg  = "New message about your listing.";
    $notifStmt = $db->prepare("INSERT INTO livestock_notifications (user_id, type, reference_id, message) VALUES (?,?,?,?)");
    $notifType = 'new_message';
    $notifStmt->bind_param('isis', $receiverId, $notifType, $convoId, $notifMsg);
    $notifStmt->execute();

    echo json_encode(['success' => true, 'message_id' => $msgId, 'conversation_id' => $convoId]);
}

// ================================================================
// ORDERS
// ================================================================

function handleCreateOrder(): void {
    $db   = getDB();
    $body = jsonBody();

    $listingId = (int)($body['listing_id'] ?? 0);
    $buyerId   = (int)($body['buyer_id']   ?? 0);
    $quantity  = (int)($body['quantity']   ?? 1);

    if (!$listingId || !$buyerId) {
        jsonError('Missing listing_id or buyer_id', 400);
        return;
    }

    // Fetch listing to get seller_id and current price
    $lStmt = $db->prepare("SELECT user_id, price, listing_type, title FROM livestock_listings WHERE id = ? AND status = 'active'");
    $lStmt->bind_param('i', $listingId);
    $lStmt->execute();
    $listing = $lStmt->get_result()->fetch_assoc();

    if (!$listing) { jsonError('Listing not found or no longer active', 404); return; }

    $sellerId    = (int)$listing['user_id'];
    $agreedPrice = (float)$listing['price'];
    $orderType   = match($listing['listing_type']) {
        'trade'   => 'trade',
        'service' => 'service_booking',
        default   => 'purchase'
    };

    $stmt = $db->prepare("
        INSERT INTO livestock_orders (listing_id, buyer_id, seller_id, quantity, agreed_price, order_type)
        VALUES (?,?,?,?,?,?)
    ");
    $stmt->bind_param('iiiids', $listingId, $buyerId, $sellerId, $quantity, $agreedPrice, $orderType);

    if (!$stmt->execute()) {
        jsonError('Failed to create order: ' . $stmt->error, 500);
        return;
    }

    $orderId = $db->insert_id;

    // Notify seller
    $notifMsg  = "New {$orderType} request for your listing \"{$listing['title']}\".";
    $notifStmt = $db->prepare("INSERT INTO livestock_notifications (user_id, type, reference_id, message) VALUES (?,?,?,?)");
    $notifType = 'new_order';
    $notifStmt->bind_param('isis', $sellerId, $notifType, $orderId, $notifMsg);
    $notifStmt->execute();

    echo json_encode([
        'success'   => true,
        'order_id'  => $orderId,
        'seller_id' => $sellerId,
        'agreed_price' => $agreedPrice
    ]);
}

// ================================================================
// NOTIFICATIONS
// ================================================================

function handleGetNotifications(): void {
    $db     = getDB();
    $userId = (int)($_GET['user_id'] ?? 1);

    $stmt = $db->prepare("
        SELECT * FROM livestock_notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['notifications' => $rows]);
}

// ================================================================
// REPORTS
// ================================================================

function handleCreateReport(): void {
    $db   = getDB();
    $body = jsonBody();

    $listingId  = (int)($body['listing_id']  ?? 0);
    $reporterId = (int)($body['reporter_id'] ?? 0);
    $reportType = $body['report_type']        ?? 'other';
    $desc       = $body['description']        ?? null;

    if (!$listingId || !$reporterId) {
        jsonError('Missing listing_id or reporter_id', 400);
        return;
    }

    $stmt = $db->prepare("INSERT INTO livestock_reports (listing_id, reporter_id, report_type, description) VALUES (?,?,?,?)");
    $stmt->bind_param('iiss', $listingId, $reporterId, $reportType, $desc);
    $stmt->execute();

    echo json_encode(['success' => true, 'report_id' => $db->insert_id]);
}

// ================================================================
// ADMIN
// ================================================================

function handleGetFarmers(): void {
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.*,
               COUNT(l.id) AS listing_count,
               COALESCE(AVG(r.rating), 0) AS avg_rating
        FROM users u
        LEFT JOIN livestock_listings l ON l.user_id = u.id AND l.status != 'deleted'
        LEFT JOIN livestock_reviews r  ON r.listing_id = l.id
        GROUP BY u.id
        ORDER BY u.name ASC
    ");
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['farmers' => $rows]);
}

function handleVerifyFarmer(): void {
    $db   = getDB();
    $body = jsonBody();
    $userId = (int)($body['user_id'] ?? 0);
    if (!$userId) { jsonError('Missing user_id', 400); return; }

    $db->prepare("UPDATE users SET da_verified = 1 WHERE id = ?")->bind_param('i', $userId)->execute();

    // Log admin action
    logAdminAction($db, $body['admin_id'] ?? 1, 'verify_farmer', 'farmer', $userId, 'DA verification approved');

    // Notify farmer
    $msg = 'Congratulations! Your account has been DA Verified by the admin.';
    $type = 'da_verified';
    $stmt = $db->prepare("INSERT INTO livestock_notifications (user_id, type, message) VALUES (?,?,?)");
    $stmt->bind_param('iss', $userId, $type, $msg);
    $stmt->execute();

    echo json_encode(['success' => true]);
}

function handleSuspendFarmer(): void {
    $db     = getDB();
    $body   = jsonBody();
    $userId = (int)($body['user_id'] ?? 0);
    if (!$userId) { jsonError('Missing user_id', 400); return; }

    // Hide all active listings
    $db->prepare("UPDATE livestock_listings SET status = 'deleted' WHERE user_id = ? AND status = 'active'")
       ->bind_param('i', $userId)->execute();

    logAdminAction($db, $body['admin_id'] ?? 1, 'suspend_farmer', 'farmer', $userId, $body['reason'] ?? null);

    echo json_encode(['success' => true]);
}

function handleAdminListings(): void {
    $db     = getDB();
    $status = $_GET['status'] ?? 'all';

    $where  = $status !== 'all' ? 'WHERE l.status = ?' : 'WHERE 1=1';
    $params = $status !== 'all' ? [$status] : [];
    $types  = $status !== 'all' ? 's' : '';

    $sql = "
        SELECT l.*, u.name AS seller_name, u.da_verified,
               COALESCE(AVG(r.rating),0) AS seller_rating
        FROM livestock_listings l
        JOIN users u ON u.id = l.user_id
        LEFT JOIN livestock_reviews r ON r.listing_id = l.id
        $where
        GROUP BY l.id
        ORDER BY l.created_at DESC
    ";

    $stmt = $db->prepare($sql);
    if ($types) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['listings' => $rows]);
}

function handleAdminRemoveListing(): void {
    $db        = getDB();
    $body      = jsonBody();
    $listingId = (int)($body['listing_id'] ?? 0);
    if (!$listingId) { jsonError('Missing listing_id', 400); return; }

    $db->prepare("UPDATE livestock_listings SET status = 'removed' WHERE id = ?")
       ->bind_param('i', $listingId)->execute();

    logAdminAction($db, $body['admin_id'] ?? 1, 'remove_listing', 'listing', $listingId, $body['reason'] ?? null);

    echo json_encode(['success' => true]);
}

function handleDismissReport(): void {
    $db       = getDB();
    $body     = jsonBody();
    $reportId = (int)($body['report_id'] ?? 0);
    if (!$reportId) { jsonError('Missing report_id', 400); return; }

    $db->prepare("UPDATE livestock_reports SET status = 'dismissed' WHERE id = ?")
       ->bind_param('i', $reportId)->execute();

    logAdminAction($db, $body['admin_id'] ?? 1, 'dismiss_report', 'report', $reportId, null);

    echo json_encode(['success' => true]);
}

// ================================================================
// HELPERS
// ================================================================

function formatListing(array $row): array {
    $row['photo_urls']   = $row['photo_urls'] ? explode('||', $row['photo_urls']) : [];
    $row['da_verified']  = (bool)$row['da_verified'];
    $row['is_negotiable']= (bool)$row['is_negotiable'];
    $row['seller_rating']= round((float)$row['seller_rating'], 1);
    $row['price']        = (float)$row['price'];
    $row['weight_kg']    = (float)$row['weight_kg'];
    $row['animal_count'] = (int)$row['animal_count'];
    return $row;
}

function jsonBody(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return $_POST; // fallback to form POST
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}

function jsonError(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['error' => $message]);
}

function logAdminAction(mysqli $db, int $adminId, string $actionType, string $targetType, ?int $targetId, ?string $notes): void {
    $stmt = $db->prepare("INSERT INTO admin_action_log (admin_user_id, action_type, target_type, target_id, notes) VALUES (?,?,?,?,?)");
    $stmt->bind_param('issis', $adminId, $actionType, $targetType, $targetId, $notes);
    $stmt->execute();
}
