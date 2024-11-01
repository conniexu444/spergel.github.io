function loadHeader() {
    const navButtons = `
        <a href="event-list.html" id="event-list-link" class="nav-button">View All Events</a>
        <a href="calendar.html" id="calendar-link" class="nav-button">View Calendar</a>
    `;
    
    // Find the existing navigation or header area
    const existingNav = document.querySelector('.nav-links');
    if (!existingNav) {
        // If nav-links doesn't exist, create it in the header
        const headerEl = document.getElementById('header');
        if (headerEl) {
            const nav = document.createElement('nav');
            nav.className = 'nav-links';
            nav.innerHTML = navButtons;
            headerEl.appendChild(nav);
        }
    } else {
        existingNav.innerHTML += navButtons;
    }

    // Add active class after ensuring elements exist
    const currentPage = window.location.pathname.split('/').pop();
    const eventListLink = document.getElementById('event-list-link');
    const calendarLink = document.getElementById('calendar-link');
    
    if (currentPage === 'event-list.html' && eventListLink) {
        eventListLink.classList.add('active');
    } else if (currentPage === 'calendar.html' && calendarLink) {
        calendarLink.classList.add('active');
    }
}

// Wait for DOM content to be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}