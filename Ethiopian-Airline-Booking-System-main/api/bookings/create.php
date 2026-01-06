<?php
// api/bookings/create.php
header('Content-Type: application/json');
require_once '../db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents('php://input'), true);

// Assume user_id comes from session or token (simplified here: passed in body or looked up by username)
$username = $data['username'] ?? null;
$flightNumber = $data['flightNumber'] ?? null;

if (!$username || !$flightNumber) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing booking details']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Get User ID
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if (!$user) throw new Exception("User not found");

    // 2. Get Flight ID and Check Seats
    $stmt = $pdo->prepare("SELECT id, seats_available, price FROM flights WHERE flight_number = ?");
    $stmt->execute([$flightNumber]);
    $flight = $stmt->fetch();

    if (!$flight) throw new Exception("Flight not found");
    if ($flight['seats_available'] <= 0) throw new Exception("No seats available");

    // 3. Create Booking
    $sql = "INSERT INTO bookings (user_id, flight_id, passenger_name, seat_number, payment_method, price, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'confirmed')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $user['id'],
        $flight['id'],
        $data['passengerName'],
        $data['selectedSeat'],
        $data['paymentMethod'],
        $flight['price']
    ]);
    
    $bookingId = $pdo->lastInsertId();

    // 4. Update Seats
    $stmt = $pdo->prepare("UPDATE flights SET seats_available = seats_available - 1 WHERE id = ?");
    $stmt->execute([$flight['id']]);

    $pdo->commit();

    echo json_encode(['message' => 'Booking confirmed', 'booking_id' => $bookingId]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Booking failed: ' . $e->getMessage()]);
}
?>
