let currentDate = new Date();
let selectedDate = null;

document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.getElementById('calendar');
    const selectedDateSpan = document.getElementById('selected-date');
    const eventsList = document.getElementById('events-list');

    function renderCalendar() {
        const calendarEl = document.getElementById('calendar');
        const currentMonthEl = document.getElementById('current-month');
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthEl.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        calendarEl.innerHTML = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            calendarEl.appendChild(createCalendarDay(''));
        }
        
        // Create calendar days for the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dayEvents = EventUtils.getFilteredEvents().filter(event => {
                const eventDate = new Date(event.start_date);
                return eventDate.getFullYear() === date.getFullYear() && 
                       eventDate.getMonth() === date.getMonth() && 
                       eventDate.getDate() === date.getDate();
            });
            
            const dayEl = createCalendarDay(day, dayEvents.length > 0);
            
            // Add selected class if this is the selected date
            if (selectedDate && 
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()) {
                dayEl.classList.add('selected');
            }

            // Add today class if this is today
            if (isToday(date)) {
                dayEl.classList.add('today');
            }

            dayEl.addEventListener('click', () => handleDayClick(dayEl, date));
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

    function handleDayClick(dayEl, date) {
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(d => {
            d.classList.remove('selected');
        });

        // Add selected class to clicked day
        dayEl.classList.add('selected');
        
        // Update selected date
        selectedDate = date;
        selectedDateSpan.textContent = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Show events for the selected date
        showEvents(date);
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
        
        if (dayEvents.length === 0) {
            eventsListEl.innerHTML = '<p>No events scheduled for this date.</p>';
        } else {
            dayEvents.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.classList.add('event');
                eventEl.innerHTML = EventUtils.renderEventDetails(event);
                eventsListEl.appendChild(eventEl);
            });
        }
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    // Month navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Initialize calendar
    EventUtils.loadEvents(() => {
        EventUtils.createSourceFilters(renderCalendar);
        renderCalendar();
    });
}); 