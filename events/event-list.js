function showAllEvents() {
    const eventsListEl = document.getElementById('events-list');
    const filteredEvents = EventUtils.getFilteredEvents();
    
    eventsListEl.innerHTML = '';
    
    filteredEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        eventDiv.innerHTML = EventUtils.renderEventDetails(event);
        eventsListEl.appendChild(eventDiv);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    EventUtils.initializeMobileFilters();
    EventUtils.loadEvents(() => {
        EventUtils.createSourceFilters(showAllEvents);
        showAllEvents();
    });
});