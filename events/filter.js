let selectedUniversities = new Set();
let selectedCategories = new Set();
let selectedAcademicTopics = new Set();

function createSourceFilters(events, onFilterChange) {
    const sourceFiltersEl = document.getElementById('source-filters');
    const universities = new Set();
    const categories = new Set();
    const academicTopics = new Set();
    
    // Collect unique values for each filter
    events.forEach(event => {
        if (event.university) universities.add(event.university);
        if (event.main_category) categories.add(event.main_category);
        if (event.academic_topics) event.academic_topics.forEach(topic => academicTopics.add(topic));
    });

    sourceFiltersEl.innerHTML = '<h3>Filter Events</h3>';
    
    // Load saved filters from localStorage
    const savedUniversities = JSON.parse(localStorage.getItem('selectedUniversities')) || [];
    const savedCategories = JSON.parse(localStorage.getItem('selectedCategories')) || [];
    const savedAcademicTopics = JSON.parse(localStorage.getItem('selectedAcademicTopics')) || [];
    selectedUniversities = new Set(savedUniversities);
    selectedCategories = new Set(savedCategories);
    selectedAcademicTopics = new Set(savedAcademicTopics);

    // Add "Select All" and "Clear All" buttons for all filters
    const allButtonContainer = document.createElement('div');
    allButtonContainer.className = 'filter-buttons';
    allButtonContainer.innerHTML = `
        <button id="select-all-filters">Select All</button>
        <button id="clear-all-filters">Clear All</button>
    `;
    sourceFiltersEl.appendChild(allButtonContainer);

    // Create filter sections
    createFilterSection('Universities', universities, selectedUniversities, sourceFiltersEl);
    createFilterSection('Categories', categories, selectedCategories, sourceFiltersEl);
    createFilterSection('Academic Topics', academicTopics, selectedAcademicTopics, sourceFiltersEl);

    // Remove API access button

    // Event listener for checkboxes
    sourceFiltersEl.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const filterType = e.target.getAttribute('data-filter-type');
            const value = e.target.value;
            const selectedSet = getSelectedSetByType(filterType);

            if (e.target.checked) {
                selectedSet.add(value);
            } else {
                selectedSet.delete(value);
            }
            updateFilters(onFilterChange);
        }
    });

    // Event listeners for "Select All" and "Clear All" buttons
    document.getElementById('select-all-filters').addEventListener('click', () => {
        selectAllFilters([universities, categories, academicTopics]);
        updateAllCheckboxes(true);
        updateFilters(onFilterChange);
    });

    document.getElementById('clear-all-filters').addEventListener('click', () => {
        clearAllFilters();
        updateAllCheckboxes(false);
        updateFilters(onFilterChange);
    });

    // Remove event listener for API access button
}

function createFilterSection(title, values, selectedSet, parentElement) {
    const sectionContainer = document.createElement('div');
    sectionContainer.className = 'filter-section';
    sectionContainer.innerHTML = `<h4>${title}</h4>`;

    values.forEach(value => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${title.toLowerCase()}-${value}`;
        checkbox.value = value;
        checkbox.checked = selectedSet.has(value) || selectedSet.size === 0;
        checkbox.setAttribute('data-filter-type', title.toLowerCase());

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = value;

        sectionContainer.appendChild(checkbox);
        sectionContainer.appendChild(label);
        sectionContainer.appendChild(document.createElement('br'));
    });

    parentElement.appendChild(sectionContainer);
}

function getSelectedSetByType(filterType) {
    switch (filterType) {
        case 'universities': return selectedUniversities;
        case 'categories': return selectedCategories;
        case 'academic topics': return selectedAcademicTopics;
        default: return new Set();
    }
}

function selectAllFilters(filterSets) {
    selectedUniversities = new Set(filterSets[0]);
    selectedCategories = new Set(filterSets[1]);
    selectedAcademicTopics = new Set(filterSets[2]);
}

function clearAllFilters() {
    selectedUniversities.clear();
    selectedCategories.clear();
    selectedAcademicTopics.clear();
}

function updateAllCheckboxes(checked) {
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = checked;
    });
}

function updateFilters(onFilterChange) {
    // Save to localStorage
    localStorage.setItem('selectedUniversities', JSON.stringify([...selectedUniversities]));
    localStorage.setItem('selectedCategories', JSON.stringify([...selectedCategories]));
    localStorage.setItem('selectedAcademicTopics', JSON.stringify([...selectedAcademicTopics]));
    onFilterChange();
}

function getFilteredEvents(events) {
    // If no filters are selected, return an empty array
    if (selectedUniversities.size === 0 && selectedCategories.size === 0 && selectedAcademicTopics.size === 0) {
        return []; // Return an empty array when no filters are selected
    }
    return events.filter(event => {
        const universityMatch = selectedUniversities.size === 0 || selectedUniversities.has(event.university);
        const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(event.main_category);
        const topicMatch = selectedAcademicTopics.size === 0 || (event.academic_topics && event.academic_topics.some(topic => selectedAcademicTopics.has(topic)));
        return universityMatch && categoryMatch && topicMatch;
    });
}