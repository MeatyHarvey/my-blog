document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('bouncing-container');
    const image = document.getElementById('bouncing-image');
    
    if (!container || !image) return;
    
    // Initial position
    let x = 50;
    let y = 50;
    
    // Speed and direction
    let dx = 2.5; // Slightly faster horizontal movement
    let dy = 2.0; // Slightly faster vertical movement
    
    // Colors for tint changes
    const colors = [
        'hue-rotate(0deg) brightness(1.8)',
        'hue-rotate(60deg) brightness(1.8)',
        'hue-rotate(120deg) brightness(1.8)',
        'hue-rotate(180deg) brightness(1.8)',
        'hue-rotate(240deg) brightness(1.8)',
        'hue-rotate(300deg) brightness(1.8)'
    ];
    
    function animate() {
        // Update position
        x += dx;
        y += dy;
        
        // Check for collisions
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const imageWidth = image.width;
        const imageHeight = image.height;
        
        // Bounce off edges
        if (x + imageWidth > containerWidth || x < 0) {
            dx = -dx;
            image.style.filter = `${colors[Math.floor(Math.random() * colors.length)]} brightness(1.5)`;
        }
        
        if (y + imageHeight > containerHeight || y < 0) {
            dy = -dy;
            image.style.filter = `${colors[Math.floor(Math.random() * colors.length)]} brightness(1.5)`;
        }
        
        // Apply position
        image.style.left = x + 'px';
        image.style.top = y + 'px';
        
        requestAnimationFrame(animate);
    }
    
    // Start animation when image loads
    if (image.complete) {
        animate();
    } else {
        image.onload = animate;
    }
});