function loadHeader() {
    const header = document.createElement('div');
    header.className = 'custom-header';
    header.innerHTML = `
        <div class="header-content">
            <nav>
                <a href="event-list.html" id="event-list-link" class="nav-button">View All Events</a>
                <a href="calendar.html" id="calendar-link" class="nav-button">View Calendar</a>
            </nav>
        </div>
    `;
    
    // Insert the custom header after the existing h1 element
    const mainHeader = document.querySelector('h1');
    mainHeader.parentNode.insertBefore(header, mainHeader.nextSibling);

    // Highlight the current page in the navigation
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'event-list.html') {
        document.getElementById('event-list-link').classList.add('active');
    } else if (currentPage === 'calendar.html') {
        document.getElementById('calendar-link').classList.add('active');
    } 

}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadHeader);