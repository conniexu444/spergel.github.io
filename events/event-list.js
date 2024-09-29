function showAllEvents() {
    const eventsListEl = document.getElementById('events-list');
    const filteredEvents = EventUtils.getFilteredEvents();
    
    eventsListEl.innerHTML = ''; // Clear existing content
    
    filteredEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        eventDiv.innerHTML = EventUtils.renderEventDetails(event);
        eventsListEl.appendChild(eventDiv);
    });
}

EventUtils.loadEvents(() => {
    EventUtils.createSourceFilters(showAllEvents);
    showAllEvents();
});