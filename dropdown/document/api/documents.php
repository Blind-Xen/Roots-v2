<?php
// api/documents.php
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
        'SELECT d.*, u.name AS owner_name, u.email AS owner_email
         FROM documents d
         JOIN users u ON d.user_id = u.id
         ORDER BY d.created_at DESC'
    );
    respond(['documents' => $stmt->fetchAll()]);
}

if ($action === 'upload') {
    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? 'other');
    $submitDA = trim($_POST['submitDA'] ?? 'no');
    $notes = trim($_POST['notes'] ?? '');
    $user_id = intval($_POST['user_id'] ?? 1); // Default to 1 for now

    if (!$title) {
        respond(['error' => 'Title is required'], 400);
    }

    if (!isset($_FILES['file'])) {
        respond(['error' => 'File is required'], 400);
    }

    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        respond(['error' => 'File upload error'], 400);
    }

    // Validate file type
    $allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!in_array($file['type'], $allowedTypes)) {
        respond(['error' => 'Invalid file type. Only PDF, JPG, PNG allowed'], 400);
    }

    // Validate file size (10MB max)
    if ($file['size'] > 10 * 1024 * 1024) {
        respond(['error' => 'File too large. Max 10MB'], 400);
    }

    // Create uploads directory if not exists
    $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate unique filename
    $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('doc_', true) . '.' . $fileExt;
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        respond(['error' => 'Failed to save file'], 500);
    }

    // Determine status
    $status = ($submitDA === 'yes') ? 'pending' : 'private';
    $shared = ($submitDA === 'yes') ? 1 : 0;
    $daNote = ($submitDA === 'yes') ? 'Submitted to DA for review.' : '';

    $stmt = $pdo->prepare('INSERT INTO documents (title, category, status, shared, da_note, notes, file_path, file_size, file_type, user_id) VALUES (:title, :category, :status, :shared, :da_note, :notes, :file_path, :file_size, :file_type, :user_id)');
    $stmt->execute([
        'title' => $title,
        'category' => $category,
        'status' => $status,
        'shared' => $shared,
        'da_note' => $daNote,
        'notes' => $notes,
        'file_path' => $fileName,
        'file_size' => $file['size'],
        'file_type' => $file['type'],
        'user_id' => $user_id
    ]);

    respond(['message' => 'Document uploaded successfully', 'document_id' => $pdo->lastInsertId()]);
}

if ($action === 'share') {
    $document_id = intval($_POST['document_id'] ?? 0);
    $shared_with_user_id = intval($_POST['shared_with_user_id'] ?? 0);

    if (!$document_id || !$shared_with_user_id) {
        respond(['error' => 'document_id and shared_with_user_id are required'], 400);
    }

    $stmt = $pdo->prepare('INSERT INTO shared_documents (document_id, shared_with_user_id) VALUES (:document_id, :shared_with_user_id)');
    $stmt->execute(['document_id' => $document_id, 'shared_with_user_id' => $shared_with_user_id]);
    respond(['message' => 'Document shared successfully']);
}

if ($action === 'delete') {
    $document_id = intval($_POST['document_id'] ?? $_GET['document_id'] ?? 0);
    if (!$document_id) {
        respond(['error' => 'document_id is required'], 400);
    }

    $stmt = $pdo->prepare('DELETE FROM documents WHERE id = :document_id');
    $stmt->execute(['document_id' => $document_id]);
    respond(['message' => 'Document deleted']);
}

respond(['error' => 'Unknown action'], 400);
