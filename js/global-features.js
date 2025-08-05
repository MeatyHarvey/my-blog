// Global Comments and Likes System with Local Storage Fallback

document.addEventListener('DOMContentLoaded', function() {
    initializeGlobalFeatures();
});

function initializeGlobalFeatures() {
    checkFirebaseConnection();
    loadGlobalLikes();
    loadGlobalComments();
    setupGlobalCommentForms();
    setupGlobalLikeButtons();
}

// Check if Firebase is available
let useFirebase = false;
let db; // Add missing database reference

async function checkFirebaseConnection() {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            // Initialize database reference
            db = firebase.firestore();
            // Test Firebase connection
            await db.collection('test').limit(1).get();
            useFirebase = true;
            console.log('Firebase connected successfully');
        }
    } catch (error) {
        console.log('Firebase not available, using local storage fallback');
        useFirebase = false;
    }
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
        if (useFirebase) {
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
        } else {
            // Use local storage fallback
            const localLikes = parseInt(localStorage.getItem(`global_likes_${postId}`)) || 0;
            const userLiked = hasUserLiked(postId);
            
            button.querySelector('.like-count').textContent = localLikes;
            
            if (userLiked) {
                button.classList.add('liked');
                button.querySelector('.heart').textContent = '♥';
            }
        }
    } catch (error) {
        console.error('Error loading likes:', error);
        // Fallback to local storage
        const localLikes = parseInt(localStorage.getItem(`global_likes_${postId}`)) || 0;
        button.querySelector('.like-count').textContent = localLikes;
    }
}

async function toggleGlobalLike(postId, button) {
    const isLiked = button.classList.contains('liked');
    const likeCountSpan = button.querySelector('.like-count');
    const heartSpan = button.querySelector('.heart');
    let currentCount = parseInt(likeCountSpan.textContent) || 0;
    
    try {
        if (useFirebase) {
            const postRef = db.collection('posts').doc(postId);
            
            if (isLiked) {
                await postRef.update({
                    likes: firebase.firestore.FieldValue.increment(-1)
                });
                button.classList.remove('liked');
                heartSpan.textContent = '♡';
                removeUserLike(postId);
            } else {
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
            
            const doc = await postRef.get();
            if (doc.exists) {
                likeCountSpan.textContent = doc.data().likes || 0;
            }
        } else {
            // Local storage fallback
            if (isLiked) {
                currentCount--;
                button.classList.remove('liked');
                heartSpan.textContent = '♡';
                removeUserLike(postId);
            } else {
                currentCount++;
                button.classList.add('liked');
                heartSpan.textContent = '♥';
                setUserLike(postId);
                
                // Animation
                button.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 200);
            }
            
            localStorage.setItem(`global_likes_${postId}`, currentCount.toString());
            likeCountSpan.textContent = currentCount;
        }
        
        updateStats();
        
    } catch (error) {
        console.error('Error updating like:', error);
        alert('Unable to update like. Please try again.');
    }
}

// User like tracking
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

// Global Comments System with Local Storage Fallback
function setupGlobalCommentForms() {
    const posts = document.querySelectorAll('.post[data-category]');
    
    posts.forEach(post => {
        const likeBtn = post.querySelector('.like-btn');
        if (!likeBtn) return;
        
        const postId = likeBtn.getAttribute('data-post');
        
        if (!post.querySelector('.comments-section')) {
            const commentsHTML = `
                <div class="comments-section">
                    <h4>Comments</h4>
                    <div class="comments-list" id="comments-${postId}">
                        <div class="loading">Loading comments...</div>
                    </div>
                    <form class="comment-form" data-post-id="${postId}">
                        <div class="form-group">
                            <input type="text" class="comment-author" placeholder="Your name" required>
                        </div>
                        <div class="form-group">
                            <textarea class="comment-text" placeholder="Write a comment..." rows="3" required></textarea>
                        </div>
                        <button type="submit" class="btn-primary comment-submit">Post Comment</button>
                    </form>
                </div>
            `;
            
            post.insertAdjacentHTML('beforeend', commentsHTML);
        }
        
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
    const commentsList = document.getElementById(`comments-${postId}`);
    if (!commentsList) return;
    
    try {
        let comments = [];
        
        if (useFirebase) {
            const commentsQuery = await db.collection('comments')
                .where('postId', '==', postId)
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            commentsQuery.forEach(doc => {
                comments.push(doc.data());
            });
        } else {
            // Load from local storage
            const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
            comments = localComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<p class="error">Unable to load comments. Please refresh the page.</p>';
    }
}

async function submitGlobalComment(form) {
    const postId = form.getAttribute('data-post-id');
    const authorInput = form.querySelector('.comment-author');
    const textInput = form.querySelector('.comment-text');
    const submitBtn = form.querySelector('.comment-submit');
    
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
        const newComment = {
            postId: postId,
            author: author,
            text: text,
            timestamp: new Date().toISOString()
        };
        
        if (useFirebase && db) {
            console.log('Posting comment to Firebase...');
            await db.collection('comments').add({
                ...newComment,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Comment posted to Firebase successfully');
        } else {
            console.log('Posting comment to local storage...');
            // Save to local storage
            const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
            localComments.push(newComment);
            localStorage.setItem(`comments_${postId}`, JSON.stringify(localComments));
            
            // Also save to global comments for admin dashboard
            const globalComments = JSON.parse(localStorage.getItem('globalComments') || '{}');
            if (!globalComments[postId]) {
                globalComments[postId] = [];
            }
            globalComments[postId].push(newComment);
            localStorage.setItem('globalComments', JSON.stringify(globalComments));
            console.log('Comment posted to local storage successfully');
        }
        
        // Clear form
        authorInput.value = '';
        textInput.value = '';
        
        // Reload comments
        await loadCommentsForPost(postId);
        
        // Show success message briefly
        submitBtn.textContent = 'Posted!';
        setTimeout(() => {
            submitBtn.textContent = 'Post Comment';
        }, 1000);
        
    } catch (error) {
        console.error('Error posting comment:', error);
        
        // Try local storage as fallback
        try {
            console.log('Trying local storage fallback...');
            const newComment = {
                postId: postId,
                author: author,
                text: text,
                timestamp: new Date().toISOString()
            };
            
            const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
            localComments.push(newComment);
            localStorage.setItem(`comments_${postId}`, JSON.stringify(localComments));
            
            // Also save to global comments
            const globalComments = JSON.parse(localStorage.getItem('globalComments') || '{}');
            if (!globalComments[postId]) {
                globalComments[postId] = [];
            }
            globalComments[postId].push(newComment);
            localStorage.setItem('globalComments', JSON.stringify(globalComments));
            
            // Clear form
            authorInput.value = '';
            textInput.value = '';
            
            // Reload comments
            await loadCommentsForPost(postId);
            
            submitBtn.textContent = 'Posted!';
            setTimeout(() => {
                submitBtn.textContent = 'Post Comment';
            }, 1000);
            
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            alert('Failed to post comment. Please try again.');
        }
    } finally {
        submitBtn.disabled = false;
        if (submitBtn.textContent === 'Posting...') {
            submitBtn.textContent = 'Post Comment';
        }
    }
}

function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    
    let timestamp;
    if (comment.timestamp) {
        if (typeof comment.timestamp === 'string') {
            timestamp = new Date(comment.timestamp).toLocaleDateString();
        } else if (comment.timestamp.toDate) {
            timestamp = comment.timestamp.toDate().toLocaleDateString();
        } else {
            timestamp = 'Just now';
        }
    } else {
        timestamp = 'Just now';
    }
    
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

// Global function for submitting comments from individual post pages
function submitComment(postId) {
    const form = document.querySelector(`form[data-post-id="${postId}"]`) || 
                 document.querySelector('.comment-form');
    
    if (form) {
        // Create a submit event and trigger the existing handler
        const submitEvent = new Event('submit');
        form.dispatchEvent(submitEvent);
    } else {
        // Fallback: try to submit using input values directly
        const authorInput = document.getElementById('comment-author');
        const textInput = document.getElementById('comment-text');
        
        if (authorInput && textInput) {
            const author = authorInput.value.trim();
            const text = textInput.value.trim();
            
            if (!author || !text) {
                alert('Please fill in both name and comment.');
                return;
            }
            
            // Create a temporary form object
            const tempForm = {
                getAttribute: () => postId,
                querySelector: (selector) => {
                    if (selector === '.comment-author') return authorInput;
                    if (selector === '.comment-text') return textInput;
                    if (selector === '.comment-submit') {
                        return document.querySelector('.submit-comment-btn') || {
                            disabled: false,
                            textContent: 'Post Comment'
                        };
                    }
                    return null;
                }
            };
            
            submitGlobalComment(tempForm);
        }
    }
}

// Make submitComment available globally
window.submitComment = submitComment;

async function loadGlobalLikes() {
    const posts = document.querySelectorAll('.like-btn');
    
    for (const button of posts) {
        const postId = button.getAttribute('data-post');
        await loadLikeStatus(postId, button);
    }
}

async function loadGlobalComments() {
    setupGlobalCommentForms();
}

// Update stats with real data (removed duplicate view tracking)
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
