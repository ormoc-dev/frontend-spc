/**
 * Dashboard Locations Module
 */
const Locations = {
    liveLocationInterval: null,
    devicePositions: {},

    /**
     * Initialize locations maps and data
     */
    init() {
        setTimeout(() => {
            if (typeof Maps !== 'undefined') {
                Maps.init('live-location-map', { zoom: 16 });
                Maps.init('locations-map', { zoom: 14 });
            }
            this.fetchLiveDevices();
            this.startAutoRefresh();
        }, 100);
    },

    /**
     * Start auto-refreshing live location
     */
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.liveLocationInterval = setInterval(() => {
            const selector = document.getElementById('live-device-selector');
            if (selector && selector.value) {
                this.refreshDeviceLocation(selector.value);
            }
        }, 1000);
    },

    /**
     * Stop auto-refreshing
     */
    stopAutoRefresh() {
        if (this.liveLocationInterval) {
            clearInterval(this.liveLocationInterval);
            this.liveLocationInterval = null;
        }
    },

    /**
     * Refresh location for specific device
     */
    async refreshDeviceLocation(deviceSerial) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/cane/location/${deviceSerial}`);
            if (!response.ok) return;
            const result = await response.json();
            if (result.success && result.data) {
                this.updateMap(result.data);
            }
        } catch (error) { }
    },

    /**
     * Fetch devices with live locations
     */
    async fetchLiveDevices() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/cane/devices`);
            const result = await response.json();
            if (result.success && result.data) {
                this.populateSelector(result.data);
            }
        } catch (error) { }
    },

    /**
     * Populate device selector
     */
    populateSelector(devices) {
        const selector = document.getElementById('live-device-selector');
        if (!selector) return;

        const devicesWithLocation = devices.filter(d => d.has_location);
        if (devicesWithLocation.length === 0) {
            selector.innerHTML = '<option value="">No devices with live location</option>';
            return;
        }

        selector.innerHTML = devicesWithLocation.map(d =>
            `<option value="${d.device.device_serial}" data-device='${JSON.stringify(d)}'>
                ${d.device.device_name || d.device.device_serial} 📍
            </option>`
        ).join('');

        selector.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            if (selectedOption && selectedOption.dataset.device) {
                this.updateMap(JSON.parse(selectedOption.dataset.device));
            }
        });

        if (devicesWithLocation.length > 0) {
            this.updateMap(devicesWithLocation[0]);
        }
    },

    /**
     * Update map with device data
     */
    updateMap(deviceData) {
        const { device, location } = deviceData;
        if (!location) return;

        const lat = parseFloat(location.latitude);
        const lng = parseFloat(location.longitude);
        const pos = [lat, lng];
        const deviceId = device.device_serial;

        let heading = 0;
        if (this.devicePositions[deviceId]) {
            heading = Maps.calculateHeading(this.devicePositions[deviceId], pos);
        }
        this.devicePositions[deviceId] = pos;

        Maps.setView('live-location-map', pos, 16);
        Maps.addMarker('live-location-map', pos, {
            heading: heading,
            popup: `<b>${device.device_name || device.device_serial}</b><br>Live Location`
        });

        const coordsEl = document.getElementById('live-coordinates');
        const updatedEl = document.getElementById('live-last-updated');
        const accuracyEl = document.getElementById('live-accuracy');

        if (document.getElementById('live-device-name')) {
            document.getElementById('live-device-name').textContent = device.device_name || device.device_serial;
            if (coordsEl) coordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            if (updatedEl) updatedEl.textContent = new Date(location.recorded_at).toLocaleString();
            if (accuracyEl) accuracyEl.textContent = location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Unknown';

            [coordsEl, updatedEl, accuracyEl].forEach(el => {
                if (el) {
                    el.style.backgroundColor = 'rgba(37, 99, 235, 0.2)';
                    setTimeout(() => el.style.backgroundColor = 'transparent', 200);
                }
            });
        }
    }
};
