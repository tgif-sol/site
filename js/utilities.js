/**
 * Utilities - Shared utility functions and constants
 * @module Utilities
 * @author Alan James Curtis
 * @version 2.0.0
 */

'use strict';

/**
 * Application Constants
 * Centralized configuration and storage keys
 */
const AppConstants = {
    // LocalStorage Keys
    STORAGE_KEYS: {
        VISITED: 'gaming_visited',
        PERSONA: 'gaming_persona',
        XP_PROGRESS: (persona) => `xpSystemProgress_${persona}`,
        READING_PROGRESS: (persona) => `readingProgress_${persona}`
    },

    // Default Values
    DEFAULTS: {
        PERSONA: 'founder',
        EXPIRATION_DAYS: 3
    },

    // Breakpoints
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 1024
    },

    // Animation Durations (ms)
    ANIMATION: {
        FAST: 200,
        NORMAL: 300,
        SLOW: 500
    }
};

/**
 * Storage Utility
 * Centralized localStorage management
 */
const Storage = {
    /**
     * Get persona from storage
     * @returns {string} Current persona or default
     */
    getPersona() {
        return localStorage.getItem(AppConstants.STORAGE_KEYS.PERSONA) || AppConstants.DEFAULTS.PERSONA;
    },

    /**
     * Set persona in storage
     * @param {string} persona - Persona to set
     */
    setPersona(persona) {
        localStorage.setItem(AppConstants.STORAGE_KEYS.PERSONA, persona);
    },

    /**
     * Check if user has visited
     * @returns {boolean} True if visited
     */
    hasVisited() {
        return !!localStorage.getItem(AppConstants.STORAGE_KEYS.VISITED);
    },

    /**
     * Mark user as visited
     */
    markVisited() {
        localStorage.setItem(AppConstants.STORAGE_KEYS.VISITED, 'true');
    },

    /**
     * Clear all gaming-related storage
     */
    clearAll() {
        localStorage.removeItem(AppConstants.STORAGE_KEYS.VISITED);
        localStorage.removeItem(AppConstants.STORAGE_KEYS.PERSONA);
    },

    /**
     * Get expiration date (3 days from now)
     * @returns {number} Timestamp
     */
    getExpirationDate() {
        return Date.now() + (AppConstants.DEFAULTS.EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    }
};

/**
 * Device Detection Utility
 */
const Device = {
    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile
     */
    isMobile() {
        return window.innerWidth <= AppConstants.BREAKPOINTS.MOBILE;
    },

    /**
     * Check if device is tablet
     * @returns {boolean} True if tablet
     */
    isTablet() {
        return window.innerWidth > AppConstants.BREAKPOINTS.MOBILE && 
               window.innerWidth <= AppConstants.BREAKPOINTS.TABLET;
    },

    /**
     * Check if device is desktop
     * @returns {boolean} True if desktop
     */
    isDesktop() {
        return window.innerWidth > AppConstants.BREAKPOINTS.MOBILE;
    },

    /**
     * Check if device supports touch
     * @returns {boolean} True if touch device
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
};

/**
 * DOM Utility Functions
 */
const DOM = {
    /**
     * Show loading state
     * @param {string|HTMLElement} elementId - Element ID or element
     * @param {string} message - Loading message
     */
    showLoading(elementId, message = 'Loading...') {
        const element = typeof elementId === 'string' 
            ? document.getElementById(elementId) 
            : elementId;
        
        if (element) {
            element.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <span>${message}</span>
                </div>
            `;
        }
    },

    /**
     * Show error state
     * @param {string|HTMLElement} elementId - Element ID or element
     * @param {string} message - Error message
     */
    showError(elementId, message = 'An error occurred') {
        const element = typeof elementId === 'string' 
            ? document.getElementById(elementId) 
            : elementId;
        
        if (element) {
            element.innerHTML = `
                <div class="error-state">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    },

    /**
     * Show empty state
     * @param {string|HTMLElement} elementId - Element ID or element
     * @param {string} message - Empty state message
     */
    showEmpty(elementId, message = 'No content available') {
        const element = typeof elementId === 'string' 
            ? document.getElementById(elementId) 
            : elementId;
        
        if (element) {
            element.innerHTML = `<p class="empty-state">${message}</p>`;
        }
    },

    /**
     * Scroll to element smoothly
     * @param {string|HTMLElement} target - Target element or selector
     * @param {object} options - Scroll options
     */
    scrollTo(target, options = {}) {
        const element = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
        
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                ...options
            });
        }
    }
};

/**
 * URL Routing Utility
 * Hash-based navigation for split-view pages
 */
const Router = {
    /**
     * Initialize router
     * @param {object} config - Router configuration
     */
    init(config) {
        this.config = config;
        this.loadFromHash();

        window.addEventListener('hashchange', () => this.loadFromHash());

        // Set up click handlers
        document.querySelectorAll(`[${config.attribute}]`).forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const key = e.target.dataset[config.datasetKey];
                if (key) {
                    window.location.hash = key;
                }
            });
        });
    },

    /**
     * Load content from hash
     */
    loadFromHash() {
        const hash = window.location.hash.slice(1);

        if (hash && this.config.data[hash]) {
            this.renderContent(hash);
            this.updateActiveState(hash);
        } else if (this.config.defaultHash) {
            window.location.hash = this.config.defaultHash;
        }
    },

    /**
     * Render content
     * @param {string} key - Content key
     */
    renderContent(key) {
        const data = this.config.data[key];
        if (data && this.config.render) {
            const html = this.config.render(data);
            const container = document.getElementById(this.config.contentId);
            if (container) {
                container.innerHTML = html;
            }
        }
    },

    /**
     * Update active state
     * @param {string} key - Active key
     */
    updateActiveState(key) {
        document.querySelectorAll(`[${this.config.attribute}]`).forEach(l => {
            l.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[${this.config.attribute}="${key}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
};

/**
 * Image Lazy Loading
 * Uses IntersectionObserver for performance
 */
const LazyLoader = {
    /**
     * Initialize lazy loading for images
     */
    init() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: load all images immediately
            document.querySelectorAll('img[data-src]').forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
};

/**
 * Initialize utilities on DOM ready
 */
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize lazy loading
            LazyLoader.init();

            // Setup smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href && href !== '#') {
                        e.preventDefault();
                        DOM.scrollTo(href);
                    }
                });
            });

            // Keep Router available globally for compatibility
            if (typeof Router !== 'undefined') {
                window.Router = Router;
            }
        });
    } else {
        LazyLoader.init();
    }
})();

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppConstants,
        Storage,
        Device,
        DOM,
        Router,
        LazyLoader
    };
}

// Make available globally
window.AppConstants = AppConstants;
window.Storage = Storage;
window.Device = Device;
window.DOM = DOM;
