const CONFIG = {

    ENV: window.location.hostname === 'localhost' ? 'development' : 'production',

    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost/smartpathcane/backend-spc/public/index.php'
        : 'https://your-domain.com/backend-spc/public/index.php',


    APP_NAME: 'SmartPath Cane',
    VERSION: '1.0.1', // Bumped version to clear cache


    CACHE_DURATION: 300000,
    MAX_RETRIES: 3,
    TIMEOUT: 10000
};

// Log config for debugging
console.log('API URL:', CONFIG.API_URL);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
