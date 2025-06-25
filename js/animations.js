// Self-executing function to prevent global scope pollution
(function() {
    // Only add the event listener once
    if (window.animationListenerAdded) return;
    window.animationListenerAdded = true;
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Completely remove any existing animation first
        const allHeadings = document.querySelectorAll('header h1');
        
        // Process each heading (there should only be one, but just in case)
        allHeadings.forEach(function(heading) {
            // Skip if already animated
            if (heading.hasAttribute('data-animated')) return;
            
            // Mark as animated
            heading.setAttribute('data-animated', 'true');
            
            // Store original text for fallback
            const originalText = heading.textContent || "Harvey's Blog";
            
            // Clear ALL content
            heading.innerHTML = '';
            
            // Create a container for the animated text
            const container = document.createElement('div');
            container.style.display = 'inline';
            heading.appendChild(container);
            
            // Define text to type
            const finalText = "Harvey's Blog";
            
            // Type each character with a delay
            let i = 0;
            function typeNextChar() {
                if (i < finalText.length) {
                    // Handle space character specially
                    if (finalText[i] === ' ') {
                        // Add extra space after "Harvey's"
                        const space = document.createElement('span');
                        space.innerHTML = '&nbsp;&nbsp;';
                        container.appendChild(space);
                    } else {
                        container.textContent += finalText[i];
                    }
                    i++;
                    setTimeout(typeNextChar, 120);
                } else {
                    // Add blinking cursor at the end
                    const cursor = document.createElement('span');
                    cursor.className = 'cursor';
                    cursor.textContent = '|';
                    heading.appendChild(cursor);
                }
            }
            
            // Start typing after a delay
            setTimeout(typeNextChar, 500);
        });
    });
})();