/**
 * Authentication Module
 * SmartPath Cane - Login, Register, Logout handling
 */

const Auth = {
    currentUser: null,
    modal: null,

    /**
     * Show auth modal
     */
    showModal(mode = 'login') {
        const content = `
            <h2 class="modal-title">${mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p class="modal-subtitle">${mode === 'login' ? 'Sign in to your account' : 'Join SmartPath Cane today'}</p>
            
            <form class="auth-form" id="auth-form">
                <div class="auth-error" id="auth-error"></div>
                
                ${mode === 'register' ? `
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-input" id="auth-fullname" required placeholder="Enter your full name">
                </div>
                ` : ''}
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="auth-email" required placeholder="Enter your email">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" id="auth-password" required placeholder="Enter your password" minlength="6">
                </div>
                
                <button type="submit" class="btn btn-primary btn-lg" id="auth-submit">
                    ${mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
            </form>
            
            <div class="modal-footer">
                <p>${mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</p>
                <button type="button" class="btn-link" id="auth-toggle">
                    ${mode === 'login' ? 'Create Account' : 'Sign In'}
                </button>
            </div>
        `;

        this.modal = UI.showModal(content);
        this.attachModalListeners(mode);
    },

    /**
     * Attach modal event listeners
     */
    attachModalListeners(mode) {
        const form = document.getElementById('auth-form');
        const toggleBtn = document.getElementById('auth-toggle');
        const errorDiv = document.getElementById('auth-error');

        // Form submission
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.textContent = '';

            const submitBtn = document.getElementById('auth-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Please wait...';

            const data = {
                email: document.getElementById('auth-email').value,
                password: document.getElementById('auth-password').value,
                fullname: document.getElementById('auth-fullname')?.value
            };

            try {
                const response = mode === 'login'
                    ? await AuthAPI.login(data.email, data.password)
                    : await AuthAPI.register(data);

                if (response.success) {
                    this.currentUser = response.data?.user || null;
                    api.setToken(response.data?.token);
                    this.modal?.close();
                    UI.showToast(mode === 'login' ? 'Welcome back!' : 'Account created!', 'success');
                    App.showDashboard();
                } else {
                    errorDiv.textContent = response.error || 'Authentication failed';
                }
            } catch (error) {
                console.error('Auth error:', error);
                errorDiv.textContent = error.message || 'Network error. Please try again.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = mode === 'login' ? 'Sign In' : 'Create Account';
            }
        });

        // Toggle login/register
        toggleBtn?.addEventListener('click', () => {
            this.modal?.close();
            this.showModal(mode === 'login' ? 'register' : 'login');
        });
    },

    /**
     * Close auth modal
     */
    closeModal() {
        this.modal?.close();
        this.modal = null;
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await AuthAPI.logout();
            this.currentUser = null;
            api.clearToken();
            UI.showToast('Logged out successfully', 'success');
            App.render();
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!this.currentUser;
    },

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    }
};
