<?php
// ======================================================
// api/db.php — Database connection
// Used by all API files in this folder
// ======================================================
 
$host = '127.0.0.1';
$port = '3308';           // your XAMPP port
$db   = 'roots_db';
$user = 'root';
$pass = '';               // XAMPP default is empty
 
try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}
?>