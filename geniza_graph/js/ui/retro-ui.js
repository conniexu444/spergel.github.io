class RetroUI extends BaseUI {
    constructor(graph) {
        super(graph);
        this.initializeRetroUI();
    }

    // Override the base handler
    handleLetterDetails(data) {
        this.showRetroMetadata(data);
    }

    initializeRetroUI() {
        // Make tags panel draggable
        this.makeDraggable($('.tags-panel'), '.panel-header');
        
        // Add retro-specific event listeners
        document.addEventListener('showLetterDetails', (event) => {
            this.showRetroMetadata(event.detail);
        });

        // Initialize retro-specific elements
        this.initializeRetroElements();
        this.initializeRetroTimeSlider();
    }

    initializeRetroTimeSlider() {
        // Add retro styling to time slider
        $('.ui-slider-handle').addClass('retro-handle');
        $('.ui-slider-range').addClass('retro-range');
    }

    initializeRetroElements() {
        // Create metadata overlay and popup if they don't exist
        if (!$('.metadata-overlay').length) {
            $('body').append('<div class="metadata-overlay"></div>');
        }
        if (!$('.metadata-popup').length) {
            $('body').append(`
                <div class="metadata-popup">
                    <div class="metadata-header">
                        <span class="metadata-title"></span>
                        <button class="close-metadata">×</button>
                    </div>
                    <div class="metadata-content"></div>
                </div>
            `);
        }

        // Add close handler for metadata
        $('.close-metadata, .metadata-overlay').on('click', () => {
            this.hideMetadata();
        });

        // Add keyboard handler for ESC
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideMetadata();
            }
        });
    }

    showRetroMetadata(data) {
        let title, content;

        if (data.type === 'node') {
            // Person metadata
            const letters = this.findLettersForPerson(data.data.id);
            title = `PERSON: ${data.data.id}`;
            content = `
                <div class="metadata-section">
                    <p>TOTAL LETTERS: ${letters.length}</p>
                    <hr>
                    ${letters.map((letter, index) => `
                        <div class="letter-entry">
                            <p>LETTER ${index + 1}</p>
                            <p>PGPID: ${letter.pgpid}</p>
                            <p>FROM: ${letter.source}</p>
                            <p>TO: ${letter.target}</p>
                            <p>DATE: ${letter.date || 'UNKNOWN'}</p>
                            <p>START: ${letter.start_location || 'UNKNOWN'}</p>
                            <p>END: ${letter.end_location || 'UNKNOWN'}</p>
                            ${letter.tags ? `<p>TAGS: ${letter.tags.join(', ')}</p>` : ''}
                            <p><a href="https://geniza.princeton.edu/en/documents/${letter.pgpid}" target="_blank">VIEW DOCUMENT >></a></p>
                            <hr>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            // Connection metadata
            title = `CONNECTION DETAILS`;
            content = `
                <div class="metadata-section">
                    <p>PEOPLE: ${data.data.source.id} <-> ${data.data.target.id}</p>
                    <p>TOTAL LETTERS: ${data.data.letters.length}</p>
                    <hr>
                    ${data.data.letters.map((letter, index) => `
                        <div class="letter-entry">
                            <p>LETTER ${index + 1}</p>
                            <p>PGPID: ${letter.pgpid}</p>
                            <p>DATE: ${letter.date || 'UNKNOWN'}</p>
                            <p>START: ${letter.start_location || 'UNKNOWN'}</p>
                            <p>END: ${letter.end_location || 'UNKNOWN'}</p>
                            ${letter.tags ? `<p>TAGS: ${letter.tags.join(', ')}</p>` : ''}
                            <p><a href="https://geniza.princeton.edu/en/documents/${letter.pgpid}" target="_blank">VIEW DOCUMENT >></a></p>
                            <hr>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Update and show metadata
        $('.metadata-title').text(title);
        $('.metadata-content').html(content);
        $('.metadata-overlay, .metadata-popup').fadeIn(200);

        // Add retro animation effect
        this.showRetroLoading();
        setTimeout(() => {
            this.hideRetroLoading();
        }, 500);
    }

    hideMetadata() {
        $('.metadata-overlay, .metadata-popup').fadeOut(200);
    }

    showRetroLoading() {
        $('.metadata-popup').append(`
            <div class="retro-loading">
                LOADING...
                <div class="loading-bar"></div>
            </div>
        `);
    }

    hideRetroLoading() {
        $('.retro-loading').remove();
    }

    makeDraggable(element, handle) {
        let isDragging = false;
        let startX, startY, elementX, elementY;

        const dragStart = (e) => {
            if (e.target.closest('.close-metadata')) return;
            
            isDragging = true;
            const event = e.type === "mousedown" ? e : e.touches[0];
            startX = event.clientX - elementX;
            startY = event.clientY - elementY;
            
            element.css('cursor', 'grabbing');
        };

        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const event = e.type === "mousemove" ? e : e.touches[0];
            elementX = event.clientX - startX;
            elementY = event.clientY - startY;

            // Keep within viewport
            const rect = element[0].getBoundingClientRect();
            elementX = Math.min(Math.max(elementX, 0), window.innerWidth - rect.width);
            elementY = Math.min(Math.max(elementY, 0), window.innerHeight - rect.height);

            element.css({
                'position': 'fixed',
                'left': elementX + 'px',
                'top': elementY + 'px'
            });
        };

        const dragEnd = () => {
            isDragging = false;
            element.css('cursor', 'grab');
        };

        // Add event listeners
        handle = handle ? element.find(handle) : element;
        
        // Mouse events
        handle.on('mousedown', dragStart);
        $(document).on('mousemove', drag);
        $(document).on('mouseup', dragEnd);

        // Touch events
        handle.on('touchstart', dragStart);
        $(document).on('touchmove', drag);
        $(document).on('touchend', dragEnd);
    }

    showRetroError(message) {
        $("#graph-container").append(`
            <div class="retro-error">
                ERROR: ${message}
                <div class="blink">PRESS ANY KEY TO CONTINUE</div>
            </div>
        `);

        $(document).one('keypress', () => {
            $(".retro-error").remove();
        });
    }
}
