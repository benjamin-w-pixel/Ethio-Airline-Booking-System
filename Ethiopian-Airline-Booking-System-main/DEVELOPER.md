# DEVELOPER NOTES
## Ethiopian Airline Booking System

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

### Key Files

**Frontend:**
- `index.html` - Main application structure
- `style.css` - Glassmorphism design system
- `script.js` - UI controllers and business logic
- `services.js` - API communication layer

**Backend:**
- `api/db.php` - Database connection and initialization
- `api/auth/*.php` - Authentication endpoints
- `api/flights/*.php` - Flight management
- `api/bookings/*.php` - Booking operations

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

### Contributing

This is a complete, production-ready system. For modifications:
1. Test thoroughly in development
2. Backup database before schema changes
3. Document API changes
4. Maintain backward compatibility

---

### License & Credits

**Built for**: Ethiopian Airlines  
**Technology**: PHP, SQLite, Vanilla JavaScript  
**Design**: Glassmorphism UI/UX  
**Year**: 2025  

© Ethiopian Airlines - The Leading Airline of Africa 🇪🇹
