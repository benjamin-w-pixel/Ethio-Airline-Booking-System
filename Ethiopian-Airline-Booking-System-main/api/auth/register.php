<?php
// api/auth/register.php
header('Content-Type: application/json');
require_once '../db.php';

// Allow CORS (Cross-Origin Resource Sharing) - Adjust for production
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

// Basic Validation
$required = ['username', 'password', 'name', 'email'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing field: $field"]);
        exit;
    }
}

$username = $data['username'];
$password = $data['password'];
$full_name = $data['name'];
$email = $data['email'];
$age = isset($data['age']) ? $data['age'] : null;
$gender = isset($data['gender']) ? $data['gender'] : null;
$passport = isset($data['passport_number']) ? $data['passport_number'] : null;

// Hash Password
$password_hash = password_hash($password, PASSWORD_BCRYPT);

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'Username or Email already exists']);
        exit;
    }

    // Insert User
    $sql = "INSERT INTO users (username, password_hash, full_name, email, age, gender, passport_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$username, $password_hash, $full_name, $email, $age, $gender, $passport]);

    http_response_code(201);
    echo json_encode(['message' => 'User registered successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
}
?>
