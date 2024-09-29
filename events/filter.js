let selectedUniversities = new Set();
let selectedDepartments = new Set();

function createSourceFilters(events, onFilterChange) {
    const sourceFiltersEl = document.getElementById('source-filters');
    const universityDepartments = {};
    
    // Group departments by university
    events.forEach(event => {
        const university = event.university || event.source;
        const department = event.department || event['department-program'];
        if (!universityDepartments[university]) {
            universityDepartments[university] = new Set();
        }
        if (department) {
            universityDepartments[university].add(department);
        }
    });

    sourceFiltersEl.innerHTML = '<h3>Filter by University and Department</h3>';
    
    // Load saved filters from localStorage
    const savedUniversities = JSON.parse(localStorage.getItem('selectedUniversities')) || [];
    const savedDepartments = JSON.parse(localStorage.getItem('selectedDepartments')) || [];
    selectedUniversities = new Set(savedUniversities);
    selectedDepartments = new Set(savedDepartments);

    // Add "Select All" and "Clear All" buttons for all filters
    const allButtonContainer = document.createElement('div');
    allButtonContainer.className = 'filter-buttons';
    allButtonContainer.innerHTML = `
        <button id="select-all-filters">Select All</button>
        <button id="clear-all-filters">Clear All</button>
    `;
    sourceFiltersEl.appendChild(allButtonContainer);

    // Create university dropdowns with department checkboxes
    Object.keys(universityDepartments).forEach(university => {
        const uniContainer = document.createElement('div');
        uniContainer.className = 'university-container';
        
        const uniCheckbox = document.createElement('input');
        uniCheckbox.type = 'checkbox';
        uniCheckbox.id = `uni-${university}`;
        uniCheckbox.value = university;
        uniCheckbox.checked = selectedUniversities.has(university) || selectedUniversities.size === 0;
        
        const uniLabel = document.createElement('label');
        uniLabel.htmlFor = `uni-${university}`;
        uniLabel.textContent = university;
        
        const deptContainer = document.createElement('div');
        deptContainer.className = 'department-container';
        deptContainer.style.display = uniCheckbox.checked ? 'block' : 'none';
        
        universityDepartments[university].forEach(department => {
            const deptCheckbox = document.createElement('input');
            deptCheckbox.type = 'checkbox';
            deptCheckbox.id = `dept-${university}-${department}`;
            deptCheckbox.value = department;
            deptCheckbox.checked = selectedDepartments.has(department) || selectedDepartments.size === 0;
            
            const deptLabel = document.createElement('label');
            deptLabel.htmlFor = `dept-${university}-${department}`;
            deptLabel.textContent = department;
            
            deptContainer.appendChild(deptCheckbox);
            deptContainer.appendChild(deptLabel);
            deptContainer.appendChild(document.createElement('br'));
        });
        
        uniContainer.appendChild(uniCheckbox);
        uniContainer.appendChild(uniLabel);
        uniContainer.appendChild(deptContainer);
        sourceFiltersEl.appendChild(uniContainer);
        
        // Toggle department visibility when university checkbox is clicked
        uniCheckbox.addEventListener('change', () => {
            deptContainer.style.display = uniCheckbox.checked ? 'block' : 'none';
            updateFilters(onFilterChange);
        });
    });
    
    // Event listener for checkboxes
    sourceFiltersEl.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const university = e.target.closest('.university-container')?.querySelector('input[type="checkbox"]').value;
            if (e.target.id.startsWith('uni-')) {
                if (e.target.checked) {
                    selectedUniversities.add(university);
                } else {
                    selectedUniversities.delete(university);
                }
            } else if (e.target.id.startsWith('dept-')) {
                if (e.target.checked) {
                    selectedDepartments.add(e.target.value);
                } else {
                    selectedDepartments.delete(e.target.value);
                }
            }
            updateFilters(onFilterChange);
        }
    });

    // Event listeners for "Select All" and "Clear All" buttons
    document.getElementById('select-all-filters').addEventListener('click', () => {
        selectedUniversities = new Set(Object.keys(universityDepartments));
        selectedDepartments = new Set([].concat(...Object.values(universityDepartments)));
        updateAllCheckboxes(true);
        updateFilters(onFilterChange);
    });

    document.getElementById('clear-all-filters').addEventListener('click', () => {
        selectedUniversities.clear();
        selectedDepartments.clear();
        updateAllCheckboxes(false);
        updateFilters(onFilterChange);
    });
}

function updateAllCheckboxes(checked) {
    document.querySelectorAll('.university-container input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = checked;
        const deptContainer = checkbox.closest('.university-container').querySelector('.department-container');
        deptContainer.style.display = checked ? 'block' : 'none';
        deptContainer.querySelectorAll('input[type="checkbox"]').forEach(deptCheckbox => {
            deptCheckbox.checked = checked;
        });
    });
}

function updateFilters(onFilterChange) {
    // Save to localStorage
    localStorage.setItem('selectedUniversities', JSON.stringify([...selectedUniversities]));
    localStorage.setItem('selectedDepartments', JSON.stringify([...selectedDepartments]));
    onFilterChange();
}

function getFilteredEvents(events) {
    // If no filters are selected, show all events
    if (selectedUniversities.size === 0 && selectedDepartments.size === 0) {
        return events;
    }
    return events.filter(event => {
        const universityMatch = selectedUniversities.size === 0 || selectedUniversities.has(event.university || event.source);
        const departmentMatch = selectedDepartments.size === 0 || selectedDepartments.has(event.department || event['department-program']);
        return universityMatch && departmentMatch;
    });
}