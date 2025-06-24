// Typing animation for the blog title
document.addEventListener('DOMContentLoaded', function() {
    const titleElement = document.querySelector('header h1');
    if (!titleElement) return;
    
    const originalTitle = titleElement.textContent;
    titleElement.textContent = ''; // Clear the title
    
    // Add a blinking cursor element
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor';
    cursorSpan.innerHTML = '|';
    titleElement.appendChild(cursorSpan);
    
    // Type out each character with a delay
    let charIndex = 0;
    const startDelay = 500; // ms before typing starts
    const typingDelayRandom = true; // random typing speed for realism
    const typingDelayMin = 70; // minimum typing delay
    const typingDelayMax = 170; // maximum typing delay
    
    function typeTitle() {
        if (charIndex < originalTitle.length) {
            // Create a text node for the current character
            const charSpan = document.createElement('span');
            charSpan.className = 'typed-char';
            charSpan.textContent = originalTitle.charAt(charIndex);
            titleElement.insertBefore(charSpan, cursorSpan);
            
            charIndex++;
            setTimeout(typeTitle, typingDelayRandom ? 
                Math.random() * (typingDelayMax - typingDelayMin) + typingDelayMin : 
                typingDelay);
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeTitle, startDelay);
});