<?php
// api/bookings/list.php
header('Content-Type: application/json');
require_once '../db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

$username = $_GET['username'] ?? null;

if (!$username) {
    http_response_code(400);
    echo json_encode(['error' => 'Username required']);
    exit;
}

try {
    $sql = "SELECT b.*, f.flight_number, f.source, f.destination, f.departure_time 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN flights f ON b.flight_id = f.id
            WHERE u.username = ?
            ORDER BY b.booking_date DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$username]);
    $bookings = $stmt->fetchAll();

    echo json_encode($bookings);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch bookings']);
}
?>
