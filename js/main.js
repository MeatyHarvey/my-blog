// Blog functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle post form if it exists
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createPost();
        });
        
        // Live preview functionality
        const titleInput = document.getElementById('title');
        const contentInput = document.getElementById('content');
        const preview = document.getElementById('preview');
        const previewContent = document.getElementById('preview-content');
        
        function updatePreview() {
            const title = titleInput.value;
            const content = contentInput.value;
            
            if (title || content) {
                preview.style.display = 'block';
                previewContent.innerHTML = `
                    <h2>${title || 'Untitled Post'}</h2>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <div>${content.replace(/\n/g, '<br>') || 'No content yet...'}</div>
                `;
            } else {
                preview.style.display = 'none';
            }
        }
        
        titleInput.addEventListener('input', updatePreview);
        contentInput.addEventListener('input', updatePreview);
    }
});

function createPost() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    if (!title || !content) {
        alert('Please fill in both title and content!');
        return;
    }
    
    // For now, just show success message
    // In a real blog, you'd send this to a server
    alert(`Post "${title}" created successfully!\n\nIn a full implementation, this would be saved to your blog.`);
    
    // Clear the form
    document.getElementById('post-form').reset();
    document.getElementById('preview').style.display = 'none';
}

// Blog post management functionality

// Load posts from localStorage
function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    return posts;
}

// Save posts to localStorage
function savePosts(posts) {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Display posts on index page
function displayPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    
    const posts = loadPosts();
    
    // Clear existing posts
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts yet. Create your first post!</p>';
        return;
    }
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create HTML for each post
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p class="post-meta">${new Date(post.date).toLocaleDateString()}</p>
            <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
            <div class="post-actions">
                <a href="view-post.html?id=${post.id}" class="read-more">Read More</a>
                <button class="delete-post" data-id="${post.id}">Delete</button>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-post').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this post?')) {
                deletePost(this.getAttribute('data-id'));
            }
        });
    });
}

// Add a new post
function addPost(title, content, tags) {
    const posts = loadPosts();
    const newPost = {
        id: Date.now().toString(), // Use timestamp as ID
        title: title,
        content: content,
        tags: tags,
        date: new Date().toISOString()
    };
    
    posts.push(newPost);
    savePosts(posts);
    return newPost;
}

// Delete a post
function deletePost(id) {
    let posts = loadPosts();
    posts = posts.filter(post => post.id !== id);
    savePosts(posts);
    
    // Refresh the posts display if on index page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        displayPosts();
    } else {
        // Redirect to home if on view-post page
        window.location.href = 'index.html';
    }
}

// Display a single post
function displaySinglePost() {
    const postContainer = document.getElementById('post-container');
    if (!postContainer) return;
    
    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        postContainer.innerHTML = '<p>Post not found</p>';
        return;
    }
    
    const posts = loadPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        postContainer.innerHTML = '<p>Post not found</p>';
        return;
    }
    
    postContainer.innerHTML = `
        <div class="post single-post">
            <h1>${post.title}</h1>
            <p class="post-meta">Published on ${new Date(post.date).toLocaleDateString()} by Harvey</p>
            <div class="post-content">
                ${post.content.replace(/\n/g, '<br>')}
            </div>
            <div class="post-navigation">
                <a href="index.html" class="back-to-home">← Back to Home</a>
                <button class="delete-post" data-id="${post.id}">Delete Post</button>
            </div>
        </div>
    `;
    
    // Add event listener for delete button
    document.querySelector('.delete-post').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this post?')) {
            deletePost(this.getAttribute('data-id'));
        }
    });
}

// Handle form submission on write page
function setupWriteForm() {
    const blogForm = document.getElementById('blog-form');
    if (!blogForm) return;
    
    blogForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const tags = document.getElementById('tags').value;
        
        const newPost = addPost(title, content, tags);
        alert('Post published successfully!');
        
        // Reset form
        blogForm.reset();
        
        // Option to view the post
        if (confirm('Post published! Would you like to view it?')) {
            window.location.href = `view-post.html?id=${newPost.id}`;
        }
    });
}

// Initialize functionality based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Setup write form if on write page
    setupWriteForm();
    
    // Display posts if on index page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        displayPosts();
    }
    
    // Display single post if on view-post page
    if (window.location.pathname.includes('view-post.html')) {
        displaySinglePost();
    }
});

// Add smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});