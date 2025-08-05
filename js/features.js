// Optimized Advanced Blog Features

// Use event delegation and throttling for better performance
let searchTimeout;
let isInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (!isInitialized) {
        initializeFeatures();
        isInitialized = true;
    }
});

function initializeFeatures() {
    // Initialize features with performance optimizations
    requestAnimationFrame(() => {
        initializeSearch();
        initializeFilters();
        initializeLikes();
        initializeSharing();
        initializeThemeToggle();
        loadRecentPosts();
    });
}

// Optimized Search with throttling
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (!searchInput || !searchBtn) return;
    
    // Throttled search function
    function throttledSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300); // Wait 300ms after user stops typing
    }
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const posts = document.querySelectorAll('.post[data-category]');
        
        // Use document fragment for better performance
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

// Optimized Filter Functions
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

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
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

// Optimized Like System (now handled by global-features.js)
function initializeLikes() {
    // This is now handled by global-features.js
    console.log('Like system initialized by global-features.js');
}

// Optimized Social Sharing
function initializeSharing() {
    // Use event delegation for better performance
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
    // Create a simple toast notification
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

// Optimized Theme Toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) return;
    
    // Load saved theme immediately to prevent flash
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

// Optimized Recent Posts
function loadRecentPosts() {
    const recentPostsContainer = document.getElementById('recent-posts');
    if (!recentPostsContainer) return;
    
    const recentPosts = [
        { title: 'Future Fear', date: 'Oct 26, 2024', url: 'posts/2024-10-26-future-fear.html' },
        { title: 'I will be the special one', date: 'Jul 2, 2024', url: 'posts/2024-07-02-i-will-be-the-special-one.html' }
    ];
    
    // Use template literals for better performance
    const html = recentPosts.map(post => `
        <div class="recent-post-item">
            <a href="${post.url}" class="recent-post-title">${post.title}</a>
            <div class="recent-post-date">${post.date}</div>
        </div>
    `).join('');
    
    recentPostsContainer.innerHTML = html;
}

// Optimized Tag Cloud with event delegation
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
}

// Update Blog Stats
function updateStats() {
    const totalPostsEl = document.getElementById('total-posts');
    const totalViewsEl = document.getElementById('total-views');
    const totalLikesEl = document.getElementById('total-likes');
    
    if (totalPostsEl) {
        const posts = document.querySelectorAll('.post').length;
        totalPostsEl.textContent = posts;
    }
    
    if (totalViewsEl) {
        let totalViews = 0;
        const viewElements = document.querySelectorAll('.view-count');
        viewElements.forEach(el => {
            totalViews += parseInt(el.textContent.split(' ')[0]) || 0;
        });
        totalViewsEl.textContent = totalViews;
    }
    
    if (totalLikesEl) {
        let totalLikes = 0;
        const likeElements = document.querySelectorAll('.like-count');
        likeElements.forEach(el => {
            totalLikes += parseInt(el.textContent) || 0;
        });
        totalLikesEl.textContent = totalLikes;
    }
}

// Tag Cloud Functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tag')) {
        const tag = e.target.textContent;
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = tag;
            searchInput.dispatchEvent(new Event('input'));
        }
    }
});
