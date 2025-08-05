// Global Comments and Likes System using Firebase

document.addEventListener('DOMContentLoaded', function() {
    initializeGlobalFeatures();
});

function initializeGlobalFeatures() {
    loadGlobalLikes();
    loadGlobalComments();
    setupGlobalCommentForms();
    setupGlobalLikeButtons();
}

// Global Likes System
function setupGlobalLikeButtons() {
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
        const postId = button.getAttribute('data-post');
        
        button.addEventListener('click', function() {
            toggleGlobalLike(postId, button);
        });
        
        // Load current like status
        loadLikeStatus(postId, button);
    });
}

async function loadLikeStatus(postId, button) {
    try {
        const likeDoc = await db.collection('posts').doc(postId).get();
        
        if (likeDoc.exists) {
            const data = likeDoc.data();
            const likeCount = data.likes || 0;
            const userLiked = hasUserLiked(postId);
            
            button.querySelector('.like-count').textContent = likeCount;
            
            if (userLiked) {
                button.classList.add('liked');
                button.querySelector('.heart').textContent = '♥';
            }
        }
    } catch (error) {
        console.error('Error loading likes:', error);
        // Fallback to local storage
        const localLikes = localStorage.getItem(`likes_${postId}`) || '0';
        button.querySelector('.like-count').textContent = localLikes;
    }
}

async function toggleGlobalLike(postId, button) {
    const isLiked = button.classList.contains('liked');
    const likeCountSpan = button.querySelector('.like-count');
    const heartSpan = button.querySelector('.heart');
    
    try {
        const postRef = db.collection('posts').doc(postId);
        
        if (isLiked) {
            // Unlike
            await postRef.update({
                likes: firebase.firestore.FieldValue.increment(-1)
            });
            
            button.classList.remove('liked');
            heartSpan.textContent = '♡';
            removeUserLike(postId);
            
        } else {
            // Like
            await postRef.set({
                likes: firebase.firestore.FieldValue.increment(1)
            }, { merge: true });
            
            button.classList.add('liked');
            heartSpan.textContent = '♥';
            setUserLike(postId);
            
            // Animation
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Update display
        const doc = await postRef.get();
        if (doc.exists) {
            likeCountSpan.textContent = doc.data().likes || 0;
        }
        
    } catch (error) {
        console.error('Error updating like:', error);
        alert('Unable to update like. Please try again.');
    }
}

// User like tracking (to prevent multiple likes from same user)
function hasUserLiked(postId) {
    const userLikes = JSON.parse(localStorage.getItem('userLikes') || '[]');
    return userLikes.includes(postId);
}

function setUserLike(postId) {
    const userLikes = JSON.parse(localStorage.getItem('userLikes') || '[]');
    if (!userLikes.includes(postId)) {
        userLikes.push(postId);
        localStorage.setItem('userLikes', JSON.stringify(userLikes));
    }
}

function removeUserLike(postId) {
    const userLikes = JSON.parse(localStorage.getItem('userLikes') || '[]');
    const index = userLikes.indexOf(postId);
    if (index > -1) {
        userLikes.splice(index, 1);
        localStorage.setItem('userLikes', JSON.stringify(userLikes));
    }
}

// Global Comments System
function setupGlobalCommentForms() {
    // Add comment forms to each post
    const posts = document.querySelectorAll('.post[data-category]');
    
    posts.forEach(post => {
        const postId = post.querySelector('.like-btn').getAttribute('data-post');
        
        // Add comment section if it doesn't exist
        if (!post.querySelector('.comments-section')) {
            const commentsHTML = `
                <div class="comments-section">
                    <h4>Comments</h4>
                    <div class="comments-list" id="comments-${postId}">
                        <!-- Comments will be loaded here -->
                    </div>
                    <form class="comment-form" data-post-id="${postId}">
                        <div class="form-group">
                            <input type="text" class="comment-author" placeholder="Your name" required>
                        </div>
                        <div class="form-group">
                            <textarea class="comment-text" placeholder="Write a comment..." rows="3" required></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Post Comment</button>
                    </form>
                </div>
            `;
            
            post.insertAdjacentHTML('beforeend', commentsHTML);
        }
        
        // Load existing comments
        loadCommentsForPost(postId);
    });
    
    // Setup form submission
    document.addEventListener('submit', function(e) {
        if (e.target.classList.contains('comment-form')) {
            e.preventDefault();
            submitGlobalComment(e.target);
        }
    });
}

async function loadCommentsForPost(postId) {
    try {
        const commentsQuery = await db.collection('comments')
            .where('postId', '==', postId)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        
        const commentsList = document.getElementById(`comments-${postId}`);
        if (!commentsList) return;
        
        commentsList.innerHTML = '';
        
        if (commentsQuery.empty) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        commentsQuery.forEach(doc => {
            const comment = doc.data();
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
        
    } catch (error) {
        console.error('Error loading comments:', error);
        const commentsList = document.getElementById(`comments-${postId}`);
        if (commentsList) {
            commentsList.innerHTML = '<p class="error">Unable to load comments. Please refresh the page.</p>';
        }
    }
}

async function submitGlobalComment(form) {
    const postId = form.getAttribute('data-post-id');
    const authorInput = form.querySelector('.comment-author');
    const textInput = form.querySelector('.comment-text');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const author = authorInput.value.trim();
    const text = textInput.value.trim();
    
    if (!author || !text) {
        alert('Please fill in both name and comment.');
        return;
    }
    
    // Disable form during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    
    try {
        await db.collection('comments').add({
            postId: postId,
            author: author,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ip: await getUserIP() // Optional: for moderation
        });
        
        // Clear form
        authorInput.value = '';
        textInput.value = '';
        
        // Reload comments
        await loadCommentsForPost(postId);
        
        alert('Comment posted successfully!');
        
    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Failed to post comment. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Comment';
    }
}

function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    
    const timestamp = comment.timestamp ? 
        comment.timestamp.toDate().toLocaleDateString() : 
        'Just now';
    
    div.innerHTML = `
        <div class="comment-header">
            <strong class="comment-author">${escapeHtml(comment.author)}</strong>
            <span class="comment-date">${timestamp}</span>
        </div>
        <div class="comment-content">
            ${escapeHtml(comment.text).replace(/\n/g, '<br>')}
        </div>
    `;
    
    return div;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

async function loadGlobalLikes() {
    // Initialize like counts from Firebase
    const posts = document.querySelectorAll('.like-btn');
    
    for (const button of posts) {
        const postId = button.getAttribute('data-post');
        await loadLikeStatus(postId, button);
    }
}

async function loadGlobalComments() {
    // Comments are loaded individually per post
    setupGlobalCommentForms();
}
