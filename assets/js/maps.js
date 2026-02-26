/**
 * Maps Module
 * SmartPath Cane - Leaflet Map Integration
 */

const Maps = {
    instances: {},
    defaultLocation: [11.0056, 124.6075], // Ormoc City, Leyte

    /**
     * Initialize a map
     */
    init(containerId, options = {}) {
        const element = document.getElementById(containerId);
        if (!element || typeof L === 'undefined') {
            console.warn(`Map container #${containerId} not found or Leaflet not loaded`);
            return null;
        }

        // Return existing map if already initialized
        if (this.instances[containerId]) {
            this.instances[containerId].invalidateSize();
            return this.instances[containerId];
        }

        const config = {
            zoomControl: true,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: true,
            ...options
        };

        const map = L.map(containerId, config).setView(
            options.center || this.defaultLocation, 
            options.zoom || 15
        );

        // Add satellite tile layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 19
        }).addTo(map);

        // Add labels layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            opacity: 0.7
        }).addTo(map);

        this.instances[containerId] = map;
        return map;
    },

    /**
     * Create custom cane marker icon
     */
    createCaneIcon(options = {}) {
        const size = options.size || 40;
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-pin" style="width:${size}px;height:${size}px;font-size:${size/2}px">🦯</div>
                ${options.pulse !== false ? '<div class="marker-pulse"></div>' : ''}
            `,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
        });
    },

    /**
     * Add marker to map
     */
    addMarker(mapId, position, options = {}) {
        const map = this.instances[mapId];
        if (!map) return null;

        const icon = options.icon || this.createCaneIcon(options);
        const marker = L.marker(position, { icon }).addTo(map);

        if (options.popup) {
            marker.bindPopup(options.popup);
        }

        if (options.accuracy) {
            L.circle(position, {
                color: '#2563eb',
                fillColor: '#2563eb',
                fillOpacity: 0.1,
                radius: options.accuracy
            }).addTo(map);
        }

        return marker;
    },

    /**
     * Initialize mini map (non-interactive)
     */
    initMiniMap(containerId) {
        return this.init(containerId, {
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            zoom: 16
        });
    },

    /**
     * Invalidate size (call after container becomes visible)
     */
    refresh(containerId) {
        const map = this.instances[containerId];
        if (map) {
            setTimeout(() => map.invalidateSize(), 100);
        }
    },

    /**
     * Destroy map instance
     */
    destroy(containerId) {
        const map = this.instances[containerId];
        if (map) {
            map.remove();
            delete this.instances[containerId];
        }
    }
};
