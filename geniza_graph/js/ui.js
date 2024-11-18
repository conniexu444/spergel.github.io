class GenizaUI {
    constructor() {
        this.addBackButton();
        this.graph = new NetworkGraph("#graph-container");
        this.timeRange = [250, 1850]; // Set default range
        this.currentDataMode = "2plus";
        this.graphData = {
            all: null,
            twoPlus: null
        };
        this.currentStyle = 'retro'; // Default to retro style
        this.initializeUI();
        this.loadData();
        this.initializeLetterDetails();

        // Initialize theme based on stored preference or default to light mode
        const storedTheme = localStorage.getItem('theme') || 'light';
        if (storedTheme === 'light') {
            $("body").addClass("light-mode");
        } else {
            $("body").removeClass("light-mode");
        }
    }

    addBackButton() {
        // Create back button container
        const backContainer = $('<div class="back-container"></div>').css({
            'position': 'absolute',
            'top': '10px',
            'left': '10px',
            'z-index': '1000'
        });

        // Create back button
        const backButton = $('<button class="retro-button back-button">← BACK</button>').css({
            'font-family': 'var(--retro-font)',  // Match the retro style
            'padding': '5px 15px'
        });

        // Add click handler
        backButton.on('click', () => {
            window.location.href = '../geniza.html';
        });

        // Add button to container and container to body
        backContainer.append(backButton);
        $('body').append(backContainer);
    }

    initializeUI() {
        // Make tags panel draggable regardless of style
        this.makeDraggable($('.tags-panel'), '.panel-header');
        
        // Initialize buttons with explicit handlers
        $("#apply-filters").on("click", () => this.applyFilters());
        
        // Remove any existing SELECT ALL button before adding a new one
        $('.select-all').remove();
        
        // Add select/deselect all functionality
        if (!$('.select-all').length) {
            const selectAllBtn = $('<button class="retro-button select-all">SELECT ALL</button>');
            selectAllBtn.click(() => {
                const allChecked = $('.retro-checkbox:checked').length === $('.retro-checkbox').length;
                $('.retro-checkbox').prop('checked', !allChecked);
                // Update button text based on new state
                selectAllBtn.text(allChecked ? 'SELECT ALL' : 'DESELECT ALL');
                this.updateTagsCount();
            });
            
            // Set initial button text based on current state
            const initialAllChecked = $('.retro-checkbox:checked').length === $('.retro-checkbox').length;
            selectAllBtn.text(initialAllChecked ? 'DESELECT ALL' : 'SELECT ALL');
            
            $('#tags-checkboxes').before(selectAllBtn);
        }

        // Initialize select boxes with retro styling
        $("select").selectmenu({
            classes: {
                "ui-selectmenu-button": "retro-select",
                "ui-selectmenu-menu": "retro-select-menu"
            }
        });

        // Add hover effects
        this.addHoverEffects();

        // Add handler for checkbox changes
        $(document).on('change', '.retro-checkbox', () => {
            this.updateTagsCount();
            this.updateSelectAllButton();
        });

        // Add handler for select changes
        $("#letters-from, #letters-to").on('change', () => {
            this.applyFilters();
        });

        // Initialize time slider
        $("#time-slider").on("slidechange", (event, ui) => {
            this.timeRange = ui.values;
            this.applyFilters();
        });

        // Remove auto-update handlers
        $("#letters-from, #letters-to").off('change');
        $(document).off('change', '.retro-checkbox');
        $("#time-slider").off('slidechange');

        // Initialize time slider with custom styling
        this.initializeTimeSlider();

        // Single apply button handler
        $("#apply-filters").on("click", () => this.applyFilters());

        // Add data toggle button handler
        $("#data-toggle").off('click').on('click', () => {
            this.currentDataMode = this.currentDataMode === "all" ? "2plus" : "all";
            // Update button text to reflect current state
            $("#data-toggle").text(this.currentDataMode === "all" ? "2+ LETTERS" : "ALL LETTERS");
            // Repopulate selectors and apply filters with new data mode
            this.populateSelectors();
            this.applyFilters();
        });

        // Add dark mode toggle handler with updated implementation
        $("#mode-toggle").off('click').on('click', () => {
            this.toggleTheme();
        });
        
        // Initialize theme based on stored preference or default to light mode
        const storedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(storedTheme);

        // Add panel toggle functionality
        $('.tags-panel .panel-header').on('click', () => {
            $('.tags-panel').toggleClass('open');
        });

        // Optional: Close panel when clicking outside
        $(document).on('click', (e) => {
            if (!$(e.target).closest('.tags-panel').length && $('.tags-panel').hasClass('open')) {
                $('.tags-panel').removeClass('open');
            }
        });

        // Prevent panel from closing when clicking inside it
        $('.tags-panel').on('click', (e) => {
            e.stopPropagation();
        });
    }

    addHoverEffects() {
        const buttonClass = this.currentStyle === 'retro' ? '.retro-button' : '.standard-button';
        $(buttonClass).hover(
            function() {
                if (this.currentStyle === 'retro') {
                    $(this).css("background-color", "var(--bg-color)")
                           .css("color", "var(--primary-color)")
                           .css("border", "1px solid var(--primary-color)");
                } else {
                    $(this).css("background-color", "var(--hover-color)")
                           .css("transform", "translateY(-1px)")
                           .css("box-shadow", "0 2px 4px rgba(0,0,0,0.2)");
                }
            },
            function() {
                if (this.currentStyle === 'retro') {
                    $(this).css("background-color", "var(--primary-color)")
                           .css("color", "var(--bg-color)")
                           .css("border", "none");
                } else {
                    $(this).css("background-color", "var(--primary-color)")
                           .css("transform", "none")
                           .css("box-shadow", "none");
                }
            }
        );
    }

    initializeSliderHandles() {
        const track = $(".slider-track");
        const handles = $(".slider-handle");
        const fill = $(".slider-fill");
        
        let isDragging = false;
        let activeHandle = null;
        
        const updateSlider = (handle, position) => {
            const trackBounds = track[0].getBoundingClientRect();
            const percentage = Math.max(0, Math.min(100, (position - trackBounds.left) / trackBounds.width * 100));
            const year = Math.round(this.timeRange[0] + (percentage / 100) * (this.timeRange[1] - this.timeRange[0]));
            
            handle.css('left', `${percentage}%`);
            handle.attr('data-value', year);
            
            // Update fill bar
            const leftPos = parseFloat($('.slider-handle.left').css('left')) || 0;
            const rightPos = parseFloat($('.slider-handle.right').css('left')) || 100;
            fill.css({
                left: `${Math.min(leftPos, rightPos)}%`,
                width: `${Math.abs(rightPos - leftPos)}%`
            });
            
            // Update year labels without animation
            if(handle.hasClass('left')) {
                $('.year-label.left').text(year);
                this.timeRange[0] = year;
            } else {
                $('.year-label.right').text(year);
                this.timeRange[1] = year;
            }
        };

        handles.on('mousedown', function(e) {
            isDragging = true;
            activeHandle = $(this);
            e.preventDefault();
        });

        $(document).on('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(activeHandle, e.clientX);
        });

        $(document).on('mouseup', () => {
            isDragging = false;
            activeHandle = null;
        });

        // Set initial positions
        $('.slider-handle.left').css('left', '0%');
        $('.slider-handle.right').css('left', '100%');
        fill.css({
            left: '0%',
            width: '100%'
        });
    }

    async loadData() {
        try {
            this.showRetroLoading();

            // Load both data files concurrently
            const [allData, twoPlusData] = await Promise.all([
                fetch('graph_data_all.json').then(resp => resp.json()),
                fetch('graph_data_2_plus_letters.json').then(resp => resp.json())
            ]);

            this.graphData.all = allData;
            this.graphData.twoPlus = twoPlusData;

            // Calculate date range from all data
            this.calculateDateRange(allData);
            
            // Initialize time slider with calculated range
            this.initializeTimeSlider();

            // Initialize with 2+ letters data and render the graph
            this.populateSelectors();
            this.applyFilters(); // This will trigger the initial graph render
            this.hideRetroLoading();
        } catch (error) {
            this.hideRetroLoading();
            console.error("Error loading data:", error);
            this.showRetroError("DATA LOAD ERROR");
        }
    }

    calculateDateRange(data) {
        let minDate = Infinity;
        let maxDate = -Infinity;

        data.links.forEach(link => {
            link.letters.forEach(letter => {
                if (letter.date) {
                    minDate = Math.min(minDate, letter.date);
                    maxDate = Math.max(maxDate, letter.date);
                }
            });
        });

        // Update timeRange with actual data range
        this.timeRange = [
            Math.floor(minDate),
            Math.ceil(maxDate)
        ];

        // Reinitialize the slider with the new range
        this.initializeTimeSlider();
    }

    initializeTimeSlider() {
        const sliderContainer = $(".time-range");
        sliderContainer.empty();

        // Create new slider structure
        sliderContainer.append(`
            <input type="text" class="year-input left" value="${this.timeRange[0]}" maxlength="4">
            <div class="slider-track">
                <div class="slider-fill"></div>
                <div class="slider-handle left"></div>
                <div class="slider-handle right"></div>
            </div>
            <input type="text" class="year-input right" value="${this.timeRange[1]}" maxlength="4">
        `);

        this.initializeSliderControls();
    }

    initializeSliderControls() {
        const track = $(".slider-track");
        const handles = $(".slider-handle");
        const fill = $(".slider-fill");
        const inputs = $(".year-input");
        
        let isDragging = false;
        let activeHandle = null;

        // Input handlers
        inputs.on('input', function() {
            // Restrict to numbers only
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        inputs.on('change', (e) => {
            const isLeft = $(e.target).hasClass('left');
            const value = parseInt(e.target.value);
            const otherValue = parseInt($(`.year-input.${isLeft ? 'right' : 'left'}`).val());

            // Validate input
            if (isNaN(value) || 
                value < 250 || 
                value > 1850 || 
                (isLeft && value >= otherValue) || 
                (!isLeft && value <= otherValue)) {
                e.target.value = isLeft ? this.timeRange[0] : this.timeRange[1];
                return;
            }

            // Update timeRange
            if (isLeft) {
                this.timeRange[0] = value;
                this.updateSliderPosition('left', value);
            } else {
                this.timeRange[1] = value;
                this.updateSliderPosition('right', value);
            }
        });

        // Slider handlers
        const updateFromSlider = (handle, position) => {
            const trackBounds = track[0].getBoundingClientRect();
            const percentage = Math.max(0, Math.min(100, 
                (position - trackBounds.left) / trackBounds.width * 100));
            
            const range = 1850 - 250;
            const year = Math.round(250 + (percentage / 100) * range);
            
            const isLeft = handle.hasClass('left');
            const otherValue = parseInt($(`.year-input.${isLeft ? 'right' : 'left'}`).val());

            if ((isLeft && year >= otherValue) || (!isLeft && year <= otherValue)) {
                return;
            }

            // Update handle position
            handle.css('left', `${percentage}%`);
            
            // Update input value
            $(`.year-input.${isLeft ? 'left' : 'right'}`).val(year);
            
            // Update timeRange
            if (isLeft) {
                this.timeRange[0] = year;
            } else {
                this.timeRange[1] = year;
            }

            // Update fill bar
            this.updateFillBar();
        };

        handles.on('mousedown', function(e) {
            isDragging = true;
            activeHandle = $(this);
            e.preventDefault();
        });

        $(document).on('mousemove', (e) => {
            if (!isDragging) return;
            updateFromSlider(activeHandle, e.clientX);
        });

        $(document).on('mouseup', () => {
            isDragging = false;
            activeHandle = null;
        });

        // Set initial positions
        this.updateSliderPosition('left', this.timeRange[0]);
        this.updateSliderPosition('right', this.timeRange[1]);
    }

    updateSliderPosition(side, value) {
        const percentage = ((value - 250) / (1850 - 250)) * 100;
        $(`.slider-handle.${side}`).css('left', `${percentage}%`);
        this.updateFillBar();
    }

    updateFillBar() {
        const leftPos = parseFloat($('.slider-handle.left').css('left'));
        const rightPos = parseFloat($('.slider-handle.right').css('left'));
        $('.slider-fill').css({
            left: `${leftPos}%`,
            width: `${rightPos - leftPos}%`
        });
    }

    updateGraphData() {
        const currentData = this.currentDataMode === "all" ? 
            this.graphData.all : this.graphData.twoPlus;

        if (!currentData) return;

        // Filter data based on current time range and other filters
        const filteredData = this.filterData(currentData);
        
        // Update graph visualization with processed nodes and filtered links
        const nodes = this.processNodesFromLinks(filteredData.links);
        this.graph.updateData(nodes, filteredData.links);
    }

    processNodesFromLinks(links) {
        const nodesMap = new Map();
        
        links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            
            if (!nodesMap.has(sourceId)) {
                nodesMap.set(sourceId, {
                    id: sourceId,
                    name: sourceId,
                    tags: link.tags || []
                });
            }
            if (!nodesMap.has(targetId)) {
                nodesMap.set(targetId, {
                    id: targetId,
                    name: targetId,
                    tags: link.tags || []
                });
            }
        });

        return Array.from(nodesMap.values());
    }

    filterData(data) {
        if (!data) return { nodes: [], links: [] };

        // Get selected tags
        const selectedTags = $('.retro-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        // Filter links based on selected tags and time range
        const filteredLinks = data.links.filter(link => {
            // Check if link has any of the selected tags
            const hasSelectedTags = selectedTags.length === 0 || 
                (link.tags && link.tags.some(tag => selectedTags.includes(tag)));

            // Check if any letters fall within the time range
            const hasLettersInRange = link.letters.some(letter => 
                letter.date >= this.timeRange[0] && letter.date <= this.timeRange[1]
            );

            return hasSelectedTags && hasLettersInRange;
        });

        return {
            links: filteredLinks
        };
    }

    populateSelectors() {
        const currentData = this.currentDataMode === "all" ? 
            this.graphData.all : this.graphData.twoPlus;
            
        if (!currentData) return;

        // Collect all unique tags
        const tags = new Set();
        currentData.links.forEach(link => {
            if (link.tags) {
                link.tags.forEach(tag => tags.add(tag));
            }
        });

        // Populate tags checkboxes
        const tagsContainer = $("#tags-checkboxes");
        tagsContainer.empty();
        Array.from(tags).sort().forEach(tag => {
            const wrapper = $('<div class="tag-checkbox-wrapper"></div>');
            const checkbox = $('<input type="checkbox">')
                .addClass('retro-checkbox')
                .attr('id', `tag-${tag}`)
                .attr('value', tag);
            const label = $('<label></label>')
                .attr('for', `tag-${tag}`)
                .text(tag);
            
            wrapper.append(checkbox).append(label);
            tagsContainer.append(wrapper);
        });

        // Update SELECT ALL button text after populating checkboxes
        const allChecked = $('.retro-checkbox:checked').length === $('.retro-checkbox').length;
        $('.select-all').text(allChecked ? 'DESELECT ALL' : 'SELECT ALL');
        
        // Update tags count
        this.updateTagsCount();
    }

    applyFilters() {
        console.log("Applying filters");
        const currentData = this.currentDataMode === "all" ? 
            this.graphData.all : this.graphData.twoPlus;

        if (!currentData) {
            console.log("No data available");
            return;
        }

        const filteredData = this.filterData(currentData);
        console.log("Filtered data:", filteredData);
        
        const processedNodes = this.processNodesFromLinks(filteredData.links);
        console.log("Processed nodes:", processedNodes);

        // Update graph with filtered data
        this.graph.updateData(processedNodes, filteredData.links);
    }

    toggleDarkMode() {
        // Simply toggle the light-mode class since colors are defined in CSS
        $("body").toggleClass("light-mode");
        
        // Update button text
        const isLightMode = $("body").hasClass("light-mode");
        $("#mode-toggle").text(isLightMode ? "DARK MODE" : "LIGHT MODE");
        
        // Update graph colors if graph exists
        if (this.graph) {
            this.graph.updateColors();
        }

        // Update dialog theme
        this.updateDialogTheme();
    }

    updateTimeDisplay() {
        // Update time range display with retro animation
        $(".time-range span").each((index, element) => {
            $(element).text(this.timeRange[index])
                     .addClass("blink")
                     .delay(500)
                     .queue(function() {
                         $(this).removeClass("blink").dequeue();
                     });
        });
    }

    showRetroLoading() {
        // Remove any existing loading or error messages
        $(".retro-loading, .retro-error").remove();
        
        $("#graph-container").append(
            `<div class="retro-loading">
                PROCESSING...
                <div class="loading-bar"></div>
            </div>`
        );
    }

    hideRetroLoading() {
        $(".retro-loading").remove();
    }

    showRetroError(message) {
        // Remove any existing loading or error messages
        $(".retro-loading, .retro-error").remove();
        
        $("#graph-container").append(
            `<div class="retro-error">
                ERROR: ${message}
                <div class="blink">PRESS ANY KEY TO CONTINUE</div>
            </div>`
        );

        // Add key press handler to dismiss error
        $(document).one('keypress', () => {
            $(".retro-error").remove();
        });
    }

    // Add method to get selected tags count
    updateTagsCount() {
        const selectedCount = $('.retro-checkbox:checked').length;
        const totalCount = $('.retro-checkbox').length;
        $('.panel-header').first().text(
            `TAGS SELECTOR (${selectedCount}/${totalCount})`
        );
    }

    initializeLetterDetails() {
        // Add letter details panel to DOM
        $('body').append(`
            <div class="letter-details">
                <button class="close-details">×</button>
                <div class="letter-column from">
                    <div class="letter-column-header">LETTERS FROM</div>
                    <div class="letter-content"></div>
                </div>
                <div class="letter-column to">
                    <div class="letter-column-header">LETTERS TO</div>
                    <div class="letter-content"></div>
                </div>
                <div class="metadata-section">
                    <div class="metadata-header">METADATA</div>
                    <div class="metadata-content"></div>
                </div>
            </div>
        `);

        // Add event listeners
        $('.close-details').on('click', () => {
            $('.letter-details').removeClass('visible');
        });

        document.addEventListener('showLetterDetails', (event) => {
            this.showLetterDetails(event.detail);
        });
    }

    showLetterDetails({ type, data }) {
        const details = $('.letter-details');
        const fromContent = details.find('.letter-column.from .letter-content');
        const toContent = details.find('.letter-column.to .letter-content');
        const metadataContent = details.find('.metadata-content');

        fromContent.empty();
        toContent.empty();
        metadataContent.empty();

        const currentData = this.currentDataMode === "all" ? this.graphData.all : this.graphData.twoPlus;

        if (type === 'node') {
            details.find('.from .letter-column-header').text(`LETTERS FROM ${data.id}`);
            details.find('.to .letter-column-header').text(`LETTERS TO ${data.id}`);

            currentData.links.forEach(link => {
                if (link.source === data.id) {
                    this.renderLetters(link.letters, fromContent, data.id, link.target);
                }
                if (link.target === data.id) {
                    this.renderLetters(link.letters, toContent, link.source, data.id);
                }
            });

            this.renderMetadata({
                type: 'node',
                id: data.id,
                totalLetters: fromContent.children().length + toContent.children().length
            }, metadataContent);
        } else {
            // Link clicked
            const sourceName = typeof data.source === 'object' ? data.source.id : data.source;
            const targetName = typeof data.target === 'object' ? data.target.id : data.target;
            
            details.find('.from .letter-column-header').text(`LETTERS FROM ${sourceName}`);
            details.find('.to .letter-column-header').text(`LETTERS TO ${sourceName}`);
            
            const forwardLink = currentData.links.find(link => 
                (link.source === sourceName && link.target === targetName) ||
                (link.source.id === sourceName && link.target.id === targetName)
            );
            const backwardLink = currentData.links.find(link => 
                (link.source === targetName && link.target === sourceName) ||
                (link.source.id === targetName && link.target.id === sourceName)
            );

            if (forwardLink) {
                this.renderLetters(forwardLink.letters, fromContent, sourceName, targetName);
            }
            if (backwardLink) {
                this.renderLetters(backwardLink.letters, toContent, targetName, sourceName);
            }

            this.renderMetadata({
                type: 'link',
                source: sourceName,
                target: targetName,
                totalLetters: (forwardLink ? forwardLink.letters.length : 0) + (backwardLink ? backwardLink.letters.length : 0),
                tags: data.tags
            }, metadataContent);
        }

        details.addClass('visible');
    }

    renderLetters(letters, container, sourceName, targetName) {
        letters.forEach(letter => {
            const direction = letter.direction === 'forward' 
                ? `${sourceName} → ${targetName}`
                : `${targetName} → ${sourceName}`;
            container.append(`
                <div class="letter-item" onclick="window.open('https://geniza.princeton.edu/en/documents/${letter.pgpid}', '_blank')">
                    <strong>Direction:</strong> ${direction}<br>
                    <strong>Date:</strong> ${letter.date || 'Unknown'}<br>
                    <strong>ID:</strong> ${letter.pgpid}<br>
                    <strong>From:</strong> ${letter.start_location}<br>
                    <strong>To:</strong> ${letter.end_location}<br>
                    ${letter.tags && letter.tags.length ? `<strong>Tags:</strong> ${letter.tags.join(', ')}` : ''}
                </div>
            `);
        });
    }

    renderMetadata(data, container) {
        if (data.type === 'node') {
            container.append(`
                <div class="metadata-item">
                    <strong>Person:</strong> ${data.id}<br>
                    <strong>Total Letters:</strong> ${data.totalLetters}
                </div>
            `);
        } else {
            container.append(`
                <div class="metadata-item">
                    <strong>People:</strong> ${data.source}, ${data.target}<br>
                    <strong>Total Letters:</strong> ${data.totalLetters}<br>
                    ${data.tags && data.tags.length ? `<strong>Tags:</strong> ${data.tags.join(', ')}` : ''}
                </div>
            `);
        }
    }

    getDateRange(letters) {
        const dates = letters.map(l => l.date).filter(d => d);
        if (dates.length === 0) return 'Unknown';
        return `${Math.min(...dates)} - ${Math.max(...dates)}`;
    }

    // Add this method to update the select all button text when individual checkboxes are clicked
    updateSelectAllButton() {
        const allChecked = $('.retro-checkbox:checked').length === $('.retro-checkbox').length;
        $('.select-all').text(allChecked ? 'DESELECT ALL' : 'SELECT ALL');
    }

    // Add this new method to the class
    makeDraggable(element, handleSelector) {
        const handle = element.find(handleSelector);
        let isDragging = false;
        let startX;
        let startY;
        let elementX = 0;
        let elementY = 0;

        handle.css('cursor', 'move');

        const dragStart = (e) => {
            if (e.type === "touchstart") {
                startX = e.touches[0].clientX - elementX;
                startY = e.touches[0].clientY - elementY;
            } else {
                startX = e.clientX - elementX;
                startY = e.clientY - elementY;
            }

            if (e.target === handle[0] || handle.find(e.target).length > 0) {
                isDragging = true;
                // Remove any existing transform that might interfere with dragging
                if (element.hasClass('metadata-popup')) {
                    element.css('transform', 'none');
                }
            }
        }

        const dragEnd = () => {
            isDragging = false;
        }

        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            let clientX, clientY;
            if (e.type === "touchmove") {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            elementX = clientX - startX;
            elementY = clientY - startY;

            // Ensure the element stays within viewport bounds
            const rect = element[0].getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            elementX = Math.min(Math.max(elementX, 0), viewportWidth - rect.width);
            elementY = Math.min(Math.max(elementY, 0), viewportHeight - rect.height);

            element.css({
                'position': 'fixed',
                'left': elementX + 'px',
                'top': elementY + 'px'
            });
        }

        // Touch Events
        handle[0].addEventListener("touchstart", dragStart, false);
        document.addEventListener("touchend", dragEnd, false);
        document.addEventListener("touchmove", drag, false);

        // Mouse Events
        handle[0].addEventListener("mousedown", dragStart, false);
        document.addEventListener("mouseup", dragEnd, false);
        document.addEventListener("mousemove", drag, false);
    }

    // Add new method to update dialog theme
    updateDialogTheme() {
        $('.ui-dialog').css({
            'background-color': 'var(--panel-bg)',
            'color': 'var(--text-color)',
            'border-color': 'var(--border-color)'
        });

        $('.ui-dialog-titlebar').css({
            'background-color': 'var(--primary-color)',
            'color': 'var(--bg-color)'
        });

        $('.ui-dialog-content').css({
            'background-color': 'var(--panel-bg)',
            'color': 'var(--text-color)'
        });

        // Update links within dialog
        $('#dialog-body a').css({
            'color': 'var(--primary-color)'
        });
    }

    // Helper method to find all letters for a person
    findLettersForPerson(personId) {
        const letters = [];
        const currentData = this.currentDataMode === "all" ? 
            this.graphData.all : this.graphData.twoPlus;
        
        if (!currentData || !currentData.links) {
            console.warn('No data available for person:', personId);
            return letters;
        }
        
        currentData.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            
            if (sourceId === personId || targetId === personId) {
                link.letters.forEach(letter => {
                    letters.push({
                        ...letter,
                        source: sourceId,
                        target: targetId
                    });
                });
            }
        });
        return letters;
    }

    // New method to toggle theme
    toggleTheme() {
        const currentTheme = $("body").hasClass("light-mode") ? "dark" : "light";
        this.setTheme(currentTheme);
    }

    // New method to set theme
    setTheme(theme) {
        if (theme === "light") {
            $("body").addClass("light-mode").removeClass("dark-mode");
            $("#mode-toggle").text("DARK MODE");
        } else {
            $("body").removeClass("light-mode").addClass("dark-mode");
            $("#mode-toggle").text("LIGHT MODE");
        }

        // Store preference
        localStorage.setItem('theme', theme);

        // Update UI components
        this.updateThemeElements();
        
        // Update graph colors if graph exists
        if (this.graph) {
            this.graph.updateColors();
        }
    }

    // New method to update theme-dependent elements
    updateThemeElements() {
        // Update dialog theme if it exists
        if ($("#dialog").length) {
            this.updateDialogTheme();
        }

        // Update any other theme-dependent elements
        const isLightMode = $("body").hasClass("light-mode");
        
        // Update buttons and other elements that might need theme-specific styling
        $('.standard-button, .retro-button').each((_, element) => {
            $(element).css({
                'background-color': 'var(--primary-color)',
                'color': 'var(--bg-color)'
            });
        });

        // Update panels
        $('.tags-panel').css({
            'background-color': 'var(--panel-bg)',
            'color': 'var(--text-color)',
            'border-color': 'var(--border-color)'
        });

        // Update checkboxes
        $('.standard-checkbox, .retro-checkbox').css({
            'border-color': 'var(--primary-color)'
        });
    }
}

// Initialize the UI when document is ready
$(document).ready(() => {
    new GenizaUI();
});
