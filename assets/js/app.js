/**
 * SmartPath Cane - Main Application
 * Frontend Entry Point
 */

class SmartPathApp {
    constructor() {
        this.container = document.getElementById('app');
        this.currentUser = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('SmartPath Cane initialized');
        this.render();
        this.attachEventListeners();
    }

    /**
     * Render the main app structure
     */
    render() {
        this.container.innerHTML = `
            ${this.renderHeader()}
            <main class="main-content">
                ${this.renderHero()}
                ${this.renderFeatures()}
            </main>
            ${this.renderFooter()}
        `;
    }

    /**
     * Render header/navigation
     */
    renderHeader() {
        return `
            <header class="header">
                <div class="container">
                    <nav class="nav">
                        <a href="#" class="nav-brand">
                            <span class="nav-brand-icon">🦯</span>
                            <span class="nav-brand-text">SmartPath Cane</span>
                        </a>
                        <div class="nav-links">
                            <a href="#features" class="nav-link">Features</a>
                            <a href="#about" class="nav-link">About</a>
                            <a href="#contact" class="nav-link">Contact</a>
                            <button class="btn btn-primary btn-sm" id="btn-login">Login</button>
                        </div>
                    </nav>
                </div>
            </header>
        `;
    }

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
                            <button class="btn btn-primary btn-lg" id="btn-get-started">
                                Get Started
                            </button>
                            <button class="btn btn-outline btn-lg" id="btn-learn-more">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Render features section
     */
    renderFeatures() {
        return `
            <section class="features" id="features">
                <div class="container">
                    <h2 class="section-title text-center">Key Features</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">📍</div>
                            <h3 class="feature-title">Real-Time Tracking</h3>
                            <p class="feature-description">
                                GPS location tracking with instant updates to caregivers.
                            </p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🚨</div>
                            <h3 class="feature-title">Emergency Alerts</h3>
                            <p class="feature-description">
                                One-touch SOS button sends immediate alerts with location.
                            </p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🔋</div>
                            <h3 class="feature-title">Long Battery Life</h3>
                            <p class="feature-description">
                                Extended battery with low-power alerts and monitoring.
                            </p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">👥</div>
                            <h3 class="feature-title">Caregiver Connect</h3>
                            <p class="feature-description">
                                Multiple caregivers can monitor and receive alerts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

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
                            <a href="#privacy">Privacy</a>
                            <a href="#terms">Terms</a>
                            <a href="#support">Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Login button
        const loginBtn = document.getElementById('btn-login');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        // Get started button
        const getStartedBtn = document.getElementById('btn-get-started');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => this.handleGetStarted());
        }

        // Learn more button
        const learnMoreBtn = document.getElementById('btn-learn-more');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => this.handleLearnMore());
        }
    }

    /**
     * Handle login click
     */
    handleLogin() {
        console.log('Login clicked');
        // TODO: Implement login modal or redirect
        alert('Login functionality coming soon!');
    }

    /**
     * Handle get started click
     */
    handleGetStarted() {
        console.log('Get started clicked');
        // TODO: Implement registration or onboarding
        alert('Registration coming soon!');
    }

    /**
     * Handle learn more click
     */
    handleLearnMore() {
        console.log('Learn more clicked');
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SmartPathApp();
});
