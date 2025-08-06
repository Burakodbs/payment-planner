// Dynamic Resource Loader with Smart Caching

class ResourceLoader {
    constructor() {
        this.loadedResources = new Set();
        this.cacheManager = window.cacheManager;
    }
    
    // Load multiple resources
    async loadResources(resources) {
        const promises = resources.map(resource => {
            if (typeof resource === 'string') {
                return this.loadResource(resource);
            } else {
                return this.loadResource(resource.src, resource.type);
            }
        });
        
        return Promise.all(promises);
    }
    
    // Load single resource
    loadResource(src, type = null) {
        return new Promise((resolve, reject) => {
            // Detect type if not provided
            if (!type) {
                type = src.endsWith('.css') ? 'css' : 'js';
            }
            
            // Check if already loaded
            const resourceId = `${type}:${src}`;
            if (this.loadedResources.has(resourceId)) {
                resolve();
                return;
            }
            
            if (type === 'css') {
                this.loadCSS(src, resolve, reject);
            } else if (type === 'js') {
                this.loadJS(src, resolve, reject);
            }
            
            this.loadedResources.add(resourceId);
        });
    }
    
    loadCSS(href, onLoad, onError) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = this.addCacheParam(href);
        link.onload = onLoad;
        link.onerror = onError;
        document.head.appendChild(link);
    }
    
    loadJS(src, onLoad, onError) {
        const script = document.createElement('script');
        script.src = this.addCacheParam(src);
        script.onload = onLoad;
        script.onerror = onError;
        document.head.appendChild(script);
    }
    
    addCacheParam(url) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${this.cacheManager.getCacheParam()}`;
    }
    
    // Load common app resources
    async loadAppResources() {
        const commonCSS = [
            './assets/css/variables.css',
            './assets/css/base.css',
            './assets/css/layout.css',
            './assets/css/components.css',
            './assets/css/utilities.css',
            './assets/css/auth.css'
        ];
        
        const commonJS = [
            './assets/js/cache-manager.js',
            './assets/js/components.js',
            './assets/js/auth.js',
            './assets/js/auth-ui.js',
            './assets/js/app.js',
            './assets/js/data-manager.js',
            './assets/js/calculations.js',
            './assets/js/chart-manager.js',
            './assets/js/utils.js'
        ];
        
        console.log('📦 Loading app resources...');
        
        try {
            // Load CSS first
            await this.loadResources(commonCSS);
            console.log('✅ CSS loaded');
            
            // Then load JS
            await this.loadResources(commonJS);
            console.log('✅ JavaScript loaded');
            
        } catch (error) {
            console.error('❌ Failed to load app resources:', error);
        }
    }
}

// Global resource loader
window.resourceLoader = new ResourceLoader();