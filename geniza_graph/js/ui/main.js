class GenizaUI {
    constructor() {
        this.graph = new NetworkGraph("#graph-container");
        this.currentStyle = 'standard';
        this.isDarkMode = true;
        
        this.initializeToggles();
        this.loadData().then(() => {
            this.initializeUI();
        });
    }

    initializeToggles() {
        // Dark mode toggle
        $('#mode-toggle').on('click', () => this.toggleDarkMode());
        
        // Data mode toggle
        $('#data-toggle').on('click', () => {
            this.currentDataMode = this.currentDataMode === "all" ? "2plus" : "all";
            $('#data-toggle').text(this.currentDataMode === "all" ? "ALL LETTERS" : "2+ LETTERS");
            this.applyFilters();
        });

        // Style toggle
        $('#style-toggle').on('click', () => this.toggleStyle());
    }

    async loadData() {
        try {
            const response = await fetch('data/letters_data.json');
            const data = await response.json();
            
            // Process data for both modes
            this.graphData = {
                all: this.processData(data),
                twoPlus: this.processData(data, true)
            };

            // Initialize graph with 2+ letters mode
            this.graph.updateData(
                this.graphData.twoPlus.nodes,
                this.graphData.twoPlus.links
            );

        } catch (error) {
            console.error("Error loading data:", error);
            this.showError("Failed to load graph data");
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        this.graph.updateColors();
        this.ui.updateTheme?.(this.isDarkMode);
    }

    initializeUI() {
        // Clean up existing UI if any
        if (this.ui) {
            this.ui.clearUI();
        }

        console.log("Initializing UI with graph:", this.graph); // Debug log
        
        // Create new UI instance
        this.ui = this.currentStyle === 'retro' 
            ? new RetroUI(this.graph) 
            : new StandardUI(this.graph);

        // Apply current style
        this.applyCurrentStyle();
    }

    toggleStyle() {
        this.currentStyle = this.currentStyle === 'retro' ? 'standard' : 'retro';
        this.initializeUI();
    }

    applyCurrentStyle() {
        // Remove current style
        $('link[rel="stylesheet"]').each(function() {
            if (this.href.includes('retro-style.css') || this.href.includes('standard-style.css')) {
                $(this).remove();
            }
        });

        // Add new style
        const newStylesheet = $('<link>')
            .attr('rel', 'stylesheet')
            .attr('href', `css/${this.currentStyle}-style.css`);
        $('head').append(newStylesheet);
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
}

// Initialize the UI when document is ready
$(document).ready(() => {
    new GenizaUI();
});
