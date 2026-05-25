<?php
// api/reviews.php
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
    $stmt = $pdo->query(
        'SELECT r.*, d.title AS document_title, u.name AS reviewer_name
         FROM reviews r
         JOIN documents d ON r.document_id = d.id
         JOIN users u ON r.reviewer_id = u.id
         ORDER BY r.reviewed_at DESC'
    );
    respond(['reviews' => $stmt->fetchAll()]);
}

if ($action === 'submit') {
    $document_id = intval($_POST['document_id'] ?? 0);
    $reviewer_id = intval($_POST['reviewer_id'] ?? 0);
    $status = $_POST['status'] ?? '';
    $comments = trim($_POST['comments'] ?? '');

    if (!$document_id || !$reviewer_id || !in_array($status, ['approved', 'rejected'], true)) {
        respond(['error' => 'document_id, reviewer_id, and valid status are required'], 400);
    }

    $stmt = $pdo->prepare('INSERT INTO reviews (document_id, reviewer_id, status, comments) VALUES (:document_id, :reviewer_id, :status, :comments)');
    $stmt->execute(['document_id' => $document_id, 'reviewer_id' => $reviewer_id, 'status' => $status, 'comments' => $comments]);

    if (isset($_POST['use_stored_proc']) && $_POST['use_stored_proc'] === '1') {
        $proc = $pdo->prepare('CALL sp_update_document_status(:document_id, :status)');
        $proc->execute(['document_id' => $document_id, 'status' => $status]);
    }

    respond(['message' => 'Review submitted', 'review_id' => $pdo->lastInsertId()]);
}

if ($action === 'summary') {
    $user_id = intval($_GET['user_id'] ?? 0);
    if (!$user_id) {
        respond(['error' => 'user_id is required'], 400);
    }

    $stmt = $pdo->prepare('CALL sp_get_user_document_summary(:user_id)');
    $stmt->execute(['user_id' => $user_id]);
    respond(['summary' => $stmt->fetch()]);
}

respond(['error' => 'Unknown action'], 400);
