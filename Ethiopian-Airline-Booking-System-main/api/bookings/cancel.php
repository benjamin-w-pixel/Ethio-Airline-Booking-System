<?php
// api/bookings/cancel.php
header('Content-Type: application/json');
require_once '../db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents('php://input'), true);
$bookingId = $data['booking_id'] ?? null;

if (!$bookingId) {
    http_response_code(400);
    echo json_encode(['error' => 'Booking ID required']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // 1. Get flight_id from booking
    $stmt = $pdo->prepare("SELECT flight_id, status FROM bookings WHERE id = ?");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        throw new Error('Booking not found');
    }

    if ($booking['status'] === 'cancelled') {
        throw new Error('Booking is already cancelled');
    }

    // 2. Update booking status
    $stmt = $pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?");
    $stmt->execute([$bookingId]);

    // 3. Restore seat count in flights table
    $stmt = $pdo->prepare("UPDATE flights SET seats_available = seats_available + 1 WHERE id = ?");
    $stmt->execute([$booking['flight_id']]);

    $pdo->commit();
    echo json_encode(['message' => 'Booking cancelled successfully']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
