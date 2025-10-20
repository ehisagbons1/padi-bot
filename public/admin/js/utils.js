// Utility Functions

const Utils = {
    // Format currency
    formatCurrency(amount) {
        return `₦${amount.toLocaleString()}`;
    },

    // Format date
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    },

    // Format datetime
    formatDateTime(date) {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    // Get status badge HTML
    getStatusBadge(status) {
        const statusMap = {
            completed: { class: 'status-completed', text: 'Completed' },
            processing: { class: 'status-processing', text: 'Processing' },
            failed: { class: 'status-failed', text: 'Failed' },
            active: { class: 'status-active', text: 'Active' },
            suspended: { class: 'status-failed', text: 'Suspended' },
        };

        const badge = statusMap[status] || { class: 'status-processing', text: status };
        return `<span class="status-badge ${badge.class}">${badge.text}</span>`;
    },

    // Get transaction type label
    getTransactionTypeLabel(type) {
        const typeMap = {
            airtime: '📱 Airtime',
            data: '📶 Data',
            giftcard_sale: '🎁 Gift Card',
            wallet_funding: '💰 Wallet Funding',
            wallet_withdrawal: '💸 Withdrawal',
        };
        return typeMap[type] || type;
    },

    // Show alert
    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    },

    // Confirm dialog
    confirm(message) {
        return window.confirm(message);
    },

    // Prompt dialog
    prompt(message, defaultValue = '') {
        return window.prompt(message, defaultValue);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

