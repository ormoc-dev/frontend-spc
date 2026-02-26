/**
 * API Client
 * SmartPath Cane - Frontend (Netlify)
 * Communicates with Hostinger Backend
 */

class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_URL;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Set auth token
     */
    setToken(token) {
        this.headers['Authorization'] = `Bearer ${token}`;
    }

    /**
     * Clear auth token
     */
    clearToken() {
        delete this.headers['Authorization'];
    }

    /**
     * Make API request
     */
    async request(endpoint, method = 'GET', data = null) {
        // Build URL - if baseURL contains .php, use query string
        let url;
        if (this.baseURL.includes('.php')) {
            const separator = this.baseURL.includes('?') ? '&' : '?';
            url = `${this.baseURL}${separator}path=${encodeURIComponent(endpoint)}&_t=${Date.now()}`;
        } else {
            url = `${this.baseURL}${endpoint}`;
        }

        // Debug: log the URL being called
        console.log('API Request URL:', url);

        const options = {
            method,
            headers: this.headers,
            mode: 'cors',
            credentials: 'include'
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // GET request
    get(endpoint) {
        return this.request(endpoint, 'GET');
    }

    // POST request
    post(endpoint, data) {
        return this.request(endpoint, 'POST', data);
    }

    // PUT request
    put(endpoint, data) {
        return this.request(endpoint, 'PUT', data);
    }

    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, 'DELETE');
    }
}

// Create global API client instance
const api = new APIClient();

// Auth API
const AuthAPI = {
    login: (email, password) => api.post('/api/auth/login', { email, password }),
    register: (data) => api.post('/api/auth/register', data),
    logout: () => api.post('/api/auth/logout'),
    me: () => api.get('/api/auth/me'),
    forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password })
};

// User API
const UserAPI = {
    getProfile: () => api.get('/api/user/profile'),
    updateProfile: (data) => api.put('/api/user/profile', data),
    changePassword: (data) => api.put('/api/user/password', data)
};

// Device API
const DeviceAPI = {
    list: () => api.get('/api/devices'),
    get: (id) => api.get(`/api/devices/${id}`),
    create: (data) => api.post('/api/devices', data),
    update: (id, data) => api.put(`/api/devices/${id}`, data),
    delete: (id) => api.delete(`/api/devices/${id}`),
    getLocation: (id) => api.get(`/api/devices/${id}/location`),
    getHistory: (id) => api.get(`/api/devices/${id}/history`)
};

// SOS Alert API
const AlertAPI = {
    list: () => api.get('/api/alerts'),
    get: (id) => api.get(`/api/alerts/${id}`),
    create: (data) => api.post('/api/alerts', data),
    acknowledge: (id) => api.put(`/api/alerts/${id}/acknowledge`),
    resolve: (id) => api.put(`/api/alerts/${id}/resolve`)
};

// Geofence API
const GeofenceAPI = {
    list: () => api.get('/api/geofences'),
    get: (id) => api.get(`/api/geofences/${id}`),
    create: (data) => api.post('/api/geofences', data),
    update: (id, data) => api.put(`/api/geofences/${id}`, data),
    delete: (id) => api.delete(`/api/geofences/${id}`)
};

// Export APIs
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, api, AuthAPI, UserAPI, DeviceAPI, AlertAPI, GeofenceAPI };
}
