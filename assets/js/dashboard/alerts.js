/**
 * Dashboard Alerts Module
 */
const Alerts = {
    /**
     * Initialize alerts tab
     */
    init() {
        this.load();
        const filterSelect = document.getElementById('alert-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.load(e.target.value);
            });
        }
    },

    /**
     * Load alerts from API
     */
    async load(filter = 'all') {
        // Ensure supabase client is initialized for Dashboard operations
        if (!Dashboard.supabaseClient && typeof supabase !== 'undefined') {
            Dashboard.supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
        }

        try {
            const response = await AlertAPI.list();
            if (response.success) {
                let alerts = response.data || [];
                switch (filter) {
                    case 'unresolved': alerts = alerts.filter(a => a.status === 'active'); break;
                    case 'sos': alerts = alerts.filter(a => a.alert_type === 'sos'); break;
                    case 'fall': alerts = alerts.filter(a => a.alert_type === 'fall'); break;
                }
                alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                this.renderList(alerts);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        }
    },

    /**
     * Render alert list
     */
    renderList(alerts) {
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
            const badgeClass = alertType === 'sos' ? 'alert-badge-danger' :
                alertType === 'fall' ? 'alert-badge-warning' : 'alert-badge-info';

            return `
                <div class="alert-item alert-item-detailed alert-item-${alertType === 'sos' ? 'danger' : alertType === 'fall' ? 'warning' : 'info'}">
                    <div class="alert-header">
                        <div class="alert-badge ${badgeClass}">${alertType.toUpperCase()}</div>
                        <div class="alert-meta">
                            <span>${alert.device_serial || 'Unknown Device'}</span>
                            <span class="alert-dot">•</span>
                            <span>${new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="alert-content">
                        <h4 class="alert-title">${Dashboard.getAlertTitle(alert)}</h4>
                        <p class="alert-description">${Dashboard.getAlertDescription(alert)}</p>
                    </div>
                    <div class="alert-actions">
                        ${alert.status === 'active' ? `
                        <button class="btn btn-primary btn-sm" onclick="Alerts.resolve('${alert.id}')">✓ Resolve</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Resolve alert
     */
    async resolve(alertId) {
        try {
            const response = await AlertAPI.resolve(alertId);
            if (response.success) {
                UI.showToast('Alert resolved', 'success');
                this.load(document.getElementById('alert-filter')?.value || 'all');
            }
        } catch (error) {
            UI.showToast('Failed to resolve alert', 'error');
        }
    }
};
