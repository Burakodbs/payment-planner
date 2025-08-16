// Central Application State Store - Redux-inspired but simpler
class AppStore {
    constructor() {
        this.state = this.getInitialState();
        this.reducers = new Map();
        this.subscribers = new Set();
        this.middleware = [];
        this.history = [];
        this.maxHistorySize = 50;
        this.isDispatching = false;
    }

    // Initial state
    getInitialState() {
        return {
            // Core data
            expenses: [],
            regularPayments: [],
            creditCards: [],
            people: [],
            
            // UI state
            ui: {
                loading: false,
                currentPage: '',
                modals: {},
                filters: {},
                notifications: []
            },
            
            // Auth state
            auth: {
                currentUser: null,
                isAuthenticated: false,
                sessionExpiry: null
            },
            
            // App state
            app: {
                version: '3.1.0',
                lastSync: null,
                isOnline: navigator.onLine,
                theme: 'light'
            }
        };
    }

    // Register reducer
    registerReducer(name, reducer) {
        if (typeof reducer !== 'function') {
            throw new Error(`Reducer '${name}' must be a function`);
        }
        this.reducers.set(name, reducer);
    }

    // Add middleware
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        this.middleware.push(middleware);
    }

    // Get current state
    getState() {
        return { ...this.state }; // Return copy to prevent mutations
    }

    // Get specific part of state
    getStateSlice(path) {
        return this.getNestedValue(this.state, path);
    }

    // Subscribe to state changes
    subscribe(callback, filter = null) {
        if (typeof callback !== 'function') {
            throw new Error('Subscriber must be a function');
        }

        const subscriber = { callback, filter, id: this.generateId() };
        this.subscribers.add(subscriber);

        // Return unsubscribe function
        return () => {
            this.subscribers.delete(subscriber);
        };
    }

    // Dispatch action
    dispatch(action) {
        if (this.isDispatching) {
            throw new Error('Cannot dispatch while already dispatching');
        }

        if (!action || typeof action.type !== 'string') {
            throw new Error('Action must have a type property');
        }

        this.isDispatching = true;

        try {
            // Store previous state for history
            const prevState = { ...this.state };

            // Apply middleware
            let processedAction = action;
            for (const middleware of this.middleware) {
                processedAction = middleware(processedAction, this.state, this.dispatch.bind(this));
                if (!processedAction) break;
            }

            if (!processedAction) {
                this.isDispatching = false;
                return;
            }

            // Apply reducers
            let newState = { ...this.state };
            let hasChanged = false;

            for (const [name, reducer] of this.reducers) {
                try {
                    const slice = newState[name];
                    const newSlice = reducer(slice, processedAction, newState);
                    
                    if (newSlice !== slice) {
                        newState[name] = newSlice;
                        hasChanged = true;
                    }
                } catch (error) {
                    console.error(`Reducer '${name}' error:`, error);
                }
            }

            // Update state if changed
            if (hasChanged) {
                this.state = newState;
                
                // Add to history
                this.addToHistory({
                    action: processedAction,
                    prevState,
                    newState: { ...newState },
                    timestamp: Date.now()
                });

                // Notify subscribers
                this.notifySubscribers(processedAction, prevState, newState);

                // Emit global event
                if (window.eventBus) {
                    window.eventBus.emit('state:changed', {
                        action: processedAction,
                        prevState,
                        newState
                    });
                }
            }

        } finally {
            this.isDispatching = false;
        }
    }

    // Notify subscribers
    notifySubscribers(action, prevState, newState) {
        for (const subscriber of this.subscribers) {
            try {
                // Apply filter if specified
                if (subscriber.filter) {
                    if (typeof subscriber.filter === 'string') {
                        // Path filter
                        const prevValue = this.getNestedValue(prevState, subscriber.filter);
                        const newValue = this.getNestedValue(newState, subscriber.filter);
                        if (prevValue === newValue) continue;
                    } else if (typeof subscriber.filter === 'function') {
                        // Function filter
                        if (!subscriber.filter(action, prevState, newState)) continue;
                    }
                }

                subscriber.callback(newState, prevState, action);
            } catch (error) {
                console.error('Subscriber error:', error);
            }
        }
    }

    // Add to history
    addToHistory(entry) {
        this.history.push(entry);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    // Helper to get nested value
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key];
        }, obj);
    }

    // Generate unique ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Debug helpers
    getHistory() {
        return [...this.history];
    }

    getSubscriberCount() {
        return this.subscribers.size;
    }

    getReducers() {
        return Array.from(this.reducers.keys());
    }

    // Reset store
    reset() {
        this.state = this.getInitialState();
        this.history = [];
        this.notifySubscribers({ type: 'STORE_RESET' }, {}, this.state);
    }
}

// Action creators helpers
const createAction = (type, payload = {}) => ({ type, payload, timestamp: Date.now() });

const createAsyncAction = (type) => ({
    request: (payload) => createAction(`${type}_REQUEST`, payload),
    success: (payload) => createAction(`${type}_SUCCESS`, payload),
    failure: (payload) => createAction(`${type}_FAILURE`, payload)
});

// Global store instance
window.AppStore = AppStore;
window.appStore = new AppStore();
window.createAction = createAction;
window.createAsyncAction = createAsyncAction;

// Development helpers
if (window.APP_DEBUG) {
    window.appStore.use((action, state) => {
        console.log(`🔄 Action: ${action.type}`, action.payload);
        return action;
    });
    
    // Global access for debugging
    window.getState = () => window.appStore.getState();
    window.dispatch = (action) => window.appStore.dispatch(action);
}

export { AppStore, createAction, createAsyncAction };
export default window.appStore;
