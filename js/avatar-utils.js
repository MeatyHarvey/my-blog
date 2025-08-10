// Avatar utility functions for the blog system
// This file provides functions to display user avatars consistently across the site

/**
 * Generate avatar HTML for any user
 * @param {Object} avatar - The user's avatar object
 * @param {string} username - The user's username (for fallback initials)
 * @param {number} size - The size of the avatar in pixels (default: 40)
 * @returns {string} HTML string for the avatar
 */
function generateAvatarHTML(avatar, username, size = 40) {
    if (avatar?.type === 'photo' && avatar?.photo) {
        return `<div style="width: ${size}px; height: ${size}px; border-radius: 50%; background-image: url(${avatar.photo}); background-size: cover; background-position: center; border: 2px solid rgba(255,255,255,0.3);"></div>`;
    } else {
        const background = avatar?.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        const initials = avatar?.initials || username.substring(0, 2).toUpperCase();
        const fontSize = Math.max(12, size * 0.4);
        return `<div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${background}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; border: 2px solid rgba(255,255,255,0.3);">${initials}</div>`;
    }
}

/**
 * Generate avatar for legacy authorAvatar format (for existing posts)
 * @param {Object} authorAvatar - Legacy avatar object
 * @param {string} author - Author name for fallback
 * @param {number} size - Avatar size in pixels
 * @returns {string} HTML string for the avatar
 */
function generateLegacyAvatarHTML(authorAvatar, author, size = 40) {
    if (authorAvatar?.type === 'photo' && authorAvatar?.photo) {
        return generateAvatarHTML(authorAvatar, author, size);
    } else {
        // Handle legacy format
        const background = authorAvatar?.backgroundColor || authorAvatar?.background || '#4ECDC4';
        const initials = authorAvatar?.initials || author.substring(0, 2).toUpperCase();
        const fontSize = Math.max(12, size * 0.4);
        return `<div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${background}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; border: 2px solid rgba(255,255,255,0.3);">${initials}</div>`;
    }
}

/**
 * Get user data from localStorage or Firebase
 * @param {string} userId - The user ID to fetch
 * @returns {Object|null} User data or null if not found
 */
async function getUserData(userId) {
    try {
        if (window.db) {
            const userDoc = await window.db.collection('users').doc(userId).get();
            return userDoc.exists ? userDoc.data() : null;
        } else {
            const users = JSON.parse(localStorage.getItem('blogUsers') || '[]');
            return users.find(u => u.id === userId) || null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

/**
 * Update avatar displays across the page
 * This function can be called when a user updates their avatar
 */
function updateAvatarDisplays() {
    // Update any avatar displays that have the 'user-avatar' class
    document.querySelectorAll('.user-avatar').forEach(async (element) => {
        const userId = element.dataset.userId;
        const username = element.dataset.username;
        const size = parseInt(element.dataset.size) || 40;
        
        if (userId) {
            const userData = await getUserData(userId);
            if (userData) {
                element.outerHTML = generateAvatarHTML(userData.avatar, userData.username, size);
            }
        } else if (username) {
            // For legacy displays without user ID
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (currentUser && currentUser.username === username) {
                element.outerHTML = generateAvatarHTML(currentUser.avatar, currentUser.username, size);
            }
        }
    });
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.generateAvatarHTML = generateAvatarHTML;
    window.generateLegacyAvatarHTML = generateLegacyAvatarHTML;
    window.getUserData = getUserData;
    window.updateAvatarDisplays = updateAvatarDisplays;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateAvatarHTML,
        generateLegacyAvatarHTML,
        getUserData,
        updateAvatarDisplays
    };
}
