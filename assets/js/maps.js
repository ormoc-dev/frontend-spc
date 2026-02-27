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

        // Add fullscreen control
        this.addFullscreenControl(containerId);

        return map;
    },

    /**
     * Add fullscreen button to map
     */
    addFullscreenControl(mapId) {
        const mapContainer = document.getElementById(mapId);
        if (!mapContainer) return;

        // Create fullscreen button
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'map-fullscreen-btn';
        fullscreenBtn.innerHTML = '⛶';
        fullscreenBtn.title = 'Toggle Fullscreen';
        fullscreenBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            width: 36px;
            height: 36px;
            background: white;
            border: none;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        `;

        fullscreenBtn.addEventListener('mouseenter', () => {
            fullscreenBtn.style.background = '#f3f4f6';
        });
        fullscreenBtn.addEventListener('mouseleave', () => {
            fullscreenBtn.style.background = 'white';
        });

        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen(mapId);
        });

        // Position the map container relatively if not already
        if (getComputedStyle(mapContainer).position === 'static') {
            mapContainer.style.position = 'relative';
        }
        mapContainer.appendChild(fullscreenBtn);
    },

    /**
     * Toggle fullscreen for map
     */
    toggleFullscreen(mapId) {
        const mapContainer = document.getElementById(mapId);
        if (!mapContainer) return;

        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().catch(err => {
                console.error('Fullscreen error:', err);
                // Fallback: maximize the container
                mapContainer.style.position = 'fixed';
                mapContainer.style.top = '0';
                mapContainer.style.left = '0';
                mapContainer.style.width = '100vw';
                mapContainer.style.height = '100vh';
                mapContainer.style.zIndex = '9999';
                mapContainer.dataset.isFullscreen = 'true';
            });
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            // Remove fallback styles
            if (mapContainer.dataset.isFullscreen) {
                mapContainer.style.position = '';
                mapContainer.style.top = '';
                mapContainer.style.left = '';
                mapContainer.style.width = '';
                mapContainer.style.height = '';
                mapContainer.style.zIndex = '';
                delete mapContainer.dataset.isFullscreen;
            }
        }

        // Invalidate map size after transition
        setTimeout(() => {
            const map = this.instances[mapId];
            if (map) map.invalidateSize();
        }, 300);
    },

    /**
     * Create custom location pin marker with cane emoji inside
     */
    createCaneIcon(options = {}) {
        const size = options.size || 12;

        return L.divIcon({
            className: 'simple-dot-marker',
            html: `
                <div style="position:relative;width:${size * 4}px;height:${size * 4}px;">
                    <!-- Outer wave ring -->
                    <div style="
                        position:absolute;
                        top:50%;
                        left:50%;
                        transform:translate(-50%,-50%);
                        width:${size * 4}px;
                        height:${size * 4}px;
                        border:2px solid rgba(37,99,235,0.3);
                        border-radius:50%;
                        animation:wave-pulse 2s ease-out infinite;
                        z-index:1;
                    "></div>
                    <!-- Middle wave ring -->
                    <div style="
                        position:absolute;
                        top:50%;
                        left:50%;
                        transform:translate(-50%,-50%);
                        width:${size * 2.5}px;
                        height:${size * 2.5}px;
                        border:2px solid rgba(37,99,235,0.5);
                        border-radius:50%;
                        animation:wave-pulse 2s ease-out infinite 0.5s;
                        z-index:2;
                    "></div>
                    <!-- Center dot -->
                    <div style="
                        position:absolute;
                        top:50%;
                        left:50%;
                        transform:translate(-50%,-50%);
                        width:${size}px;
                        height:${size}px;
                        background:#2563eb;
                        border:2px solid white;
                        border-radius:50%;
                        box-shadow:0 2px 4px rgba(0,0,0,0.3);
                        z-index:3;
                    "></div>
                </div>
            `,
            iconSize: [size * 4, size * 4],
            iconAnchor: [size * 2, size * 2]
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
