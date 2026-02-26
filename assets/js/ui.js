/**
 * UI Utilities
 * SmartPath Cane - Shared UI Components and Helpers
 */

const UI = {
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Show modal
     */
    showModal(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                ${options.showClose !== false ? '<button class="modal-close">&times;</button>' : ''}
                ${content}
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();

        modal.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
        modal.querySelector('.modal-close')?.addEventListener('click', closeModal);

        return { modal, close: closeModal };
    },

    /**
     * Format date relative
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    },

    /**
     * Get user initials
     */
    getUserInitials(user) {
        const first = user?.first_name || '';
        const last = user?.last_name || '';
        return (first.charAt(0) + last.charAt(0)).toUpperCase() || 'U';
    },

    /**
     * Debounce function
     */
    debounce(fn, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    },

    /**
     * Toggle element visibility
     */
    toggle(element, show) {
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    }
};
