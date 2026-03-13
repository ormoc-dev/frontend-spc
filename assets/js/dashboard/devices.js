/**
 * Dashboard Devices Module
 */
const Devices = {
    /**
     * Load devices from API
     */
    async load() {
        try {
            const response = await DeviceAPI.list();
            if (response.success) {
                this.renderList(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load devices:', error);
        }
    },

    /**
     * Render device list
     */
    renderList(devices) {
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
                    <button class="btn btn-outline btn-sm" onclick="Dashboard.trackDevice('${device.id}')">📍 Track</button>
                    <button class="btn btn-outline btn-sm" onclick="Dashboard.editDevice('${device.id}')">⚙️ Settings</button>
                    <button class="btn btn-outline btn-sm" onclick="Dashboard.viewHistory('${device.id}')">📊 History</button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Show add device modal
     */
    showAddModal() {
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

        this.modal = UI.showModal(content);
        this.attachModalListeners();
    },

    /**
     * Attach modal listeners
     */
    attachModalListeners() {
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
                    this.modal?.close();
                    UI.showToast(response.message || 'Device registered successfully!', 'success');
                    this.load();
                } else {
                    errorDiv.textContent = response.error || 'Failed to register device';
                }
            } catch (error) {
                errorDiv.textContent = error.message || 'Network error. Please try again.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register Device';
            }
        });
    }
};
