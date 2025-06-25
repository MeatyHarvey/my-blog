// Add this guard at the very top to prevent multiple executions
if (window.animationInitialized) {
    // Animation already running, exit
    console.log("Animation already initialized, preventing duplicate");
} else {
    // Set flag to prevent multiple executions
    window.animationInitialized = true;

    // Typing animation for the blog title
    document.addEventListener('DOMContentLoaded', function() {
        const titleElement = document.querySelector('header h1');
        if (!titleElement || titleElement.querySelector('.typed-char')) return;
        
        // Hard-coded parts of the title to ensure consistent spacing
        const part1 = "Harvey's";
        const part2 = "Blog";
        
        // Clear the title element
        titleElement.textContent = '';
        
        // Create blinking cursor
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'cursor';
        cursorSpan.innerHTML = '|';
        
        let charIndex = 0;
        let currentPart = 0;
        let typingComplete = false;
        
        // Typing the first part "Harvey's"
        function typeTitle() {
            if (currentPart === 0) {
                if (charIndex < part1.length) {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'typed-char';
                    charSpan.textContent = part1.charAt(charIndex);
                    titleElement.appendChild(charSpan);
                    charIndex++;
                    
                    setTimeout(typeTitle, Math.random() * 100 + 70);
                } else {
                    // First part complete, add space
                    charIndex = 0;
                    currentPart = 1;
                    
                    const spaceSpan = document.createElement('span');
                    spaceSpan.className = 'typed-space';
                    spaceSpan.innerHTML = '&nbsp;';
                    titleElement.appendChild(spaceSpan);
                    
                    setTimeout(typeTitle, 200); // Pause before second part
                }
            }
            // Typing the second part "Blog"
            else if (currentPart === 1) {
                if (charIndex < part2.length) {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'typed-char';
                    charSpan.textContent = part2.charAt(charIndex);
                    titleElement.appendChild(charSpan);
                    charIndex++;
                    
                    setTimeout(typeTitle, Math.random() * 100 + 70);
                } else if (!typingComplete) {
                    // All done, add cursor
                    titleElement.appendChild(cursorSpan);
                    typingComplete = true;
                }
            }
        }
        
        // Start typing after a delay
        setTimeout(typeTitle, 500);
    });
}