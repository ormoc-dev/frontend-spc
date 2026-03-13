/**
 * Dashboard Geofences Module
 */
const Geofences = {
    /**
     * Initialize geofences map
     */
    init() {
        setTimeout(() => {
            if (typeof Maps !== 'undefined') {
                Maps.init('geofences-map', { zoom: 14 });
                Maps.addMarker('geofences-map', Maps.defaultLocation);
            }
        }, 100);
    }
};
