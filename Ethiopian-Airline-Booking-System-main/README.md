# ✈️ Ethiopian Airline Booking System

A professional, full-stack flight booking application managed by **Ethiopian Airlines**. This system provides a seamless booking experience with seat selection, payment integration, and booking management.

---

## 🚀 Key Features

*   **Flight Search**: Real-time flight searching between destinations.
*   **Interactive Seat Map**: Select your preferred seat with a visual, interactive map (Green = Available, Red = Reserved).
*   **Secure Payment**: Simulation of Visa/MasterCard payments with validation.
*   **Booking Management**: View, print, and cancel your bookings.
*   **Admin Dashboard**: Manage flights, view all bookings, and update seat availability.
*   **Zero-Config Database**: Powered by **SQLite** for instant setup - no database server installation required!

---

## 🛠️ Technology Stack

*   **Frontend**: HTML5, CSS3, Vanilla JavaScript (Modern ES6+)
*   **Backend**: PHP 8.0+
*   **Database**: SQLite (Default) / Microsoft SQL Server (Optional Enterprise Mode)
*   **Server**: Apache (via XAMPP, WAMP, or equivalent)

---

## 📦 How to Install & Run (The Easy Way)

This project is designed to be **"Plug and Play"**. Follow these steps to get it running in 5 minutes.

### 1. Prerequisites
*   Download and install **[XAMPP](https://www.apachefriends.org/index.html)** (or WAMP/MAMP).
*   That's it! No complex drivers needed.

### 2. Deployment
1.  **Download** this project repository.
2.  **Extract** the folder.
3.  **Copy** the entire `Ethiopian-Airline-Booking-System-main` folder.
4.  **Paste** it into your XAMPP `htdocs` directory:
    *   Windows: `C:\xampp\htdocs\`
    *   Mac/Linux: `/Applications/XAMPP/htdocs/` or `/var/www/html/`

### 3. Start the Server
1.  Open **XAMPP Control Panel**.
2.  Start **Apache**.

### 4. Launch 🚀
1.  Open your browser.
2.  Go to: **`http://localhost/Ethiopian-Airline-Booking-System-main/`**
3.  The application will automatically create the database (`database/airline_system.sqlite`) on the first run.

---

## 🔑 Login Credentials

### Admin Portal
*   **Username**: `admin`
*   **Password**: `admin123`

### Passenger Portal
*   **Register** a new account to log in!

---

## 📚 For Developers: How it Works

### Database Structure
The system uses `database/airline_system.sqlite`.
*   **Users Table**: Stores passenger and admin info.
*   **Flights Table**: Stores flight details (price, seats, schedule).
*   **Bookings Table**: Links users to flights.

### API Endpoints (PHP)
All logic resides in the `/api` folder:
*   `api/auth/login.php`: Handles user/admin authentication.
*   `api/flights/search.php`: Returns flight JSON data.
*   `api/bookings/create.php`: Processes bookings and updates text files/DB.

---

## ⚠️ Troubleshooting

### "I see a white screen or 404 error"
*   Make sure you are accessing `http://localhost/...` and NOT opening the `.html` file directly by double-clicking. PHP requires a server.

### "The Payment Popup looks weird"
*   Please perform a **Hard Refresh** (`CTRL + F5`) to clear old CSS.
*   The system uses inline styles and Javascript injection to guarantee critical UI elements appear correctly.

### "Database Error"
*   Ensure the `database/` folder is **writable**. Windows usually allows this by default in XAMPP.

---

## 🖥️ Enterprise Setup (Optional: SQL Server)
If you prefer Microsoft SQL Server over SQLite:
1.  Install SQL Server Express.
2.  Create a database named `AirlineBookingDB`.
3.  Run the script in `database/schema_mssql.sql`.
4.  Edit `api/db.php`: Set `$use_sqlite = false;` and update your `$user`/`$pass`.

---

**Built with  biniyam for Ethiopian Airlines**
