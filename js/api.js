/**
 * API Client
 * SmartPath Cane - Frontend (Netlify)
 * Communicates with Hostinger Backend
 */

function APIClient() {
    this.baseURL = window.CONFIG ? window.CONFIG.API_URL : '';
    this.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
}

/**
 * Set auth token
 */
APIClient.prototype.setToken = function (token) {
    this.headers['Authorization'] = 'Bearer ' + token;
};

/**
 * Clear auth token
 */
APIClient.prototype.clearToken = function () {
    delete this.headers['Authorization'];
};

/**
 * Make API request
 */
APIClient.prototype.request = function (endpoint, method, data) {
    if (!method) method = 'GET';

    // Build URL
    var url;
    if (this.baseURL.indexOf('.php') !== -1) {
        var separator = this.baseURL.indexOf('?') !== -1 ? '&' : '?';
        url = this.baseURL + separator + 'path=' + encodeURIComponent(endpoint) + '&_t=' + Date.now();
    } else {
        url = this.baseURL + endpoint;
    }

    console.log('API Request URL:', url);

    var options = {
        method: method,
        headers: this.headers,
        mode: 'cors',
        credentials: 'include'
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    return fetch(url, options).then(function (response) {
        var contentType = response.headers.get('content-type');
        if (!contentType || contentType.indexOf('application/json') === -1) {
            return response.text().then(function (text) {
                throw new Error('Server returned HTML instead of JSON. Status: ' + response.status);
            });
        }

        return response.json().then(function (result) {
            if (!response.ok) {
                throw new Error(result.error || 'HTTP ' + response.status);
            }
            return result;
        });
    })['catch'](function (error) {
        console.error('API Error:', error);
        throw error;
    });
};

// Convenience methods
APIClient.prototype.get = function (endpoint) { return this.request(endpoint, 'GET'); };
APIClient.prototype.post = function (endpoint, data) { return this.request(endpoint, 'POST', data); };
APIClient.prototype.put = function (endpoint, data) { return this.request(endpoint, 'PUT', data); };
APIClient.prototype.delete = function (endpoint) { return this.request(endpoint, 'DELETE'); };

// Create global API client instance
window.api = new APIClient();

// Auth API
window.AuthAPI = {
    login: function (email, password) { return window.api.post('/api/auth/login', { email: email, password: password }); },
    register: function (data) { return window.api.post('/api/auth/register', data); },
    logout: function () { return window.api.post('/api/auth/logout'); },
    me: function () { return window.api.get('/api/auth/me'); },
    forgotPassword: function (email) { return window.api.post('/api/auth/forgot-password', { email: email }); },
    resetPassword: function (token, password) { return window.api.post('/api/auth/reset-password', { token: token, password: password }); }
};

// User API
window.UserAPI = {
    getProfile: function () { return window.api.get('/api/user/profile'); },
    updateProfile: function (data) { return window.api.put('/api/user/profile', data); },
    changePassword: function (data) { return window.api.put('/api/user/password', data); }
};

// Device API
window.DeviceAPI = {
    list: function () { return window.api.get('/api/devices'); },
    get: function (id) { return window.api.get('/api/devices/' + id); },
    create: function (data) { return window.api.post('/api/devices', data); },
    update: function (id, data) { return window.api.put('/api/devices/' + id, data); },
    delete: function (id) { return window.api.delete('/api/devices/' + id); },
    getLocation: function (id) { return window.api.get('/api/devices/' + id + '/location'); },
    getHistory: function (id) { return window.api.get('/api/devices/' + id + '/history'); }
};

// SOS Alert API
window.AlertAPI = {
    list: function () { return window.api.get('/api/alerts'); },
    get: function (id) { return window.api.get('/api/alerts/' + id); },
    create: function (data) { return window.api.post('/api/alerts', data); },
    acknowledge: function (id) { return window.api.put('/api/alerts/' + id + '/acknowledge'); },
    resolve: function (id) { return window.api.put('/api/alerts/' + id + '/resolve'); }
};

// Geofence API
window.GeofenceAPI = {
    list: function () { return window.api.get('/api/geofences'); },
    get: function (id) { return window.api.get('/api/geofences/' + id); },
    create: function (data) { return window.api.post('/api/geofences', data); },
    update: function (id, data) { return window.api.put('/api/geofences/' + id, data); },
    delete: function (id) { return window.api.delete('/api/geofences/' + id); }
};

// Export APIs
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APIClient: APIClient,
        api: window.api,
        AuthAPI: window.AuthAPI,
        UserAPI: window.UserAPI,
        DeviceAPI: window.DeviceAPI,
        AlertAPI: window.AlertAPI,
        GeofenceAPI: window.GeofenceAPI
    };
}
