// Toast Notification System
class NotificationService {
    static show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
    static success(message) {
        this.show(message, 'success');
    }
    static error(message) {
        this.show(message, 'error');
    }
    static info(message) {
        this.show(message, 'info');
    }
    static warning(message) {
        this.show(message, 'warning');
    }
}
// Global backward compatibility
window.showToast = (message, type) => NotificationService.show(message, type);
