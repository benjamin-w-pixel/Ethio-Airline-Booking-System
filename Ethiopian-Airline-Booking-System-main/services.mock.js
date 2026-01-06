/**
 * services.js
 * 
 * This file contains the Data Service Layer. 
 * It currently uses LocalStorage to mimic a backend. 
 * In the future, these methods will be replaced with fetch() calls to the PHP API.
 * All methods return Promises to simulate asynchronous network requests.
 */

const DB_KEYS = {
    PASSENGERS: 'passengers',
    ADMINS: 'admins',
    FLIGHTS: 'flights',
    BOOKINGS: 'bookings',
    FEEDBACK: 'feedback'
};

// Helper to simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Service ---
const AuthService = {
    async loginPassenger(username, password) {
        await delay();
        const passengers = JSON.parse(localStorage.getItem(DB_KEYS.PASSENGERS) || '[]');
        
        // Simple password check (in production, use hashing)
        // Check for hashed password format or plain text (legacy support)
        const user = passengers.find(p => p.username === username);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Verify password (reuse the verifyPassword helper logic if possible, 
        // but for now we will implement a simple check here or assume the helper is available globally if needed.
        // Since this file loads before script.js, we can't depend on script.js functions easily without window global.
        // We will implement a basic check here for self-containment.)
        
        // Note: In a real API, the server handles verification.
        if (user.password !== password && user.password !== await this.hashString(password)) { 
             // weak check compatible with old/new
             throw new Error('Invalid password');
        }

        return {
            id: user.id || Date.now(), // Ensure ID exists
            username: user.username,
            name: user.name,
            email: user.email,
            passport: user.passport
        };
    },

    async registerPassenger(userData) {
        await delay();
        const passengers = JSON.parse(localStorage.getItem(DB_KEYS.PASSENGERS) || '[]');
        
        if (passengers.some(p => p.username === userData.username)) {
            throw new Error('Username already exists');
        }
        
        // Add ID if missing
        const newUser = { ...userData, id: Date.now() };
        passengers.push(newUser);
        localStorage.setItem(DB_KEYS.PASSENGERS, JSON.stringify(passengers));
        return newUser;
    },

    async loginAdmin(username, password) {
        await delay();
        // Default admin check
        if (username === 'RESPECT_WORLD' && password === 'keiven12') {
            return { username: 'RESPECT_WORLD', role: 'admin' };
        }
        
        const admins = JSON.parse(localStorage.getItem(DB_KEYS.ADMINS) || '[]');
        const admin = admins.find(a => a.username === username && a.password === password);
        
        if (admin) return admin;
        throw new Error('Invalid admin credentials');
    },

    // Simple hash helper to match script.js logic if needed internally
    async hashString(str) {
        if (!str) return '';
        const enc = new TextEncoder();
        const data = enc.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
};

// --- Flight Service ---
const FlightService = {
    async getAllFlights() {
        await delay();
        // Return default flights if empty
        let flights = JSON.parse(localStorage.getItem(DB_KEYS.FLIGHTS));
        if (!flights || flights.length === 0) {
           flights = this._getDefaultFlights();
           localStorage.setItem(DB_KEYS.FLIGHTS, JSON.stringify(flights));
        }
        return flights;
    },

    async addFlight(flightData) {
        await delay();
        const flights = await this.getAllFlights();
        flights.push(flightData);
        localStorage.setItem(DB_KEYS.FLIGHTS, JSON.stringify(flights));
        return flightData;
    },

    async updateFlight(flightNumber, updates) {
        await delay();
        const flights = await this.getAllFlights();
        const index = flights.findIndex(f => f.number === flightNumber);
        if (index === -1) throw new Error('Flight not found');
        
        flights[index] = { ...flights[index], ...updates };
        localStorage.setItem(DB_KEYS.FLIGHTS, JSON.stringify(flights));
        return flights[index];
    },

    async deleteFlight(flightNumber) {
        await delay();
        let flights = await this.getAllFlights();
        flights = flights.filter(f => f.number !== flightNumber);
        localStorage.setItem(DB_KEYS.FLIGHTS, JSON.stringify(flights));
        return true;
    },

    async updateSeats(flightNumber, newCount) {
        await delay();
        const flights = await this.getAllFlights();
        const flight = flights.find(f => f.number === flightNumber);
        if (flight) {
            flight.seats = parseInt(newCount);
            localStorage.setItem(DB_KEYS.FLIGHTS, JSON.stringify(flights));
            return flight;
        }
        throw new Error('Flight not found');
    },

    _getDefaultFlights() {
        return [
            { number: 'ET701', source: 'Addis Ababa', destination: 'Bahir Dar', time: '07:00', seats: 50, price: 150 },
            { number: 'ET702', source: 'Addis Ababa', destination: 'Mekele', time: '08:30', seats: 60, price: 200 },
            { number: 'ET703', source: 'Addis Ababa', destination: 'Gondar', time: '10:00', seats: 45, price: 180 },
            { number: 'ET704', source: 'Addis Ababa', destination: 'Hawassa', time: '12:00', seats: 55, price: 120 },
            { number: 'ET705', source: 'Addis Ababa', destination: 'Arba Minch', time: '14:00', seats: 40, price: 140 },
            { number: 'ET706', source: 'Addis Ababa', destination: 'Dire Dawa', time: '16:00', seats: 50, price: 160 },
            { number: 'ET707', source: 'Addis Ababa', destination: 'Axum', time: '18:00', seats: 35, price: 190 },
            { number: 'ET708', source: 'Addis Ababa', destination: 'Lalibela', time: '09:00', seats: 30, price: 220 },
            { number: 'ET709', source: 'Addis Ababa', destination: 'Gambella', time: '11:00', seats: 25, price: 250 },
            { number: 'ET710', source: 'Addis Ababa', destination: 'Jimma', time: '13:00', seats: 45, price: 130 }
        ];
    }
};

// --- Booking Service ---
const BookingService = {
    async createBooking(bookingData) {
        await delay();
        // bookingData should include: flightNumber, username, passengerName, seat, paymentMethod
        const bookings = JSON.parse(localStorage.getItem(DB_KEYS.BOOKINGS) || '[]');
        
        // Add ID and timestamp
        const newBooking = {
            id: 'BK' + Date.now(),
            date: new Date().toISOString(),
            status: 'Confirmed',
            ...bookingData
        };
        
        bookings.push(newBooking);
        localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(bookings));
        
        // We should also decrement seats or mark seat as occupied
        await this._occupySeat(bookingData.flightNumber, bookingData.seat);
        
        return newBooking;
    },

    async getUserBookings(username) {
        await delay();
        const bookings = JSON.parse(localStorage.getItem(DB_KEYS.BOOKINGS) || '[]');
        return bookings.filter(b => b.username === username);
    },

    async getAllBookings() {
        await delay();
        return JSON.parse(localStorage.getItem(DB_KEYS.BOOKINGS) || '[]');
    },

    async cancelBooking(bookingId) {
        await delay();
        const bookings = JSON.parse(localStorage.getItem(DB_KEYS.BOOKINGS) || '[]');
        const booking = bookings.find(b => b.id === bookingId);
        
        if (booking) {
            booking.status = 'Cancelled';
            localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(bookings));
            // In a real system, we'd free the seat here
            return booking;
        }
        throw new Error('Booking not found');
    },

    async submitFeedback(feedbackData) {
        await delay();
        const feedbacks = JSON.parse(localStorage.getItem(DB_KEYS.FEEDBACK) || '[]');
        const newFeedback = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...feedbackData
        };
        feedbacks.push(newFeedback);
        localStorage.setItem(DB_KEYS.FEEDBACK, JSON.stringify(feedbacks));
        return newFeedback;
    },

    async _occupySeat(flightNumber, seatId) {
        // Interacting with the seatmap storage logic
        // This mirrors script.js logic but keeps it in Data Layer
        const maps = JSON.parse(localStorage.getItem('seatmaps') || '{}');
        if (!maps[flightNumber]) maps[flightNumber] = [];
        if (!maps[flightNumber].includes(seatId)) {
            maps[flightNumber].push(seatId);
            localStorage.setItem('seatmaps', JSON.stringify(maps));
        }
    }
};

// Expose Services Globaly
window.AuthService = AuthService;
window.FlightService = FlightService;
window.BookingService = BookingService;
