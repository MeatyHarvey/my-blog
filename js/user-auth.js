// User Authentication System
class UserAuth {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }

    // Load current user from localStorage
    loadCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    // Save current user to localStorage
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    // Register a new user
    register(username, password, confirmPassword) {
        // Validation
        if (!username || !password || !confirmPassword) {
            throw new Error('All fields are required');
        }

        if (username.length < 3) {
            throw new Error('Username must be at least 3 characters long');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        // Check if username already exists
        const users = this.getAllUsers();
        if (users[username]) {
            throw new Error('Username already exists');
        }

        // Create new user
        const newUser = {
            username: username,
            password: this.hashPassword(password),
            registeredAt: new Date().toISOString(),
            avatar: this.generateAvatar(username)
        };

        // Save user
        users[username] = newUser;
        localStorage.setItem('registeredUsers', JSON.stringify(users));

        // Store original password for recovery
        this.storeOriginalPassword(username, password);

        return true;
    }

    // Login user
    login(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        const users = this.getAllUsers();
        const user = users[username];

        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== this.hashPassword(password)) {
            throw new Error('Invalid password');
        }

        // Set current user
        this.currentUser = {
            username: user.username,
            avatar: user.avatar,
            registeredAt: user.registeredAt
        };

        this.saveCurrentUser();
        return this.currentUser;
    }

    // Logout user
    logout() {
        this.currentUser = null;
        this.saveCurrentUser();
    }

    // Password recovery function
    recoverPassword(username) {
        if (!username) {
            throw new Error('Username is required');
        }

        const users = this.getAllUsers();
        const user = users[username];

        if (!user) {
            throw new Error('Username not found. Please check your spelling or register a new account.');
        }

        // For security purposes, we'll return the original password
        // In a real application, this would send an email instead
        const originalPassword = this.getOriginalPassword(username);
        
        if (!originalPassword) {
            throw new Error('Password recovery failed. Please contact support.');
        }

        return {
            username: username,
            password: originalPassword
        };
    }

    // Get original password (stored separately for recovery)
    getOriginalPassword(username) {
        const passwords = JSON.parse(localStorage.getItem('userPasswords') || '{}');
        return passwords[username];
    }

    // Store original password for recovery purposes
    storeOriginalPassword(username, password) {
        const passwords = JSON.parse(localStorage.getItem('userPasswords') || '{}');
        passwords[username] = password;
        localStorage.setItem('userPasswords', JSON.stringify(passwords));
    }

    // Get all registered users
    getAllUsers() {
        return JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    }

    // Simple password hashing (for demo purposes)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Generate a simple avatar
    generateAvatar(username) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const colorIndex = username.length % colors.length;
        return {
            backgroundColor: colors[colorIndex],
            initials: username.substring(0, 2).toUpperCase()
        };
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Create global instance
window.userAuth = new UserAuth();

// User Authentication UI Functions
function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'flex';
        showLoginForm();
    }
}

function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'none';
        clearAuthForms();
    }
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) forgotForm.style.display = 'none';
    document.getElementById('modal-title').textContent = '🔐 Login to Comment';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) forgotForm.style.display = 'none';
    document.getElementById('modal-title').textContent = '📝 Create Account';
}

function showForgotPasswordForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
        forgotForm.style.display = 'block';
        document.getElementById('modal-title').textContent = '🔑 Forgot Password';
    }
}

function clearAuthForms() {
    document.querySelectorAll('#auth-modal input').forEach(input => input.value = '');
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const user = window.userAuth.login(username, password);
        alert(`✅ Welcome back, ${user.username}!`);
        hideAuthModal();
        updateAuthUI();
    } catch (error) {
        alert(`❌ ${error.message}`);
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    try {
        window.userAuth.register(username, password, confirmPassword);
        alert(`✅ Account created successfully! Welcome, ${username}!`);
        
        // Auto-login after registration
        window.userAuth.login(username, password);
        hideAuthModal();
        updateAuthUI();
    } catch (error) {
        alert(`❌ ${error.message}`);
    }
}

function handleForgotPassword(event) {
    event.preventDefault();
    
    const username = document.getElementById('forgot-username').value;
    
    try {
        const result = window.userAuth.recoverPassword(username);
        alert(`🔑 Password Recovery\n\nUsername: ${result.username}\nPassword: ${result.password}\n\n⚠️ For security, please change your password after logging in!`);
        showLoginForm();
        // Pre-fill the login form
        document.getElementById('login-username').value = username;
    } catch (error) {
        alert(`❌ ${error.message}`);
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.userAuth.logout();
        updateAuthUI();
        alert('👋 Logged out successfully!');
    }
}

function updateAuthUI() {
    const authButton = document.getElementById('auth-button');
    const userInfo = document.getElementById('user-info');
    
    if (window.userAuth.isLoggedIn()) {
        const user = window.userAuth.getCurrentUser();
        if (authButton) authButton.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            userInfo.innerHTML = `
                <div class="user-avatar" style="width: 35px; height: 35px; border-radius: 50%; background: ${user.avatar.backgroundColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
                    ${user.avatar.initials}
                </div>
                <span style="margin-left: 10px; color: rgba(255,255,255,0.9); font-weight: 500;">${user.username}</span>
                <button onclick="handleLogout()" style="margin-left: 15px; background: rgba(220, 53, 69, 0.8); color: white; border: none; padding: 5px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    Logout
                </button>
            `;
        }
    } else {
        if (authButton) authButton.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Update comment forms to include user authentication
function updateCommentForms() {
    const commentForms = document.querySelectorAll('.comment-form');
    
    commentForms.forEach(form => {
        const authorInput = form.querySelector('.comment-author');
        
        if (window.userAuth.isLoggedIn()) {
            const user = window.userAuth.getCurrentUser();
            if (authorInput) {
                authorInput.value = user.username;
                authorInput.readOnly = true;
                authorInput.style.background = 'rgba(255,255,255,0.1)';
                authorInput.style.color = 'rgba(255,255,255,0.7)';
            }
        } else {
            if (authorInput) {
                authorInput.value = '';
                authorInput.readOnly = false;
                authorInput.style.background = '';
                authorInput.style.color = '';
                authorInput.placeholder = 'Your name (or login for permanent username)';
            }
        }
    });
}

// Initialize auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    updateCommentForms();
});

// Make functions globally available
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.showForgotPasswordForm = showForgotPasswordForm;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleForgotPassword = handleForgotPassword;
window.handleLogout = handleLogout;
window.updateAuthUI = updateAuthUI;
window.updateCommentForms = updateCommentForms;
