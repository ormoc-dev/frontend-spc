// Check for local environment
var hostname = window.location.hostname;
var isLocal = hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.indexOf('192.168.') === 0 ||
    hostname.indexOf('10.') === 0 ||
    hostname.indexOf('172.') === 0 ||
    hostname.indexOf('.local') !== -1;

window.CONFIG = {
    ENV: isLocal ? 'development' : 'production',

    API_URL: isLocal
        ? 'http://' + hostname + '/smartpathcane/backend-spc/public'
        : 'https://floralwhite-raccoon-333018.hostingersite.com/backend-spc/public',

    SUPABASE_URL: 'https://ksoukgxagrpaleedqqua.supabase.co',
    SUPABASE_KEY: 'sb_publishable_Ku5jRYPcCchUGsET6gRNBw_wzqfFQg7',

    APP_NAME: 'SmartPath Cane',
    VERSION: '1.0.8', // Bumped version to force refresh

    CACHE_DURATION: 300000,
    MAX_RETRIES: 3,
    TIMEOUT: 10000
};

// Log for debugging
console.log('Environment:', window.CONFIG.ENV);
console.log('API URL:', window.CONFIG.API_URL);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.CONFIG;
}
