class BaseUI {
    constructor(graph) {
        if (!graph) {
            throw new Error('Graph must be provided to BaseUI constructor');
        }
        this.graph = graph;
        this.timeRange = [250, 1850];
        this.currentDataMode = "2plus";
        this.graphData = {
            all: null,
            twoPlus: null
        };
        
        this.initializeCommonFilters();
        this.initializeEventHandlers();
        this.initializeTimeSlider();
        this.populateSelectors();
        this.addHoverEffects();
    }

    initializeTimeSlider() {
        $("#time-slider").slider({
            range: true,
            min: 250,
            max: 1850,
            values: this.timeRange,
            slide: (event, ui) => {
                this.timeRange = ui.values;
                // Update display
                $('.time-range span:first').text(ui.values[0]);
                $('.time-range span:last').text(ui.values[1]);
            }
        });
    }

    populateSelectors() {
        // Populate tag checkboxes
        const tags = new Set();
        this.graph.links.forEach(link => {
            link.letters.forEach(letter => {
                if (letter.tags) {
                    letter.tags.forEach(tag => tags.add(tag));
                }
            });
        });

        const tagsContainer = $('#tags-checkboxes');
        tagsContainer.empty();
        Array.from(tags).sort().forEach(tag => {
            tagsContainer.append(`
                <div class="checkbox-container">
                    <input type="checkbox" class="retro-checkbox" id="tag-${tag}" value="${tag}" checked>
                    <label for="tag-${tag}">${tag}</label>
                </div>
            `);
        });

        this.updateTagsCount();
    }

    updateTagsCount() {
        const selectedCount = $('.retro-checkbox:checked').length;
        const totalCount = $('.retro-checkbox').length;
        $('.panel-header').first().text(
            `TAGS SELECTOR (${selectedCount}/${totalCount})`
        );
    }

    addHoverEffects() {
        $('.retro-button, .standard-button').hover(
            function() { $(this).addClass('hover'); },
            function() { $(this).removeClass('hover'); }
        );
    }

    applyFilters() {
        const selectedTags = $('.retro-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        // Filter nodes and links based on selected criteria
        const filteredData = this.filterGraphData(selectedTags);
        
        // Update graph visualization
        this.graph.updateData(filteredData.nodes, filteredData.links);
    }

    filterGraphData(selectedTags) {
        // Implementation of data filtering logic
        // This would filter based on tags, time range, and other criteria
        // Return filtered nodes and links
    }

    initializeCommonFilters() {
        // Initialize time slider
        $("#time-slider").on("slidechange", (event, ui) => {
            this.timeRange = ui.values;
            this.applyFilters();
        });

        // Initialize tag filters
        $(document).on('change', '.retro-checkbox', () => {
            this.updateTagsCount();
        });

        // Initialize person filters
        $("#letters-from, #letters-to").on('change', () => {
            this.applyFilters();
        });

        // Apply filters button
        $("#apply-filters").on("click", () => this.applyFilters());
    }

    initializeEventHandlers() {
        // Common event handler setup
        document.removeEventListener('showLetterDetails', this.handleLetterDetails.bind(this));
        document.addEventListener('showLetterDetails', (event) => {
            this.handleLetterDetails(event.detail);
        });
    }

    clearUI() {
        // Clear everything except filters
        $('.metadata-popup, .metadata-overlay, #dialog').remove();
        $('.ui-dialog').remove();
        
        // Remove event listeners
        document.removeEventListener('showLetterDetails', this.handleLetterDetails);
    }

    updateTagsCount() {
        const selectedCount = $('.retro-checkbox:checked').length;
        const totalCount = $('.retro-checkbox').length;
        $('.panel-header').first().text(
            `TAGS SELECTOR (${selectedCount}/${totalCount})`
        );
    }

    // Common method to find letters for a person
    findLettersForPerson(personId) {
        const letters = [];
        if (!this.graph || !this.graph.links) {
            console.error('Graph or links not initialized');
            return letters;
        }

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

    // Abstract method that must be implemented by child classes
    handleLetterDetails(data) {
        throw new Error('handleLetterDetails must be implemented by child class');
    }
}
