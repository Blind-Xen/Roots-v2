<?php
// ======================================================
// api/delete_listing.php
// Marks a listing as 'removed' (soft delete)
// Method: POST
// Sends JSON: { listing_id, user_id }
// ======================================================
 
require_once 'db.php';
header('Content-Type: application/json');
 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}
 
$input = json_decode(file_get_contents('php://input'), true);
 
if (empty($input['listing_id']) || empty($input['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'listing_id and user_id are required']);
    exit;
}
 
try {
    // Check ownership
    $check = $pdo->prepare("SELECT user_id FROM fv_listings WHERE id = ?");
    $check->execute([$input['listing_id']]);
    $row = $check->fetch(PDO::FETCH_ASSOC);
 
    if (!$row) {
        echo json_encode(['success' => false, 'message' => 'Listing not found']);
        exit;
    }
 
    if ((int)$row['user_id'] !== (int)$input['user_id']) {
        echo json_encode(['success' => false, 'message' => 'You can only remove your own listings']);
        exit;
    }
 
    $pdo->prepare("UPDATE fv_listings SET status = 'removed' WHERE id = ?")->execute([$input['listing_id']]);
 
    echo json_encode(['success' => true, 'message' => 'Listing removed']);
 
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>