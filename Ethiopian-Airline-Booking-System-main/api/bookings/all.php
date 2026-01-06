<?php
// api/bookings/all.php
header('Content-Type: application/json');
require_once '../db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

// In a real app, verify admin session token here.
// For now, we trust the frontend logic/state (as requested/per current scope).

try {
    $sql = "SELECT b.id, b.booking_date, b.status, b.status as payment_status, 
                   f.flight_number, f.source, f.destination, f.departure_time, f.price,
                   u.username, u.full_name as passenger_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN flights f ON b.flight_id = f.id
            ORDER BY b.booking_date DESC";
    
    $stmt = $pdo->query($sql);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($bookings);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch all bookings: ' . $e->getMessage()]);
}
?>
