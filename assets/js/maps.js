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

        // Add high-quality satellite tile layer with better zoom support
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 22,
            maxNativeZoom: 18,
            detectRetina: true,
            subdomains: ['server', 'services']
        }).addTo(map);

        // Add labels layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 22,
            maxNativeZoom: 18,
            opacity: 0.8,
            detectRetina: true
        }).addTo(map);

        this.instances[containerId] = map;
        return map;
    },

    /**
     * Create custom cane marker icon with direction arrow
     */
    createCaneIcon(options = {}) {
        const size = options.size || 40;
        const heading = options.heading || 0; // Direction in degrees (0-360)

        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-container" style="position:relative;width:${size}px;height:${size}px;">
                    <div class="marker-arrow" style="
                        position:absolute;
                        top:50%;
                        left:50%;
                        width:0;
                        height:0;
                        margin-left:-4px;
                        margin-top:-${size / 2 + 6}px;
                        border-left:4px solid transparent;
                        border-right:4px solid transparent;
                        border-bottom:10px solid #dc2626;
                        transform:rotate(${heading}deg);
                        transform-origin:50% ${size / 2 + 6}px;
                        filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                        z-index:10;
                    "></div>
                    <div class="marker-pin" style="
                        width:${size}px;
                        height:${size}px;
                        font-size:${size / 2}px;
                        position:relative;
                        z-index:5;
                    ">🦯</div>
                    ${options.pulse !== false ? '<div class="marker-pulse"></div>' : ''}
                </div>
            `,
            iconSize: [size, size + 12],
            iconAnchor: [size / 2, size / 2]
        });
    },

    /**
     * Calculate heading between two coordinates
     */
    calculateHeading(from, to) {
        const lat1 = from[0] * Math.PI / 180;
        const lat2 = to[0] * Math.PI / 180;
        const dLon = (to[1] - from[1]) * Math.PI / 180;

        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

        let heading = Math.atan2(y, x) * 180 / Math.PI;
        heading = (heading + 360) % 360; // Normalize to 0-360

        return heading;
    },

    /**
     * Add marker to map
     */
    addMarker(mapId, position, options = {}) {
        const map = this.instances[mapId];
        if (!map) return null;

        // Remove existing marker if any (for live tracking updates)
        if (this.markers && this.markers[mapId]) {
            map.removeLayer(this.markers[mapId]);
        }

        const icon = options.icon || this.createCaneIcon(options);
        const marker = L.marker(position, { icon }).addTo(map);

        // Store marker reference
        if (!this.markers) this.markers = {};
        this.markers[mapId] = marker;

        if (options.popup) {
            marker.bindPopup(options.popup);
        }

        if (options.accuracy) {
            // Remove existing accuracy circle if any
            if (this.accuracyCircles && this.accuracyCircles[mapId]) {
                map.removeLayer(this.accuracyCircles[mapId]);
            }
            const circle = L.circle(position, {
                color: '#2563eb',
                fillColor: '#2563eb',
                fillOpacity: 0.1,
                radius: options.accuracy
            }).addTo(map);
            if (!this.accuracyCircles) this.accuracyCircles = {};
            this.accuracyCircles[mapId] = circle;
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
     * Set map view to specific location
     */
    setView(containerId, position, zoom) {
        const map = this.instances[containerId];
        if (map) {
            map.setView(position, zoom);
        }
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
