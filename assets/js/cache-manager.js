// Modern Cache Management System

class CacheManager {
    constructor() {
        this.isDevMode = this.detectDevMode();
        this.cacheStrategy = this.isDevMode ? 'no-cache' : 'smart-cache';
        this.version = this.generateVersion();
        
        // console.log(`🔧 Cache Manager initialized: ${this.cacheStrategy} mode`);
    }
    
    // Development mode detection
    detectDevMode() {
        return (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('localhost') ||
            window.location.port === '8000' ||
            window.location.port === '3000' ||
            window.location.protocol === 'file:'
        );
    }
    
    // Generate cache version
    generateVersion() {
        if (this.isDevMode) {
            // Development: Always fresh
            return Date.now();
        } else {
            // Production: Daily refresh
            const today = new Date();
            return today.getFullYear() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
        }
    }
    
    // Get cache parameter
    getCacheParam() {
        if (this.isDevMode) {
            return `t=${Date.now()}`;
        } else {
            return `v=${this.version}`;
        }
    }
    
    // Load script with cache busting
    loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = `${src}?${this.getCacheParam()}`;
        script.onload = callback || function() {};
        script.onerror = function() {
            console.error(`❌ Failed to load script: ${src}`);
        };
        document.head.appendChild(script);
        return script;
    }
    
    // Load CSS with cache busting
    loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${href}?${this.getCacheParam()}`;
        link.onerror = function() {
            console.error(`❌ Failed to load CSS: ${href}`);
        };
        document.head.appendChild(link);
        return link;
    }
    
    // Force clear all cache
    clearAllCache() {
        return new Promise((resolve) => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    const promises = registrations.map(registration => registration.unregister());
                    return Promise.all(promises);
                }).then(() => {
                    // console.log('🧹 Service Workers unregistered');
                });
            }
            
            if ('caches' in window) {
                caches.keys().then(function(cacheNames) {
                    const promises = cacheNames.map(cacheName => caches.delete(cacheName));
                    return Promise.all(promises);
                }).then(() => {
                    // console.log('🧹 All caches cleared');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
    
    // Smart reload with cache clear
    smartReload() {
        this.clearAllCache().then(() => {
            window.location.reload(true);
        });
    }
    
    // Force hard refresh
    forceRefresh() {
        // Clear cache and reload
        this.clearAllCache().then(() => {
            // Add timestamp to prevent any cache
            const url = new URL(window.location);
            url.searchParams.set('refresh', Date.now());
            window.location.replace(url.toString());
        });
    }
    
    // Update all existing script/css tags
    updateExistingResources() {
        // Update script tags
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.src.includes('./assets/')) {
                const baseSrc = script.src.split('?')[0];
                script.src = `${baseSrc}?${this.getCacheParam()}`;
            }
        });
        
        // Update CSS links
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            if (link.href.includes('./assets/')) {
                const baseHref = link.href.split('?')[0];
                link.href = `${baseHref}?${this.getCacheParam()}`;
            }
        });
        
        // console.log('🔄 Resource URLs updated with fresh cache params');
    }
    
    // Check for updates (for production)
    checkForUpdates() {
        if (this.isDevMode) return;
        
        fetch('./version.json?' + Date.now())
            .then(response => response.json())
            .then(data => {
                const currentVersion = localStorage.getItem('app_version');
                if (currentVersion && currentVersion !== data.version) {
                    // console.log('🆕 New version detected, clearing cache...');
                    this.clearAllCache().then(() => {
                        localStorage.setItem('app_version', data.version);
                        window.location.reload();
                    });
                } else {
                    localStorage.setItem('app_version', data.version);
                }
            })
            .catch(() => {
                // console.log('📦 Version check skipped (no version.json)');
            });
    }
    
    // Initialize cache strategy
    init() {
        // console.log(`🚀 Cache strategy: ${this.cacheStrategy}`);
        
        if (this.isDevMode) {
            // console.log('🔧 Development mode: Cache disabled');
            // In dev, add cache prevention headers
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Cache-Control';
            meta.content = 'no-cache, no-store, must-revalidate';
            document.head.appendChild(meta);
        }
        
        // Check for updates on load
        this.checkForUpdates();
    }
}

// Global cache manager instance
window.cacheManager = new CacheManager();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => cacheManager.init());
} else {
    cacheManager.init();
}

// Expose useful functions globally
window.clearCache = () => cacheManager.clearAllCache();
window.smartReload = () => cacheManager.smartReload();
window.forceRefresh = () => cacheManager.forceRefresh();