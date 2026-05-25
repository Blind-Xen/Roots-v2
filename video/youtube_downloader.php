<?php
/**
 * YouTube Video Downloader using yt-dlp
 * Downloads YouTube videos and serves them to the frontend
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../shared/config.php';

function downloadYouTubeVideo($url, $resolution = '720p') {
    // Validate YouTube URL
    if (!preg_match('/(youtube\.com|youtu\.be)/', $url)) {
        return ['success' => false, 'error' => 'Invalid YouTube URL'];
    }

    // Map resolution to yt-dlp format
    $formatMap = [
        '360p' => '18',
        '480p' => '135',
        '720p' => '22',
        '1080p' => '137+bestaudio[ext=m4a]'
    ];
    
    $format = $formatMap[$resolution] ?? '22';

    // Create download directory if it doesn't exist
    $downloadDir = __DIR__ . '/downloads/';
    if (!file_exists($downloadDir)) {
        mkdir($downloadDir, 0777, true);
    }

    // Generate unique filename
    $filename = 'video_' . time() . '_' . bin2hex(random_bytes(8)) . '.mp4';
    $outputPath = $downloadDir . $filename;

    // Build yt-dlp command
    $cmd = sprintf(
        'yt-dlp -f %s -o "%s" "%s" 2>&1',
        escapeshellarg($format),
        escapeshellarg($outputPath),
        escapeshellarg($url)
    );

    // Execute command
    $output = [];
    $returnCode = 0;
    exec($cmd, $output, $returnCode);

    if ($returnCode !== 0 || !file_exists($outputPath)) {
        return [
            'success' => false,
            'error' => 'Failed to download video. yt-dlp may not be installed or URL is invalid.',
            'details' => implode("\n", $output)
        ];
    }

    // Get video info
    $infoCmd = sprintf('yt-dlp --dump-json "%s" 2>&1', escapeshellarg($url));
    $infoOutput = shell_exec($infoCmd);
    $videoInfo = json_decode($infoOutput, true);

    // Return video data
    return [
        'success' => true,
        'filename' => $filename,
        'title' => $videoInfo['title'] ?? 'Unknown',
        'duration' => $videoInfo['duration'] ?? 0,
        'thumbnail' => $videoInfo['thumbnail'] ?? '',
        'resolution' => $resolution,
        'size' => filesize($outputPath)
    ];
}

function getVideoInfo($url) {
    if (!preg_match('/(youtube\.com|youtu\.be)/', $url)) {
        return ['success' => false, 'error' => 'Invalid YouTube URL'];
    }

    $cmd = sprintf('yt-dlp --dump-json "%s" 2>&1', escapeshellarg($url));
    $output = shell_exec($cmd);
    $info = json_decode($output, true);

    if (!$info) {
        return ['success' => false, 'error' => 'Failed to get video info'];
    }

    return [
        'success' => true,
        'title' => $info['title'] ?? 'Unknown',
        'duration' => $info['duration'] ?? 0,
        'thumbnail' => $info['thumbnail'] ?? '',
        'uploader' => $info['uploader'] ?? 'Unknown',
        'view_count' => $info['view_count'] ?? 0
    ];
}

// Handle requests
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'download':
            $url = $_POST['url'] ?? '';
            $resolution = $_POST['resolution'] ?? '720p';
            $result = downloadYouTubeVideo($url, $resolution);
            echo json_encode($result);
            break;

        case 'info':
            $url = $_GET['url'] ?? '';
            $result = getVideoInfo($url);
            echo json_encode($result);
            break;

        case 'serve':
            $filename = $_GET['filename'] ?? '';
            $filepath = __DIR__ . '/downloads/' . $filename;
            
            if (!file_exists($filepath)) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'File not found']);
                break;
            }

            header('Content-Type: video/mp4');
            header('Content-Length: ' . filesize($filepath));
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            readfile($filepath);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
