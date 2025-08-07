// Global Comments and Likes System with Local Storage Fallback

document.addEventListener('DOMContentLoaded', function() {
    initializeGlobalFeatures();
});

function initializeGlobalFeatures() {
    console.log('🚀 Initializing Global Features...');
    
    // Wait longer for Firebase to fully load, then initialize everything
    setTimeout(async () => {
        console.log('🔧 Starting delayed initialization...');
        await checkFirebaseConnection();
        
        // Set up forms first, then load content
        setupGlobalCommentForms();
        setupGlobalLikeButtons();
        
        // Load existing data
        loadGlobalLikes();
        loadGlobalComments();
        
        // Force load comments for current page based on URL
        setTimeout(() => {
            const currentPath = window.location.pathname;
            if (currentPath.includes('future-fear')) {
                console.log('🎯 Force loading comments for current page: future-fear');
                loadCommentsForPost('future-fear');
            } else if (currentPath.includes('special-one')) {
                console.log('🎯 Force loading comments for current page: special-one');
                loadCommentsForPost('special-one');
            }
        }, 1000);
        
        console.log('✅ Global Features initialized');
    }, 2000); // Increased delay to 2 seconds
}

// Check if Firebase is available
let useFirebase = false;
// Use the global db from firebase-config.js instead of declaring a new one

async function checkFirebaseConnection() {
    try {
        // Wait a bit more for Firebase to fully initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if Firebase was properly initialized in firebase-config.js
        if (typeof firebase !== 'undefined' && 
            typeof window.firebaseInitialized !== 'undefined' && 
            window.firebaseInitialized && 
            typeof window.db !== 'undefined' && window.db !== null) {
            
            console.log('🔍 Attempting to test Firebase connection...');
            // Test Firebase connection with a simple read
            const testDoc = await window.db.collection('test').limit(1).get();
            useFirebase = true;
            console.log('✅ Firebase connected successfully');
        } else {
            throw new Error('Firebase not properly initialized');
        }
    } catch (error) {
        console.log('❌ Firebase not available or failed to connect:', error.message);
        console.log('📱 Using local storage fallback for comments and data');
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
    console.log('🔧 Setting up global comment forms...');
    const posts = document.querySelectorAll('.post[data-category]');
    
    posts.forEach(post => {
        const likeBtn = post.querySelector('.like-btn');
        if (!likeBtn) return;
        
        const postId = likeBtn.getAttribute('data-post');
        console.log('📝 Setting up comments for post:', postId);
        
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
        
        // Load comments immediately
        setTimeout(() => {
            loadCommentsForPost(postId);
        }, 100);
    });
    
    // Setup form submission with better event handling
    document.addEventListener('submit', function(e) {
        console.log('📝 Form submit event triggered');
        console.log('🎯 Target element:', e.target);
        console.log('🏷️ Target class list:', e.target.classList);
        
        if (e.target.classList.contains('comment-form')) {
            console.log('✅ Comment form detected, preventing default and submitting');
            e.preventDefault();
            e.stopPropagation();
            
            // Add a small delay to ensure the form is properly processed
            setTimeout(() => {
                submitGlobalComment(e.target);
            }, 50);
        }
    }, true); // Use capture phase to ensure we catch the event first
}

async function loadCommentsForPost(postId) {
    console.log('📖 Loading comments for post:', postId);
    const commentsList = document.getElementById(`comments-${postId}`);
    if (!commentsList) {
        console.log('❌ Comments list element not found for post:', postId);
        return;
    }
    
    try {
        let comments = [];
        
        console.log('🔥 useFirebase:', useFirebase, 'db:', !!db);
        
        if (useFirebase && window.db) {
            console.log('🔍 Loading comments from Firebase...');
            try {
                // Try the optimized query with index first
                const commentsQuery = await window.db.collection('comments')
                    .where('postId', '==', postId)
                    .orderBy('timestamp', 'desc')
                    .limit(50)
                    .get();
                
                commentsQuery.forEach(doc => {
                    const commentData = doc.data();
                    commentData.id = doc.id; // Add document ID for deletion
                    comments.push(commentData);
                });
                console.log('✅ Loaded', comments.length, 'comments from Firebase (with index)');
            } catch (indexError) {
                console.log('⚠️ Index not ready yet, using simple query:', indexError.message);
                // Fallback to simple query without orderBy
                const commentsQuery = await window.db.collection('comments')
                    .where('postId', '==', postId)
                    .limit(50)
                    .get();
                
                commentsQuery.forEach(doc => {
                    const commentData = doc.data();
                    commentData.id = doc.id; // Add document ID for deletion
                    comments.push(commentData);
                });
                
                // Sort on the client side
                comments.sort((a, b) => {
                    const timestampA = a.timestamp?.toDate?.() || new Date(a.timestamp);
                    const timestampB = b.timestamp?.toDate?.() || new Date(b.timestamp);
                    return timestampB - timestampA; // Newest first
                });
                console.log('✅ Loaded', comments.length, 'comments from Firebase (fallback)');
            }
        } else {
            console.log('💾 Loading comments from local storage...');
            // Load from local storage
            const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
            comments = localComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            console.log('✅ Loaded', comments.length, 'comments from local storage');
        }
        
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            console.log('📝 No comments found for post:', postId);
            return;
        }
        
        // Add bulk delete controls if there are comments
        const bulkDeleteControls = `
            <div class="bulk-delete-controls" style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; display: none;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <label>
                        <input type="checkbox" id="select-all-${postId}" onchange="toggleSelectAll('${postId}')">
                        Select All
                    </label>
                    <button class="bulk-delete-btn" onclick="bulkDeleteComments('${postId}')" disabled>
                        🗑️ Delete Selected (<span id="selected-count-${postId}">0</span>)
                    </button>
                    <button class="cancel-selection-btn" onclick="cancelSelection('${postId}')">
                        ❌ Cancel
                    </button>
                </div>
            </div>
        `;
        
        commentsList.innerHTML = bulkDeleteControls;
        
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment, postId);
            commentsList.appendChild(commentElement);
        });
        
        // Show bulk controls if there are comments with IDs
        const hasCommentsWithIds = comments.some(comment => comment.id);
        if (hasCommentsWithIds) {
            const bulkControls = commentsList.querySelector('.bulk-delete-controls');
            if (bulkControls) {
                bulkControls.style.display = 'block';
            }
        }
        
        console.log('✅ Comments displayed for post:', postId);
        
    } catch (error) {
        console.error('❌ Error loading comments for post', postId, ':', error);
        commentsList.innerHTML = '<p class="error">Unable to load comments. <button onclick="loadCommentsForPost(\'' + postId + '\')">🔄 Retry</button></p>';
        
        // Auto-retry once after 3 seconds if Firebase wasn't ready
        if (error.message.includes('Firebase') || error.message.includes('db')) {
            setTimeout(() => {
                console.log('🔄 Auto-retrying comment load for post:', postId);
                loadCommentsForPost(postId);
            }, 3000);
        }
    }
}

async function submitGlobalComment(form) {
    console.log('🚀 submitGlobalComment called');
    console.log('📝 Form:', form);
    console.log('🔥 useFirebase:', useFirebase);
    console.log('💾 db:', db);
    
    const postId = form.getAttribute('data-post-id');
    const authorInput = form.querySelector('.comment-author');
    const textInput = form.querySelector('.comment-text');
    const submitBtn = form.querySelector('.comment-submit');
    
    console.log('📋 Form data:', { postId, authorInput, textInput, submitBtn });
    
    if (!postId) {
        console.error('❌ No post ID found');
        alert('Error: Post ID not found. Please refresh and try again.');
        return;
    }
    
    if (!authorInput || !textInput) {
        console.error('❌ Form inputs not found');
        alert('Error: Form inputs not found. Please refresh and try again.');
        return;
    }
    
    const author = authorInput.value.trim();
    const text = textInput.value.trim();
    
    console.log('✍️ Comment data:', { author, text });
    
    if (!author || !text) {
        alert('Please fill in both name and comment.');
        return;
    }
    
    // Prevent double submission
    if (submitBtn && submitBtn.disabled) {
        console.log('🚫 Submission already in progress, ignoring duplicate request');
        return;
    }
    
    // Disable form during submission
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';
        console.log('🔒 Form disabled, showing "Posting..." status');
    }
    
    try {
        const newComment = {
            postId: postId,
            author: author,
            text: text,
            timestamp: new Date().toISOString()
        };
        
        console.log('💬 New comment object:', newComment);
        
        if (useFirebase && window.db) {
            console.log('🔥 Attempting to post comment to Firebase...');
            try {
                const docRef = await window.db.collection('comments').add({
                    ...newComment,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('✅ Comment posted to Firebase successfully with ID:', docRef.id);
            } catch (firebaseError) {
                console.error('❌ Firebase posting failed:', firebaseError);
                throw firebaseError; // This will trigger the local storage fallback
            }
        } else {
            console.log('💾 Posting comment to local storage...');
            // Save to local storage
            const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
            newComment.id = 'local_' + Date.now(); // Add ID for local storage
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
        if (submitBtn) {
            submitBtn.textContent = 'Posted!';
            setTimeout(() => {
                submitBtn.textContent = 'Post Comment';
            }, 1000);
        }
        
        console.log('Comment posted successfully');
        
    } catch (error) {
        console.error('Error posting comment:', error);
        
        // Try local storage as fallback
        try {
            console.log('Trying local storage fallback...');
            const newComment = {
                postId: postId,
                author: author,
                text: text,
                timestamp: new Date().toISOString(),
                id: 'local_' + Date.now()
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
            
            if (submitBtn) {
                submitBtn.textContent = 'Posted!';
                setTimeout(() => {
                    submitBtn.textContent = 'Post Comment';
                }, 1000);
            }
            
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            alert('Failed to post comment. Please try again.');
        }
    } finally {
        console.log('🔧 Cleaning up form state');
        if (submitBtn) {
            submitBtn.disabled = false;
            if (submitBtn.textContent === 'Posting...') {
                submitBtn.textContent = 'Post Comment';
                console.log('🔄 Reset button text to "Post Comment"');
            }
        }
        console.log('✅ Comment submission process completed');
    }
}

function createCommentElement(comment, postId) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.setAttribute('data-comment-id', comment.id || '');
    
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
    
    // Add checkbox for bulk selection and individual delete button
    const deleteControls = comment.id ? `
        <div class="comment-controls">
            <input type="checkbox" class="comment-checkbox" value="${comment.id}" onchange="updateBulkDeleteButton()">
            <button class="delete-comment-btn" onclick="deleteComment('${comment.id}', '${postId}')" title="Delete this comment">
                🗑️
            </button>
        </div>
    ` : '';
    
    div.innerHTML = `
        <div class="comment-header">
            <div class="comment-info">
                <strong class="comment-author">${escapeHtml(comment.author)}</strong>
                <span class="comment-date">${timestamp}</span>
            </div>
            ${deleteControls}
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
    console.log('submitComment called with postId:', postId);
    
    // First try to find the proper form
    const form = document.querySelector(`form[data-post-id="${postId}"]`) || 
                 document.querySelector('.comment-form');
    
    if (form && form.tagName === 'FORM') {
        console.log('Found proper form, dispatching submit event');
        // Create a submit event and trigger the existing handler
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
        return;
    }
    
    // Fallback: try to submit using input values directly
    console.log('Using fallback method for comment submission');
    const authorInput = document.getElementById('comment-author') || 
                       document.querySelector('.comment-author');
    const textInput = document.getElementById('comment-text') || 
                     document.querySelector('.comment-text');
    
    if (authorInput && textInput) {
        const author = authorInput.value.trim();
        const text = textInput.value.trim();
        
        if (!author || !text) {
            alert('Please fill in both name and comment.');
            return;
        }
        
        // Create a temporary form object that mimics the expected structure
        const tempForm = {
            getAttribute: (attr) => {
                if (attr === 'data-post-id') return postId;
                return null;
            },
            querySelector: (selector) => {
                if (selector === '.comment-author') return authorInput;
                if (selector === '.comment-text') return textInput;
                if (selector === '.comment-submit') {
                    return document.querySelector('.submit-comment-btn') || 
                           document.querySelector('.comment-submit') || {
                        disabled: false,
                        textContent: 'Post Comment'
                    };
                }
                return null;
            }
        };
        
        console.log('Calling submitGlobalComment with temp form');
        submitGlobalComment(tempForm);
    } else {
        console.error('Could not find comment form inputs');
        alert('Could not find comment form. Please refresh the page and try again.');
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
    console.log('🔄 Loading global comments for all posts...');
    setupGlobalCommentForms();
    
    // Find all comment forms with data-post-id and load comments for each
    const commentForms = document.querySelectorAll('.comment-form[data-post-id]');
    
    commentForms.forEach(form => {
        const postId = form.getAttribute('data-post-id');
        if (postId) {
            console.log('📝 Loading comments for post:', postId);
            // Add a small delay to ensure Firebase is ready
            setTimeout(() => {
                loadCommentsForPost(postId);
            }, 500);
        }
    });
    
    // Also find comment sections that follow the pattern "comments-{postId}"
    const commentsSections = document.querySelectorAll('[id^="comments-"]');
    
    commentsSections.forEach(section => {
        const postId = section.id.replace('comments-', '');
        if (postId && postId !== section.id) { // Make sure we actually found a postId
            console.log('📝 Loading comments for post from ID pattern:', postId);
            setTimeout(() => {
                loadCommentsForPost(postId);
            }, 600);
        }
    });
    
    // If no specific comment sections found, try to load from URL pattern
    if (commentForms.length === 0 && commentsSections.length === 0) {
        const urlPath = window.location.pathname;
        if (urlPath.includes('future-fear')) {
            console.log('📝 Loading comments for future-fear from URL pattern');
            setTimeout(() => {
                loadCommentsForPost('future-fear');
            }, 700);
        } else if (urlPath.includes('special-one')) {
            console.log('📝 Loading comments for special-one from URL pattern');
            setTimeout(() => {
                loadCommentsForPost('special-one');
            }, 700);
        }
    }
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

// Admin function to delete comments (password protected)
async function deleteComment(commentId, postId) {
    // Admin password protection
    const adminPassword = prompt('Enter admin password to delete this comment:');
    if (adminPassword !== 'harvey123') { // Change this to your preferred password
        alert('Incorrect password. Only admin can delete comments.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
        return;
    }
    
    try {
        if (useFirebase && window.db && !commentId.startsWith('local_')) {
            console.log('🗑️ Deleting comment from Firebase:', commentId);
            await window.db.collection('comments').doc(commentId).delete();
            console.log('✅ Comment deleted from Firebase successfully');
        } else {
            console.log('🗑️ Deleting comment from local storage:', commentId);
            // Delete from local storage
            const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
            const filteredComments = localComments.filter(comment => 
                comment.id !== commentId && 
                comment.timestamp !== commentId.replace('local_', '') // Fallback for old comments without ID
            );
            localStorage.setItem(`comments_${postId}`, JSON.stringify(filteredComments));
            
            // Also remove from global comments
            const globalComments = JSON.parse(localStorage.getItem('globalComments') || '{}');
            if (globalComments[postId]) {
                globalComments[postId] = globalComments[postId].filter(comment => 
                    comment.id !== commentId &&
                    comment.timestamp !== commentId.replace('local_', '')
                );
                localStorage.setItem('globalComments', JSON.stringify(globalComments));
            }
            console.log('✅ Comment deleted from local storage successfully');
        }
        
        // Reload comments to reflect the deletion
        await loadCommentsForPost(postId);
        alert('Comment deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
    }
}

// Make deleteComment available globally
window.deleteComment = deleteComment;

// Bulk delete functions
function updateBulkDeleteButton() {
    // Find all comment sections and update their bulk delete buttons
    document.querySelectorAll('.comments-list').forEach(commentsList => {
        const postId = commentsList.id.replace('comments-', '');
        const checkboxes = commentsList.querySelectorAll('.comment-checkbox:checked');
        const bulkDeleteBtn = commentsList.querySelector('.bulk-delete-btn');
        const selectedCountSpan = commentsList.querySelector(`#selected-count-${postId}`);
        
        if (bulkDeleteBtn && selectedCountSpan) {
            bulkDeleteBtn.disabled = checkboxes.length === 0;
            selectedCountSpan.textContent = checkboxes.length;
        }
    });
}

function toggleSelectAll(postId) {
    const commentsList = document.getElementById(`comments-${postId}`);
    const selectAllCheckbox = document.getElementById(`select-all-${postId}`);
    const commentCheckboxes = commentsList.querySelectorAll('.comment-checkbox');
    
    commentCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkDeleteButton();
}

function cancelSelection(postId) {
    const commentsList = document.getElementById(`comments-${postId}`);
    const selectAllCheckbox = document.getElementById(`select-all-${postId}`);
    const commentCheckboxes = commentsList.querySelectorAll('.comment-checkbox');
    
    // Uncheck all checkboxes
    selectAllCheckbox.checked = false;
    commentCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    updateBulkDeleteButton();
}

async function bulkDeleteComments(postId) {
    const commentsList = document.getElementById(`comments-${postId}`);
    const selectedCheckboxes = commentsList.querySelectorAll('.comment-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one comment to delete.');
        return;
    }
    
    // Admin password protection
    const adminPassword = prompt(`Enter admin password to delete ${selectedCheckboxes.length} selected comments:`);
    if (adminPassword !== 'harvey123') {
        alert('Incorrect password. Only admin can delete comments.');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedCheckboxes.length} comments? This action cannot be undone.`)) {
        return;
    }
    
    const commentIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
    let successCount = 0;
    let errorCount = 0;
    
    // Show progress
    const bulkDeleteBtn = commentsList.querySelector('.bulk-delete-btn');
    const originalText = bulkDeleteBtn.textContent;
    bulkDeleteBtn.disabled = true;
    
    try {
        console.log(`🗑️ Starting bulk deletion of ${commentIds.length} comments...`);
        
        for (let i = 0; i < commentIds.length; i++) {
            const commentId = commentIds[i];
            bulkDeleteBtn.textContent = `Deleting... (${i + 1}/${commentIds.length})`;
            
            try {
                if (useFirebase && window.db && !commentId.startsWith('local_')) {
                    console.log('🗑️ Deleting comment from Firebase:', commentId);
                    await window.db.collection('comments').doc(commentId).delete();
                } else {
                    console.log('🗑️ Deleting comment from local storage:', commentId);
                    // Delete from local storage
                    const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                    const filteredComments = localComments.filter(comment => 
                        comment.id !== commentId && 
                        comment.timestamp !== commentId.replace('local_', '')
                    );
                    localStorage.setItem(`comments_${postId}`, JSON.stringify(filteredComments));
                    
                    // Also remove from global comments
                    const globalComments = JSON.parse(localStorage.getItem('globalComments') || '{}');
                    if (globalComments[postId]) {
                        globalComments[postId] = globalComments[postId].filter(comment => 
                            comment.id !== commentId &&
                            comment.timestamp !== commentId.replace('local_', '')
                        );
                        localStorage.setItem('globalComments', JSON.stringify(globalComments));
                    }
                }
                
                successCount++;
                console.log(`✅ Comment ${commentId} deleted successfully`);
                
            } catch (error) {
                console.error(`❌ Error deleting comment ${commentId}:`, error);
                errorCount++;
            }
        }
        
        // Show results
        if (errorCount === 0) {
            alert(`✅ Successfully deleted all ${successCount} comments!`);
        } else {
            alert(`Deleted ${successCount} comments successfully. ${errorCount} failed to delete.`);
        }
        
        // Reload comments to reflect the deletions
        await loadCommentsForPost(postId);
        
    } catch (error) {
        console.error('❌ Bulk delete operation failed:', error);
        alert('Bulk delete operation failed. Please try again.');
    } finally {
        bulkDeleteBtn.textContent = originalText;
        bulkDeleteBtn.disabled = false;
    }
}

// Make bulk delete functions available globally
window.updateBulkDeleteButton = updateBulkDeleteButton;
window.toggleSelectAll = toggleSelectAll;
window.cancelSelection = cancelSelection;
window.bulkDeleteComments = bulkDeleteComments;
