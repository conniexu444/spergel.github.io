// Global object to hold our utility functions
window.EventUtils = {
    events: [],
    selectedSources: new Set(),

    loadEvents: async function(onEventsLoaded) {
        const eventSource = 'data/all_events.json';

        try {
            const response = await fetch(eventSource);
            const jsonData = await response.json();
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            this.events = jsonData
                .filter(event => event.start_date && event.end_date && new Date(event.start_date) >= today);
            
            // Remove duplicate events
            this.events = this.events.filter((event, index, self) =>
                index === self.findIndex((t) => t.title === event.title && t.start_date === event.start_date)
            );

            // Sort events by start date
            this.events.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            
            onEventsLoaded();
        } catch (error) {
            console.error('Error loading events:', error);
        }
    },

    createSourceFilters: function(onFilterChange) {
        createSourceFilters(this.events, onFilterChange);
    },

    getFilteredEvents: function() {
        return getFilteredEvents(this.events);
    },

    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    },

    formatTime: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    sanitizeHTML: function(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return DOMPurify.sanitize(temp.innerHTML, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: ['href', 'target']
        });
    },

    decodeHTMLEntities: function(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    },

    renderEventDetails: function(event) {
        const decodedDescription = this.decodeHTMLEntities(event.description || '');
        const sanitizedDescription = this.sanitizeHTML(decodedDescription);
        
        return `
            <h3><a href="${this.sanitizeHTML(event.url)}" target="_blank" rel="noopener noreferrer">${this.sanitizeHTML(event.title)}</a></h3>
            <p><strong>Date:</strong> ${this.formatDate(event.start_date)}</p>
            <p><strong>Time:</strong> ${this.formatTime(event.start_date)} - ${this.formatTime(event.end_date)}</p>
            <p><strong>Location:</strong> ${this.sanitizeHTML(event.location || 'N/A')}</p>
            <p><strong>University:</strong> ${this.sanitizeHTML(event.university || event.source || 'Unknown')}</p>
            <p><strong>Department:</strong> ${this.sanitizeHTML(event.department || event['department-program'] || 'N/A')}</p>
            <div class="event-description">${sanitizedDescription}</div>
        `;
    }
};