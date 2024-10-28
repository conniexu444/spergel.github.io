class StandardUI extends BaseUI {
    constructor(graph) {
        super(graph);  // Pass graph to BaseUI
        this.initializeStandardUI();
    }

    // Add this override method to match RetroUI's pattern
    handleLetterDetails(data) {
        this.showModernMetadata(data);
    }

    initializeStandardUI() {
        // Remove any existing elements
        $('#dialog').remove();
        $('.ui-dialog').remove();
        
        // Create dialog elements
        if (!$('#dialog').length) {
            $('body').append(`
                <div id="dialog" title="Details">
                    <div id="dialog-body"></div>
                </div>
            `);
        }

        // Initialize jQuery UI dialog
        $("#dialog").dialog({
            autoOpen: false,
            modal: false,
            width: 500,
            height: 'auto',
            maxHeight: window.innerHeight * 0.8,
            draggable: true,
            resizable: false,
            closeOnEscape: true,
            position: { 
                my: "center", 
                at: "center", 
                of: window 
            }
        });
    }

    showModernMetadata(data) {
        try {
            let title, content;
            console.log("Showing metadata for:", data); // Debug log

            if (data.type === 'node') {
                // Find all letters connected to this person
                const letters = this.findLettersForPerson(data.data.id);
                
                title = `Person Details: ${data.data.id}`;
                content = `
                    <div class="metadata-section">
                        <div class="metadata-item">
                            <h3>Person Information</h3>
                            <p><strong>Name:</strong> ${data.data.id}</p>
                            <p><strong>Total Letters:</strong> ${letters.length}</p>
                        </div>
                        
                        <div class="letters-section">
                            <h3>Letters</h3>
                            ${letters.map((letter, index) => `
                                <div class="letter-item">
                                    <p><strong>PGPID:</strong> ${letter.pgpid}</p>
                                    <p><strong>Direction:</strong> ${letter.source} → ${letter.target}</p>
                                    <p><strong>Date:</strong> ${letter.date || 'Unknown'}</p>
                                    <p><strong>From:</strong> ${letter.start_location || 'Unknown'}</p>
                                    <p><strong>To:</strong> ${letter.end_location || 'Unknown'}</p>
                                    ${letter.tags ? `<p><strong>Tags:</strong> ${letter.tags.join(', ')}</p>` : ''}
                                    <p><a href="https://geniza.princeton.edu/en/documents/${letter.pgpid}" target="_blank">View Document</a></p>
                                    <hr>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                // Connection metadata (link click)
                title = `Connection Details`;
                content = `
                    <div class="metadata-section">
                        <div class="metadata-item">
                            <h3>Connection Information</h3>
                            <p><strong>People:</strong> ${data.data.source.id} → ${data.data.target.id}</p>
                            <p><strong>Total Letters:</strong> ${data.data.letters.length}</p>
                        </div>
                        
                        <div class="letters-section">
                            <h3>Letters</h3>
                            ${data.data.letters.map((letter, index) => `
                                <div class="letter-item">
                                    <p><strong>PGPID:</strong> ${letter.pgpid}</p>
                                    <p><strong>Date:</strong> ${letter.date || 'Unknown'}</p>
                                    <p><strong>From:</strong> ${letter.start_location || 'Unknown'}</p>
                                    <p><strong>To:</strong> ${letter.end_location || 'Unknown'}</p>
                                    ${letter.tags ? `<p><strong>Tags:</strong> ${letter.tags.join(', ')}</p>` : ''}
                                    <p><a href="https://geniza.princeton.edu/en/documents/${letter.pgpid}" target="_blank">View Document</a></p>
                                    <hr>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            // Update dialog content and open it
            $('#dialog-body').html(content);
            $("#dialog")
                .dialog('option', 'title', title)
                .dialog('open');

        } catch (error) {
            console.error("Error showing metadata:", error);
            console.error("Data received:", data);
        }
    }

    updateDialogTheme(isDarkMode) {
        const dialogTheme = {
            backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderColor: isDarkMode ? '#ffffff' : '#000000'
        };

        $('.ui-dialog').css({
            'background-color': dialogTheme.backgroundColor,
            'color': dialogTheme.color,
            'border-color': dialogTheme.borderColor
        });

        $('.ui-dialog-titlebar').css({
            'background-color': 'var(--primary-color)',
            'color': '#ffffff'
        });
    }

    // Add this helper method if it's not already in BaseUI
    findLettersForPerson(personId) {
        console.log("Finding letters for person:", personId, "Graph:", this.graph); // Debug log
        
        if (!this.graph) {
            console.error('Graph is undefined in StandardUI');
            return [];
        }

        if (!this.graph.links) {
            console.error('Graph links are undefined in StandardUI');
            return [];
        }

        const letters = [];
        this.graph.links.forEach(link => {
            if (link.source.id === personId || link.target.id === personId) {
                link.letters.forEach(letter => {
                    letters.push({
                        ...letter,
                        source: link.source.id,
                        target: link.target.id
                    });
                });
            }
        });
        return letters;
    }
}
