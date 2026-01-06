<?php
// api/flights/update_seats.php
header('Content-Type: application/json');
require_once '../db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['flightNumber']) || !isset($data['newCount'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Flight Number and New Count required']);
    exit;
}

$flightNumber = $data['flightNumber'];
$newCount = (int)$data['newCount'];

try {
    $sql = "UPDATE flights SET seats_available = ? WHERE flight_number = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$newCount, $flightNumber]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Flight not found']);
        exit;
    }

    echo json_encode(['message' => 'Seats updated successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update seats: ' . $e->getMessage()]);
}
?>
