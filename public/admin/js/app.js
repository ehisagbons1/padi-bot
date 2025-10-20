// Main Application
const App = {
    currentPage: 'dashboard',
    currentAdmin: null,

    init() {
        this.checkAuth();
        this.setupLoginForm();
    },

    async checkAuth() {
        try {
            const { admin } = await API.getProfile();
            this.currentAdmin = admin;
            this.showDashboard();
        } catch (error) {
            this.showLogin();
        }
    },

    showLogin() {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    },

    showDashboard() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        
        // Set admin info
        document.getElementById('adminName').textContent = this.currentAdmin.username;
        document.getElementById('adminRole').textContent = this.currentAdmin.role;
        
        // Setup navigation
        this.setupNavigation();
        this.setupLogout();
        
        // Load dashboard
        this.loadPage('dashboard');
        
        // Start auto-refresh
        this.startAutoRefresh();
    },

    setupLoginForm() {
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            
            try {
                const { admin } = await API.login(username, password);
                this.currentAdmin = admin;
                this.showDashboard();
            } catch (error) {
                errorDiv.textContent = error.message || 'Login failed';
            }
        });
    },

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.loadPage(page);
            });
        });
    },

    setupLogout() {
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            try {
                await API.logout();
                this.currentAdmin = null;
                this.showLogin();
            } catch (error) {
                Utils.showAlert('Logout failed', 'error');
            }
        });
    },

    loadPage(page) {
        this.currentPage = page;
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
        
        // Update pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}Page`).classList.add('active');
        
        // Update title
        const titles = {
            dashboard: 'Dashboard',
            users: 'User Management',
            transactions: 'Transactions',
            giftcards: 'Gift Cards Approval',
            products: 'Gift Card Products',
            'data-plans': 'Data Plans',
            settings: 'Settings',
        };
        document.getElementById('pageTitle').textContent = titles[page];
        
        // Load page data
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'transactions':
                this.loadTransactions();
                break;
            case 'giftcards':
                this.loadGiftCards();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'data-plans':
                this.loadDataPlans();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    },

    async loadDashboard() {
        try {
            const { stats, recentTransactions } = await API.getDashboardStats();
            
            // Update stats
            document.getElementById('statTotalUsers').textContent = stats.users.total;
            document.getElementById('statNewUsers').textContent = stats.users.newToday;
            document.getElementById('statTotalTx').textContent = stats.transactions.total;
            document.getElementById('statTodayTx').textContent = stats.transactions.today;
            document.getElementById('statTotalRevenue').textContent = Utils.formatCurrency(stats.revenue.total);
            document.getElementById('statTodayRevenue').textContent = stats.revenue.today.toLocaleString();
            document.getElementById('statPending').textContent = stats.transactions.pending;
            document.getElementById('pendingBadge').textContent = stats.transactions.pending;
            
            // Update recent transactions
            const tbody = document.getElementById('recentTransactions');
            if (recentTransactions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">No transactions yet</td></tr>';
            } else {
                tbody.innerHTML = recentTransactions.map(tx => `
                    <tr>
                        <td>${Utils.formatDateTime(tx.createdAt)}</td>
                        <td>${Utils.getTransactionTypeLabel(tx.type)}</td>
                        <td>${tx.user?.phoneNumber || tx.phoneNumber}</td>
                        <td>${Utils.formatCurrency(tx.amount)}</td>
                        <td>${Utils.getStatusBadge(tx.status)}</td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            Utils.showAlert('Failed to load dashboard', 'error');
        }
    },

    async loadUsers(page = 1, search = '') {
        try {
            const { users, pagination } = await API.getUsers(page, search);
            const tbody = document.getElementById('usersTable');
            
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
            } else {
                tbody.innerHTML = users.map(user => `
                    <tr>
                        <td>${user.phoneNumber}</td>
                        <td>${user.name || '-'}</td>
                        <td>${Utils.formatCurrency(user.wallet.balance)}</td>
                        <td>${Utils.getStatusBadge(user.status)}</td>
                        <td>${Utils.formatDate(user.createdAt)}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="App.viewUser('${user._id}')">View</button>
                        </td>
                    </tr>
                `).join('');
            }
            
            this.renderPagination('usersPagination', pagination, (p) => this.loadUsers(p, search));
        } catch (error) {
            console.error('Failed to load users:', error);
            Utils.showAlert('Failed to load users', 'error');
        }
    },

    async loadTransactions(page = 1) {
        try {
            const type = document.getElementById('txTypeFilter')?.value || '';
            const status = document.getElementById('txStatusFilter')?.value || '';
            
            const { transactions, pagination } = await API.getTransactions(page, { type, status });
            const tbody = document.getElementById('transactionsTable');
            
            if (transactions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No transactions found</td></tr>';
            } else {
                tbody.innerHTML = transactions.map(tx => `
                    <tr>
                        <td>${Utils.formatDateTime(tx.createdAt)}</td>
                        <td>${Utils.getTransactionTypeLabel(tx.type)}</td>
                        <td>${tx.user?.phoneNumber || tx.phoneNumber}</td>
                        <td>${Utils.formatCurrency(tx.amount)}</td>
                        <td>${Utils.getStatusBadge(tx.status)}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="App.viewTransaction('${tx._id}')">View</button>
                        </td>
                    </tr>
                `).join('');
            }
            
            this.renderPagination('txPagination', pagination, (p) => this.loadTransactions(p));
        } catch (error) {
            console.error('Failed to load transactions:', error);
            Utils.showAlert('Failed to load transactions', 'error');
        }
    },

    async loadGiftCards(page = 1) {
        try {
            const { giftCards, pagination } = await API.getPendingGiftCards(page);
            const container = document.getElementById('giftcardsContainer');
            document.getElementById('pendingCount').textContent = pagination.total;
            
            if (giftCards.length === 0) {
                container.innerHTML = '<p class="loading">No pending gift cards</p>';
            } else {
                container.innerHTML = giftCards.map(tx => `
                    <div class="giftcard-item">
                        <div class="giftcard-header">
                            <div>
                                <h3>${tx.details.cardType} - ${tx.details.cardValue}</h3>
                                <p>User: ${tx.user?.phoneNumber || tx.phoneNumber}</p>
                                <p>Amount: ${Utils.formatCurrency(tx.amount)}</p>
                                <small>Submitted: ${Utils.formatDateTime(tx.createdAt)}</small>
                            </div>
                        </div>
                        ${tx.details.cardImages && tx.details.cardImages.length > 0 ? `
                            <div class="giftcard-images">
                                ${tx.details.cardImages.map((img, idx) => `
                                    <div class="giftcard-image">
                                        <img src="${typeof img === 'string' ? img : img.url || '/uploads/placeholder.jpg'}" 
                                             alt="Card Image ${idx + 1}"
                                             onclick="window.open(this.src, '_blank')">
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p>No images uploaded</p>'}
                        <p><strong>Card Code:</strong> ${tx.details.cardCode || 'Not provided'}</p>
                        <div class="giftcard-actions">
                            <button class="btn btn-success" onclick="App.approveGiftCard('${tx._id}')">✅ Approve</button>
                            <button class="btn btn-danger" onclick="App.rejectGiftCard('${tx._id}')">❌ Reject</button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load gift cards:', error);
            Utils.showAlert('Failed to load gift cards', 'error');
        }
    },

    async approveGiftCard(transactionId) {
        const note = prompt('Add approval note (optional):');
        if (note === null) return;
        
        try {
            await API.approveGiftCard(transactionId, note || 'Approved');
            Utils.showAlert('Gift card approved successfully', 'success');
            this.loadGiftCards();
            this.loadDashboard(); // Refresh stats
        } catch (error) {
            Utils.showAlert(error.message || 'Failed to approve gift card', 'error');
        }
    },

    async rejectGiftCard(transactionId) {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        
        try {
            await API.rejectGiftCard(transactionId, reason);
            Utils.showAlert('Gift card rejected', 'success');
            this.loadGiftCards();
        } catch (error) {
            Utils.showAlert(error.message || 'Failed to reject gift card', 'error');
        }
    },

    async loadProducts() {
        try {
            const { products } = await API.getGiftCardProducts();
            const container = document.getElementById('productsContainer');
            
            if (products.length === 0) {
                container.innerHTML = '<p class="loading">No products yet. Click "Add Product" to create one.</p>';
            } else {
                container.innerHTML = `
                    <div class="product-grid">
                        ${products.map(product => `
                            <div class="product-card">
                                <h3>${product.name}</h3>
                                <p>Code: <code>${product.code}</code></p>
                                <p>Status: ${product.enabled ? '✅ Enabled' : '❌ Disabled'}</p>
                                <div class="product-rates">
                                    <strong>Rates:</strong>
                                    ${product.rates.map(r => `
                                        <div class="rate-item">
                                            <span>$${r.value}</span>
                                            <span>${Utils.formatCurrency(r.rate)}</span>
                                        </div>
                                    `).join('')}
                                    <div class="rate-item">
                                        <span>Default Rate:</span>
                                        <span>×${product.defaultRate}</span>
                                    </div>
                                </div>
                                <div class="product-actions">
                                    <button class="btn btn-sm btn-primary" onclick="App.editProduct('${product._id}')">Edit</button>
                                    <button class="btn btn-sm btn-danger" onclick="App.deleteProduct('${product._id}')">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            Utils.showAlert('Failed to load products', 'error');
        }
    },

    async loadDataPlans(network = '') {
        try {
            const { plans } = await API.getDataPlans(network);
            const container = document.getElementById('dataPlansContainer');
            
            if (plans.length === 0) {
                container.innerHTML = '<p class="loading">No data plans yet. Click "Add Plan" to create one.</p>';
            } else {
                // Group by network
                const grouped = {};
                plans.forEach(plan => {
                    if (!grouped[plan.network]) grouped[plan.network] = [];
                    grouped[plan.network].push(plan);
                });
                
                container.innerHTML = Object.entries(grouped).map(([net, netPlans]) => `
                    <div class="section">
                        <h3>${net.toUpperCase()} Data Plans</h3>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Plan</th>
                                        <th>Size</th>
                                        <th>Validity</th>
                                        <th>Price</th>
                                        <th>Profit</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${netPlans.map(plan => `
                                        <tr>
                                            <td>${plan.name}</td>
                                            <td>${plan.dataSize}</td>
                                            <td>${plan.validity}</td>
                                            <td>${Utils.formatCurrency(plan.price)}</td>
                                            <td>${Utils.formatCurrency(plan.profit)}</td>
                                            <td>${plan.enabled ? '✅' : '❌'}</td>
                                            <td>
                                                <button class="btn btn-sm btn-primary" onclick="App.editDataPlan('${plan._id}')">Edit</button>
                                                <button class="btn btn-sm btn-danger" onclick="App.deleteDataPlan('${plan._id}')">Delete</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load data plans:', error);
            Utils.showAlert('Failed to load data plans', 'error');
        }
    },

    async loadSettings() {
        try {
            const { settings } = await API.getSettings();
            
            // Bot settings
            document.getElementById('botName').value = settings.bot.name;
            document.getElementById('welcomeMessage').value = settings.bot.welcomeMessage;
            document.getElementById('supportPhone').value = settings.bot.supportPhone;
            document.getElementById('supportEmail').value = settings.bot.supportEmail;
            
            // Service status
            document.getElementById('airtimeEnabled').checked = settings.services.airtime.enabled;
            document.getElementById('dataEnabled').checked = settings.services.data.enabled;
            document.getElementById('giftCardEnabled').checked = settings.services.giftCard.enabled;
            document.getElementById('walletEnabled').checked = settings.services.wallet.enabled;
            
            // Maintenance
            document.getElementById('maintenanceEnabled').checked = settings.maintenance.enabled;
            document.getElementById('maintenanceMessage').value = settings.maintenance.message;
        } catch (error) {
            console.error('Failed to load settings:', error);
            Utils.showAlert('Failed to load settings', 'error');
        }
    },

    renderPagination(elementId, pagination, callback) {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        const { page, pages } = pagination;
        const buttons = [];
        
        if (page > 1) {
            buttons.push(`<button onclick="App.${callback.name}(${page - 1})">Previous</button>`);
        }
        
        for (let i = 1; i <= Math.min(pages, 5); i++) {
            const active = i === page ? 'active' : '';
            buttons.push(`<button class="${active}" onclick="App.${callback.name}(${i})">${i}</button>`);
        }
        
        if (page < pages) {
            buttons.push(`<button onclick="App.${callback.name}(${page + 1})">Next</button>`);
        }
        
        container.innerHTML = buttons.join('');
    },

    startAutoRefresh() {
        setInterval(() => {
            if (this.currentPage === 'dashboard') {
                this.loadDashboard();
            } else if (this.currentPage === 'giftcards') {
                this.loadGiftCards();
            }
        }, 30000); // Refresh every 30 seconds
    },

    viewUser(userId) {
        alert('User details view - To be implemented');
    },

    viewTransaction(transactionId) {
        alert('Transaction details view - To be implemented');
    },

    editProduct(productId) {
        alert('Edit product - To be implemented');
    },

    deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        // To be implemented
    },

    editDataPlan(planId) {
        alert('Edit data plan - To be implemented');
    },

    deleteDataPlan(planId) {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        // To be implemented
    },
};

// Global functions for onclick handlers
window.App = App;

window.showAddProductModal = function() {
    alert('Add product modal - To be implemented');
};

window.showAddDataPlanModal = function() {
    alert('Add data plan modal - To be implemented');
};

window.saveSettings = async function() {
    try {
        const settings = {
            bot: {
                name: document.getElementById('botName').value,
                welcomeMessage: document.getElementById('welcomeMessage').value,
                supportPhone: document.getElementById('supportPhone').value,
                supportEmail: document.getElementById('supportEmail').value,
            },
            services: {
                airtime: { enabled: document.getElementById('airtimeEnabled').checked },
                data: { enabled: document.getElementById('dataEnabled').checked },
                giftCard: { enabled: document.getElementById('giftCardEnabled').checked },
                wallet: { enabled: document.getElementById('walletEnabled').checked },
            },
            maintenance: {
                enabled: document.getElementById('maintenanceEnabled').checked,
                message: document.getElementById('maintenanceMessage').value,
            },
        };
        
        await API.updateSettings(settings);
        
        // Clear cache so changes take effect immediately
        await API.clearCache();
        
        Utils.showAlert('✅ Settings saved and cache cleared! Changes are now live.', 'success');
    } catch (error) {
        Utils.showAlert(error.message || 'Failed to save settings', 'error');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Setup filters
document.addEventListener('DOMContentLoaded', () => {
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', Utils.debounce((e) => {
            App.loadUsers(1, e.target.value);
        }, 500));
    }
    
    const txTypeFilter = document.getElementById('txTypeFilter');
    const txStatusFilter = document.getElementById('txStatusFilter');
    if (txTypeFilter) {
        txTypeFilter.addEventListener('change', () => App.loadTransactions(1));
    }
    if (txStatusFilter) {
        txStatusFilter.addEventListener('change', () => App.loadTransactions(1));
    }
});

