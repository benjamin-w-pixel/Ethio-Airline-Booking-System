-- Database Schema for Ethiopian Airline Booking System (SQL Server / SQL Express)
-- Database Name: airline_db

IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'airline_db')
BEGIN
    CREATE DATABASE airline_db;
END
GO

USE airline_db;
GO

-- Users Table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'passenger', -- 'passenger' or 'admin'
    age INT,
    gender VARCHAR(10),
    passport_number VARCHAR(50),
    created_at DATETIME DEFAULT GETDATE()
);

-- Flights Table
CREATE TABLE flights (
    id INT IDENTITY(1,1) PRIMARY KEY,
    flight_number VARCHAR(20) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time VARCHAR(10) NOT NULL, 
    price DECIMAL(10, 2) NOT NULL,
    seats_available INT NOT NULL,
    day_of_week VARCHAR(20), 
    created_at DATETIME DEFAULT GETDATE()
);

-- Bookings Table
CREATE TABLE bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    flight_id INT FOREIGN KEY REFERENCES flights(id),
    passenger_name VARCHAR(100), 
    seat_number VARCHAR(10),
    booking_date DATETIME DEFAULT GETDATE(),
    status VARCHAR(20) DEFAULT 'confirmed',
    payment_method VARCHAR(50),
    price DECIMAL(10, 2),
    cancellation_date DATETIME,
    refund_amount DECIMAL(10, 2)
);

-- Feedback / Ratings Table
CREATE TABLE feedback (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment VARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);

-- Seed Initial Data 
INSERT INTO users (username, password_hash, full_name, email, role) VALUES 
('admin', '$2y$10$wzGFta5y2JEZ.BNupvnbL.AW0BFmguklzUfrCH7osHM7/mMOhykK6', 'System Admin', 'admin@ethiopianairlines.com', 'admin');

-- Example Flight
INSERT INTO flights (flight_number, source, destination, departure_time, price, seats_available, day_of_week) VALUES
('ET101', 'Addis Ababa', 'Bahir Dar', '07:00', 150.00, 50, 'Monday');
