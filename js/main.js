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

// Add smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});