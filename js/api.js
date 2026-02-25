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
        const url = `${this.baseURL}${endpoint}`;

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
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};

// User API
const UserAPI = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/profile', data),
    changePassword: (data) => api.put('/user/password', data)
};

// Device API
const DeviceAPI = {
    list: () => api.get('/devices'),
    get: (id) => api.get(`/devices/${id}`),
    create: (data) => api.post('/devices', data),
    update: (id, data) => api.put(`/devices/${id}`, data),
    delete: (id) => api.delete(`/devices/${id}`),
    getLocation: (id) => api.get(`/devices/${id}/location`),
    getHistory: (id) => api.get(`/devices/${id}/history`)
};

// SOS Alert API
const AlertAPI = {
    list: () => api.get('/alerts'),
    get: (id) => api.get(`/alerts/${id}`),
    create: (data) => api.post('/alerts', data),
    acknowledge: (id) => api.put(`/alerts/${id}/acknowledge`),
    resolve: (id) => api.put(`/alerts/${id}/resolve`)
};

// Geofence API
const GeofenceAPI = {
    list: () => api.get('/geofences'),
    get: (id) => api.get(`/geofences/${id}`),
    create: (data) => api.post('/geofences', data),
    update: (id, data) => api.put(`/geofences/${id}`, data),
    delete: (id) => api.delete(`/geofences/${id}`)
};

// Export APIs
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, api, AuthAPI, UserAPI, DeviceAPI, AlertAPI, GeofenceAPI };
}
