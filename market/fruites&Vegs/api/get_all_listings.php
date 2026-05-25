<?php
require_once 'db.php';
header('Content-Type: application/json');
 
try {
    $stmt = $pdo->query("
        SELECT
            fv.id,
            fv.crop_name,
            fv.category,
            fv.price_per_kg,
            fv.quantity_kg,
            fv.description,
            fv.location,
            fv.created_at,
            COALESCE(fv.image_url, '') AS image_url,
            u.id          AS farmer_id,
            u.full_name   AS farmer_name,
            u.barangay    AS farmer_barangay,
            u.is_verified AS farmer_verified
        FROM fv_listings fv
        JOIN core_users u ON fv.user_id = u.id
        WHERE fv.status = 'active'
        AND u.is_verified = 1
        ORDER BY fv.created_at DESC
    ");
 
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
 
    echo json_encode([
        'success' => true,
        'data'    => $listings
    ]);
 
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>