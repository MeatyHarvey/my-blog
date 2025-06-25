// Typing animation for the blog title
document.addEventListener('DOMContentLoaded', function() {
    const titleElement = document.querySelector('header h1');
    if (!titleElement) return;
    
    // Split the title into "Harvey's" and "Blog"
    const titleText = titleElement.textContent.trim();
    const parts = titleText.split(' ');
    
    if (parts.length === 2) {
        // Clear the title
        titleElement.textContent = '';
        
        // Create blinking cursor
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'cursor';
        cursorSpan.innerHTML = '|';
        
        // Type out characters with a delay
        let fullText = parts[0]; // First word "Harvey's"
        fullText += ' '; // Add a space
        fullText += parts[1]; // Second word "Blog"
        
        let charIndex = 0;
        const typingDelayMin = 70;
        const typingDelayMax = 170;
        
        function typeTitle() {
            if (charIndex < fullText.length) {
                const charSpan = document.createElement('span');
                charSpan.className = 'typed-char';
                
                // If this is the space between words, add extra space
                if (fullText.charAt(charIndex) === ' ') {
                    charSpan.innerHTML = '&nbsp;&nbsp;&nbsp;'; // Three spaces
                } else {
                    charSpan.textContent = fullText.charAt(charIndex);
                }
                
                titleElement.appendChild(charSpan);
                charIndex++;
                
                const delay = Math.random() * (typingDelayMax - typingDelayMin) + typingDelayMin;
                setTimeout(typeTitle, delay);
            } else {
                titleElement.appendChild(cursorSpan);
            }
        }
        
        // Start typing after a short delay
        setTimeout(typeTitle, 500);
    }
});