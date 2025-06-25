// Typing animation for the blog title
document.addEventListener('DOMContentLoaded', function() {
    const titleElement = document.querySelector('header h1');
    if (!titleElement) return;
    
    // Store original title text
    const titleText = titleElement.textContent.trim();
    
    // Clear the title element
    titleElement.textContent = '';
    
    // Create blinking cursor
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor';
    cursorSpan.innerHTML = '|';
    
    // Type out each character
    let charIndex = 0;
    const typingDelayMin = 70;
    const typingDelayMax = 170;
    
    // IMPORTANT: Split the title into words
    const words = ["Harvey's", "Blog"];
    let currentText = "";
    
    function typeTitle() {
        if (words.length > 0) {
            if (charIndex < words[0].length) {
                // Still typing the current word
                const charSpan = document.createElement('span');
                charSpan.className = 'typed-char';
                charSpan.textContent = words[0].charAt(charIndex);
                titleElement.appendChild(charSpan);
                charIndex++;
                
                const delay = Math.random() * (typingDelayMax - typingDelayMin) + typingDelayMin;
                setTimeout(typeTitle, delay);
            } else {
                // Finished a word
                charIndex = 0;
                currentText = words.shift();
                
                // Add space between words if more words remain
                if (words.length > 0) {
                    const spaceSpan = document.createElement('span');
                    spaceSpan.className = 'typed-space';
                    spaceSpan.innerHTML = '&nbsp;&nbsp;&nbsp;'; // Three spaces between words
                    titleElement.appendChild(spaceSpan);
                    
                    // Slight pause between words
                    setTimeout(typeTitle, 200);
                } else {
                    // Add cursor at the end
                    titleElement.appendChild(cursorSpan);
                }
            }
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeTitle, 500);
});