const CONFIG = {

    ENV: window.location.hostname === 'localhost' ? 'development' : 'production',

    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost/smartpathcane/backend-spc'  
        : 'https://your-domain.com/backend-spc',         

  
    APP_NAME: 'SmartPath Cane',
    VERSION: '1.0.0',


    CACHE_DURATION: 300000, 
    MAX_RETRIES: 3,        
    TIMEOUT: 10000           
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
