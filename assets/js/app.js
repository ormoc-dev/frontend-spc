/**
 * SmartPath Cane - Main Application (Refactored)
 * Frontend Entry Point - Uses Modular Architecture
 */

const App = {
    container: null,
    deferredPrompt: null,

    /**
     * Initialize the application
     */
    init() {
        try {
            this.container = document.getElementById('app');
            console.log('SmartPath Cane initializing...');

            // PWA Install Prompt
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.deferredPrompt = e;
            });

            // Check for existing auth session
            const hasSession = Auth.init();
            if (hasSession) {
                this.showDashboard();
            } else {
                this.renderLanding();
            }
            this.attachEventListeners();

            console.log('App initialized successfully');
        } catch (error) {
            console.error('App Initialization Failed:', error);
            this.handleInitError(error);
        }
    },

    /**
     * Fallback for initialization errors
     */
    handleInitError(error) {
        if (this.container) {
            this.container.innerHTML = `
                <div style="padding: 40px; text-align: center; font-family: sans-serif;">
                    <h2 style="color: #e11d48;">Initialization Error</h2>
                    <p>Something went wrong while starting the app.</p>
                    <p style="font-size: 0.8rem; color: #666; margin-top: 20px;">${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">Retry</button>
                </div>
            `;
        }
    },

    /**
     * Render landing page
     */
    renderLanding() {
        this.container.innerHTML = `
            ${this.renderHeader()}
            <main class="main-content">
                ${this.renderHero()}
                ${this.renderMapTracker()}
                ${this.renderFeatures()}
            </main>
            ${this.renderFooter()}
        `;

        var self = this;
        setTimeout(function () { self.initLandingMap(); }, 100);
        this.attachEventListeners();
    },

    /**
     * Render header
     */
    renderHeader() {
        const isLoggedIn = Auth.isLoggedIn();
        const user = Auth.getUser();

        return `
            <header class="header">
                <div class="container">
                    <nav class="nav">
                        <a href="#" class="nav-brand" id="nav-brand">
                            <span class="nav-brand-icon">🦯</span>
                            <span class="nav-brand-text">SmartPath Cane</span>
                        </a>
                        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">☰</button>
                        <div class="nav-links">
                            <a href="#features" class="nav-link">Features</a>
                            <a href="#tracker" class="nav-link">Tracker</a>
                            ${isLoggedIn ? `
                                <button class="btn btn-primary btn-sm" id="btn-dashboard">Dashboard</button>
                            ` : `
                                <button class="btn btn-primary btn-sm" id="btn-login">Login</button>
                            `}
                        </div>
                    </nav>
                    <div class="nav-mobile" id="nav-mobile">
                        <a href="#features" class="nav-link">Features</a>
                        <a href="#tracker" class="nav-link">Tracker</a>
                        ${isLoggedIn ? `
                            <button class="btn btn-primary" id="btn-dashboard-mobile">Dashboard</button>
                        ` : `
                            <button class="btn btn-primary" id="btn-login-mobile">Login</button>
                        `}
                    </div>
                </div>
            </header>
        `;
    },

    /**
     * Render hero section
     */
    renderHero() {
        return `
            <section class="hero">
                <div class="container">
                    <div class="hero-content">
                        <h1 class="hero-title">Smart Navigation for Everyone</h1>
                        <p class="hero-description">
                            Advanced smart cane technology with real-time location tracking, 
                            emergency alerts, and caregiver connectivity.
                        </p>
                        <div class="hero-actions">
                            <button class="btn btn-primary btn-lg" id="btn-get-started">Get Started</button>
                            <button class="btn btn-outline btn-lg" id="btn-learn-more">Learn More</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * Render map tracker section
     */
    renderMapTracker() {
        return `
            <section class="map-section" id="tracker">
                <div class="container">
                    <div class="tracker-header-row">
                        <div class="tracker-title-group">
                            <h2 class="section-title text-center">Live Location Tracker</h2>
                            <p class="section-subtitle text-center">Real-time GPS tracking for peace of mind</p>
                        </div>
                        <button class="btn btn-install" id="btn-install-app">
                            <span class="btn-icon">📱</span>
                            Install Mobile App
                        </button>
                    </div>
                    <div class="map-container">
                        <div id="landing-map" class="google-map"></div>
                        <div class="map-overlay">
                            <div class="tracker-card">
                                <div class="tracker-header">
                                    <span class="tracker-status online">● Online</span>
                                    <span class="tracker-time">Just now</span>
                                </div>
                                <div class="tracker-info">
                                    <div class="tracker-item">
                                        <span class="tracker-label">Device</span>
                                        <span class="tracker-value">SPC-001</span>
                                    </div>
                                    <div class="tracker-item">
                                        <span class="tracker-label">Battery</span>
                                        <span class="tracker-value">85%</span>
                                    </div>
                                    <div class="tracker-item">
                                        <span class="tracker-label">Location</span>
                                        <span class="tracker-value">Ormoc City</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * Render features section
     */
    renderFeatures() {
        const features = [
            { icon: '📍', title: 'Real-Time Tracking', desc: 'GPS location updates every 30 seconds' },
            { icon: '🚨', title: 'Emergency Alerts', desc: 'Instant SOS notifications to caregivers' },
            { icon: '🗺️', title: 'Safe Zones', desc: 'Custom geofences with entry/exit alerts' },
            { icon: '🔋', title: 'Smart Monitoring', desc: 'Battery and connectivity status' }
        ];

        return `
            <section class="features" id="features">
                <div class="container">
                    <h2 class="section-title text-center">Key Features</h2>
                <div class="features-grid">
                    ${features.map(function (f) {
            return `
                        <div class="feature-card">
                            <div class="feature-icon">${f.icon}</div>
                            <h3 class="feature-title">${f.title}</h3>
                            <p class="feature-description">${f.desc}</p>
                        </div>
                    `;
        }).join('')}
                </div>
                </div>
            </section>
        `;
    },

    /**
     * Render footer
     */
    renderFooter() {
        return `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <p>&copy; 2026 SmartPath Cane. All rights reserved.</p>
                        <div class="footer-links">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    },

    /**
     * Initialize landing page map
     */
    initLandingMap() {
        const map = Maps.init('landing-map', { zoom: 16 });
        if (map) {
            Maps.addMarker('landing-map', Maps.defaultLocation, {
                popup: '<b>SmartPath Cane</b><br>Device: SPC-001<br>Battery: 85%'
            });
        }
    },

    /**
     * Show dashboard
     */
    showDashboard() {
        Dashboard.render();
    },

    /**
     * Render landing page (alias for renderLanding)
     */
    render() {
        this.renderLanding();
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Use event delegation on the container to avoid duplicate listeners
        this.container.removeEventListener('click', this.handleContainerClick);
        this.container.addEventListener('click', this.handleContainerClick);

        // Smooth scroll for nav links (delegate these too)
        this.container.removeEventListener('click', this.handleNavLinkClick);
        this.container.addEventListener('click', this.handleNavLinkClick);
    },

    /**
     * Handle container clicks (event delegation)
     */
    handleContainerClick(e) {
        // Navigation toggle
        if (e.target.closest('#nav-toggle')) {
            document.getElementById('nav-mobile')?.classList.toggle('active');
            return;
        }

        // Login buttons
        if (e.target.closest('#btn-login') || e.target.closest('#btn-login-mobile')) {
            Auth.showModal('login');
            document.getElementById('nav-mobile')?.classList.remove('active');
            return;
        }

        // Dashboard buttons
        if (e.target.closest('#btn-dashboard') || e.target.closest('#btn-dashboard-mobile')) {
            App.showDashboard();
            document.getElementById('nav-mobile')?.classList.remove('active');
            return;
        }

        // Get Started button
        if (e.target.closest('#btn-get-started')) {
            Auth.showModal('register');
            return;
        }

        // Learn More button
        if (e.target.closest('#btn-learn-more')) {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Install app button
        if (e.target.closest('#btn-install-app')) {
            if (App.deferredPrompt) {
                App.deferredPrompt.prompt();
                App.deferredPrompt.userChoice.then(function (choiceResult) {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    App.deferredPrompt = null;
                });
            } else {
                UI.showToast('📱 To install: Tap browser menu and "Add to Home Screen"', 'info');
            }
            return;
        }
    },

    /**
     * Handle nav link clicks for smooth scroll
     */
    handleNavLinkClick(e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            document.getElementById('nav-mobile')?.classList.remove('active');
        }
    }
};

// Initialize - handle case where DOMContentLoaded already fired
// (happens when scripts are at the bottom of body)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { App.init(); });
} else {
    // DOM is already ready, call immediately
    App.init();
}
