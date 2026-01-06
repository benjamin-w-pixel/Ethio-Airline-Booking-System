/**
 * services.js
 * 
 * This file contains the Data Service Layer. 
 * Updated to use fetch() to communicate with the PHP API.
 */

const API_BASE_URL = './api'; // Relative path for local server compatibility

// Helper for fetch calls
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Server Error');
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// --- Auth Service ---
const AuthService = {
    async loginPassenger(username, password) {
        // Calls api/auth/login.php
        const response = await apiCall('/auth/login.php', 'POST', { username, password });
        return response.user;
    },

    async registerPassenger(userData) {
        // Calls api/auth/register.php
        const response = await apiCall('/auth/register.php', 'POST', userData);
        return response;
    },

    async loginAdmin(username, password) {
        // Calls api/auth/login.php
        const response = await apiCall('/auth/login.php', 'POST', { username, password });
        if (response.user.role !== 'admin') {
            throw new Error('Access denied: Admin privileges required.');
        }
        return response.user;
    },
    
    async hashString(str) {
        // Keep helper for any legacy frontend needs, though logic is now server-side
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
        // Calls api/flights/list.php
        return await apiCall('/flights/list.php');
    },

    async addFlight(flightData) {
        // Backend expects camelCase keys: flightNumber, source, destination, ...
        // Ensure mapping if necessary, or assume caller provides correct keys
        return await apiCall('/flights/manage.php', 'POST', flightData);
    },

    async updateFlight(id, updates) {
        // updates should contain flightNumber, source, destination, etc.
        return await apiCall('/flights/manage.php', 'POST', { ...updates, id });
    },

    async deleteFlight(flightNumber) {
         // Calls api/flights/manage.php?flight_number=...
         return await apiCall(`/flights/manage.php?flight_number=${encodeURIComponent(flightNumber)}`, 'DELETE');
    },

    async updateSeats(flightNumber, newCount) {
        return await apiCall('/flights/update_seats.php', 'POST', { flightNumber, newCount });
    }
};

// --- Booking Service ---
const BookingService = {
    async createBooking(bookingData) {
        // Calls api/bookings/create.php
        return await apiCall('/bookings/create.php', 'POST', bookingData);
    },

    async getUserBookings(username) {
        // Calls api/bookings/list.php?username=...
        return await apiCall(`/bookings/list.php?username=${encodeURIComponent(username)}`);
    },

    async getAllBookings() {
         return await apiCall('/bookings/all.php');
    },

    async cancelBooking(bookingId) {
         return await apiCall('/bookings/cancel.php', 'POST', { booking_id: bookingId });
    },

    async submitFeedback(feedbackData) {
        // Calls api/feedback/submit.php
        return await apiCall('/feedback/submit.php', 'POST', feedbackData);
    }
};

// Expose Services Globally
window.AuthService = AuthService;
window.FlightService = FlightService;
window.BookingService = BookingService;
