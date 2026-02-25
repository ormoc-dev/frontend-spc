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
                ${this.renderMapTracker()}
                ${this.renderFeatures()}
            </main>
            ${this.renderFooter()}
        `;

        // Initialize map after rendering
        setTimeout(() => this.initMap(), 100);
    }

    /**
     * Render map tracker section
     */
    renderMapTracker() {
        return `
            <section class="map-section" id="tracker">
                <div class="container">
                    <h2 class="section-title text-center">Live Location Tracker</h2>
                    <p class="section-subtitle text-center">
                        Real-time GPS tracking for peace of mind
                    </p>
                    <div class="map-container">
                        <div id="google-map" class="google-map"></div>
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
                                        <span class="tracker-value">Ormoc City, Leyte</span>
                                    </div>
                                </div>
                                <button class="btn btn-primary btn-sm tracker-btn">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Initialize Leaflet Map with Satellite Mode
     */
    initMap() {
        const mapElement = document.getElementById('google-map');
        if (!mapElement) return;

        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            console.warn('Leaflet not loaded');
            return;
        }

        // Default location (Ormoc City, Leyte, Philippines)
        const defaultLocation = [11.0056, 124.6075];

        try {
            // Create map
            const map = L.map('google-map', {
                zoomControl: true,
                attributionControl: false
            }).setView(defaultLocation, 16);

            // Add satellite tile layer (Esri World Imagery)
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri',
                maxZoom: 19
            }).addTo(map);

            // Add labels layer on top
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                opacity: 0.7
            }).addTo(map);

            // Custom icon
            const caneIcon = L.divIcon({
                className: 'custom-marker',
                html: '<div class="marker-pin">🦯</div><div class="marker-pulse"></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            // Add marker
            const marker = L.marker(defaultLocation, { icon: caneIcon }).addTo(map);

            // Add accuracy circle
            const circle = L.circle(defaultLocation, {
                color: '#2563eb',
                fillColor: '#2563eb',
                fillOpacity: 0.1,
                radius: 100
            }).addTo(map);

            // Add popup
            marker.bindPopup('<b>SmartPath Cane</b><br>Device: SPC-001<br>Battery: 85%');

            // Simulate movement (demo only)
            this.simulateLeafletMovement(map, marker, circle);

        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    /**
     * Simulate tracker movement for demo
     */
    simulateLeafletMovement(map, marker, circle) {
        let angle = 0;
        const radius = 0.0005;
        const center = [11.0056, 124.6075];

        setInterval(() => {
            angle += 0.1;
            const newLat = center[0] + radius * Math.cos(angle);
            const newLng = center[1] + radius * Math.sin(angle);
            const newPosition = [newLat, newLng];

            marker.setLatLng(newPosition);
            circle.setLatLng(newPosition);
            map.panTo(newPosition);
        }, 3000);
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
                        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
                            ☰
                        </button>
                        <div class="nav-links">
                            <a href="#features" class="nav-link">Features</a>
                            <a href="#about" class="nav-link">About</a>
                            <a href="#contact" class="nav-link">Contact</a>
                            <button class="btn btn-primary btn-sm" id="btn-login">Login</button>
                        </div>
                    </nav>
                    <div class="nav-mobile" id="nav-mobile">
                        <a href="#features" class="nav-link">Features</a>
                        <a href="#about" class="nav-link">About</a>
                        <a href="#contact" class="nav-link">Contact</a>
                        <button class="btn btn-primary" id="btn-login-mobile">Login</button>
                    </div>
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
        // Mobile menu toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMobile = document.getElementById('nav-mobile');
        if (navToggle && navMobile) {
            navToggle.addEventListener('click', () => {
                navMobile.classList.toggle('active');
                navToggle.textContent = navMobile.classList.contains('active') ? '✕' : '☰';
            });

            // Close menu when clicking a link
            navMobile.querySelectorAll('a, button').forEach(el => {
                el.addEventListener('click', () => {
                    navMobile.classList.remove('active');
                    navToggle.textContent = '☰';
                });
            });
        }

        // Login buttons
        const loginBtn = document.getElementById('btn-login');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        const loginBtnMobile = document.getElementById('btn-login-mobile');
        if (loginBtnMobile) {
            loginBtnMobile.addEventListener('click', () => this.handleLogin());
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
