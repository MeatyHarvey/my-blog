// Optimized Blog Features - Clean Version

// Global variables
let useFirebase = false;
let db;
let searchTimeout;
let isInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (!isInitialized) {
        initializeFeatures();
        isInitialized = true;
    }
});

function initializeFeatures() {
    // Set up Firebase variables if available
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
            db = firebase.firestore();
            useFirebase = true;
        } catch (error) {
            console.log('Firebase not available, using local storage');
            useFirebase = false;
        }
    }
    
    // Initialize features with performance optimizations
    requestAnimationFrame(() => {
        initializeSearch();
        initializeFilters();
        initializeSharing();
        initializeThemeToggle();
        loadRecentPosts();
        initializeViewCounter();
        initializeCommentNotifications();
        initializeWebsiteUptime();
    });
}

// Search with throttling
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (!searchInput || !searchBtn) return;
    
    function throttledSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    }
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const posts = document.querySelectorAll('.post[data-category]');
        
        posts.forEach(post => {
            const title = post.querySelector('h2')?.textContent?.toLowerCase() || '';
            const content = post.querySelector('p:not(.post-meta)')?.textContent?.toLowerCase() || '';
            
            const isVisible = query === '' || title.includes(query) || content.includes(query);
            post.style.display = isVisible ? 'block' : 'none';
        });
        
        filterDynamicPosts();
    }
    
    searchInput.addEventListener('input', throttledSearch);
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            clearTimeout(searchTimeout);
            performSearch();
        }
    });
}

// Filter Functions
function initializeFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', debounce(filterPosts, 100));
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', debounce(sortPosts, 100));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
        const args = arguments;
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function filterPosts() {
    const categoryFilter = document.getElementById('category-filter');
    const selectedCategory = categoryFilter?.value || 'all';
    const posts = document.querySelectorAll('.post[data-category]');
    
    posts.forEach(post => {
        const postCategory = post.getAttribute('data-category');
        const isVisible = selectedCategory === 'all' || postCategory === selectedCategory;
        post.style.display = isVisible ? 'block' : 'none';
    });
    
    filterDynamicPosts();
}

function filterDynamicPosts() {
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const selectedCategory = categoryFilter?.value || 'all';
    const searchQuery = searchInput?.value?.toLowerCase().trim() || '';
    
    const dynamicContainer = document.getElementById('posts-container');
    if (!dynamicContainer) return;
    
    const dynamicPosts = dynamicContainer.querySelectorAll('.post');
    
    dynamicPosts.forEach(post => {
        const title = post.querySelector('h2')?.textContent?.toLowerCase() || '';
        const content = post.querySelector('p:not(.post-meta)')?.textContent?.toLowerCase() || '';
        
        const matchesSearch = searchQuery === '' || title.includes(searchQuery) || content.includes(searchQuery);
        const matchesCategory = selectedCategory === 'all';
        
        post.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
    });
}

function sortPosts() {
    const sortFilter = document.getElementById('sort-filter');
    const sortBy = sortFilter?.value || 'newest';
    const postsSection = document.querySelector('.posts-section');
    const posts = Array.from(document.querySelectorAll('.post[data-category]'));
    
    if (!postsSection || posts.length === 0) return;
    
    posts.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                const dateA = new Date(a.querySelector('.post-meta')?.textContent?.split('•')?.[0]?.trim() || 0);
                const dateB = new Date(b.querySelector('.post-meta')?.textContent?.split('•')?.[0]?.trim() || 0);
                return dateB - dateA;
            case 'oldest':
                const dateOldA = new Date(a.querySelector('.post-meta')?.textContent?.split('•')?.[0]?.trim() || 0);
                const dateOldB = new Date(b.querySelector('.post-meta')?.textContent?.split('•')?.[0]?.trim() || 0);
                return dateOldA - dateOldB;
            case 'popular':
                const likesA = parseInt(a.querySelector('.like-count')?.textContent || 0);
                const likesB = parseInt(b.querySelector('.like-count')?.textContent || 0);
                return likesB - likesA;
            default:
                return 0;
        }
    });
    
    const dynamicContainer = document.getElementById('posts-container');
    posts.forEach(post => {
        postsSection.insertBefore(post, dynamicContainer);
    });
}

// Social Sharing
function initializeSharing() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('share-btn')) {
            const platform = e.target.getAttribute('data-platform');
            const post = e.target.closest('.post');
            if (!post) return;
            
            const title = post.querySelector('h2')?.textContent || 'Check this out!';
            const url = window.location.href;
            
            sharePost(platform, title, url);
        }
    });
}

function sharePost(platform, title, url) {
    const text = `Check out this post: "${title}"`;
    
    switch(platform) {
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'copy':
            if (navigator.clipboard) {
                navigator.clipboard.writeText(`${text} - ${url}`).then(() => {
                    showToast('Link copied to clipboard!');
                }).catch(() => {
                    fallbackCopyToClipboard(`${text} - ${url}`);
                });
            } else {
                fallbackCopyToClipboard(`${text} - ${url}`);
            }
            break;
    }
}

function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Link copied to clipboard!');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(53, 66, 74, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 0.9em;
        backdrop-filter: blur(10px);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Theme Toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) return;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Recent Posts
function loadRecentPosts() {
    const recentPostsContainer = document.getElementById('recent-posts');
    if (!recentPostsContainer) return;
    
    const recentPosts = [
        { title: 'Future Fear', date: 'Oct 26, 2024', url: 'posts/2024-10-26-future-fear.html' },
        { title: 'I will be the special one', date: 'Jul 2, 2024', url: 'posts/2024-07-02-i-will-be-the-special-one.html' }
    ];
    
    const html = recentPosts.map(post => `
        <div class="recent-post-item">
            <a href="${post.url}" class="recent-post-title">${post.title}</a>
            <div class="recent-post-date">${post.date}</div>
        </div>
    `).join('');
    
    recentPostsContainer.innerHTML = html;
}

// Tag Cloud
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tag')) {
        const tag = e.target.textContent;
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = tag;
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchInput.dispatchEvent(new Event('input'));
            }, 100);
        }
    }
});

// Viewer Counter System
function initializeViewCounter() {
    const currentPage = window.location.pathname;
    const pageId = currentPage.replace(/[^a-zA-Z0-9]/g, '_') || 'home';
    
    incrementViewCount(pageId);
    
    const viewCountEl = document.getElementById('view-count');
    if (viewCountEl) {
        displayViewCount(pageId, viewCountEl);
    }
}

async function incrementViewCount(pageId) {
    const sessionKey = `viewed_${pageId}_${new Date().toDateString()}`;
    if (sessionStorage.getItem(sessionKey)) {
        console.log('Page already viewed in this session');
        return;
    }
    
    try {
        if (useFirebase && typeof firebase !== 'undefined') {
            const viewRef = db.collection('views').doc(pageId);
            const viewDoc = await viewRef.get();
            
            if (viewDoc.exists) {
                await viewRef.update({
                    count: firebase.firestore.FieldValue.increment(1),
                    lastViewed: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                await viewRef.set({
                    count: 1,
                    lastViewed: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } else {
            const views = JSON.parse(localStorage.getItem('pageViews') || '{}');
            views[pageId] = (views[pageId] || 0) + 1;
            localStorage.setItem('pageViews', JSON.stringify(views));
        }
        
        sessionStorage.setItem(sessionKey, 'true');
        
    } catch (error) {
        console.error('Error incrementing view count:', error);
        const views = JSON.parse(localStorage.getItem('pageViews') || '{}');
        views[pageId] = (views[pageId] || 0) + 1;
        localStorage.setItem('pageViews', JSON.stringify(views));
        sessionStorage.setItem(sessionKey, 'true');
    }
}

async function displayViewCount(pageId, element) {
    try {
        let viewCount = 0;
        
        if (useFirebase && typeof firebase !== 'undefined') {
            const viewDoc = await db.collection('views').doc(pageId).get();
            if (viewDoc.exists) {
                viewCount = viewDoc.data().count || 0;
            }
        } else {
            const views = JSON.parse(localStorage.getItem('pageViews') || '{}');
            viewCount = views[pageId] || 0;
        }
        
        element.textContent = `${viewCount} views`;
    } catch (error) {
        console.error('Error displaying view count:', error);
        element.textContent = '0 views';
    }
}

// Comment Notifications
function initializeCommentNotifications() {
    setInterval(checkForNewComments, 30000);
    checkForNewComments();
}

async function checkForNewComments() {
    try {
        const notificationEl = document.getElementById('comment-notification');
        if (!notificationEl) return;
        
        if (useFirebase && typeof firebase !== 'undefined') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const commentsQuery = await db.collection('comments')
                .where('timestamp', '>', yesterday)
                .orderBy('timestamp', 'desc')
                .get();
            
            const newComments = commentsQuery.docs.length;
            
            if (newComments > 0) {
                notificationEl.style.display = 'block';
                notificationEl.textContent = `${newComments} new comment${newComments > 1 ? 's' : ''}`;
                notificationEl.classList.add('notification-badge');
            } else {
                notificationEl.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error checking for new comments:', error);
    }
}

// Website Uptime System
function initializeWebsiteUptime() {
    // Set the website launch date (you can change this to your actual launch date)
    const websiteLaunchDate = new Date('2025-06-24T00:00:00Z'); // June 24, 2025

    function updateUptime() {
        const uptimeEl = document.getElementById('website-uptime');
        if (!uptimeEl) return;
        
        const now = new Date();
        const timeDiff = now - websiteLaunchDate;
        
        if (timeDiff < 0) {
            uptimeEl.textContent = 'Coming soon...';
            return;
        }
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        let uptimeText = '';
        
        if (days > 0) {
            uptimeText += `${days} day${days !== 1 ? 's' : ''}`;
            if (hours > 0) {
                uptimeText += `, ${hours} hour${hours !== 1 ? 's' : ''}`;
            }
        } else if (hours > 0) {
            uptimeText += `${hours} hour${hours !== 1 ? 's' : ''}`;
            if (minutes > 0) {
                uptimeText += `, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
            }
        } else {
            uptimeText += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        
        uptimeEl.textContent = uptimeText;
    }
    
    // Update immediately
    updateUptime();
    
    // Update every minute
    setInterval(updateUptime, 60000);
}
