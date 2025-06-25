document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('bouncing-container');
    const kumamonImage = document.getElementById('kumamon-image');
    const babyratImage = document.getElementById('babyrat-image');
    const explosionContainer = document.getElementById('explosion-container');
    const explosionImage = document.getElementById('explosion-image');
    
    if (!container || !kumamonImage || !babyratImage || !explosionContainer || !explosionImage) return;
    
    let isExploding = false;
    
    // Initial positions - start at opposite corners
    let kumamonX = 50;
    let kumamonY = 50;
    let babyratX = window.innerWidth - 150;
    let babyratY = window.innerHeight - 150;
    
    // Speed and direction
    let kumamonDx = 2.5;
    let kumamonDy = 2.0;
    let babyratDx = -2.2;
    let babyratDy = -1.8;
    
    // Colors for tint changes
    const colors = [
        'hue-rotate(0deg) brightness(1.8)',
        'hue-rotate(60deg) brightness(1.8)',
        'hue-rotate(120deg) brightness(1.8)',
        'hue-rotate(180deg) brightness(1.8)',
        'hue-rotate(240deg) brightness(1.8)',
        'hue-rotate(300deg) brightness(1.8)'
    ];
    
    // Random position generator
    function getRandomPosition(maxX, maxY) {
        return {
            x: Math.random() * (maxX - 100),
            y: Math.random() * (maxY - 100)
        };
    }
    
    // Check for collision between two images
    function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(
            x1 + w1 < x2 ||
            x2 + w2 < x1 ||
            y1 + h1 < y2 ||
            y2 + h2 < y1
        );
    }
    
    // Trigger explosion effect
    function explode(x, y) {
        if (isExploding) return;
        
        isExploding = true;
        
        // Position explosion at the collision point (not center of screen)
        explosionContainer.style.left = (x - 112) + 'px'; // Half of 225px width
        explosionContainer.style.top = (y - 112) + 'px'; // Half of 225px height
        explosionContainer.style.transform = ''; // Remove the transform
        explosionContainer.style.display = 'block';
        explosionContainer.style.zIndex = '9999'; // Very high z-index
        explosionContainer.style.position = 'fixed'; // Keep it fixed
        
        // Hide the bouncing images
        kumamonImage.style.display = 'none';
        babyratImage.style.display = 'none';
        
        // Reset after 2 seconds
        setTimeout(function() {
            explosionContainer.style.display = 'none';
            
            // Reset positions to random locations
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            const kumaPos = getRandomPosition(containerWidth, containerHeight);
            const ratPos = getRandomPosition(containerWidth, containerHeight);
            
            // Make sure they start far apart
            while (Math.abs(kumaPos.x - ratPos.x) < 200 || Math.abs(kumaPos.y - ratPos.y) < 200) {
                kumaPos.x = Math.random() * (containerWidth - 100);
                ratPos.y = Math.random() * (containerHeight - 100);
            }
            
            kumamonX = kumaPos.x;
            kumamonY = kumaPos.y;
            babyratX = ratPos.x;
            babyratY = ratPos.y;
            
            // Randomize directions
            kumamonDx = Math.random() > 0.5 ? 2.5 : -2.5;
            kumamonDy = Math.random() > 0.5 ? 2.0 : -2.0;
            babyratDx = Math.random() > 0.5 ? 2.2 : -2.2;
            babyratDy = Math.random() > 0.5 ? 1.8 : -1.8;
            
            // Show images again
            kumamonImage.style.display = 'block';
            babyratImage.style.display = 'block';
            
            isExploding = false;
        }, 2000);
    }
    
    function animate() {
        if (isExploding) {
            requestAnimationFrame(animate);
            return;
        }
        
        // Update Kumamon position
        kumamonX += kumamonDx;
        kumamonY += kumamonDy;
        
        // Update Baby Rat position
        babyratX += babyratDx;
        babyratY += babyratDy;
        
        // Check for collisions with container edges for Kumamon
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const kumamonWidth = kumamonImage.width || 100;  // Updated to your size
        const kumamonHeight = kumamonImage.height || 100; // Updated to your size
        
        // Bounce Kumamon off edges - REMOVED color changes
        if (kumamonX + kumamonWidth > containerWidth || kumamonX < 0) {
            kumamonDx = -kumamonDx;
            // Removed color changing for Kumamon
        }
        
        if (kumamonY + kumamonHeight > containerHeight || kumamonY < 0) {
            kumamonDy = -kumamonDy;
            // Removed color changing for Kumamon
        }
        
        // Check for collisions with container edges for Baby Rat
        const babyratWidth = babyratImage.width || 80;
        const babyratHeight = babyratImage.height || 100;
        
        // Bounce Baby Rat off edges
        if (babyratX + babyratWidth > containerWidth || babyratX < 0) {
            babyratDx = -babyratDx;
            babyratImage.style.filter = `${colors[Math.floor(Math.random() * colors.length)]}`;
        }
        
        if (babyratY + babyratHeight > containerHeight || babyratY < 0) {
            babyratDy = -babyratDy;
            babyratImage.style.filter = `${colors[Math.floor(Math.random() * colors.length)]}`;
        }
        
        // Check for collision between Kumamon and Baby Rat
        if (checkCollision(
            kumamonX, kumamonY, kumamonWidth, kumamonHeight,
            babyratX, babyratY, babyratWidth, babyratHeight
        )) {
            // They collided! Trigger explosion
            explode((kumamonX + babyratX) / 2, (kumamonY + babyratY) / 2);
        }
        
        // Apply positions
        kumamonImage.style.left = kumamonX + 'px';
        kumamonImage.style.top = kumamonY + 'px';
        babyratImage.style.left = babyratX + 'px';
        babyratImage.style.top = babyratY + 'px';
        
        requestAnimationFrame(animate);
    }
    
    // Start animation when images load
    let imagesLoaded = 0;
    function checkAllImagesLoaded() {
        imagesLoaded++;
        if (imagesLoaded >= 3) { // 3 images total
            animate();
        }
    }
    
    if (kumamonImage.complete) {
        checkAllImagesLoaded();
    } else {
        kumamonImage.onload = checkAllImagesLoaded;
    }
    
    if (babyratImage.complete) {
        checkAllImagesLoaded();
    } else {
        babyratImage.onload = checkAllImagesLoaded;
    }
    
    if (explosionImage.complete) {
        checkAllImagesLoaded();
    } else {
        explosionImage.onload = checkAllImagesLoaded;
    }
});