<?php
// ======================================================
// api/update_listing.php
// Updates price or quantity of an existing listing
// Method: POST
// Sends JSON: { listing_id, user_id, price_per_kg, quantity_kg, status }
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
    // Check that listing belongs to this user
    $check = $pdo->prepare("SELECT user_id FROM fv_listings WHERE id = ?");
    $check->execute([$input['listing_id']]);
    $row = $check->fetch(PDO::FETCH_ASSOC);
 
    if (!$row) {
        echo json_encode(['success' => false, 'message' => 'Listing not found']);
        exit;
    }
 
    if ((int)$row['user_id'] !== (int)$input['user_id']) {
        echo json_encode(['success' => false, 'message' => 'You can only edit your own listings']);
        exit;
    }
 
    // Build update query from provided fields
    $fields = [];
    $values = [];
    $allowed = ['crop_name', 'category', 'price_per_kg', 'quantity_kg', 'description', 'location', 'status'];
 
    foreach ($allowed as $f) {
        if (isset($input[$f])) {
            $fields[] = "$f = ?";
            $values[] = $input[$f];
        }
    }
 
    if (empty($fields)) {
        echo json_encode(['success' => false, 'message' => 'Nothing to update']);
        exit;
    }
 
    $values[] = $input['listing_id'];
    $pdo->prepare("UPDATE fv_listings SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
 
    echo json_encode(['success' => true, 'message' => 'Listing updated!']);
 
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>