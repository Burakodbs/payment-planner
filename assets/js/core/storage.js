// Storage Abstraction Layer - Unified interface for all storage operations
class StorageProvider {
    constructor() {
        this.adapters = new Map();
        this.defaultAdapter = 'localStorage';
        this.fallbackOrder = ['localStorage', 'sessionStorage', 'memory'];
    }

    // Register storage adapter
    registerAdapter(name, adapter) {
        this.adapters.set(name, adapter);
    }

    // Get adapter
    getAdapter(name = this.defaultAdapter) {
        return this.adapters.get(name);
    }

    // Auto-detect best available adapter
    getBestAdapter() {
        for (const adapterName of this.fallbackOrder) {
            const adapter = this.adapters.get(adapterName);
            if (adapter && adapter.isAvailable()) {
                return adapter;
            }
        }
        throw new Error('No storage adapter available');
    }

    async get(key, adapterName) {
        const adapter = adapterName ? this.getAdapter(adapterName) : this.getBestAdapter();
        return await adapter.get(key);
    }

    async set(key, value, adapterName) {
        const adapter = adapterName ? this.getAdapter(adapterName) : this.getBestAdapter();
        return await adapter.set(key, value);
    }

    async remove(key, adapterName) {
        const adapter = adapterName ? this.getAdapter(adapterName) : this.getBestAdapter();
        return await adapter.remove(key);
    }

    async clear(adapterName) {
        const adapter = adapterName ? this.getAdapter(adapterName) : this.getBestAdapter();
        return await adapter.clear();
    }
}

// LocalStorage Adapter
class LocalStorageAdapter {
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    async get(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error('LocalStorage get error:', e);
            return null;
        }
    }

    async set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('LocalStorage set error:', e);
            return false;
        }
    }

    async remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('LocalStorage remove error:', e);
            return false;
        }
    }

    async clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('LocalStorage clear error:', e);
            return false;
        }
    }
}

// IndexedDB Adapter
class IndexedDBAdapter {
    constructor(dbName = 'PaymentPlannerDB', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    isAvailable() {
        return 'indexedDB' in window;
    }

    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('data')) {
                    db.createObjectStore('data', { keyPath: 'key' });
                }
            };
        });
    }

    async get(key) {
        try {
            await this.init();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['data'], 'readonly');
                const store = transaction.objectStore('data');
                const request = store.get(key);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result ? result.value : null);
                };
            });
        } catch (e) {
            console.error('IndexedDB get error:', e);
            return null;
        }
    }

    async set(key, value) {
        try {
            await this.init();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['data'], 'readwrite');
                const store = transaction.objectStore('data');
                const request = store.put({ key, value, timestamp: Date.now() });

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(true);
            });
        } catch (e) {
            console.error('IndexedDB set error:', e);
            return false;
        }
    }

    async remove(key) {
        try {
            await this.init();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['data'], 'readwrite');
                const store = transaction.objectStore('data');
                const request = store.delete(key);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(true);
            });
        } catch (e) {
            console.error('IndexedDB remove error:', e);
            return false;
        }
    }

    async clear() {
        try {
            await this.init();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['data'], 'readwrite');
                const store = transaction.objectStore('data');
                const request = store.clear();

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(true);
            });
        } catch (e) {
            console.error('IndexedDB clear error:', e);
            return false;
        }
    }
}

// Memory Adapter (fallback)
class MemoryAdapter {
    constructor() {
        this.storage = new Map();
    }

    isAvailable() {
        return true;
    }

    async get(key) {
        return this.storage.get(key) || null;
    }

    async set(key, value) {
        this.storage.set(key, value);
        return true;
    }

    async remove(key) {
        return this.storage.delete(key);
    }

    async clear() {
        this.storage.clear();
        return true;
    }
}

// Initialize default storage provider
const storageProvider = new StorageProvider();

// Register adapters
storageProvider.registerAdapter('localStorage', new LocalStorageAdapter());
storageProvider.registerAdapter('indexedDB', new IndexedDBAdapter());
storageProvider.registerAdapter('memory', new MemoryAdapter());

// Global access
window.StorageProvider = StorageProvider;
window.storageProvider = storageProvider;

export { StorageProvider, LocalStorageAdapter, IndexedDBAdapter, MemoryAdapter };
export default storageProvider;
