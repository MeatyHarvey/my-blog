// Advanced Blog Features

document.addEventListener('DOMContentLoaded', function() {
    initializeFeatures();
});

function initializeFeatures() {
    initializeSearch();
    initializeFilters();
    initializeLikes();
    initializeSharing();
    initializeThemeToggle();
    initializeViewTracking();
    loadRecentPosts();
    updateStats();
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (!searchInput || !searchBtn) return;
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const posts = document.querySelectorAll('.post[data-category]');
        
        posts.forEach(post => {
            const title = post.querySelector('h2').textContent.toLowerCase();
            const content = post.querySelector('p:not(.post-meta)').textContent.toLowerCase();
            
            if (query === '' || title.includes(query) || content.includes(query)) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
        
        // Also search dynamic posts
        filterDynamicPosts();
    }
    
    searchInput.addEventListener('input', performSearch);
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Filter Functionality
function initializeFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterPosts);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', sortPosts);
    }
}

function filterPosts() {
    const categoryFilter = document.getElementById('category-filter');
    const selectedCategory = categoryFilter.value;
    const posts = document.querySelectorAll('.post[data-category]');
    
    posts.forEach(post => {
        const postCategory = post.getAttribute('data-category');
        
        if (selectedCategory === 'all' || postCategory === selectedCategory) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
    
    filterDynamicPosts();
}

function filterDynamicPosts() {
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // This will work with the existing dynamic posts from main.js
    const dynamicContainer = document.getElementById('posts-container');
    if (dynamicContainer) {
        const dynamicPosts = dynamicContainer.querySelectorAll('.post');
        
        dynamicPosts.forEach(post => {
            const title = post.querySelector('h2') ? post.querySelector('h2').textContent.toLowerCase() : '';
            const content = post.querySelector('p:not(.post-meta)') ? post.querySelector('p:not(.post-meta)').textContent.toLowerCase() : '';
            
            const matchesSearch = searchQuery === '' || title.includes(searchQuery) || content.includes(searchQuery);
            const matchesCategory = selectedCategory === 'all'; // Dynamic posts are usually 'blog' category
            
            if (matchesSearch && matchesCategory) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }
}

function sortPosts() {
    const sortFilter = document.getElementById('sort-filter');
    const sortBy = sortFilter.value;
    const postsSection = document.querySelector('.posts-section');
    const posts = Array.from(document.querySelectorAll('.post[data-category]'));
    
    posts.sort((a, b) => {
        if (sortBy === 'newest') {
            const dateA = new Date(a.querySelector('.post-meta').textContent.split('•')[0].trim());
            const dateB = new Date(b.querySelector('.post-meta').textContent.split('•')[0].trim());
            return dateB - dateA;
        } else if (sortBy === 'oldest') {
            const dateA = new Date(a.querySelector('.post-meta').textContent.split('•')[0].trim());
            const dateB = new Date(b.querySelector('.post-meta').textContent.split('•')[0].trim());
            return dateA - dateB;
        } else if (sortBy === 'popular') {
            const likesA = parseInt(a.querySelector('.like-count').textContent) || 0;
            const likesB = parseInt(b.querySelector('.like-count').textContent) || 0;
            return likesB - likesA;
        }
        return 0;
    });
    
    // Re-insert sorted posts
    const dynamicContainer = document.getElementById('posts-container');
    posts.forEach(post => {
        postsSection.insertBefore(post, dynamicContainer);
    });
}

// Like System
function initializeLikes() {
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
        const postId = button.getAttribute('data-post');
        const isLiked = localStorage.getItem(`liked_${postId}`) === 'true';
        
        if (isLiked) {
            button.classList.add('liked');
            button.querySelector('.heart').textContent = '♥';
        }
        
        button.addEventListener('click', function() {
            toggleLike(postId, button);
        });
    });
}

function toggleLike(postId, button) {
    const isLiked = button.classList.contains('liked');
    const likeCountSpan = button.querySelector('.like-count');
    const heartSpan = button.querySelector('.heart');
    let currentCount = parseInt(likeCountSpan.textContent) || 0;
    
    if (isLiked) {
        // Unlike
        button.classList.remove('liked');
        heartSpan.textContent = '♡';
        currentCount--;
        localStorage.setItem(`liked_${postId}`, 'false');
    } else {
        // Like
        button.classList.add('liked');
        heartSpan.textContent = '♥';
        currentCount++;
        localStorage.setItem(`liked_${postId}`, 'true');
        
        // Add animation
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 200);
    }
    
    likeCountSpan.textContent = currentCount;
    updateStats();
}

// Social Sharing
function initializeSharing() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            const post = this.closest('.post');
            const title = post.querySelector('h2').textContent;
            const url = window.location.href;
            
            sharePost(platform, title, url);
        });
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
            navigator.clipboard.writeText(`${text} - ${url}`).then(() => {
                alert('Link copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = `${text} - ${url}`;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('Link copied to clipboard!');
            });
            break;
    }
}

// Theme Toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) return;
    
    // Load saved theme
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

// View Tracking
function initializeViewTracking() {
    // Track page views
    const currentPage = window.location.pathname;
    let pageViews = parseInt(localStorage.getItem(`views_${currentPage}`)) || 0;
    pageViews++;
    localStorage.setItem(`views_${currentPage}`, pageViews);
    
    // Update view counts for posts
    updateViewCounts();
}

function updateViewCounts() {
    const viewElements = document.querySelectorAll('.view-count');
    viewElements.forEach(element => {
        const currentCount = parseInt(element.textContent.split(' ')[0]) || 0;
        const randomIncrease = Math.floor(Math.random() * 3); // Random small increase
        element.textContent = `${currentCount + randomIncrease} views`;
    });
}

// Recent Posts Sidebar
function loadRecentPosts() {
    const recentPostsContainer = document.getElementById('recent-posts');
    if (!recentPostsContainer) return;
    
    const recentPosts = [
        { title: 'Future Fear', date: 'Oct 26, 2024', url: 'posts/2024-10-26-future-fear.html' },
        { title: 'I will be the special one', date: 'Jul 2, 2024', url: 'posts/2024-07-02-i-will-be-the-special-one.html' }
    ];
    
    let html = '';
    recentPosts.forEach(post => {
        html += `
            <div class="recent-post-item">
                <a href="${post.url}" class="recent-post-title">${post.title}</a>
                <div class="recent-post-date">${post.date}</div>
            </div>
        `;
    });
    
    recentPostsContainer.innerHTML = html;
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
