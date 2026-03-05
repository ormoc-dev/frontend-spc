const isLocal = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.endsWith('.local');

const CONFIG = {
    ENV: isLocal ? 'development' : 'production',

    API_URL: isLocal
        ? `http://${window.location.hostname}/smartpathcane/backend-spc/public`
        : 'https://floralwhite-raccoon-333018.hostingersite.com/backend-spc/public',


    APP_NAME: 'SmartPath Cane',
    VERSION: '1.0.3', // Bumped version to clear cache


    CACHE_DURATION: 300000,
    MAX_RETRIES: 3,
    TIMEOUT: 10000
};

// Log config for debugging
console.log('API URL:', CONFIG.API_URL);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
