<?php
// ======================================================
// api/get_farmer_shop.php
// Returns one farmer's info + all their listings
// Usage: api/get_farmer_shop.php?farmer_id=1
// ======================================================
 
require_once 'db.php';
header('Content-Type: application/json');
 
$farmer_id = isset($_GET['farmer_id']) ? (int)$_GET['farmer_id'] : 0;
 
if (!$farmer_id) {
    echo json_encode(['success' => false, 'message' => 'farmer_id is required']);
    exit;
}
 
try {
    // Get farmer info
    $stmt = $pdo->prepare("
        SELECT id, full_name, barangay, is_verified
        FROM core_users
        WHERE id = ? AND is_verified = 1
    ");
    $stmt->execute([$farmer_id]);
    $farmer = $stmt->fetch(PDO::FETCH_ASSOC);
 
    if (!$farmer) {
        echo json_encode(['success' => false, 'message' => 'Farmer not found']);
        exit;
    }
 
    // Get their listings
    $stmt2 = $pdo->prepare("
        SELECT id, crop_name, category, price_per_kg, quantity_kg, description, location
        FROM fv_listings
        WHERE user_id = ? AND status = 'active'
        ORDER BY created_at DESC
    ");
    $stmt2->execute([$farmer_id]);
    $listings = $stmt2->fetchAll(PDO::FETCH_ASSOC);
 
    echo json_encode([
        'success'  => true,
        'farmer'   => $farmer,
        'listings' => $listings
    ]);
 
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>