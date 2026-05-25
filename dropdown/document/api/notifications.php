<?php
// api/notifications.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';
$pdo = getPDO();
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

function respond($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if ($action === 'list') {
    $user_id = intval($_GET['user_id'] ?? 0);
    if (!$user_id) {
        respond(['error' => 'user_id is required'], 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC');
    $stmt->execute(['user_id' => $user_id]);
    respond(['notifications' => $stmt->fetchAll()]);
}

if ($action === 'mark_read') {
    $notification_id = intval($_POST['notification_id'] ?? 0);
    if (!$notification_id) {
        respond(['error' => 'notification_id is required'], 400);
    }

    $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = :notification_id');
    $stmt->execute(['notification_id' => $notification_id]);
    respond(['message' => 'Notification marked as read']);
}

respond(['error' => 'Unknown action'], 400);
