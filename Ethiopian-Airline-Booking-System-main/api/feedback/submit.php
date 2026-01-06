<?php
// api/feedback/submit.php
header('Content-Type: application/json');
require_once '../db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? null;
$rating = $data['rating'] ?? null;
$comment = $data['comment'] ?? null;

if (!$username || !$rating) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and rating required']);
    exit;
}

try {
    // Get User ID
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    $sql = "INSERT INTO feedback (user_id, rating, comment) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user['id'], $rating, $comment]);

    http_response_code(201);
    echo json_encode(['message' => 'Feedback submitted successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Feedback submission failed']);
}
?>
