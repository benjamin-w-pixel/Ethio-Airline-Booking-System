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

## 🎨 Screenshots & UI
*(Coming Soon - Placeholders for UI previews)*
- **Home Page**: Modern search functionality.
- **Seat Map**: Interactive layout with instant feedback.
- **Admin Panel**: Comprehensive dashboard to manage bookings.

---

## 📁 Project Architecture

```plaintext
/Ethiopian-Airline-Booking-System-main
├── index.html            # Main front-end entry point
├── style.css             # UI styling & tokens
├── script_clean.js       # Core logic and DOM manipulation
├── script_additions.js   # Additional logic & interaction enhancements
├── /api                  # PHP backend endpoints
│   ├── /auth             # Authentication API
│   ├── /flights          # Search APIs
│   └── /bookings         # Booking management
├── /database             # SQLite database and scripts
└── README.md             # This file
```

---

## 👨‍💻 DEVELOPER NOTES

### Technical Architecture

#### Frontend
- **Framework**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS with Glassmorphism effects
- **State Management**: LocalStorage for UI state, API for data persistence
- **Internationalization**: Built-in English/Amharic support

#### Backend
- **Language**: PHP 8.0+
- **Architecture**: RESTful API
- **Database**: SQLite (portable, zero-config)
- **Authentication**: BCRYPT password hashing

---

### API Endpoints

#### Authentication
```
POST /api/auth/login.php
POST /api/auth/register.php
```

#### Flights
```
GET  /api/flights/list.php
POST /api/flights/manage.php (add/update)
DELETE /api/flights/manage.php?flight_number=XX
POST /api/flights/update_seats.php
```

#### Bookings
```
POST /api/bookings/create.php
GET  /api/bookings/list.php?username=XX
GET  /api/bookings/all.php (admin only)
POST /api/bookings/cancel.php
```

#### Feedback
```
POST /api/feedback/submit.php
```

---

### Database Schema

#### users
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- password_hash (TEXT)
- full_name (TEXT)
- email (TEXT)
- role (TEXT: 'passenger' or 'admin')
- age, gender, passport_number
- created_at (DATETIME)

#### flights
- id (INTEGER PRIMARY KEY)
- flight_number (TEXT UNIQUE)
- source, destination (TEXT)
- departure_time (TEXT)
- price (REAL)
- seats_available (INTEGER)
- day_of_week (TEXT)
- created_at (DATETIME)

#### bookings
- id (INTEGER PRIMARY KEY)
- user_id, flight_id (FOREIGN KEYS)
- passenger_name, seat_number
- booking_date (DATETIME)
- status (TEXT: 'confirmed' or 'cancelled')
- payment_method, price
- cancellation_date, refund_amount

#### feedback
- id (INTEGER PRIMARY KEY)
- user_id (FOREIGN KEY)
- rating (INTEGER 1-5)
- comment (TEXT)
- created_at (DATETIME)

---

### Security Features

1. **Password Hashing**: All passwords use PHP's `password_hash()` with BCRYPT
2. **SQL Injection Protection**: PDO prepared statements throughout
3. **XSS Prevention**: JSON encoding for all API responses
4. **CORS**: Configured for local development (update for production)

---

### Customization Guide

#### Change Database Location
Edit `api/db.php`:
```php
$dbPath = __DIR__ . '/../database/airline.db';
```

#### Add New API Endpoint
1. Create file in appropriate `api/` subfolder
2. Include `require_once '../db.php';`
3. Set CORS headers
4. Use PDO prepared statements
5. Return JSON responses

#### Modify UI Language
Edit translation object in `script.js`:
```javascript
const translations = {
    en: { ... },
    am: { ... }
};
```

---

### Performance Optimization

**Current Setup:**
- SQLite is fast for <100,000 records
- No caching layer (add Redis for production)
- Frontend assets are not minified

**For Production:**
1. Minify CSS/JS files
2. Enable gzip compression in Apache
3. Add CDN for static assets
4. Consider migrating to MySQL/PostgreSQL for scale
5. Implement API rate limiting

---

### Testing

**Manual Testing:**
1. Visit `/api/test_db.php` for database diagnostics
2. Test each user flow (register → login → book → cancel)
3. Verify admin functions (add/edit/delete flights)

**Automated Testing:**
- No unit tests currently implemented
- Consider PHPUnit for backend
- Consider Jest for frontend

---

### Deployment Checklist

- [ ] Change admin password
- [ ] Update CORS settings in all API files
- [ ] Enable HTTPS
- [ ] Set proper file permissions (database folder writable)
- [ ] Configure Apache .htaccess for security
- [ ] Add rate limiting
- [ ] Set up automated backups
- [ ] Monitor error logs
- [ ] Test on production environment

---

### Known Limitations

1. **Single Server**: Not designed for load balancing
2. **No Email**: Booking confirmations are not sent via email
3. **No Payment Gateway**: Payment methods are simulated
4. **No Real-time Updates**: Seat availability requires page refresh
5. **Desktop Optimized**: Mobile responsive but not mobile-first

---

### Future Enhancements

- [ ] Email notifications (PHPMailer)
- [ ] Real payment gateway integration (Stripe/PayPal)
- [ ] WebSocket for real-time seat updates
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support beyond EN/AM
- [ ] Flight delay notifications
- [ ] Loyalty program integration

---

### ⚠️ Troubleshooting

#### "I see a white screen or 404 error"
*   Make sure you are accessing `http://localhost/...` and NOT opening the `.html` file directly by double-clicking. PHP requires a server.

#### "The Payment Popup looks weird"
*   Please perform a **Hard Refresh** (`CTRL + F5`) to clear old CSS.
*   The system uses inline styles and Javascript injection to guarantee critical UI elements appear correctly.

#### "Database Error"
*   Ensure the `database/` folder is **writable**. Windows usually allows this by default in XAMPP.

---

### 🖥️ Enterprise Setup (Optional: SQL Server)
If you prefer Microsoft SQL Server over SQLite:
1.  Install SQL Server Express.
2.  Create a database named `AirlineBookingDB`.
3.  Run the script in `database/schema_mssql.sql`.
4.  Edit `api/db.php`: Set `$use_sqlite = false;` and update your `$user`/`$pass`.

---

## 🤝 Contributing
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
**Built with ❤️ for Ethiopian Airlines**

© 2026 Ethiopian Airline Booking System. All Rights Reserved.
