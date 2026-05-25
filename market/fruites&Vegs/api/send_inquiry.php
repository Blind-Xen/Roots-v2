<?php
// ======================================================
// api/send_inquiry.php
// Buyer sends inquiry to a farmer about a listing
// Method: POST
// Sends JSON: { listing_id, buyer_id, quantity_needed, message }
// ======================================================
 
require_once 'db.php';
header('Content-Type: application/json');
 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}
 
$input = json_decode(file_get_contents('php://input'), true);
 
if (empty($input['listing_id']) || empty($input['buyer_id']) || empty($input['message'])) {
    echo json_encode(['success' => false, 'message' => 'listing_id, buyer_id, and message are required']);
    exit;
}
 
try {
    // Check listing exists and is active
    $check = $pdo->prepare("SELECT user_id FROM fv_listings WHERE id = ? AND status = 'active'");
    $check->execute([$input['listing_id']]);
    $listing = $check->fetch(PDO::FETCH_ASSOC);
 
    if (!$listing) {
        echo json_encode(['success' => false, 'message' => 'Listing is no longer available']);
        exit;
    }
 
    // Don't allow farmer to inquire on own listing
    if ((int)$listing['user_id'] === (int)$input['buyer_id']) {
        echo json_encode(['success' => false, 'message' => 'You cannot inquire on your own listing']);
        exit;
    }
 
    $stmt = $pdo->prepare("
        INSERT INTO fv_inquiries (listing_id, buyer_id, quantity_needed, message)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        (int)$input['listing_id'],
        (int)$input['buyer_id'],
        (float)($input['quantity_needed'] ?? 0),
        trim($input['message'])
    ]);
 
    echo json_encode(['success' => true, 'message' => 'Inquiry sent to farmer!']);
 
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>