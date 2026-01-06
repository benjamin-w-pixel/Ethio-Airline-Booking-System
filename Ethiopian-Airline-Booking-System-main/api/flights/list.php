<?php
// api/flights/list.php
header('Content-Type: application/json');
require_once '../db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

try {
    // Basic search filters
    $source = $_GET['source'] ?? null;
    $destination = $_GET['destination'] ?? null;
    $day = $_GET['day'] ?? null;

    $sql = "SELECT * FROM flights WHERE 1=1";
    $params = [];

    if ($source) {
        $sql .= " AND LOWER(source) LIKE LOWER(?)";
        $params[] = "%$source%";
    }
    if ($destination) {
        $sql .= " AND LOWER(destination) LIKE LOWER(?)";
        $params[] = "%$destination%";
    }
    if ($day) {
        $sql .= " AND day_of_week = ?";
        $params[] = $day;
    }

    $sql .= " ORDER BY departure_time ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $flights = $stmt->fetchAll();

    echo json_encode($flights);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch flights: ' . $e->getMessage()]);
}
?>
