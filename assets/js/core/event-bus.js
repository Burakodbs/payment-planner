// Core Event Bus - Simple Observer Pattern Implementation
class EventBus {
    constructor() {
        this.events = new Map();
        this.middlewares = [];
    }

    // Subscribe to events
    on(eventName, callback, options = {}) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        const listener = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            id: this.generateId()
        };
        
        this.events.get(eventName).push(listener);
        
        // Sort by priority (higher first)
        this.events.get(eventName).sort((a, b) => b.priority - a.priority);
        
        return listener.id;
    }

    // Subscribe once
    once(eventName, callback, options = {}) {
        return this.on(eventName, callback, { ...options, once: true });
    }

    // Unsubscribe
    off(eventName, listenerId) {
        if (!this.events.has(eventName)) return false;
        
        const listeners = this.events.get(eventName);
        const index = listeners.findIndex(l => l.id === listenerId);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            return true;
        }
        
        return false;
    }

    // Emit events
    emit(eventName, data = {}) {
        if (!this.events.has(eventName)) return;

        const listeners = this.events.get(eventName);
        const event = {
            name: eventName,
            data,
            timestamp: Date.now(),
            preventDefault: false
        };

        // Apply middlewares
        for (const middleware of this.middlewares) {
            try {
                middleware(event);
                if (event.preventDefault) break;
            } catch (error) {
                console.error('EventBus middleware error:', error);
            }
        }

        if (event.preventDefault) return;

        // Call listeners
        for (let i = listeners.length - 1; i >= 0; i--) {
            const listener = listeners[i];
            
            try {
                listener.callback(event.data, event);
                
                // Remove if 'once'
                if (listener.once) {
                    listeners.splice(i, 1);
                }
            } catch (error) {
                console.error(`EventBus listener error for '${eventName}':`, error);
            }
        }
    }

    // Add middleware
    use(middleware) {
        this.middlewares.push(middleware);
    }

    // Generate unique ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Debug helpers
    getEvents() {
        const result = {};
        this.events.forEach((listeners, eventName) => {
            result[eventName] = listeners.length;
        });
        return result;
    }

    clear() {
        this.events.clear();
    }
}

// Global instance
window.EventBus = EventBus;
window.eventBus = new EventBus();

// Debug mode
if (window.APP_DEBUG) {
    window.eventBus.use((event) => {
        console.log(`📢 Event: ${event.name}`, event.data);
    });
}

export { EventBus };
export default window.eventBus;
