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
                    <span>S.P.C</span>
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
                this.loadDevices();
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
                        <div class="stat-value">1</div>
                        <div class="stat-label">Live Locations</div>
                    </div>
                </div>
                <div class="stat-card">
                    <span class="coming-soon-badge coming-soon-top">Comming Soon</span>
                    <div class="stat-icon stat-icon-warning">🚨</div>
                    <div class="stat-content">
                        <div class="stat-value">2</div>
                        <div class="stat-label">Active Alerts</div>
                    </div>
                </div>
                <div class="stat-card">
                    <span class="coming-soon-badge coming-soon-top">Comming Soon</span>
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
                                  <span class="coming-soon-badge coming-soon-top">Comming Soon</span>
                                    <div class="alert-title">SOS Button Pressed</div>
                                    <div class="alert-time">5 min ago</div>
                                </div>
                            </div>
                            <div class="alert-item alert-item-warning">
                                <span>🔋</span>
                                <div class="alert-content">
                                  <span class="coming-soon-badge coming-soon-top">Comming Soon</span>
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
                <div>
                    <h1 class="dashboard-title">My Devices</h1>
                </div>
                <button class="btn btn-primary btn-sm" id="btn-add-device">+ Add Device</button>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-body">
                    <div class="device-list" id="device-list">
                        <div class="empty-state">
                            <div class="empty-icon">🦯</div>
                            <h3>No devices yet</h3>
                            <p>Add your first SmartPath Cane to get started.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Show add device modal
     */
    showAddDeviceModal() {
        const content = `
            <h2 class="modal-title">Add New Device</h2>
            <p class="modal-subtitle">Register your SmartPath Cane</p>
            
            <form class="auth-form" id="add-device-form">
                <div class="auth-error" id="device-error"></div>
                
                <div class="form-group">
                    <label class="form-label">Device Serial Number *</label>
                    <input type="text" class="form-input" id="device-serial" required placeholder="e.g., SPC-001-ABC123">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Device Name (Optional)</label>
                    <input type="text" class="form-input" id="device-name" placeholder="e.g., Dad's Cane">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Device Model</label>
                    <select class="form-select" id="device-model">
                        <option value="SPC-001">SmartPath Cane SPC-001</option>
                        <option value="SPC-002">SmartPath Cane SPC-002 (Pro)</option>
                    </select>
                </div>
                
                <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-device">
                    Register Device
                </button>
            </form>
        `;

        this.deviceModal = UI.showModal(content);
        this.attachDeviceModalListeners();
    },

    /**
     * Attach device modal listeners
     */
    attachDeviceModalListeners() {
        const form = document.getElementById('add-device-form');
        const errorDiv = document.getElementById('device-error');

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.textContent = '';

            const submitBtn = document.getElementById('btn-submit-device');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';

            const data = {
                device_serial: document.getElementById('device-serial').value.trim(),
                device_name: document.getElementById('device-name').value.trim() || null,
                device_model: document.getElementById('device-model').value
            };

            try {
                const response = await DeviceAPI.create(data);

                if (response.success) {
                    this.deviceModal?.close();
                    const message = response.message || 'Device registered successfully!';
                    UI.showToast(message, 'success');
                    this.loadDevices();
                    // If device was claimed, refresh locations tab
                    if (message.includes('claimed')) {
                        setTimeout(() => this.loadTab('locations'), 500);
                    }
                } else {
                    errorDiv.textContent = response.error || 'Failed to register device';
                }
            } catch (error) {
                console.error('Device registration error:', error);
                if (error.message?.includes('already registered to your account')) {
                    errorDiv.innerHTML = `<strong>Device already in your account!</strong><br><a href="#" onclick="Dashboard.loadTab('locations'); return false;">View in Locations tab</a>`;
                } else if (error.message?.includes('already registered')) {
                    errorDiv.innerHTML = `<strong>Device already registered!</strong><br>This device belongs to another user.`;
                } else {
                    errorDiv.textContent = error.message || 'Network error. Please try again.';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register Device';
            }
        });
    },

    /**
     * Load devices from API
     */
    async loadDevices() {
        try {
            const response = await DeviceAPI.list();
            if (response.success) {
                this.renderDeviceList(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load devices:', error);
        }
    },

    /**
     * Render device list
     */
    renderDeviceList(devices) {
        const container = document.getElementById('device-list');
        if (!container) return;

        if (devices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🦯</div>
                    <h3>No devices yet</h3>
                    <p>Add your first SmartPath Cane to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = devices.map(device => `
            <div class="device-item">
                <div class="device-header">
                    <div class="device-info">
                        <span class="device-icon">🦯</span>
                        <div class="device-details">
                            <div class="device-name">${device.device_name || 'SmartPath Cane'}</div>
                            <div class="device-id">${device.device_serial}</div>
                        </div>
                    </div>
                    <div class="device-status">
                        <div class="device-battery">
                            <div class="battery-bar"><div class="battery-fill" style="width:${device.battery_level || 0}%"></div></div>
                            <span>${device.battery_level || 0}%</span>
                        </div>
                        <span class="status-badge status-${device.status === 'active' ? 'online' : 'offline'}">${device.status}</span>
                    </div>
                </div>
                <div class="device-actions device-actions-full">
                    <button class="btn btn-outline btn-sm" onclick="Dashboard.trackDevice(${device.id})">📍 Track</button>
                    <button class="btn btn-outline btn-sm" onclick="Dashboard.editDevice(${device.id})">⚙️ Settings</button>
                    <button class="btn btn-outline btn-sm" onclick="Dashboard.viewHistory(${device.id})">📊 History</button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Render locations tab
     */
    renderLocations() {
        return `
            <div class="dashboard-tab-header">
                <div>
                    <h1 class="dashboard-title">Live Location</h1>
                    <p class="dashboard-subtitle">Real-time device tracking</p>
                </div>
                <span class="status-badge status-online">● Online</span>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-header">
                    <h3 class="dashboard-card-title">📍 Current Position</h3>
                    <span class="coming-soon-badge">Live</span>
                </div>
                <div class="dashboard-card-body">
                    <div class="form-group" style="margin-bottom: var(--space-4);">
                        <label class="form-label">Select Device</label>
                        <select class="form-select" id="live-device-selector">
                            <option value="">Loading devices...</option>
                        </select>
                    </div>
                    <div class="full-map" id="live-location-map"></div>
                    <div class="location-info" id="live-location-info" style="margin-top: var(--space-4);">
                        <div class="location-item">
                            <span class="location-label">Device</span>
                            <span class="location-value" id="live-device-name">-</span>
                        </div>
                        <div class="location-item">
                            <span class="location-label">Coordinates</span>
                            <span class="location-value" id="live-coordinates">-</span>
                        </div>
                        <div class="location-item">
                            <span class="location-label">Last Updated</span>
                            <span class="location-value" id="live-last-updated">-</span>
                        </div>
                        <div class="location-item">
                            <span class="location-label">Accuracy</span>
                            <span class="location-value" id="live-accuracy">-</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-tab-header" style="margin-top: var(--space-8);">
                <div>
                    <h1 class="dashboard-title">Location History</h1>
                    <p class="dashboard-subtitle">Past location records</p>
                </div>
                <select class="form-select form-select-sm">
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-header">
                    <h3 class="dashboard-card-title">📊 Movement History</h3>
                    <span class="coming-soon-badge coming-soon-badge-soon">Comming Soon</span>
                </div>
                <div class="dashboard-card-body">
                    <div class="full-map" id="locations-map" style="opacity: 0.6;"></div>
                    <div class="location-list" style="margin-top: var(--space-4);">
                        <div class="location-list-item">
                            <span class="location-marker">📍</span>
                            <div class="location-details">
                                <div class="location-address">Ormoc City, Leyte</div>
                                <div class="alert-time">2 hours ago</div>
                            </div>
                        </div>
                        <div class="location-list-item">
                            <span class="location-marker">📍</span>
                            <div class="location-details">
                                <div class="location-address">Palo, Leyte</div>
                                <div class="alert-time">5 hours ago</div>
                            </div>
                        </div>
                        <div class="location-list-item">
                            <span class="location-marker">📍</span>
                            <div class="location-details">
                                <div class="location-address">Tacloban City</div>
                                <div class="alert-time">Yesterday</div>
                            </div>
                        </div>
                    </div>
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
                <div>
                    <h1 class="dashboard-title">Alerts</h1>
                </div>
                <select class="form-select form-select-sm">
                    <option>All Alerts</option>
                    <option>Unresolved</option>
                </select>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-body">
                    <div class="alert-list">
                        <div class="alert-item alert-item-detailed alert-item-danger">
                            <div class="alert-header">
                                <div class="alert-badge alert-badge-danger">SOS</div>
                                <div class="alert-meta">
                                    <span>SPC-001</span>
                                    <span class="alert-dot">•</span>
                                    <span>2 min ago</span>
                                </div>
                            </div>
                            <div class="alert-content">
                                <h4 class="alert-title">Emergency SOS Button Pressed</h4>
                                <p class="alert-description">User triggered emergency alert from device</p>
                                <div class="alert-location">
                                    <span>📍</span>
                                    <span>Ormoc City, Leyte</span>
                                </div>
                            </div>
                            <div class="alert-actions">
                                <button class="btn btn-primary btn-sm">✓ Resolve</button>
                                <button class="btn btn-outline btn-sm">📍 View Location</button>
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
                <div>
                    <h1 class="dashboard-title">Geofences</h1>
                </div>
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
            // Initialize live location map
            const liveMap = Maps.init('live-location-map', { zoom: 16 });

            // Initialize history map
            const historyMap = Maps.init('locations-map', { zoom: 14 });
            if (historyMap) {
                Maps.addMarker('locations-map', Maps.defaultLocation, {
                    popup: '<b>Last Known Location</b><br>Device: SPC-001'
                });
            }

            // Fetch devices with live locations
            this.fetchLiveDevices();
        }, 100);
    },

    /**
     * Fetch devices with live locations
     */
    async fetchLiveDevices() {
        try {
            const url = `${CONFIG.API_URL}/api/cane/devices`;
            console.log('Fetching devices from:', url);
            const response = await fetch(url);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                return;
            }

            const result = await response.json();
            console.log('Devices response:', result);

            if (result.success && result.data) {
                this.populateDeviceSelector(result.data);
            } else {
                console.error('Failed to fetch devices:', result.error || result.message || 'Unknown error', result);
            }
        } catch (error) {
            console.error('Error fetching devices:', error.message || error);
        }
    },

    /**
     * Populate device selector dropdown
     */
    populateDeviceSelector(devices) {
        const selector = document.getElementById('live-device-selector');
        if (!selector) return;

        // Filter devices that have location data
        const devicesWithLocation = devices.filter(d => d.has_location);

        if (devicesWithLocation.length === 0) {
            selector.innerHTML = '<option value="">No devices with live location</option>';
            return;
        }

        selector.innerHTML = devicesWithLocation.map(d =>
            `<option value="${d.device.device_serial}" data-device='${JSON.stringify(d)}'>
                ${d.device.device_name || d.device.device_serial} ${d.has_location ? '📍' : ''}
            </option>`
        ).join('');

        // Add change event listener
        selector.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            if (selectedOption && selectedOption.dataset.device) {
                const deviceData = JSON.parse(selectedOption.dataset.device);
                this.updateLiveLocationMap(deviceData);
            }
        });

        // Show first device location
        if (devicesWithLocation.length > 0) {
            this.updateLiveLocationMap(devicesWithLocation[0]);
        }
    },

    /**
     * Update live location map with device data
     */
    updateLiveLocationMap(deviceData) {
        const { device, location } = deviceData;

        if (!location) {
            console.log('No location data for device:', device.device_serial);
            return;
        }

        const lat = parseFloat(location.latitude);
        const lng = parseFloat(location.longitude);

        // Update map
        Maps.setView('live-location-map', [lat, lng], 16);
        Maps.addMarker('live-location-map', [lat, lng], {
            popup: `<b>${device.device_name || device.device_serial}</b><br>Live Location`
        });

        // Update info panel
        document.getElementById('live-device-name').textContent = device.device_name || device.device_serial;
        document.getElementById('live-coordinates').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        document.getElementById('live-last-updated').textContent = new Date(location.recorded_at).toLocaleString();
        document.getElementById('live-accuracy').textContent = location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Unknown';
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
        // Use document-level event delegation for all dashboard interactions
        document.removeEventListener('click', this.handleDocumentClick);
        this.boundHandleDocumentClick = this.handleDocumentClick.bind(this);
        document.addEventListener('click', this.boundHandleDocumentClick);

        // User menu
        const menuToggle = document.getElementById('user-menu-toggle');
        const menuDropdown = document.getElementById('user-menu-dropdown');

        menuToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
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
    },

    /**
     * Handle document clicks (event delegation)
     */
    handleDocumentClick(e) {
        // Tab navigation - only handle if we're in the dashboard
        const navItem = e.target.closest('.dashboard-nav-item');
        if (navItem) {
            e.preventDefault();
            e.stopPropagation();
            this.loadTab(navItem.dataset.tab);
            return;
        }

        // Add Device button
        if (e.target.closest('#btn-add-device')) {
            e.stopPropagation();
            this.showAddDeviceModal();
            return;
        }
    },

    /**
     * Track device
     */
    trackDevice(deviceId) {
        this.loadTab('locations');
    },

    /**
     * Edit device
     */
    editDevice(deviceId) {
        UI.showToast('Device settings coming soon!', 'info');
    },

    /**
     * View device history
     */
    viewHistory(deviceId) {
        this.loadTab('locations');
    }
};
