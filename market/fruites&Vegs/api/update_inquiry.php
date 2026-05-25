<?php
// ======================================================
// api/update_inquiry.php
// Farmer accepts or declines a buyer's inquiry
// Method: POST
// Sends JSON: { inquiry_id, status }
// ======================================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['inquiry_id']) || empty($input['status'])) {
    echo json_encode(['success' => false, 'message' => 'inquiry_id and status are required']);
    exit;
}

if (!in_array($input['status'], ['accepted', 'declined'])) {
    echo json_encode(['success' => false, 'message' => 'Status must be accepted or declined']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE fv_inquiries SET status = ? WHERE id = ?");
    $stmt->execute([$input['status'], (int)$input['inquiry_id']]);

    // If accepted, deduct the quantity from the listing
    if ($input['status'] === 'accepted') {
        // Get the inquiry details
        $inqStmt = $pdo->prepare("SELECT listing_id, quantity_needed FROM fv_inquiries WHERE id = ?");
        $inqStmt->execute([(int)$input['inquiry_id']]);
        $inq = $inqStmt->fetch(PDO::FETCH_ASSOC);

        if ($inq) {
            // Deduct quantity
            $deductStmt = $pdo->prepare("
                UPDATE fv_listings
                SET quantity_kg = GREATEST(0, quantity_kg - ?)
                WHERE id = ?
            ");
            $deductStmt->execute([$inq['quantity_needed'], $inq['listing_id']]);

            // Check if sold out
            $checkStmt = $pdo->prepare("SELECT quantity_kg FROM fv_listings WHERE id = ?");
            $checkStmt->execute([$inq['listing_id']]);
            $listing = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($listing && $listing['quantity_kg'] <= 0) {
                $pdo->prepare("UPDATE fv_listings SET status = 'sold out' WHERE id = ?")
                    ->execute([$inq['listing_id']]);
            }
        }
    }

    echo json_encode(['success' => true, 'message' => 'Inquiry updated!']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
