/**
 * Dashboard Orchestrator Module
 * Manages global dashboard state and delegates to sub-modules
 */

const Dashboard = {
    currentTab: 'overview',
    activeAlertCount: 0,
    supabaseClient: null,
    lastAlertId: null,
    templates: {},

    /**
     * Fetch a template from assets/view/
     */
    async fetchTemplate(name) {
        if (this.templates[name]) return this.templates[name];
        try {
            const response = await fetch(`assets/view/${name}.html`);
            if (!response.ok) throw new Error(`Template ${name} not found`);
            const html = await response.text();
            this.templates[name] = html;
            return html;
        } catch (error) {
            console.error('Template load error:', error);
            return '<div class="error-msg">Failed to load content</div>';
        }
    },

    /**
     * Render main dashboard structure
     */
    async render() {
        const container = document.getElementById('app');
        const user = Auth.getUser();

        // Load shell
        if (window.App && typeof window.App.updateLoadingHint === 'function') {
            window.App.updateLoadingHint('Fetching dashboard template...');
        }
        const shell = await this.fetchTemplate('dashboard');
        container.innerHTML = shell;

        // Populate shell data
        this.updateHeaderUI(user);
        this.renderSidebar();
        this.attachListeners();

        if (window.App && typeof window.App.updateLoadingHint === 'function') {
            window.App.updateLoadingHint('Initializing real-time alerts...');
        }

        const savedTab = localStorage.getItem('dashboard_current_tab') || 'overview';
        this.loadTab(savedTab);
        this.initAudioContext();
        this.initRealtimeAlerts();

        if (window.App && typeof window.App.updateLoadingHint === 'function') {
            window.App.updateLoadingHint('Ready');
        }
    },

    /**
     * Update header with user data
     */
    updateHeaderUI(user) {
        const initialsEl = document.getElementById('user-initials');
        const nameEl = document.getElementById('user-name-display');
        if (initialsEl) initialsEl.textContent = UI.getUserInitials(user);
        if (nameEl) nameEl.textContent = user?.first_name || 'User';
    },

    /**
     * Load specific tab
     */
    async loadTab(tab) {
        if (this.currentTab === 'locations' && tab !== 'locations') {
            if (typeof Locations !== 'undefined') Locations.stopAutoRefresh();
        }

        this.currentTab = tab;
        localStorage.setItem('dashboard_current_tab', tab);

        const container = document.getElementById('dashboard-content');
        const user = Auth.getUser();

        document.querySelectorAll('.dashboard-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tab);
        });

        // Clear container with loader
        container.innerHTML = '<div class="loading-tab"><div class="spinner-sm"></div></div>';

        // Load tab template
        const html = await this.fetchTemplate(tab);
        container.innerHTML = html;

        // Initialize tab module
        switch (tab) {
            case 'overview':
                const nameEl = document.getElementById('overview-user-name');
                if (nameEl) nameEl.textContent = user?.first_name || 'User';
                Overview.init();
                this.updateAlertUI(this.activeAlertCount); // Sync count
                break;
            case 'devices':
                Devices.load();
                break;
            case 'locations':
                Locations.init();
                break;
            case 'alerts':
                Alerts.init();
                break;
            case 'alerts':
                Alerts.init();
                break;
            case 'settings':
                const sName = document.getElementById('settings-first-name');
                const sEmail = document.getElementById('settings-email');
                if (sName) sName.value = user?.first_name || '';
                if (sEmail) sEmail.value = user?.email || '';
                break;
        }
    },

    /**
     * Render global sidebar
     */
    renderSidebar() {
        const nav = document.getElementById('dashboard-sidebar-nav');
        if (!nav) return;

        const items = [
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'devices', icon: '🦯', label: 'Devices' },
            { id: 'locations', icon: '📍', label: 'Locations' },
            { id: 'alerts', icon: '🚨', label: 'Alerts', badge: this.activeAlertCount },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
        ];

        nav.innerHTML = items.map(item => `
            <a href="#${item.id}" class="dashboard-nav-item ${item.id === this.currentTab ? 'active' : ''}" 
                data-tab="${item.id}">
                <span class="dashboard-nav-icon">${item.icon}</span>
                <span class="dashboard-nav-label">${item.label}</span>
                ${item.badge !== undefined ? `<span class="badge" style="${item.badge > 0 ? '' : 'display:none'}">${item.badge}</span>` : ''}
            </a>
        `).join('');
    },

    /**
     * Initialize Supabase Realtime for alerts
     */
    async initRealtimeAlerts() {
        if (typeof supabase === 'undefined') return;

        if (!this.supabaseClient) {
            this.supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
        }

        this.refreshAlertCounts();

        this.alertSubscription = this.supabaseClient
            .channel('public:sos_alerts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_alerts' }, payload => {
                this.refreshAlertCounts();
                if (payload.eventType === 'INSERT') {
                    const latestAlert = payload.new;
                    if (latestAlert.alert_type === 'sos' || latestAlert.alert_type === 'fall') {
                        this.playSOSAlertSound();
                    }
                    UI.showToast(`🚨 NEW ${latestAlert.alert_type.toUpperCase()} from ${latestAlert.device_serial || 'Device'}!`, 'error');
                }
            })
            .subscribe();
    },

    /**
     * Refresh alert counts globally
     */
    async refreshAlertCounts() {
        try {
            // Using AlertAPI ensures compatibility with both local and deployment URLs
            const response = await AlertAPI.list();

            if (response.success) {
                const alerts = response.data || [];
                // Count active alerts
                this.activeAlertCount = alerts.filter(a => a.status === 'active').length;
                this.updateAlertUI(this.activeAlertCount);

                if (this.currentTab === 'alerts' && typeof Alerts !== 'undefined') {
                    Alerts.load(document.getElementById('alert-filter')?.value || 'all');
                }
                if (this.currentTab === 'overview' && typeof Overview !== 'undefined') {
                    Overview.loadRecentAlerts();
                }
            }
        } catch (error) {
            console.error('Error refreshing alert counts:', error);
        }
    },

    updateAlertUI(count) {
        const badgeEl = document.querySelector('.dashboard-nav-item[data-tab="alerts"] .badge');
        if (badgeEl) {
            badgeEl.textContent = count;
            badgeEl.style.display = count > 0 ? 'inline-block' : 'none';
        }
        const statValueEl = document.getElementById('active-alerts-count');
        if (statValueEl) statValueEl.textContent = count;
    },

    /**
     * Global Event Listeners
     */
    attachListeners() {
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.dashboard-nav-item');
            if (navItem) {
                e.preventDefault();
                this.loadTab(navItem.dataset.tab);
            }

            if (e.target.closest('#btn-add-device')) {
                Devices.showAddModal();
            }

            if (e.target.closest('#btn-back')) {
                window.location.href = 'index.html';
            }

            if (e.target.closest('#btn-logout')) {
                Auth.logout();
                window.location.href = 'index.html';
            }

            const menuToggle = e.target.closest('#user-menu-toggle');
            if (menuToggle) {
                document.getElementById('user-menu-dropdown')?.classList.toggle('hidden');
            } else if (!e.target.closest('#user-menu-dropdown')) {
                document.getElementById('user-menu-dropdown')?.classList.add('hidden');
            }
        });
    },

    getAlertTitle(alert) {
        const titles = { sos: 'Emergency SOS Button Pressed', fall: 'Fall Detection Alert', battery_low: 'Low Battery Alert' };
        return titles[alert.alert_type] || 'New Alert';
    },

    getAlertDescription(alert) {
        const descs = { sos: 'User triggered emergency alert from device', fall: 'Potential fall detected by device', battery_low: 'Device battery level is critically low' };
        return descs[alert.alert_type] || 'New alert received from device';
    },

    initAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!window.dashboardAudioContext) window.dashboardAudioContext = new AudioContext();
    },

    async playSOSAlertSound() {
        try {
            const audio = new Audio('assets/audio/alarm.mp3');
            audio.volume = 0.7;
            await audio.play();
        } catch (e) {
            console.warn('Audio play failed', e);
        }
    },

    trackDevice(id) { this.loadTab('locations'); },
    editDevice(id) { UI.showToast('Settings coming soon!', 'info'); },
    viewHistory(id) { this.loadTab('locations'); }
};
