// API Helper
const API = {
    baseURL: '/api/admin',

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth
    async login(username, password) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    async logout() {
        return this.request('/logout', { method: 'POST' });
    },

    async getProfile() {
        return this.request('/profile');
    },

    // Dashboard
    async getDashboardStats() {
        return this.request('/dashboard');
    },

    // Users
    async getUsers(page = 1, search = '') {
        const params = new URLSearchParams({ page, limit: 20 });
        if (search) params.append('search', search);
        return this.request(`/users?${params}`);
    },

    async getUserDetails(userId) {
        return this.request(`/users/${userId}`);
    },

    async updateUserWallet(userId, action, amount, note) {
        return this.request(`/users/${userId}/wallet`, {
            method: 'POST',
            body: JSON.stringify({ action, amount, note }),
        });
    },

    async updateUserStatus(userId, status) {
        return this.request(`/users/${userId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    // Transactions
    async getTransactions(page = 1, filters = {}) {
        const params = new URLSearchParams({ page, limit: 50, ...filters });
        return this.request(`/transactions?${params}`);
    },

    async getTransactionDetails(transactionId) {
        return this.request(`/transactions/${transactionId}`);
    },

    // Gift Cards
    async getPendingGiftCards(page = 1) {
        return this.request(`/giftcards/pending?page=${page}`);
    },

    async approveGiftCard(transactionId, note) {
        return this.request(`/giftcards/${transactionId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        });
    },

    async rejectGiftCard(transactionId, reason) {
        return this.request(`/giftcards/${transactionId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    },

    // Gift Card Products
    async getGiftCardProducts() {
        return this.request('/giftcard-products');
    },

    async createGiftCardProduct(product) {
        return this.request('/giftcard-products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
    },

    async updateGiftCardProduct(productId, updates) {
        return this.request(`/giftcard-products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    async deleteGiftCardProduct(productId) {
        return this.request(`/giftcard-products/${productId}`, {
            method: 'DELETE',
        });
    },

    // Data Plans
    async getDataPlans(network = '') {
        const params = network ? `?network=${network}` : '';
        return this.request(`/data-plans${params}`);
    },

    async createDataPlan(plan) {
        return this.request('/data-plans', {
            method: 'POST',
            body: JSON.stringify(plan),
        });
    },

    async updateDataPlan(planId, updates) {
        return this.request(`/data-plans/${planId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    async deleteDataPlan(planId) {
        return this.request(`/data-plans/${planId}`, {
            method: 'DELETE',
        });
    },

    // Settings
    async getSettings() {
        return this.request('/settings');
    },

    async updateSettings(settings) {
        return this.request('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },

    // Clear cache
    async clearCache() {
        return this.request('/clear-cache', {
            method: 'POST',
        });
    },
};

