function loadHTML(elementId, filePath) {
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
            // Get the absolute path from the root of the website
            const absolutePath = window.location.pathname
                .split('/')
                .filter((part, index, array) => {
                    // Remove empty strings and duplicate consecutive directory names
                    return part && !(part === array[index - 1]);
                });
            
            const pathDepth = absolutePath.length;
            const basePath = pathDepth ? '../'.repeat(pathDepth) : './';
            
            // Replace all relative paths with correct ones
            const correctedData = data.replace(/(?<=(?:href|src)=["'])\.\/([^"']*)/g, `${basePath}$1`);
            
            element.innerHTML = correctedData;

            // If this is the header, initialize components
            if (elementId === 'header') {
                // Initialize eyes if present
                const eyeballs = element.querySelector('.eyeballs');
                if (eyeballs && window.initializeEyes) {
                    window.initializeEyes(eyeballs);
                }

                // Initialize planets
                const planets = element.querySelectorAll('.planet');
                planets.forEach(planet => {
                    planet.addEventListener('mouseover', () => {
                        planet.style.animation = 'rotate 2s linear infinite';
                    });
                    planet.addEventListener('mouseout', () => {
                        planet.style.animation = 'none';
                    });
                });

                // Initialize mobile menu immediately
                initializeMobileMenu();
            }
        })
        .catch(error => console.error('Error loading HTML:', error));
}

function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileMenuBtn || !navLinks) {
        console.warn('Mobile menu elements not found');
        return;
    }

    // Remove any existing listeners first
    const newMobileBtn = mobileMenuBtn.cloneNode(true);
    mobileMenuBtn.parentNode.replaceChild(newMobileBtn, mobileMenuBtn);
    
    // Add click listener to mobile menu button
    newMobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('show');
        newMobileBtn.textContent = navLinks.classList.contains('show') ? '✕' : '☰';
        console.log('Mobile menu clicked', navLinks.classList.contains('show')); // Debug line
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-content') && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            newMobileBtn.textContent = '☰';
        }
    });

    // Handle resize
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = (e) => {
        if (!e.matches) {
            navLinks.classList.remove('show');
            newMobileBtn.textContent = '☰';
        }
    };
    
    // Remove old listener and add new one
    mediaQuery.removeEventListener('change', handleResize);
    mediaQuery.addEventListener('change', handleResize);
}

document.addEventListener('DOMContentLoaded', () => {
    // Load components
    const rootPath = window.location.pathname;
    const pathDepth = rootPath.split('/').filter(part => part.length > 0).length;
    const basePath = pathDepth ? '../'.repeat(pathDepth) : './';
    
    loadHTML('header', `${basePath}header.html`);
    loadHTML('footer', `${basePath}footer.html`);
});