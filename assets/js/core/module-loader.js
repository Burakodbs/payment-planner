// Module System - Modern modular loading with dependency injection
class ModuleLoader {
    constructor() {
        this.modules = new Map();
        this.dependencies = new Map();
        this.loading = new Set();
        this.loaded = new Set();
        this.config = {};
    }

    // Register a module
    register(name, factory, dependencies = []) {
        if (this.modules.has(name)) {
            throw new Error(`Module '${name}' already registered`);
        }

        this.modules.set(name, {
            name,
            factory,
            dependencies,
            instance: null,
            singleton: true // Default to singleton
        });

        this.dependencies.set(name, dependencies);
        
        this.debug(`📦 Registered module: ${name}`, dependencies);
        return this;
    }

    // Load a module
    async load(name) {
        if (this.loaded.has(name)) {
            return this.modules.get(name).instance;
        }

        if (this.loading.has(name)) {
            throw new Error(`Circular dependency detected: ${name}`);
        }

        this.loading.add(name);

        try {
            const moduleInfo = this.modules.get(name);
            if (!moduleInfo) {
                throw new Error(`Module '${name}' not found`);
            }

            // Load dependencies first
            const deps = {};
            for (const depName of moduleInfo.dependencies) {
                deps[depName] = await this.load(depName);
            }

            // Create instance
            const instance = await this.createInstance(moduleInfo, deps);
            
            moduleInfo.instance = instance;
            this.loaded.add(name);
            this.loading.delete(name);

            this.debug(`✅ Loaded module: ${name}`);
            
            // Emit module loaded event
            if (window.eventBus) {
                window.eventBus.emit('module:loaded', { name, instance });
            }

            return instance;
        } catch (error) {
            this.loading.delete(name);
            console.error(`❌ Failed to load module '${name}':`, error);
            throw error;
        }
    }

    // Create module instance
    async createInstance(moduleInfo, dependencies) {
        const { factory } = moduleInfo;
        
        if (typeof factory === 'function') {
            return await factory(dependencies, this.config);
        } else if (typeof factory === 'object') {
            return factory;
        } else {
            throw new Error(`Invalid module factory for '${moduleInfo.name}'`);
        }
    }

    // Load multiple modules
    async loadAll(names) {
        const results = {};
        for (const name of names) {
            results[name] = await this.load(name);
        }
        return results;
    }

    // Get module instance
    get(name) {
        const moduleInfo = this.modules.get(name);
        return moduleInfo ? moduleInfo.instance : null;
    }

    // Check if module is loaded
    isLoaded(name) {
        return this.loaded.has(name);
    }

    // Configure module system
    configure(config) {
        this.config = { ...this.config, ...config };
    }

    // Debug helper
    debug(message, data) {
        if (this.config.debug || window.APP_DEBUG) {
            console.log(message, data);
        }
    }

    // Get dependency graph
    getDependencyGraph() {
        const graph = {};
        this.dependencies.forEach((deps, moduleName) => {
            graph[moduleName] = deps;
        });
        return graph;
    }

    // Clear all modules
    clear() {
        this.modules.clear();
        this.dependencies.clear();
        this.loading.clear();
        this.loaded.clear();
    }
}

// Global instance
window.ModuleLoader = ModuleLoader;
window.moduleLoader = new ModuleLoader();

// Configure for debug mode
if (window.APP_DEBUG) {
    window.moduleLoader.configure({ debug: true });
}

export { ModuleLoader };
export default window.moduleLoader;
