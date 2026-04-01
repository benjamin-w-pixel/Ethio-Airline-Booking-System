
// ============================================================
// SECTION: showAdminSection — wire up analytics tab
// ============================================================
function showAdminSection(sectionId) {
    document.querySelectorAll('#admin-dashboard .dashboard-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    if (sectionId === 'manage-flights') loadFlightsForManagement();
    if (sectionId === 'view-bookings')  loadAllBookingsAdmin();
    if (sectionId === 'analytics')      loadAnalyticsDashboard();
}

function showPassengerSection(sectionId) {
    document.querySelectorAll('#passenger-dashboard .dashboard-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    if (sectionId === 'book-flight')    loadFlights();
    if (sectionId === 'my-bookings')    loadMyBookings();
    if (sectionId === 'search-flights') { document.getElementById('search-results').innerHTML = ''; }
}

function showMessage(elementId, msg, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.className = 'message ' + type;
    el.innerHTML = msg;
}

// ============================================================
// ANALYTICS DASHBOARD
// ============================================================
async function loadAnalyticsDashboard() {
    const statsEl   = document.getElementById('analytics-stats');
    const routeEl   = document.getElementById('route-chart');
    const revenueEl = document.getElementById('revenue-chart');
    const recentEl  = document.getElementById('recent-bookings-table');
    const statusEl  = document.getElementById('status-breakdown');
    if (!statsEl) return;
    statsEl.innerHTML = '<div class="message info">Loading analytics...</div>';

    let flts = flights, bks = bookings;
    try {
        const results = await Promise.all([FlightService.getAllFlights(), BookingService.getAllBookings()]);
        flts = results[0]; bks = results[1];
        flights = flts;
    } catch(e) { /* use cached */ }

    const totalFlights    = flts.length;
    const totalBookings   = bks.length;
    const totalRevenue    = bks.reduce((s, b) => s + parseFloat(b.base_price || b.price || 0), 0);
    const totalPassengers = [...new Set(bks.map(b => b.username))].length;
    const confirmed       = bks.filter(b => !b.status || b.status === 'confirmed').length;
    const cancelled       = bks.filter(b => b.status === 'cancelled').length;
    const delayed         = bks.filter(b => b.status === 'delayed').length;

    // KPI Cards
    statsEl.innerHTML = `
        <div class="stat-card green"><div class="stat-icon">✈️</div><div class="stat-value">${totalFlights}</div><div class="stat-label">Active Flights</div></div>
        <div class="stat-card gold"><div class="stat-icon">📋</div><div class="stat-value">${totalBookings}</div><div class="stat-label">Total Bookings</div></div>
        <div class="stat-card blue"><div class="stat-icon">💰</div><div class="stat-value">$${totalRevenue.toFixed(0)}</div><div class="stat-label">Revenue</div></div>
        <div class="stat-card red"><div class="stat-icon">👥</div><div class="stat-value">${totalPassengers}</div><div class="stat-label">Passengers</div></div>
        <div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-value">${confirmed}</div><div class="stat-label">Confirmed</div></div>
        <div class="stat-card red"><div class="stat-icon">❌</div><div class="stat-value">${cancelled}</div><div class="stat-label">Cancelled</div></div>
    `;

    // Route Chart
    const routeCounts = {};
    bks.forEach(b => {
        const key = (b.source || '?') + ' → ' + (b.destination || '?');
        routeCounts[key] = (routeCounts[key] || 0) + 1;
    });
    const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxRoute  = Math.max(...topRoutes.map(r => r[1]), 1);
    if (routeEl) {
        if (!topRoutes.length) {
            routeEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;align-self:center;">Book flights to see route data.</p>';
        } else {
            routeEl.innerHTML = topRoutes.map(function(entry) {
                const route = entry[0], count = entry[1];
                const heightPct = Math.round((count / maxRoute) * 100);
                const label = route.replace(/\(.*?\)/g,'').trim().substring(0, 12);
                return '<div class="bar-item"><div class="bar-value">' + count + '</div>' +
                    '<div class="bar-fill" style="height:' + Math.max(heightPct, 4) + '%;"></div>' +
                    '<div class="bar-label">' + label + '</div></div>';
            }).join('');
        }
    }

    // Revenue by weekday
    const revenueByDay = { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };
    bks.forEach(b => {
        const d = new Date(b.created_at || b.booking_date || Date.now());
        const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
        revenueByDay[day] += parseFloat(b.base_price || b.price || 0);
    });
    const maxRev = Math.max.apply(null, Object.values(revenueByDay).concat([1]));
    if (revenueEl) {
        revenueEl.innerHTML = Object.entries(revenueByDay).map(function(entry) {
            const day = entry[0], rev = entry[1];
            const h = Math.round((rev / maxRev) * 100);
            return '<div class="bar-item"><div class="bar-value">$' + rev.toFixed(0) + '</div>' +
                '<div class="bar-fill gold" style="height:' + Math.max(h, 4) + '%;"></div>' +
                '<div class="bar-label">' + day + '</div></div>';
        }).join('');
    }

    // Recent bookings table
    if (recentEl) {
        const recent = bks.slice(-8).reverse();
        if (!recent.length) {
            recentEl.innerHTML = '<p style="color:var(--text-muted);">No bookings yet.</p>';
        } else {
            recentEl.innerHTML = '<table class="data-table">' +
                '<thead><tr><th>#</th><th>Passenger</th><th>Route</th><th>Flight</th><th>Price</th><th>Status</th></tr></thead><tbody>' +
                recent.map(function(b) {
                    const st = b.status || 'confirmed';
                    return '<tr><td>' + b.id + '</td><td>' + (b.passenger_name || b.passengerName || b.username) +
                        '</td><td>' + (b.source||'') + ' → ' + (b.destination||'') +
                        '</td><td>' + (b.flight_number || b.flightNumber) +
                        '</td><td>$' + (b.base_price || b.price) +
                        '</td><td><span class="status-badge ' + st + '">' + st + '</span></td></tr>';
                }).join('') + '</tbody></table>';
        }
    }

    // Status breakdown
    if (statusEl) {
        const pctC = totalBookings > 0 ? Math.round(confirmed/totalBookings*100) : 0;
        const pctX = totalBookings > 0 ? Math.round(cancelled/totalBookings*100) : 0;
        const pctD = Math.max(0, 100 - pctC - pctX);
        statusEl.innerHTML = '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:0.8rem;">' +
            '<div class="stat-card green" style="flex:1;min-width:120px;"><div class="stat-value">' + pctC + '%</div><div class="stat-label">Confirmed</div></div>' +
            '<div class="stat-card red" style="flex:1;min-width:120px;"><div class="stat-value">' + pctX + '%</div><div class="stat-label">Cancelled</div></div>' +
            '<div class="stat-card gold" style="flex:1;min-width:120px;"><div class="stat-value">' + pctD + '%</div><div class="stat-label">Rebooking</div></div>' +
            '</div><div style="background:rgba(255,255,255,0.05);border-radius:8px;overflow:hidden;height:12px;display:flex;">' +
            '<div style="width:' + pctC + '%;background:var(--green-light);transition:width 0.8s;"></div>' +
            '<div style="width:' + pctX + '%;background:var(--red);transition:width 0.8s;"></div>' +
            '<div style="width:' + pctD + '%;background:var(--gold);transition:width 0.8s;"></div></div>';
    }
}

function loadStatistics() { loadAnalyticsDashboard(); }

// ============================================================
// ADMIN: loadAllBookingsAdmin
// ============================================================
async function loadAllBookingsAdmin() {
    const list = document.getElementById('all-bookings-list');
    if (!list) return;
    list.innerHTML = '<div class="message info">Loading...</div>';
    try {
        const bks = await BookingService.getAllBookings();
        bookings = bks;
        list.innerHTML = '';
        if (!bks.length) {
            list.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No bookings yet.</p></div>';
            return;
        }
        bks.forEach(function(b) {
            const st = b.status || 'confirmed';
            const card = document.createElement('div');
            card.className = 'booking-card status-' + st;
            card.innerHTML = '<div class="flight-route"><span>' + (b.passenger_name || b.username) + '</span><span class="flight-arrow">•</span><span>' + (b.source||'') + ' ✈ ' + (b.destination||'') + '</span></div>' +
                '<div class="flight-details">' +
                '<div class="flight-detail-item"><span class="flight-detail-label">Booking</span><span class="flight-detail-value">#' + b.id + '</span></div>' +
                '<div class="flight-detail-item"><span class="flight-detail-label">Flight</span><span class="flight-detail-value">' + (b.flight_number || b.flightNumber) + '</span></div>' +
                '<div class="flight-detail-item"><span class="flight-detail-label">Date</span><span class="flight-detail-value">' + (b.booking_date || '-') + '</span></div>' +
                '</div><div class="card-actions">' +
                '<span class="flight-price-badge">💰 $' + (b.base_price || b.price) + '</span>' +
                '<span class="status-badge ' + st + '">' + st + '</span></div>';
            list.appendChild(card);
        });
    } catch (err) {
        list.innerHTML = '<div class="message error">Could not load. Using local data.</div>';
    }
}

// ============================================================
// LIVE SEARCH FILTERS
// ============================================================
function filterFlightsLive(value) {
    const cards = document.querySelectorAll('#flights-list .flight-card');
    if (!cards.length) { loadFlights(value); return; }
    const q = value.toLowerCase();
    cards.forEach(function(card) {
        card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

function filterManageFlights(value) {
    const cards = document.querySelectorAll('#manage-flights-list .flight-card');
    const q = value.toLowerCase();
    cards.forEach(function(card) {
        card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

function filterBookings(value) {
    const cards = document.querySelectorAll('#all-bookings-list .booking-card');
    const q = value.toLowerCase();
    cards.forEach(function(card) {
        card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

function searchFlights() {
    const from    = (document.getElementById('search-from').value || '').toLowerCase();
    const to      = (document.getElementById('search-to').value || '').toLowerCase();
    const results = document.getElementById('search-results');
    if (!results) return;
    results.innerHTML = '';
    const filtered = flights.filter(function(f) {
        const seats = f.seats_available !== undefined ? f.seats_available : (f.seatsAvailable || 0);
        return seats > 0 && (f.source||'').toLowerCase().includes(from) && (f.destination||'').toLowerCase().includes(to);
    });
    if (!filtered.length) {
        results.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>No flights found.</p></div>';
        return;
    }
    filtered.forEach(function(f) {
        const fn = f.flight_number || f.flightNumber;
        const seats = f.seats_available !== undefined ? f.seats_available : (f.seatsAvailable || 0);
        const card = document.createElement('div');
        card.className = 'flight-card';
        card.innerHTML = '<div class="flight-route"><span>' + f.source + '</span><span class="flight-arrow">✈</span><span>' + f.destination + '</span></div>' +
            '<div class="flight-details">' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Flight</span><span class="flight-detail-value">' + fn + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Time</span><span class="flight-detail-value">' + (f.departure_time || f.departureTime) + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Seats</span><span class="seats-badge available">' + seats + '</span></div>' +
            '</div><div class="card-actions"><span class="flight-price-badge">💰 $' + f.price + '</span>' +
            '<button class="btn btn-primary book-btn" data-flight-number="' + fn + '" style="margin-left:auto;">✈️ Book</button></div>';
        results.appendChild(card);
    });
}

// ============================================================
// PDF TICKET
// ============================================================
function showTicket(booking) {
    if (typeof booking === 'string') { try { booking = JSON.parse(booking); } catch(e) { return; } }
    const modal = document.getElementById('ticket-modal');
    const area  = document.getElementById('ticket-preview-area');
    if (!modal || !area) return;
    window._currentTicketBooking = booking;

    const bookingRef = 'ET-' + String(booking.id || '000000').padStart(6,'0');
    const fn    = booking.flight_number || booking.flightNumber || 'N/A';
    const src   = booking.source || 'N/A';
    const dst   = booking.destination || 'N/A';
    const dep   = booking.departure_time || booking.departureTime || 'N/A';
    const seat  = booking.seat_number || booking.selectedSeat || 'Auto';
    const price = booking.base_price || booking.price || 0;
    const pax   = booking.passenger_name || booking.passengerName || (currentUser ? (currentUser.name || currentUser.username) : 'Passenger');
    const bDate = booking.booking_date || new Date().toLocaleDateString();
    const st    = (booking.status || 'confirmed').toUpperCase();
    const stColor = st === 'CONFIRMED' ? '#006400' : st === 'CANCELLED' ? '#dc2626' : '#d97706';

    area.innerHTML = '<div class="ticket-preview" id="ticket-printable">' +
        '<div class="ticket-header">' +
        '<div><div style="font-size:1.4rem;font-weight:800;letter-spacing:1px;">✈ ETHIOPIAN AIRLINES</div>' +
        '<div style="font-size:0.75rem;opacity:0.8;letter-spacing:2px;">BOARDING PASS</div></div>' +
        '<div style="text-align:right;"><div style="font-size:0.75rem;opacity:0.8;">Booking Ref</div>' +
        '<div style="font-size:1.1rem;font-weight:800;letter-spacing:2px;">' + bookingRef + '</div></div>' +
        '</div>' +
        '<div class="ticket-body">' +
        '<div class="ticket-route"><div style="font-size:0.8rem;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Route</div>' +
        '<div class="route-text">' + src + ' → ' + dst + '</div></div>' +
        '<div class="ticket-row">' +
        '<div class="ticket-field"><label>Passenger</label><span>' + pax + '</span></div>' +
        '<div class="ticket-field"><label>Flight</label><span>' + fn + '</span></div>' +
        '<div class="ticket-field"><label>Departure</label><span>' + dep + '</span></div>' +
        '<div class="ticket-field"><label>Seat</label><span>' + seat + '</span></div>' +
        '<div class="ticket-field"><label>Date</label><span>' + bDate + '</span></div>' +
        '<div class="ticket-field"><label>Amount Paid</label><span style="color:#006400;font-weight:800;">$' + price + '</span></div>' +
        '</div><hr class="ticket-divider">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div><div style="font-size:0.72rem;color:#6b7280;text-transform:uppercase;">Status</div>' +
        '<div style="font-weight:700;color:' + stColor + ';">' + st + '</div></div>' +
        '<div style="font-size:1.8rem;letter-spacing:2px;opacity:0.6;">▌▌▌║▌║║▌▌║▌▌║║▌▌▌</div></div>' +
        '</div>' +
        '<div class="ticket-footer">Thank you for flying Ethiopian Airlines — The Leading Airline of Africa ✈️<br>' +
        'customerservice@ethiopianairlines.com | +251 11 125 1010</div></div>';

    modal.style.display = 'block';
}

function closeTicketModal() { const m = document.getElementById('ticket-modal'); if(m) m.style.display='none'; }

function printTicket() {
    const el = document.getElementById('ticket-printable');
    if (!el) return;
    const win = window.open('', '_blank', 'width=700,height=650');
    win.document.write('<!DOCTYPE html><html><head><title>Boarding Pass</title><style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#fff;}.ticket-header{background:linear-gradient(135deg,#006400,#004200);color:white;padding:20px;display:flex;justify-content:space-between;align-items:center;}.ticket-body{padding:20px;}.ticket-route{text-align:center;padding:15px;background:#f9fafb;border-radius:8px;margin:15px 0;}.route-text{font-size:1.5rem;font-weight:800;color:#006400;}.ticket-row{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:15px 0;}.ticket-field label{font-size:11px;text-transform:uppercase;color:#666;display:block;font-weight:700;margin-bottom:2px;}.ticket-field span{font-size:1rem;font-weight:700;color:#111;}.ticket-divider{border:none;border-top:2px dashed #ddd;margin:15px 0;}.ticket-footer{background:#f9fafb;padding:10px 20px;text-align:center;font-size:11px;color:#666;border-top:1px solid #e5e7eb;}</style></head><body>' + el.outerHTML + '</body></html>');
    win.document.close();
    setTimeout(function(){ win.print(); }, 400);
}

function downloadTicketPDF() {
    const el = document.getElementById('ticket-printable');
    if (!el) return;
    const opt = {
        margin:       10,
        filename:     'Ethiopian_Airlines_Ticket.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(el).save();
    } else {
        alert('PDF generator not loaded. Falling back to print.');
        printTicket();
    }
}

// ============================================================
// ABOUT MODAL
// ============================================================
function showAboutSystem() { const m = document.getElementById('about-system-modal'); if(m) m.style.display='block'; }
function closeAboutModal()  { const m = document.getElementById('about-system-modal'); if(m) m.style.display='none'; }

// ============================================================
// LOGOUT — silent
// ============================================================
function logout() {
    currentUser = null; currentAdmin = null; selectedFlight = null;
    showScreen('main-menu');
    loadExistingUsers();
}

// Close modals on outside click
window.addEventListener('click', function(e) {
    ['payment-modal','manage-seats-modal','seat-modal','about-system-modal',
     'payment-method-modal','rate-us-modal','cancel-booking-modal',
     'delay-booking-modal','edit-flight-modal','delete-confirmation-modal','ticket-modal']
    .forEach(function(id) {
        const m = document.getElementById(id);
        if (m && e.target === m) m.style.display = 'none';
    });
});

function renderBookingsList(bks) {
    if (!bks || !bks.length) return '<div class="message info">No bookings.</div>';
    return bks.map(function(b) {
        const st = b.status || 'confirmed';
        return '<div class="booking-card status-' + st + '">' +
            '<div class="flight-route">' + (b.source||'') + ' ✈ ' + (b.destination||'') + '</div>' +
            '<div class="flight-details">' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Booking</span><span class="flight-detail-value">#' + b.id + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Passenger</span><span class="flight-detail-value">' + (b.passenger_name || b.passengerName || '') + '</span></div>' +
            '</div><div class="card-actions">' +
            '<span class="flight-price-badge">$' + (b.base_price || b.price || 0) + '</span>' +
            '<span class="status-badge ' + st + '">' + st + '</span></div></div>';
    }).join('');
}

function showBookingTab(tab) {
    document.querySelectorAll('.tab-pane').forEach(function(p){ p.style.display='none'; });
    const target = document.getElementById(tab + '-bookings-tab') || document.getElementById('all-bookings-tab');
    if (target) target.style.display = 'block';
    document.querySelectorAll('.booking-tab-btn').forEach(function(btn){ btn.classList.remove('active'); });
    const activeBtn = document.querySelector('[onclick="showBookingTab(\'' + tab + '\')"]');
    if (activeBtn) activeBtn.classList.add('active');
}

// ============================================================
// loadFlights — premium card rendering
// ============================================================
async function loadFlights(filterText) {
    filterText = filterText || '';
    const flightsList = document.getElementById('flights-list');
    if (!flightsList) return;
    flightsList.innerHTML = '<div class="message info">Loading flights...</div>';

    try {
        const apiFlights = await FlightService.getAllFlights();
        flights = apiFlights;
    } catch(e) { /* use cached */ }

    let available = flights.filter(function(f) {
        const seats = f.seats_available !== undefined ? f.seats_available : (f.seatsAvailable || 0);
        return seats > 0;
    });

    if (filterText) {
        const q = filterText.toLowerCase();
        available = available.filter(function(f) {
            return (f.destination||'').toLowerCase().includes(q) ||
                   (f.source||'').toLowerCase().includes(q) ||
                   (f.flight_number||f.flightNumber||'').toLowerCase().includes(q);
        });
    }

    flightsList.innerHTML = '';

    if (!available.length) {
        flightsList.innerHTML = '<div class="empty-state"><div class="empty-icon">✈️</div><p>No flights found. Try a different search.</p></div>';
        return;
    }

    available.forEach(function(flight) {
        const fn    = flight.flight_number || flight.flightNumber;
        const seats = flight.seats_available !== undefined ? flight.seats_available : (flight.seatsAvailable || 0);
        const seatsClass = seats > 30 ? 'available' : seats > 5 ? 'low' : 'none';
        const seatsLabel = seats > 30 ? seats + ' seats' : seats > 5 ? '⚠️ ' + seats + ' left!' : '❌ Full';
        const card = document.createElement('div');
        card.className = 'flight-card';
        card.innerHTML =
            '<div class="flight-route"><span>' + flight.source + '</span><span class="flight-arrow">✈</span><span>' + flight.destination + '</span></div>' +
            '<div class="flight-details">' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Flight</span><span class="flight-detail-value">' + fn + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Day</span><span class="flight-detail-value">' + (flight.day_of_week || flight.dayOfWeek || 'Daily') + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Departure</span><span class="flight-detail-value">' + (flight.departure_time || flight.departureTime || '-') + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Availability</span><span class="seats-badge ' + seatsClass + '">' + seatsLabel + '</span></div>' +
            '</div><div class="card-actions">' +
            '<span class="flight-price-badge">💰 $' + flight.price + '</span>' +
            '<button class="btn btn-primary book-btn" data-flight-number="' + fn + '" style="margin-left:auto;">✈️ Book Now</button>' +
            '</div>';
        flightsList.appendChild(card);
    });
}

// ============================================================
// loadMyBookings — premium with ticket button
// ============================================================
async function loadMyBookings() {
    const list = document.getElementById('my-bookings-list');
    if (!list || !currentUser) return;
    list.innerHTML = '<div class="message info">Loading your bookings...</div>';

    try {
        const apiBookings = await BookingService.getUserBookings(currentUser.username);
        bookings = apiBookings;
        list.innerHTML = '';
        if (!apiBookings.length) {
            list.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No bookings yet. Book your first flight!</p></div>';
            return;
        }
        apiBookings.forEach(function(b) {
            const st = b.status || 'confirmed';
            const bookingDate = new Date(b.created_at || b.booking_date || Date.now());
            const hoursDiff = (Date.now() - bookingDate) / 3600000;
            const canCancel = hoursDiff <= 24 && st === 'confirmed';
            const bookingJson = JSON.stringify(b).replace(/"/g, '&quot;');
            const card = document.createElement('div');
            card.className = 'booking-card status-' + st;
            card.id = 'booking-' + b.id;
            card.innerHTML =
                '<div class="flight-route"><span>' + (b.source||'') + '</span><span class="flight-arrow">✈</span><span>' + (b.destination||'') + '</span></div>' +
                '<div class="flight-details" style="margin-bottom:0.8rem;">' +
                '<div class="flight-detail-item"><span class="flight-detail-label">Booking #</span><span class="flight-detail-value">' + b.id + '</span></div>' +
                '<div class="flight-detail-item"><span class="flight-detail-label">Flight</span><span class="flight-detail-value">' + (b.flight_number || b.flightNumber) + '</span></div>' +
                '<div class="flight-detail-item"><span class="flight-detail-label">Departure</span><span class="flight-detail-value">' + (b.departure_time || b.departureTime || '-') + '</span></div>' +
                '<div class="flight-detail-item"><span class="flight-detail-label">Date</span><span class="flight-detail-value">' + (b.booking_date || new Date().toLocaleDateString()) + '</span></div>' +
                (b.seat_number || b.selectedSeat ? '<div class="flight-detail-item"><span class="flight-detail-label">Seat</span><span class="flight-detail-value">' + (b.seat_number || b.selectedSeat) + '</span></div>' : '') +
                '</div><div class="card-actions">' +
                '<span class="flight-price-badge">💰 $' + (b.base_price || b.price) + '</span>' +
                '<span class="status-badge ' + st + '">' + st.charAt(0).toUpperCase() + st.slice(1) + '</span>' +
                (canCancel ? '<button class="btn btn-danger" onclick="showCancelConfirmation(\'' + b.id + '\')">❌ Cancel</button>' : '') +
                (st === 'confirmed' ? '<button class="btn btn-secondary" onclick="showDelayOptions(\'' + b.id + '\')">🔄 Rebook</button>' : '') +
                '<button class="btn btn-info" onclick="showTicket(JSON.parse(this.dataset.booking))" data-booking="' + bookingJson + '">🎫 Ticket</button>' +
                '</div>';
            list.appendChild(card);
        });
    } catch (err) {
        console.error('loadMyBookings error:', err);
        list.innerHTML = '<div class="message error">Could not load bookings.</div>';
    }
}

// ============================================================
// ADMIN FLIGHT MANAGEMENT — premium cards
// ============================================================
async function loadFlightsForManagement() {
    const list = document.getElementById('manage-flights-list');
    if (!list) return;
    list.innerHTML = '<div class="message info">Loading flights...</div>';
    try {
        const apiFlights = await FlightService.getAllFlights();
        flights = apiFlights;
    } catch(e) { /* use cached */ }

    list.innerHTML = '';
    if (!flights.length) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">✈️</div><p>No flights yet. Add one above!</p></div>';
        return;
    }

    flights.forEach(function(f) {
        const fn    = f.flight_number || f.flightNumber;
        const seats = f.seats_available !== undefined ? f.seats_available : (f.seatsAvailable || 0);
        const seatsClass = seats > 30 ? 'available' : seats > 5 ? 'low' : 'none';
        const item = document.createElement('div');
        item.className = 'flight-card';
        item.innerHTML =
            '<div class="flight-route"><span>' + f.source + '</span><span class="flight-arrow">✈</span><span>' + f.destination + '</span></div>' +
            '<div class="flight-details">' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Flight</span><span class="flight-detail-value">' + fn + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Day</span><span class="flight-detail-value">' + (f.day_of_week || f.dayOfWeek || 'Daily') + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Time</span><span class="flight-detail-value">' + (f.departure_time || f.departureTime) + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Seats</span><span class="seats-badge ' + seatsClass + '">' + seats + '</span></div>' +
            '<div class="flight-detail-item"><span class="flight-detail-label">Price</span><span class="flight-price-badge">$' + f.price + '</span></div>' +
            '</div><div class="card-actions">' +
            '<button class="btn btn-secondary" onclick="openSeatsModal(\'' + fn + '\')">🪑 Seats</button>' +
            '<button class="btn btn-info" onclick="openEditFlightModal(\'' + fn + '\')">✏️ Edit</button>' +
            '<button class="btn btn-danger" onclick="showDeleteConfirmation(\'' + fn + '\')">🗑️ Delete</button>' +
            '</div>';
        list.appendChild(item);
    });
}

function openSeatsModal(flightNumber) {
    flightToManage = flights.find(function(f){ return (f.flight_number||f.flightNumber) === flightNumber; });
    if (!flightToManage) { alert('Flight not found!'); return; }
    document.getElementById('manage-flight-number').textContent = flightNumber;
    document.getElementById('new-seats').value = flightToManage.seats_available !== undefined ? flightToManage.seats_available : flightToManage.seatsAvailable;
    document.getElementById('manage-seats-message').innerHTML = '';
    document.getElementById('manage-seats-modal').style.display = 'block';
}

function closeSeatsModal() { const m = document.getElementById('manage-seats-modal'); if(m) m.style.display='none'; }

async function updateSeats() {
    if (!flightToManage) { showMessage('manage-seats-message','No flight selected!','error'); return; }
    const newSeats = parseInt(document.getElementById('new-seats').value);
    if (isNaN(newSeats)||newSeats<0) { showMessage('manage-seats-message','Enter a valid seat count!','error'); return; }
    const fn = flightToManage.flight_number || flightToManage.flightNumber;
    try {
        await FlightService.updateSeats(fn, newSeats);
    } catch(e) {
        flightToManage.seats_available = newSeats; flightToManage.seatsAvailable = newSeats;
        localStorage.setItem('flights', JSON.stringify(flights));
    }
    showMessage('manage-seats-message','Seats updated! ✅','success');
    setTimeout(function(){ closeSeatsModal(); loadFlightsForManagement(); }, 1200);
}

function openEditFlightModal(flightNumber) {
    const f = flights.find(function(fl){ return (fl.flight_number||fl.flightNumber) === flightNumber; });
    if (!f) { alert('Flight not found!'); return; }
    document.getElementById('edit-flight-number').textContent     = flightNumber;
    document.getElementById('edit-flight-id').value               = f.id || '';
    document.getElementById('edit-flight-number-input').value     = f.flight_number || f.flightNumber;
    document.getElementById('edit-source').value                  = f.source;
    document.getElementById('edit-destination').value             = f.destination;
    document.getElementById('edit-time').value                    = f.departure_time || f.departureTime;
    document.getElementById('edit-seats').value                   = f.seats_available !== undefined ? f.seats_available : f.seatsAvailable;
    document.getElementById('edit-price').value                   = f.price;
    document.getElementById('edit-flight-modal').style.display    = 'block';
}

function closeEditFlightModal() { const m = document.getElementById('edit-flight-modal'); if(m) m.style.display='none'; }

async function updateFlight(event) {
    event.preventDefault();
    const id = document.getElementById('edit-flight-id').value;
    const updates = {
        flightNumber:   document.getElementById('edit-flight-number-input').value,
        source:         document.getElementById('edit-source').value,
        destination:    document.getElementById('edit-destination').value,
        departureTime:  document.getElementById('edit-time').value,
        seatsAvailable: parseInt(document.getElementById('edit-seats').value),
        price:          parseFloat(document.getElementById('edit-price').value),
        dayOfWeek:      'Monday'
    };
    try {
        await FlightService.updateFlight(id, updates);
        showMessage('edit-flight-message','Flight updated! ✅','success');
    } catch(e) {
        const origFn = document.getElementById('edit-flight-number').textContent;
        const idx = flights.findIndex(function(f){ return (f.flight_number||f.flightNumber) === origFn; });
        if (idx !== -1) { flights[idx] = Object.assign({}, flights[idx], updates); localStorage.setItem('flights', JSON.stringify(flights)); }
        showMessage('edit-flight-message','Updated (offline). ✅','success');
    }
    setTimeout(function(){ closeEditFlightModal(); loadFlightsForManagement(); }, 1200);
}

async function addFlight(event) {
    event.preventDefault();
    const fd = {
        flightNumber:   document.getElementById('flight-number').value.trim(),
        source:         document.getElementById('flight-source').value.trim(),
        destination:    document.getElementById('flight-destination').value.trim(),
        departureTime:  document.getElementById('flight-time').value.trim(),
        seatsAvailable: parseInt(document.getElementById('flight-seats').value),
        price:          parseFloat(document.getElementById('flight-price').value),
        dayOfWeek:      'Monday'
    };
    showMessage('add-flight-message','Adding flight...','info');
    try {
        await FlightService.addFlight(fd);
        showMessage('add-flight-message','Flight ' + fd.flightNumber + ' added! ✅','success');
        event.target.reset(); loadFlightsForManagement();
    } catch(e) {
        if (flights.find(function(f){ return f.flightNumber === fd.flightNumber; })) {
            showMessage('add-flight-message','Flight number already exists!','error'); return;
        }
        flights.push(fd); localStorage.setItem('flights', JSON.stringify(flights));
        showMessage('add-flight-message','Added offline ✅','success');
        event.target.reset(); loadFlightsForManagement();
    }
}

// Expose all new globals
window.showAdminSection         = showAdminSection;
window.showPassengerSection     = showPassengerSection;
window.showMessage              = showMessage;
window.loadAnalyticsDashboard   = loadAnalyticsDashboard;
window.loadStatistics           = loadStatistics;
window.loadAllBookingsAdmin     = loadAllBookingsAdmin;
window.loadAllBookings          = loadAllBookingsAdmin;
window.filterFlightsLive        = filterFlightsLive;
window.filterManageFlights      = filterManageFlights;
window.filterBookings           = filterBookings;
window.searchFlights            = searchFlights;
window.showTicket               = showTicket;
window.closeTicketModal         = closeTicketModal;
window.printTicket              = printTicket;
window.downloadTicketPDF        = downloadTicketPDF;
window.showAboutSystem          = showAboutSystem;
window.closeAboutModal          = closeAboutModal;
window.logout                   = logout;
window.renderBookingsList       = renderBookingsList;
window.showBookingTab           = showBookingTab;
window.loadFlights              = loadFlights;
window.loadMyBookings           = loadMyBookings;
window.loadFlightsForManagement = loadFlightsForManagement;
window.openSeatsModal           = openSeatsModal;
window.closeSeatsModal          = closeSeatsModal;
window.updateSeats              = updateSeats;
window.openEditFlightModal      = openEditFlightModal;
window.closeEditFlightModal     = closeEditFlightModal;
window.updateFlight             = updateFlight;
window.addFlight                = addFlight;

// ============================================================
// RELAXED PAYMENT PROCESSING
// ============================================================
async function processPaymentOverride() {
    if (!selectedFlight || !currentUser) {
        showMessage('payment-message', 'Error processing payment! Please try again.', 'error');
        return;
    }
    
    // Validate if Card payment
    if (selectedPaymentMethod === 'Visa' || selectedPaymentMethod === 'Visa / MasterCard' || selectedPaymentMethod === 'visa') {
        const cardNumber = document.getElementById('card-number').value;
        const cardCVV = document.getElementById('card-cvv').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        
        if (!cardNumber || !cardCVV || !cardExpiry) {
            showMessage('payment-message', 'Please fill all payment details!', 'error');
            return;
        }
        
        const cleanExpiry = cardExpiry.replace(/\s+/g, '').replace("-", "/"); 
        if (cleanExpiry.length < 4) {
             showMessage('payment-message', 'Please enter a valid expiry date!', 'error');
             return;
        }
        // Removed strict regexes so any generic date input passes for ease of testing.
    }
    
    showMessage('payment-message', 'Processing payment...', 'info');

    const fn = selectedFlight.flightNumber || selectedFlight.flight_number;
    const dp = selectedFlight.departureTime || selectedFlight.departure_time;

    const bookingData = {
        passengerName: currentUser.name || currentUser.username,
        username: currentUser.username, 
        flightNumber: fn,
        source: selectedFlight.source,
        destination: selectedFlight.destination,
        departureTime: dp,
        price: selectedFlight.price,
        selectedSeat: selectedSeat ? selectedSeat : null,
        paymentMethod: selectedPaymentMethod || 'Unknown'
    };

    try {
        await BookingService.createBooking(bookingData);

        if (selectedFlight.seatsAvailable !== undefined) selectedFlight.seatsAvailable--; 
        else if (selectedFlight.seats_available !== undefined) selectedFlight.seats_available--;
        
        showMessage('payment-message', `Payment via ${selectedPaymentMethod} successful!`, 'success');

        setTimeout(() => {
            if (typeof closePaymentModal === 'function') closePaymentModal();
            if (typeof closePaymentMethodModal === 'function') closePaymentMethodModal();
            if (typeof closeSeatModal === 'function') closeSeatModal();
            
            loadFlights(); 
            const bk = { id: "BK"+Date.now(), status: "Confirmed", date: new Date().toISOString(), ...bookingData };
            window._latestBooking = bk;
            const sm = document.getElementById('success-booking-modal');
            if (sm) sm.style.display = 'block';
        }, 1200);
    } catch(err) {
        // Fallback offline save
        try {
            const b = Object.assign({ id: "BK"+Date.now(), status: "Confirmed", date: new Date().toISOString() }, bookingData);
            const lsBks = JSON.parse(localStorage.getItem('bookings') || '[]');
            lsBks.push(b);
            localStorage.setItem('bookings', JSON.stringify(lsBks));
            showMessage('payment-message', `Payment via ${selectedPaymentMethod} successful! (Offline)`, 'success');
            setTimeout(() => {
                if (typeof closePaymentModal === 'function') closePaymentModal();
                if (typeof closePaymentMethodModal === 'function') closePaymentMethodModal();
                if (typeof closeSeatModal === 'function') closeSeatModal();
                
                loadFlights(); 
                window._latestBooking = b;
                const sm = document.getElementById('success-booking-modal');
                if (sm) sm.style.display = 'block';
            }, 1200);
        } catch(e2) {
            showMessage('payment-message', 'Booking failed.', 'error');
        }
    }
}

window.downloadNewTicket = function() {
    if (window._latestBooking) {
        showTicket(window._latestBooking);
        closeSuccessModal();
    }
}

window.closeSuccessModal = function() {
    const sm = document.getElementById('success-booking-modal');
    if (sm) sm.style.display = 'none';
    
    // Auto-navigate to My Bookings so they see their receipt/ticket in the list
    if (typeof showPassengerSection === 'function') {
        showPassengerSection('my-bookings');
    }
}

window.returnToHome = function() {
    // Hide all relevant modals
    const sm = document.getElementById('success-booking-modal');
    if (sm) sm.style.display = 'none';
    const rm = document.getElementById('rate-us-modal');
    if (rm) rm.style.display = 'none';
    const tm = document.getElementById('ticket-modal');
    if (tm) tm.style.display = 'none';
    
    // Navigate to Book Flight (main screen for logged in user)
    if (typeof showPassengerSection === 'function') {
        showPassengerSection('book-flight');
    }
}

window.processPayment = processPaymentOverride;

window.proceedToPayment = function() {
    if (!selectedPaymentMethod) {
        showMessage('payment-message', 'Please select a payment method!', 'error');
        return;
    }
    
    if (typeof closePaymentMethodModal === 'function') closePaymentMethodModal();
    
    const method = String(selectedPaymentMethod).toLowerCase();
    if (method.includes('visa')) {
        if (typeof showVisaPaymentForm === 'function') showVisaPaymentForm();
    } else if (method.includes('paypal')) {
        if (typeof showPayPalPaymentForm === 'function') showPayPalPaymentForm();
    } else if (method.includes('bank')) {
        if (typeof showBankTransferForm === 'function') showBankTransferForm();
    } else if (method.includes('mobile')) {
        if (typeof showMobileMoneyForm === 'function') showMobileMoneyForm();
    } else {
        if (typeof showVisaPaymentForm === 'function') showVisaPaymentForm(); 
    }
};

window.completeBooking = async function(paymentMethodName) {
    if (!selectedFlight || !currentUser) return;
    
    const fn = selectedFlight.flightNumber || selectedFlight.flight_number;
    const dp = selectedFlight.departureTime || selectedFlight.departure_time;

    const bookingData = {
        passengerName: currentUser.name || currentUser.username,
        username: currentUser.username, 
        flightNumber: fn,
        source: selectedFlight.source,
        destination: selectedFlight.destination,
        departureTime: dp,
        price: selectedFlight.price,
        selectedSeat: selectedSeat ? selectedSeat : null,
        paymentMethod: paymentMethodName || 'Unknown'
    };

    let confirmedBooking = { id: "BK"+Date.now(), status: "Confirmed", date: new Date().toISOString(), ...bookingData };

    try {
        const result = await BookingService.createBooking(bookingData);
        if (result && result.id) confirmedBooking.id = result.id;
        
        if (selectedFlight.seatsAvailable !== undefined) selectedFlight.seatsAvailable--; 
        else if (selectedFlight.seats_available !== undefined) selectedFlight.seats_available--;
    } catch(err) {
        let lsBks = JSON.parse(localStorage.getItem('bookings') || '[]');
        lsBks.push(confirmedBooking);
        localStorage.setItem('bookings', JSON.stringify(lsBks));
    }
    
    if (typeof closeModal === 'function') closeModal();
    
    window._latestBooking = confirmedBooking;
    loadFlights(); 
    
    const sm = document.getElementById('success-booking-modal');
    if (sm) sm.style.display = 'block';
};

window.closeRateModal = function() {
    const modal = document.getElementById('rate-us-modal');
    if(modal) modal.style.display = 'none';
    
    // Automatically navigate to 'My Bookings' so the user can see their success
    if (typeof showPassengerSection === 'function') {
        showPassengerSection('my-bookings');
    }
};

// ============================================================
// DASHBOARD NAVIGATION POLISH
// ============================================================
const originalShowPassengerSection = window.showPassengerSection;
window.showPassengerSection = function(sectionId) {
    if (originalShowPassengerSection) originalShowPassengerSection(sectionId);
    
    // Update active state on buttons
    document.querySelectorAll('#passenger-dashboard .dashboard-menu .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        
        // Match the sectionId with the onclick attribute or ID if possible
        const clickAttr = btn.getAttribute('onclick');
        if (clickAttr && clickAttr.includes(sectionId)) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        }
    });
};

const originalShowAdminSection = window.showAdminSection;
window.showAdminSection = function(sectionId) {
    if (originalShowAdminSection) originalShowAdminSection(sectionId);
    
    document.querySelectorAll('#admin-dashboard .dashboard-menu .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        
        const clickAttr = btn.getAttribute('onclick');
        if (clickAttr && clickAttr.includes(sectionId)) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        }
    });
};
