<?php
/**
 * api/db.php
 * SQLite Database Connection (Works out of the box with XAMPP)
 */

$dbPath = __DIR__ . '/../database/airline.db';

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Create tables if they don't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT DEFAULT 'passenger',
            age INTEGER,
            gender TEXT,
            passport_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS flights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            flight_number TEXT UNIQUE NOT NULL,
            source TEXT NOT NULL,
            destination TEXT NOT NULL,
            departure_time TEXT NOT NULL,
            price REAL NOT NULL,
            seats_available INTEGER NOT NULL,
            day_of_week TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            flight_id INTEGER,
            passenger_name TEXT,
            seat_number TEXT,
            booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'confirmed',
            payment_method TEXT,
            price REAL,
            cancellation_date DATETIME,
            refund_amount REAL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (flight_id) REFERENCES flights(id)
        );
        
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    ");
    
    // Check if admin exists, if not create one
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    $result = $stmt->fetch();
    
    if ($result['count'] == 0) {
        // Password: admin123
        $adminHash = '$2y$10$wzGFta5y2JEZ.BNupvnbL.AW0BFmguklzUfrCH7osHM7/mMOhykK6';
        $pdo->exec("INSERT INTO users (username, password_hash, full_name, email, role) 
                    VALUES ('admin', '$adminHash', 'System Admin', 'admin@ethiopianairlines.com', 'admin')");
        
        // Add sample flights
        $flights = [
            ['ET101', 'Addis Ababa', 'Bahir Dar', '07:00', 150.00, 50, 'Monday'],
            ['ET102', 'Addis Ababa', 'Mekele', '08:30', 180.00, 45, 'Monday'],
            ['ET103', 'Addis Ababa', 'Gondar', '10:00', 170.00, 55, 'Tuesday'],
            ['ET104', 'Addis Ababa', 'Hawassa', '12:00', 120.00, 60, 'Tuesday'],
            ['ET105', 'Addis Ababa', 'Dire Dawa', '14:00', 140.00, 50, 'Wednesday'],
            ['ET106', 'Addis Ababa', 'Axum', '16:00', 190.00, 40, 'Wednesday'],
            ['ET107', 'Addis Ababa', 'Lalibela', '18:00', 200.00, 35, 'Thursday'],
            ['ET108', 'Bahir Dar', 'Addis Ababa', '09:00', 150.00, 50, 'Thursday'],
            ['ET109', 'Mekele', 'Addis Ababa', '11:00', 180.00, 45, 'Friday'],
            ['ET110', 'Gondar', 'Addis Ababa', '13:00', 170.00, 55, 'Friday'],
            ['ET111', 'Addis Ababa', 'Bahir Dar', '15:00', 150.00, 50, 'Saturday'],
            ['ET112', 'Addis Ababa', 'Mekele', '17:00', 180.00, 45, 'Sunday']
        ];
        
        foreach ($flights as $flight) {
            $pdo->exec("INSERT INTO flights (flight_number, source, destination, departure_time, price, seats_available, day_of_week) 
                        VALUES ('{$flight[0]}', '{$flight[1]}', '{$flight[2]}', '{$flight[3]}', {$flight[4]}, {$flight[5]}, '{$flight[6]}')");
        }
    }
    
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => 'Database Connection Failed',
        'message' => $e->getMessage()
    ]);
    exit;
}
?>
