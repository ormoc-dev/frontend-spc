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
        // Load saved tab or default to overview
        const savedTab = localStorage.getItem('dashboard_current_tab') || 'overview';
        this.loadTab(savedTab);

        // Initialize last alert ID and start checking for alerts
        this.lastAlertId = null;
        this.startSOSAlertCheck();
    },

    /**
     * Play SOS alert sound using alarm.mp3
     */
    playSOSAlertSound() {
        try {
            // Use the provided alarm.mp3 file
            const audio = new Audio('assets/audio/alarm.mp3');
            audio.volume = 0.7;
            audio.play().catch(e => {
                console.error('Audio play failed:', e);
                // Fallback to generated sound if mp3 fails
                this.playFallbackSOSAlertSound();
            });
        } catch (e) {
            console.error('SOS sound play failed:', e);
            this.playFallbackSOSAlertSound();
        }
    },

    /**
     * Fallback SOS alert sound (generated)
     */
    playFallbackSOSAlertSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 1);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            console.error('Fallback sound failed:', e);
        }
    },

    /**
     * Check for new SOS alerts
     */
    async checkSOSAlerts() {
        try {
            // Use API client which handles authentication
            const result = await API.get('/api/alerts');
            if (!result.success || !result.data) return;

            // Check for new alerts of any type
            const alerts = result.data;

            if (alerts.length > 0) {
                const latestAlert = alerts[0];
                const alertId = latestAlert.id;

                // Check if this is a new alert
                if (this.lastAlertId && alertId !== this.lastAlertId) {
                    // New alert received - play sound if it's an emergency type
                    if (latestAlert.alert_type === 'sos' || latestAlert.alert_type === 'fall') {
                        this.playSOSAlertSound();
                    }

                    // Show toast notification
                    const alertTitle = latestAlert.alert_type === 'sos' ? 'SOS ALERT' :
                        latestAlert.alert_type === 'fall' ? 'FALL ALERT' :
                            latestAlert.alert_type.toUpperCase();
                    UI.showToast(`🚨 NEW ${alertTitle} from ${latestAlert.device_serial || 'Device'}!`, 'error');

                    // Show browser notification if permitted
                    if (Notification.permission === 'granted') {
                        const alertMessage = latestAlert.alert_type === 'sos' ? 'Emergency alert' :
                            latestAlert.alert_type === 'fall' ? 'Fall detection' :
                                'New alert';
                        new Notification('SmartPath Cane - Alert', {
                            body: `${alertMessage} from ${latestAlert.device_serial || 'Device'}!`,
                            icon: '🚨',
                            requireInteraction: true
                        });
                    }
                }

                this.lastAlertId = alertId;
            }
        } catch (error) {
            // Silent fail
        }
    },

    /**
     * Start periodic SOS alert checking
     */
    startSOSAlertCheck() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Check immediately
        this.checkSOSAlerts();

        // Check every 5 seconds
        this.sosCheckInterval = setInterval(() => {
            this.checkSOSAlerts();
        }, 5000);
    },

    /**
     * Stop SOS alert checking
     */
    stopSOSAlertCheck() {
        if (this.sosCheckInterval) {
            clearInterval(this.sosCheckInterval);
            this.sosCheckInterval = null;
        }
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
        // Stop live location refresh when leaving locations tab
        if (this.currentTab === 'locations' && tab !== 'locations') {
            this.stopLiveLocationRefresh();
        }

        this.currentTab = tab;
        // Save current tab to localStorage
        localStorage.setItem('dashboard_current_tab', tab);
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
                this.initAlertsTab();
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
                    <span class="coming-soon-badge coming-soon-top">Coming Soon</span>
                    <div class="stat-icon stat-icon-warning">🚨</div>
                    <div class="stat-content">
                        <div class="stat-value">2</div>
                        <div class="stat-label">Active Alerts</div>
                    </div>
                </div>
                <div class="stat-card">
                    <span class="coming-soon-badge coming-soon-top">Coming Soon</span>
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
                                  <span class="coming-soon-badge coming-soon-top">Coming Soon</span>
                                    <div class="alert-title">SOS Button Pressed</div>
                                    <div class="alert-time">5 min ago</div>
                                </div>
                            </div>
                            <div class="alert-item alert-item-warning">
                                <span>🔋</span>
                                <div class="alert-content">
                                  <span class="coming-soon-badge coming-soon-top">Coming Soon</span>
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
                    // Stay on overview tab, just refresh the devices list
                    // User can manually go to locations tab if they want
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
                    <span class="coming-soon-badge coming-soon-badge-soon">Coming Soon</span>
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
                <select class="form-select form-select-sm" id="alert-filter">
                    <option value="all">All Alerts</option>
                    <option value="unresolved">Unresolved</option>
                    <option value="sos">SOS Alerts</option>
                </select>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-body">
                    <div class="alert-list" id="alert-list">
                        <div class="empty-state">
                            <div class="empty-icon">🚨</div>
                            <h3>No alerts yet</h3>
                            <p>Waiting for alerts from connected devices.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Load alerts from API
     */
    async loadAlerts(filter = 'all') {
        try {
            const response = await AlertAPI.list();

            if (response.success) {
                let alerts = response.data || [];

                // Apply filter
                switch (filter) {
                    case 'unresolved':
                        alerts = alerts.filter(alert => alert.status === 'pending');
                        break;
                    case 'sos':
                        alerts = alerts.filter(alert => alert.alert_type === 'sos');
                        break;
                }

                // Sort by created_at (newest first)
                alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                this.renderAlertList(alerts);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
            UI.showToast('Failed to load alerts', 'error');
        }
    },

    /**
     * Render alert list
     */
    renderAlertList(alerts) {
        const container = document.getElementById('alert-list');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🚨</div>
                    <h3>No alerts yet</h3>
                    <p>Waiting for alerts from connected devices.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(alert => {
            const alertType = alert.alert_type;
            const alertTime = new Date(alert.created_at).toLocaleString();
            const badgeClass = alertType === 'sos' ? 'alert-badge-danger' :
                alertType === 'fall' ? 'alert-badge-warning' :
                    'alert-badge-info';
            const icon = alertType === 'sos' ? '🚨' :
                alertType === 'fall' ? '摔倒' :
                    alertType === 'battery_low' ? '🔋' :
                        '📍';

            return `
                <div class="alert-item alert-item-detailed alert-item-${alertType === 'sos' ? 'danger' : alertType === 'fall' ? 'warning' : 'info'}">
                    <div class="alert-header">
                        <div class="alert-badge ${badgeClass}">${alertType.toUpperCase()}</div>
                        <div class="alert-meta">
                            <span>${alert.device_serial || 'Unknown Device'}</span>
                            <span class="alert-dot">•</span>
                            <span>${alertTime}</span>
                        </div>
                    </div>
                    <div class="alert-content">
                        <h4 class="alert-title">${this.getAlertTitle(alert)}</h4>
                        <p class="alert-description">${alert.message || this.getAlertDescription(alert)}</p>
                        ${alert.latitude && alert.longitude ? `
                        <div class="alert-location">
                            <span>📍</span>
                            <span>${this.getLocationAddress(alert.latitude, alert.longitude)}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="alert-actions">
                        ${alert.status === 'pending' ? `
                        <button class="btn btn-primary btn-sm" onclick="Dashboard.resolveAlert(${alert.id})">✓ Resolve</button>
                        ` : ''}
                        ${alert.latitude && alert.longitude ? `
                        <button class="btn btn-outline btn-sm" onclick="Dashboard.viewAlertLocation(${alert.id}, ${alert.latitude}, ${alert.longitude})">📍 View Location</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Get alert title
     */
    getAlertTitle(alert) {
        switch (alert.alert_type) {
            case 'sos':
                return 'Emergency SOS Button Pressed';
            case 'fall':
                return 'Fall Detection Alert';
            case 'battery_low':
                return 'Low Battery Alert';
            case 'geofence_exit':
                return 'Geofence Exit Alert';
            default:
                return 'New Alert';
        }
    },

    /**
     * Get alert description
     */
    getAlertDescription(alert) {
        switch (alert.alert_type) {
            case 'sos':
                return 'User triggered emergency alert from device';
            case 'fall':
                return 'Potential fall detected by device';
            case 'battery_low':
                return 'Device battery level is critically low';
            case 'geofence_exit':
                return 'Device exited from designated safe zone';
            default:
                return 'New alert received from device';
        }
    },

    /**
     * Get location address
     */
    async getLocationAddress(lat, lng) {
        try {
            // Simple coordinate display if reverse geocoding isn't available
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    },

    /**
     * Resolve alert
     */
    async resolveAlert(alertId) {
        try {
            const response = await AlertAPI.resolve(alertId);

            if (response.success) {
                UI.showToast('Alert resolved', 'success');
                // Reload alerts
                const filterSelect = document.getElementById('alert-filter');
                this.loadAlerts(filterSelect?.value || 'all');
            }
        } catch (error) {
            console.error('Failed to resolve alert:', error);
            UI.showToast('Failed to resolve alert', 'error');
        }
    },

    /**
     * View alert location
     */
    viewAlertLocation(alertId, lat, lng) {
        // Navigate to locations tab and center map on the alert location
        this.loadTab('locations');

        // Center the map on the alert location
        setTimeout(() => {
            try {
                Maps.setView('live-location-map', [lat, lng], 15);
                Maps.addMarker('live-location-map', [lat, lng], {
                    popup: `<b>Alert Location</b><br>Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
                });
            } catch (error) {
                console.error('Failed to view alert location:', error);
            }
        }, 500);
    },

    /**
     * Initialize alerts tab
     */
    initAlertsTab() {
        // Load alerts
        this.loadAlerts();

        // Add event listener for filter changes
        const filterSelect = document.getElementById('alert-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.loadAlerts(e.target.value);
            });
        }
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

            // Try to fetch and show device location
            this.fetchDeviceForOverview();
        }, 100);
    },

    /**
     * Fetch device location for overview map
     */
    async fetchDeviceForOverview() {
        try {
            const url = `${CONFIG.API_URL}/api/cane/devices`;
            const response = await fetch(url);

            if (!response.ok) return;

            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                // Find device with live location
                const deviceWithLocation = result.data.find(d => d.location);

                if (deviceWithLocation && deviceWithLocation.location) {
                    const lat = parseFloat(deviceWithLocation.location.latitude);
                    const lng = parseFloat(deviceWithLocation.location.longitude);

                    // Show device location on overview map
                    Maps.setView('overview-map', [lat, lng], 15);
                    Maps.addMarker('overview-map', [lat, lng], { pulse: false });
                } else {
                    // No location yet, show default
                    Maps.addMarker('overview-map', Maps.defaultLocation, { pulse: false });
                }
            } else {
                // No devices, show default
                Maps.addMarker('overview-map', Maps.defaultLocation, { pulse: false });
            }
        } catch (error) {
            // Silent fail - show default location
            Maps.addMarker('overview-map', Maps.defaultLocation, { pulse: false });
        }
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

            // Start auto-refresh every 1 second for real-time tracking
            this.startLiveLocationRefresh();
        }, 100);
    },

    /**
     * Start auto-refreshing live location every 1 second
     */
    startLiveLocationRefresh() {
        // Clear any existing interval
        if (this.liveLocationInterval) {
            clearInterval(this.liveLocationInterval);
        }

        // Refresh every 1 second
        this.liveLocationInterval = setInterval(() => {
            const selector = document.getElementById('live-device-selector');
            if (selector && selector.value) {
                // Refresh the currently selected device location
                this.refreshCurrentDeviceLocation(selector.value);
            }
        }, 1000);
    },

    /**
     * Stop live location auto-refresh
     */
    stopLiveLocationRefresh() {
        if (this.liveLocationInterval) {
            clearInterval(this.liveLocationInterval);
            this.liveLocationInterval = null;
        }
    },

    /**
     * Refresh location for current device
     */
    async refreshCurrentDeviceLocation(deviceSerial) {
        try {
            const url = `${CONFIG.API_URL}/api/cane/location/${deviceSerial}`;
            const response = await fetch(url);

            if (!response.ok) return;

            const result = await response.json();

            if (result.success && result.data) {
                // Update the map with new location
                this.updateLiveLocationMap(result.data);

                // Update the last updated time
                const location = result.data.location;
                if (location && location.recorded_at) {
                    document.getElementById('live-last-updated').textContent = new Date(location.recorded_at).toLocaleString();
                }
            }
        } catch (error) {
            // Silent fail - don't spam console with errors
        }
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
        const newPosition = [lat, lng];

        // Calculate heading from previous position
        let heading = 0;
        const deviceId = device.device_serial;

        if (this.devicePositions && this.devicePositions[deviceId]) {
            const prevPosition = this.devicePositions[deviceId];
            heading = Maps.calculateHeading(prevPosition, newPosition);
        }

        // Store current position for next update
        if (!this.devicePositions) this.devicePositions = {};
        this.devicePositions[deviceId] = newPosition;

        // Update map with directional marker
        Maps.setView('live-location-map', newPosition, 16);
        Maps.addMarker('live-location-map', newPosition, {
            heading: heading,
            popup: `<b>${device.device_name || device.device_serial}</b><br>Heading: ${Math.round(heading)}°<br>Live Location`
        });

        // Update info panel with animation
        const coordsEl = document.getElementById('live-coordinates');
        const updatedEl = document.getElementById('live-last-updated');
        const accuracyEl = document.getElementById('live-accuracy');

        document.getElementById('live-device-name').textContent = device.device_name || device.device_serial;
        coordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        updatedEl.textContent = new Date(location.recorded_at).toLocaleString();
        accuracyEl.textContent = location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Unknown';

        // Add visual flash effect to show update
        [coordsEl, updatedEl, accuracyEl].forEach(el => {
            if (el) {
                el.style.transition = 'background-color 0.2s';
                el.style.backgroundColor = 'rgba(37, 99, 235, 0.2)';
                setTimeout(() => {
                    el.style.backgroundColor = 'transparent';
                }, 200);
            }
        });

        // Log update for debugging
        console.log(`[${new Date().toLocaleTimeString()}] Location updated: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
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
