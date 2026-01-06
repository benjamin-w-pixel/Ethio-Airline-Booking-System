<?php
/**
 * api/test_db.php
 * Diagnostic tool to check your system configuration.
 */
header('Content-Type: text/plain');

echo "--- Ethiopian Airline System Diagnosis ---\n\n";

// 1. Check PHP Version
echo "PHP Version: " . phpversion() . "\n";

// 2. Check Drivers
echo "Active PDO Drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n";
if (!in_array('sqlsrv', PDO::getAvailableDrivers())) {
    echo "❌ ERROR: 'sqlsrv' driver NOT found. You must enable it in php.ini.\n";
} else {
    echo "✅ Driver 'sqlsrv' is loaded.\n";
}

// 3. Try Connection
require_once 'db.php';
try {
    $stmt = $pdo->query("SELECT @@VERSION as version");
    $row = $stmt->fetch();
    echo "\n✅ CONNECTION SUCCESSFUL!\n";
    echo "SQL Server Version: " . $row['version'] . "\n";
} catch (Exception $e) {
    echo "\n❌ CONNECTION FAILED!\n";
    echo "Error Message: " . $e->getMessage() . "\n";
    echo "\nTROUBLESHOOTING HINT:\n";
    echo "1. Run the PowerShell script I provided to enable TCP/IP.\n";
    echo "2. Make sure you created 'airline_db' in SSMS.\n";
}
?>
