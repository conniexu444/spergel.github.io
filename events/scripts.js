let currentDate = new Date();

function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    const currentMonthEl = document.getElementById('current-month');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    calendarEl.innerHTML = '';
    
    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarEl.appendChild(createCalendarDay(''));
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dayEvents = EventUtils.getFilteredEvents().filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate.getFullYear() === date.getFullYear() && 
                   eventDate.getMonth() === date.getMonth() && 
                   eventDate.getDate() === date.getDate();
        });
        
        const dayEl = createCalendarDay(day, dayEvents.length > 0);
        dayEl.addEventListener('click', () => showEvents(date));
        calendarEl.appendChild(dayEl);
    }
}

function createCalendarDay(content, hasEvents = false) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');
    if (hasEvents) {
        dayEl.classList.add('has-events');
    }
    dayEl.textContent = content;
    return dayEl;
}

function showEvents(date) {
    const eventsListEl = document.getElementById('events-list');
    eventsListEl.innerHTML = '';
    
    const dayEvents = EventUtils.getFilteredEvents().filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.getFullYear() === date.getFullYear() && 
               eventDate.getMonth() === date.getMonth() && 
               eventDate.getDate() === date.getDate();
    });
    
    dayEvents.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.classList.add('event');
        eventEl.innerHTML = EventUtils.renderEventDetails(event);
        eventsListEl.appendChild(eventEl);
    });
}

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

EventUtils.loadEvents(() => {
    EventUtils.createSourceFilters(renderCalendar);
    renderCalendar();
});