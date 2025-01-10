function loadHTML(elementId, filePath) {
    // Check if element exists first
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element with id '${elementId}' not found`);
        return;
    }

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            element.innerHTML = data;
            // If this is the header, initialize its JavaScript
            if (elementId === 'header') {
                // Trigger header.js functionality after content is loaded
                const event = new Event('headerLoaded');
                document.dispatchEvent(event);
            }
        })
        .catch(error => console.error('Error loading HTML:', error));
}

// Wait for DOM to be ready before loading
document.addEventListener('DOMContentLoaded', () => {
    // Load header and footer with correct relative paths
    loadHTML('header', 'header.html');
    loadHTML('footer', 'footer.html');
});

