/**
 * Dashboard Overview Module
 */
const Overview = {
    /**
     * Initialize overview map and data
     */
    init() {
        setTimeout(() => {
            if (typeof Maps !== 'undefined') {
                Maps.initMiniMap('overview-map');
                this.fetchDeviceForOverview();
            }
            this.loadRecentAlerts();
            // Also refresh global counts to ensure Overview stats are updated
            if (typeof Dashboard !== 'undefined') {
                Dashboard.refreshAlertCounts();
            }
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
                const deviceWithLocation = result.data.find(d => d.location);
                if (deviceWithLocation && deviceWithLocation.location) {
                    const lat = parseFloat(deviceWithLocation.location.latitude);
                    const lng = parseFloat(deviceWithLocation.location.longitude);
                    Maps.setView('overview-map', [lat, lng], 15);
                    Maps.addMarker('overview-map', [lat, lng], { pulse: false });
                } else {
                    Maps.addMarker('overview-map', Maps.defaultLocation, { pulse: false });
                }
            } else {
                Maps.addMarker('overview-map', Maps.defaultLocation, { pulse: false });
            }
        } catch (error) {
            Maps.addMarker('overview-map', Maps.defaultLocation, { pulse: false });
        }
    },

    /**
     * Load recent active alerts for overview card
     */
    async loadRecentAlerts() {
        const container = document.getElementById('overview-recent-alerts');
        if (!container) return;

        try {
            const response = await AlertAPI.list();

            if (!response.success) throw new Error(response.error);

            const allData = response.data || [];

            // 1. Update active alerts count card
            const activeCount = allData.filter(a => a.status === 'active').length;
            const statValueEl = document.getElementById('active-alerts-count');
            if (statValueEl) statValueEl.textContent = activeCount;

            // 2. Prepare recent alerts for display
            const recentData = [...allData]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 3);

            if (recentData.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🚨</div>
                        <h3>No recent alerts</h3>
                        <p>Your device alerts will appear here.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = recentData.map(alert => {
                const alertType = alert.alert_type;
                const isStatusActive = alert.status === 'active';
                const badgeClass = alertType === 'sos' ? 'alert-badge-danger' :
                    alertType === 'fall' ? 'alert-badge-warning' : 'alert-badge-info';

                return `
                    <div class="alert-item alert-item-sm alert-item-${alertType === 'sos' ? 'danger' : alertType === 'fall' ? 'warning' : 'info'}" 
                         style="margin-bottom: var(--space-3); opacity: ${isStatusActive ? '1' : '0.7'}">
                        <div class="alert-header">
                            <div class="alert-badge ${badgeClass}" style="transform: scale(0.85); transform-origin: left;">${alertType.toUpperCase()}</div>
                            <div class="alert-meta">
                                <span>${alert.device_serial || 'Device'}</span>
                                ${!isStatusActive ? `<span class="status-badge" style="background:#64748b; color:white; font-size:10px; padding:2px 6px;">RESOLVED</span>` : ''}
                            </div>
                        </div>
                        <div class="alert-content" style="padding-top: var(--space-1);">
                            <h4 class="alert-title" style="font-size: 0.9rem;">${Dashboard.getAlertTitle(alert)}</h4>
                            <div class="alert-meta" style="margin-top: var(--space-1);">
                                <span>${UI.formatRelativeTime(alert.created_at)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Failed to load recent alerts for overview:', error);
            container.innerHTML = '<p class="error-text">Failed to load alerts</p>';
        }
    }
};
