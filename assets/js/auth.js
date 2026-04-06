/**
 * Authentication Module
 * SmartPath Cane - Login, Register, Logout handling
 */

const Auth = {
    currentUser: null,
    modal: null,

    /**
     * Initialize auth - check for existing session
     */
    async init() {
        // 1. Check for tokens in URL hash (Supabase OAuth/Confirmation redirect)
        if (window.location.hash && window.location.hash.includes('access_token=')) {
            try {
                const params = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = params.get('access_token');

                if (accessToken) {
                    api.setToken(accessToken);
                    // Verify with backend and get profile (do not hang forever if API is down)
                    const meTimeout = new Promise(function (_, reject) {
                        setTimeout(function () {
                            reject(new Error('Session verification timed out'));
                        }, 12000);
                    });
                    const response = await Promise.race([AuthAPI.me(), meTimeout]);
                    if (response.success) {
                        this.saveSession(response.data, accessToken);
                        // Clear the hash without reloading
                        history.replaceState(null, null, ' ');
                        return true;
                    }
                }
            } catch (err) {
                console.error('OAuth token verification failed:', err);
                api.clearToken();
            }
        }

        // 2. Fallback to localStorage
        const savedUser = localStorage.getItem('spc_user');
        const savedToken = localStorage.getItem('spc_token');

        if (savedUser && savedToken) {
            this.currentUser = JSON.parse(savedUser);
            api.setToken(savedToken);
            return true;
        }
        return false;
    },

    /**
     * Save auth session to localStorage
     */
    saveSession(user, token) {
        this.currentUser = user;
        localStorage.setItem('spc_user', JSON.stringify(user));
        localStorage.setItem('spc_token', token);
        api.setToken(token);
    },

    /**
     * Clear auth session from localStorage
     */
    clearSession() {
        this.currentUser = null;
        localStorage.removeItem('spc_user');
        localStorage.removeItem('spc_token');
        api.clearToken();
    },

    /**
     * Show auth modal
     */
    showModal(mode = 'login') {
        let content = '';

        if (mode === 'confirmation_sent') {
            content = `
                <div class="confirmation-view">
                    <span class="confirmation-icon">📧</span>
                    <h2 class="confirmation-title">Check your email</h2>
                    <p class="confirmation-text">
                        We've sent a verification link to your email address. 
                        Please click the link to confirm your account.
                    </p>
                    <button class="btn btn-primary" id="btn-confirmation-ok">Got it</button>
                </div>
            `;
        } else {
            content = `
                <h2 class="modal-title">${mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                <p class="modal-subtitle">${mode === 'login' ? 'Sign in to your account' : 'Join SmartPath Cane today'}</p>
                
                <div class="social-auth">
                    <button class="social-btn" id="btn-oauth-google">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                        Sign in with Google
                    </button>
                </div>

                <div class="auth-divider">OR</div>

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
        }

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
        const confirmOkBtn = document.getElementById('btn-confirmation-ok');
        const googleBtn = document.getElementById('btn-oauth-google');

        // OAuth Handling
        googleBtn?.addEventListener('click', () => {
            AuthAPI.signInWithOAuth('google').catch(err => {
                if (errorDiv) errorDiv.textContent = err.message;
            });
        });

        // Confirmation OK
        confirmOkBtn?.addEventListener('click', () => {
            this.modal?.close();
        });

        // Form submission
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorDiv) errorDiv.textContent = '';

            const submitBtn = document.getElementById('auth-submit');
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
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
                    if (response.data?.confirmation_pending) {
                        this.modal?.close();
                        this.showModal('confirmation_sent');
                    } else {
                        this.saveSession(response.data?.user, response.data?.token);
                        this.modal?.close();
                        UI.showToast(mode === 'login' ? 'Welcome back!' : 'Account created!', 'success');
                        App.showDashboard();
                    }
                } else {
                    let msg = response.error || 'Authentication failed';
                    // If error is a JSON string, try to parse its inner message
                    if (typeof msg === 'string' && msg.startsWith('{')) {
                        try {
                            const parsed = JSON.parse(msg);
                            msg = parsed.msg || parsed.message || parsed.error_description || msg;
                        } catch (e) { }
                    }

                    // Special handling for rate limits
                    if (msg.includes('Too many requests')) {
                        msg = 'Registration frequency limit reached. Please wait 5 minutes or contact support if the issue persists.';
                    }

                    if (errorDiv) errorDiv.textContent = msg;
                }
            } catch (error) {
                console.error('Auth error:', error);
                if (errorDiv) errorDiv.textContent = error.message || 'Network error. Please try again.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
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
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearSession();
            UI.showToast('Logged out successfully', 'success');
            App.render();
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
