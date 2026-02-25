/**
 * Frontend Configuration
 * SmartPath Cane - Frontend (Netlify Free Tier)
 * Backend: Hostinger | Database: Supabase
 * 
 * Netlify Free Tier Limits:
 * - 100 GB bandwidth/month
 * - 300 build minutes/month (not needed for static site)
 * - Unlimited static sites
 */

const CONFIG = {
    // Environment
    ENV: window.location.hostname === 'localhost' ? 'development' : 'production',

    // API Base URL (Hostinger Backend)
    // Frontend → Hostinger Backend → Supabase Database
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost/smartpathcane/backend-spc'  // Local development
        : 'https://your-domain.com/backend-spc',         // TODO: Replace with your Hostinger domain

    // App Settings
    APP_NAME: 'SmartPath Cane',
    VERSION: '1.0.0',

    // Free Tier Optimizations
    CACHE_DURATION: 300000,  // 5 minutes cache (reduce API calls)
    MAX_RETRIES: 3,          // Retry failed requests
    TIMEOUT: 10000           // 10 second timeout
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
