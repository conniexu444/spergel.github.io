function loadHTML(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading HTML:', error));
}

// Load header and footer with specified paths
function loadHeaderAndFooter(headerPath, footerPath) {
    loadHTML('header', headerPath);
    loadHTML('footer', footerPath);
}

