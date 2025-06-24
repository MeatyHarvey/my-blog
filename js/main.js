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

// Load travel posts from localStorage
function loadTravelPosts() {
    const travelPosts = JSON.parse(localStorage.getItem('travelPosts')) || [];
    return travelPosts;
}

// Save posts to localStorage
function savePosts(posts) {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Save travel posts to localStorage
function saveTravelPosts(posts) {
    localStorage.setItem('travelPosts', JSON.stringify(posts));
}

// Display posts on index page
function displayPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    
    const posts = loadPosts();
    
    // Filter only blog posts
    const blogPosts = posts.filter(post => post.category !== 'travel');
    
    // Clear existing posts
    postsContainer.innerHTML = '';
    
    if (blogPosts.length === 0) {
        postsContainer.innerHTML = '<p>No blog posts yet. Create your first post!</p>';
        return;
    }
    
    // Sort posts by date (newest first)
    blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create HTML for each post
    blogPosts.forEach(post => {
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

// Display travel posts
function displayTravelPosts() {
    const travelContainer = document.getElementById('travel-container');
    if (!travelContainer) return;
    
    const travelPosts = loadTravelPosts();
    
    // Clear existing posts
    travelContainer.innerHTML = '';
    
    if (travelPosts.length === 0) {
        travelContainer.innerHTML = '<p>No travel photos yet. Add your first travel memory!</p>';
        return;
    }
    
    // Sort posts by date (newest first)
    travelPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create HTML for each travel post
    travelPosts.forEach(post => {
        const travelElement = document.createElement('div');
        travelElement.className = 'travel-card';
        travelElement.innerHTML = `
            <img src="${post.imageUrl}" alt="${post.title}" class="travel-image">
            <div class="travel-content">
                <h3>${post.title}</h3>
                <p class="travel-date">${new Date(post.date).toLocaleDateString()}</p>
                <p class="travel-description">${post.description}</p>
                <div class="travel-actions">
                    <button class="delete-post" data-id="${post.id}">Delete</button>
                </div>
                <div class="travel-comments">
                    <h4>Comments (${post.comments ? post.comments.length : 0})</h4>
                    ${post.comments && post.comments.length > 0 
                        ? post.comments.map(comment => `
                            <div class="comment">
                                <p class="comment-author">${comment.author}</p>
                                <p>${comment.text}</p>
                            </div>
                        `).join('')
                        : '<p>No comments yet.</p>'
                    }
                    <div class="comment-form">
                        <div class="form-group">
                            <input type="text" class="comment-author-input" placeholder="Your name" data-post-id="${post.id}">
                        </div>
                        <div class="form-group">
                            <textarea class="comment-text-input" placeholder="Leave a comment..." data-post-id="${post.id}"></textarea>
                        </div>
                        <button class="btn-primary add-comment-btn" data-post-id="${post.id}">Add Comment</button>
                    </div>
                </div>
            </div>
        `;
        travelContainer.appendChild(travelElement);
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-post').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this travel post?')) {
                deleteTravelPost(this.getAttribute('data-id'));
            }
        });
    });
    
    // Add event listeners for comment buttons
    document.querySelectorAll('.add-comment-btn').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            const authorInput = document.querySelector(`.comment-author-input[data-post-id="${postId}"]`);
            const textInput = document.querySelector(`.comment-text-input[data-post-id="${postId}"]`);
            
            const author = authorInput.value.trim();
            const text = textInput.value.trim();
            
            if (!author || !text) {
                alert('Please enter your name and comment.');
                return;
            }
            
            addTravelComment(postId, author, text);
            
            // Clear inputs
            authorInput.value = '';
            textInput.value = '';
        });
    });
}

// Add a new post
function addPost(title, content, tags, category = 'blog') {
    const posts = loadPosts();
    const newPost = {
        id: Date.now().toString(), // Use timestamp as ID
        title: title,
        content: content,
        tags: tags,
        category: category,
        date: new Date().toISOString()
    };
    
    posts.push(newPost);
    savePosts(posts);
    return newPost;
}

// Add a new travel post
function addTravelPost(title, imageUrl, description) {
    const travelPosts = loadTravelPosts();
    const newTravelPost = {
        id: Date.now().toString(),
        title: title,
        imageUrl: imageUrl,
        description: description,
        date: new Date().toISOString(),
        comments: []
    };
    
    travelPosts.push(newTravelPost);
    saveTravelPosts(travelPosts);
    return newTravelPost;
}

// Add a comment to a travel post
function addTravelComment(postId, author, text) {
    const travelPosts = loadTravelPosts();
    const postIndex = travelPosts.findIndex(post => post.id === postId);
    
    if (postIndex === -1) return;
    
    if (!travelPosts[postIndex].comments) {
        travelPosts[postIndex].comments = [];
    }
    
    travelPosts[postIndex].comments.push({
        id: Date.now().toString(),
        author: author,
        text: text,
        date: new Date().toISOString()
    });
    
    saveTravelPosts(travelPosts);
    displayTravelPosts(); // Refresh the display
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

// Delete a travel post
function deleteTravelPost(id) {
    let travelPosts = loadTravelPosts();
    travelPosts = travelPosts.filter(post => post.id !== id);
    saveTravelPosts(travelPosts);
    displayTravelPosts(); // Refresh the display
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
        const category = document.getElementById('category').value;
        
        const newPost = addPost(title, content, tags, category);
        
        if (category === 'travel') {
            alert('Travel post published successfully!');
            // Reset form
            blogForm.reset();
            // Option to view travel page
            if (confirm('Travel post published! Would you like to view the travel page?')) {
                window.location.href = 'travel.html';
            }
        } else {
            alert('Blog post published successfully!');
            // Reset form
            blogForm.reset();
            // Option to view the post
            if (confirm('Blog post published! Would you like to view it?')) {
                window.location.href = `view-post.html?id=${newPost.id}`;
            }
        }
    });
}

// Handle travel photo form submission
function setupTravelForm() {
    const travelForm = document.getElementById('travel-form');
    if (!travelForm) return;
    
    travelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('travel-title').value;
        const imageUrl = document.getElementById('travel-image').value;
        const description = document.getElementById('travel-description').value;
        
        addTravelPost(title, imageUrl, description);
        alert('Travel photo added successfully!');
        
        // Reset form
        travelForm.reset();
        
        // Refresh the travel posts display
        displayTravelPosts();
    });
}

// Initialize functionality based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Setup write form if on write page
    setupWriteForm();
    
    // Setup travel form if on travel page
    setupTravelForm();
    
    // Display posts if on index page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        displayPosts();
    }
    
    // Display travel posts if on travel page
    if (window.location.pathname.includes('travel.html')) {
        displayTravelPosts();
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