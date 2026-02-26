/**
 * Dashboard Module
 * SmartPath Cane - Dashboard Views and Functionality
 */

const Dashboard = {
    currentTab: 'overview',

    /**
     * Render dashboard
     */
    render() {
        const container = document.getElementById('app');
        const user = Auth.getUser();

        container.innerHTML = `
            ${this.renderHeader(user)}
            <main class="dashboard">
                ${this.renderSidebar()}
                <div class="dashboard-main">
                    ${this.renderContent(user)}
                </div>
            </main>
        `;

        this.attachListeners();
        this.loadTab('overview');
    },

    /**
     * Render dashboard header
     */
    renderHeader(user) {
        return `
            <header class="dashboard-header">
                <div class="dashboard-header-brand">
                    <span class="dashboard-header-icon">🦯</span>
                    <span>SmartPath Cane</span>
                </div>
                <div class="dashboard-header-actions">
                    <button class="btn btn-outline btn-sm" id="btn-back">
                        ← Back to Site
                    </button>
                    <div class="user-menu">
                        <button class="user-menu-toggle" id="user-menu-toggle">
                            <span class="user-avatar">${UI.getUserInitials(user)}</span>
                            <span class="user-name hidden-sm">${user?.first_name || 'User'}</span>
                            <span>▼</span>
                        </button>
                        <div class="user-menu-dropdown hidden" id="user-menu-dropdown">
                            <a href="#" class="user-menu-item" data-tab="settings">Settings</a>
                            <hr class="user-menu-divider">
                            <button class="user-menu-item user-menu-logout" id="btn-logout">Logout</button>
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    /**
     * Render sidebar navigation
     */
    renderSidebar() {
        const items = [
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'devices', icon: '🦯', label: 'Devices' },
            { id: 'locations', icon: '📍', label: 'Locations' },
            { id: 'alerts', icon: '🚨', label: 'Alerts', badge: 2 },
            { id: 'geofences', icon: '🗺️', label: 'Geofences' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
        ];

        return `
            <aside class="dashboard-sidebar">
                <nav class="dashboard-nav">
                    ${items.map(item => `
                        <a href="#${item.id}" class="dashboard-nav-item ${item.id === this.currentTab ? 'active' : ''}" 
                           data-tab="${item.id}">
                            <span class="dashboard-nav-icon">${item.icon}</span>
                            <span>${item.label}</span>
                            ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
                        </a>
                    `).join('')}
                </nav>
            </aside>
        `;
    },

    /**
     * Render main content area
     */
    renderContent(user) {
        return `
            <div class="dashboard-content" id="dashboard-content">
                <!-- Content loaded dynamically -->
            </div>
        `;
    },

    /**
     * Load tab content
     */
    loadTab(tab) {
        this.currentTab = tab;
        const container = document.getElementById('dashboard-content');
        const user = Auth.getUser();

        // Update active nav item
        document.querySelectorAll('.dashboard-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tab);
        });

        // Render tab content
        switch (tab) {
            case 'overview':
                container.innerHTML = this.renderOverview(user);
                this.initOverview();
                break;
            case 'devices':
                container.innerHTML = this.renderDevices();
                break;
            case 'locations':
                container.innerHTML = this.renderLocations();
                this.initLocationsMap();
                break;
            case 'alerts':
                container.innerHTML = this.renderAlerts();
                break;
            case 'geofences':
                container.innerHTML = this.renderGeofences();
                this.initGeofencesMap();
                break;
            case 'settings':
                container.innerHTML = this.renderSettings(user);
                break;
        }
    },

    /**
     * Render overview tab
     */
    renderOverview(user) {
        return `
            <div class="dashboard-tab-header">
                <div>
                    <h1 class="dashboard-title">Dashboard Overview</h1>
                    <p class="dashboard-subtitle">Welcome back, ${user?.first_name || 'User'}!</p>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon stat-icon-primary">🦯</div>
                    <div class="stat-content">
                        <div class="stat-value">1</div>
                        <div class="stat-label">Active Devices</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon stat-icon-success">📍</div>
                    <div class="stat-content">
                        <div class="stat-value">24</div>
                        <div class="stat-label">Locations Today</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon stat-icon-warning">🚨</div>
                    <div class="stat-content">
                        <div class="stat-value">2</div>
                        <div class="stat-label">Active Alerts</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon stat-icon-info">🔋</div>
                    <div class="stat-content">
                        <div class="stat-value">85%</div>
                        <div class="stat-label">Avg Battery</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <h3 class="dashboard-card-title">Live Location</h3>
                        <span class="status-badge status-online">● Online</span>
                    </div>
                    <div class="dashboard-card-body">
                        <div class="mini-map" id="overview-map"></div>
                        <div class="location-info">
                            <div class="location-item">
                                <span class="location-label">Current</span>
                                <span class="location-value">Ormoc City, Leyte</span>
                            </div>
                            <div class="location-item">
                                <span class="location-label">Updated</span>
                                <span class="location-value">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <h3 class="dashboard-card-title">Recent Alerts</h3>
                    </div>
                    <div class="dashboard-card-body">
                        <div class="alert-list">
                            <div class="alert-item alert-item-danger">
                                <span>🚨</span>
                                <div class="alert-content">
                                    <div class="alert-title">SOS Button Pressed</div>
                                    <div class="alert-time">5 min ago</div>
                                </div>
                            </div>
                            <div class="alert-item alert-item-warning">
                                <span>🔋</span>
                                <div class="alert-content">
                                    <div class="alert-title">Low Battery</div>
                                    <div class="alert-time">1 hr ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render devices tab
     */
    renderDevices() {
        return `
            <div class="dashboard-tab-header">
                <h1 class="dashboard-title">My Devices</h1>
                <button class="btn btn-primary btn-sm">+ Add Device</button>
            </div>
            
            <div class="dashboard-card">
                <div class="dashboard-card-body">
                    <div class="device-list">
                        <div class="device-item">
                            <div class="device-info">
                                <span class="device-icon">🦯</span>
                                <div class="device-details">
                                    <div class="device-name">SmartPath Cane #1</div>
                                    <div class="device-id">SPC-001</div>
                                </div>
                            </div>
                            <div class="device-status">
                                <div class="device-battery">
                                    <div class="battery-bar"><div class="battery-fill" style="width:85%"></div></div>
                                    <span>85%</span>
                                </div>
                                <span class="status-badge status-online">Online</span>
                            </div>
                            <div class="device-actions">
                                <button class="btn btn-outline btn-sm">Track</button>
                                <button class="btn btn-outline btn-sm">Settings</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render locations tab
     */
    renderLocations() {
        return `
            <div class="dashboard-tab-header">
                <h1 class="dashboard-title">Location History</h1>
                <select class="form-select form-select-sm">
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                </select>
            </div>
            
            <div class="dashboard-card">
                <div class="dashboard-card-body">
                    <div class="full-map" id="locations-map"></div>
                </div>
            </div>
        `;
    },

    /**
     * Render alerts tab
     */
    renderAlerts() {
        return `
            <div class="dashboard-tab-header">
                <h1 class="dashboard-title">Alerts</h1>
                <select class="form-select form-select-sm">
                    <option>All Alerts</option>
                    <option>Unresolved</option>
                </select>
            </div>
            
            <div class="dashboard-card">
                <div class="dashboard-card-body">
                    <div class="alert-list">
                        <div class="alert-item alert-item-danger">
                            <div class="alert-badge alert-badge-danger">SOS</div>
                            <div class="alert-content">
                                <h4 class="alert-title">Emergency SOS</h4>
                                <p class="alert-description">SOS button pressed</p>
                            </div>
                            <div class="alert-actions">
                                <button class="btn btn-primary btn-sm">Resolve</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render geofences tab
     */
    renderGeofences() {
        return `
            <div class="dashboard-tab-header">
                <h1 class="dashboard-title">Geofences</h1>
                <button class="btn btn-primary btn-sm">+ Add Geofence</button>
            </div>
            
            <div class="dashboard-grid dashboard-grid-large">
                <div class="dashboard-card dashboard-card-large">
                    <div class="dashboard-card-body">
                        <div class="full-map" id="geofences-map"></div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <h3 class="dashboard-card-title">Active Geofences</h3>
                    </div>
                    <div class="dashboard-card-body">
                        <div class="geofence-list">
                            <div class="geofence-item">
                                <div class="geofence-color" style="background:#10b981"></div>
                                <div class="geofence-info">
                                    <div class="geofence-name">Home Area</div>
                                    <div class="geofence-details">500m radius</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render settings tab
     */
    renderSettings(user) {
        return `
            <div class="dashboard-tab-header">
                <h1 class="dashboard-title">Settings</h1>
            </div>
            
            <div class="settings-grid">
                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <h3 class="dashboard-card-title">Profile</h3>
                    </div>
                    <div class="dashboard-card-body">
                        <form class="settings-form">
                            <div class="form-group">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-input" value="${user?.first_name || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" value="${user?.email || ''}" readonly>
                            </div>
                            <button type="submit" class="btn btn-primary">Save</button>
                        </form>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <h3 class="dashboard-card-title">Notifications</h3>
                    </div>
                    <div class="dashboard-card-body">
                        <label class="settings-option">
                            <input type="checkbox" checked>
                            <span class="settings-option-label">SOS Alerts</span>
                        </label>
                        <label class="settings-option">
                            <input type="checkbox" checked>
                            <span class="settings-option-label">Geofence Alerts</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Initialize overview map
     */
    initOverview() {
        setTimeout(() => {
            Maps.initMiniMap('overview-map');
            Maps.addMarker('overview-map', Maps.defaultLocation, { pulse: false });
        }, 100);
    },

    /**
     * Initialize locations map
     */
    initLocationsMap() {
        setTimeout(() => {
            Maps.init('locations-map', { zoom: 15 });
            Maps.addMarker('locations-map', Maps.defaultLocation);
        }, 100);
    },

    /**
     * Initialize geofences map
     */
    initGeofencesMap() {
        setTimeout(() => {
            Maps.init('geofences-map', { zoom: 14 });
            Maps.addMarker('geofences-map', Maps.defaultLocation);
        }, 100);
    },

    /**
     * Attach event listeners
     */
    attachListeners() {
        // Tab navigation
        document.querySelectorAll('.dashboard-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadTab(item.dataset.tab);
            });
        });

        // User menu
        const menuToggle = document.getElementById('user-menu-toggle');
        const menuDropdown = document.getElementById('user-menu-dropdown');

        menuToggle?.addEventListener('click', () => {
            menuDropdown?.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!menuToggle?.contains(e.target) && !menuDropdown?.contains(e.target)) {
                menuDropdown?.classList.add('hidden');
            }
        });

        // Back button
        document.getElementById('btn-back')?.addEventListener('click', () => {
            App.render();
        });

        // Logout
        document.getElementById('btn-logout')?.addEventListener('click', () => {
            Auth.logout();
        });
    }
};
