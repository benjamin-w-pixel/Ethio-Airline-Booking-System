<?php
// api/flights/manage.php
header('Content-Type: application/json');
require_once '../db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Add or Update Flight
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields... (Simplified for brevity)
    
    try {
        if (isset($data['id']) && $data['id']) {
            // Update Existing Flight
            $sql = "UPDATE flights SET flight_number = ?, source = ?, destination = ?, departure_time = ?, price = ?, seats_available = ?, day_of_week = ? 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['flightNumber'],
                $data['source'],
                $data['destination'],
                $data['departureTime'],
                $data['price'],
                $data['seatsAvailable'],
                $data['dayOfWeek'] ?? 'Daily',
                $data['id']
            ]);
            echo json_encode(['message' => 'Flight updated successfully']);
        } else {
            // Add New Flight
            $sql = "INSERT INTO flights (flight_number, source, destination, departure_time, price, seats_available, day_of_week) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['flightNumber'],
                $data['source'],
                $data['destination'],
                $data['departureTime'],
                $data['price'],
                $data['seatsAvailable'],
                $data['dayOfWeek'] ?? 'Daily'
            ]);
            http_response_code(201);
            echo json_encode(['message' => 'Flight added successfully']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add flight: ' . $e->getMessage()]);
    }

} elseif ($method === 'DELETE') {
    // Delete by flight_number (easier for frontend)
    $flightNumber = $_GET['flight_number'] ?? null;
    
    // Also support ID if passed
    $id = $_GET['id'] ?? null;
    
    if (!$flightNumber && !$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Flight Number or ID required']);
        exit;
    }
    
    try {
        if ($flightNumber) {
             $stmt = $pdo->prepare("DELETE FROM flights WHERE flight_number = ?");
             $stmt->execute([$flightNumber]);
        } else {
             $stmt = $pdo->prepare("DELETE FROM flights WHERE id = ?");
             $stmt->execute([$id]);
        }
        
        echo json_encode(['message' => 'Flight deleted']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete flight']);
    }
}
?>
