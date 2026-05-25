<?php
// ======================================================
// api/get_inquiries.php
// Returns all inquiries received by a specific farmer
// Usage: api/get_inquiries.php?farmer_id=1
// ======================================================

require_once 'db.php';
header('Content-Type: application/json');

$farmer_id = isset($_GET['farmer_id']) ? (int)$_GET['farmer_id'] : 0;

if (!$farmer_id) {
    echo json_encode(['success' => false, 'message' => 'farmer_id is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT
            inq.id,
            inq.listing_id,
            inq.buyer_id,
            inq.quantity_needed,
            inq.message,
            inq.status,
            inq.created_at,
            fv.crop_name,
            fv.price_per_kg,
            fv.location,
            buyer.full_name  AS buyer_name,
            buyer.barangay   AS buyer_barangay,
            buyer.phone      AS buyer_phone
        FROM fv_inquiries inq
        JOIN fv_listings fv   ON inq.listing_id = fv.id
        JOIN core_users buyer ON inq.buyer_id   = buyer.id
        WHERE fv.user_id = ?
        ORDER BY inq.created_at DESC
    ");
    $stmt->execute([$farmer_id]);
    $inquiries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data'    => $inquiries
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
