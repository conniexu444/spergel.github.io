const DEBUG_MODE = false; // Set to true to see the oval boundaries

function drawDebugOvals(leftEyeX, rightEyeX, eyeY, radiusX, radiusY) {
    const existingOvals = document.querySelectorAll('.debug-circle');
    existingOvals.forEach(oval => oval.remove());

    const ovals = [
        { x: leftEyeX, y: eyeY },
        { x: rightEyeX, y: eyeY }
    ];

    ovals.forEach(pos => {
        const oval = document.createElement('div');
        oval.className = 'debug-circle';
        oval.style.cssText = `
            position: fixed;
            width: ${radiusX * 2}px;
            height: ${radiusY * 2}px;
            border: 2px solid red;
            border-radius: 50%;
            pointer-events: none;
            transform: translate(${pos.x - radiusX}px, ${pos.y - radiusY}px) scale(1, 0.5);
            z-index: 9999;
        `;
        document.body.appendChild(oval);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('mousemove', (e) => {
        const eyeballs = document.querySelector('.eyeballs');
        const container = document.querySelector('.eyes-container');
        
        const containerRect = container.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Adjusted eye position calculations for the new layout
        const leftEyeX = containerRect.left + (containerRect.width * 0.42);  // Adjusted from 0.35
        const rightEyeX = containerRect.left + (containerRect.width * 0.58); // Adjusted from 0.65
        const eyeY = containerRect.top + (containerRect.height * 0.45);      // Adjusted from 0.4
        
        // Adjusted radii for more subtle movement
        const radiusX = containerRect.width * 0.0125;  // Reduced from 0.019
        const radiusY = containerRect.width * 0.005;   // Increased from 0.0075
        
        function getConstrainedPosition(mouseX, mouseY, eyeX, eyeY) {
            const deltaX = mouseX - eyeX;
            const deltaY = mouseY - eyeY;
            
            // Calculate normalized position within oval
            const normalizedX = deltaX / radiusX;
            const normalizedY = deltaY / radiusY;
            const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
            
            if (distance > 1) {
                const scale = 1 / distance;
                return {
                    x: deltaX * scale,
                    y: deltaY * scale
                };
            }
            return {
                x: deltaX,
                y: deltaY
            };
        }
        
        const leftEyePos = getConstrainedPosition(mouseX, mouseY, leftEyeX, eyeY);
        const rightEyePos = getConstrainedPosition(mouseX, mouseY, rightEyeX, eyeY);
        
        const moveX = (leftEyePos.x + rightEyePos.x) / 2;
        const moveY = (leftEyePos.y + rightEyePos.y) / 2;
        
        eyeballs.style.transform = `translate(${moveX}px, ${moveY}px)`;
        
        if (DEBUG_MODE) {
            drawDebugOvals(leftEyeX, rightEyeX, eyeY, radiusX, radiusY);
        }
    });
});



