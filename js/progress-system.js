/**
 * Progress System - Tracks reading progress across all pages
 * @module ProgressSystem
 * @author Alan James Curtis
 * @version 2.0.0
 */

'use strict';

/**
 * Progress System Class
 * Tracks page visits and calculates total reading progress
 */
class ProgressSystem {
    /**
     * @constructor
     */
    constructor() {
        /** @type {string[]} */
        this.pages = [
            'welcome',
            'bio',
            'writing',
            'quotes',
            'questions',
            'investments'
        ];

        /** @type {string} */
        this.currentPersona = Storage.getPersona();

        /** @type {object} */
        this.progress = this.loadProgress() || this.initializeProgress();

        /** @type {string} */
        this.currentPage = this.getCurrentPage();

        /** @type {number|null} */
        this.counterTimer = null;

        /** @type {MutationObserver|null} */
        this.observer = null;

        // Initialize pagesVisited array if it doesn't exist
        if (!this.progress.pagesVisited) {
            this.progress.pagesVisited = [];
        }

        // Mark current page as visited on first visit for this persona
        if (!this.progress.initialized) {
            if (!this.progress.pagesVisited.includes(this.currentPage)) {
                this.progress.pagesVisited.push(this.currentPage);
            }
            this.progress.initialized = true;
            this.saveProgress();
        }

        this.startTracking();
        this.updateUI();
        this.listenForPersonaChanges();
    }

    /**
     * Initialize progress data structure
     * @returns {object} Initial progress object
     */
    initializeProgress() {
        return {
            initialized: false,
            pagesVisited: [],
            totalProgress: 0,
            expireDate: Storage.getExpirationDate()
        };
    }

    /**
     * Load progress from localStorage
     * @returns {object|null} Progress data or null if not found/expired
     */
    loadProgress() {
        const key = AppConstants.STORAGE_KEYS.READING_PROGRESS(this.currentPersona);
        const saved = localStorage.getItem(key);

        if (!saved) {
            return null;
        }

        try {
            const data = JSON.parse(saved);

            // Migrate old format with timestamp
            if (data.timestamp && data.progress) {
                return data.progress;
            }

            // Check if progress has expired
            if (data.expireDate && Date.now() > data.expireDate) {
                localStorage.removeItem(key);
                return null;
            }

            // Migrate old data: add expireDate if missing
            if (!data.expireDate) {
                data.expireDate = Storage.getExpirationDate();
                this.saveProgress();
            }

            return data;
        } catch (error) {
            console.error('Progress System: Error parsing saved progress', error);
            return null;
        }
    }

    /**
     * Save progress to localStorage
     * @param {string|null} persona - Persona to save for (defaults to current)
     */
    saveProgress(persona = null) {
        const targetPersona = persona || this.currentPersona;

        // Verify that we're saving to the correct persona
        const actualPersona = Storage.getPersona();
        if (targetPersona !== actualPersona) {
            return; // Skip save if persona mismatch
        }

        const key = AppConstants.STORAGE_KEYS.READING_PROGRESS(targetPersona);

        try {
            localStorage.setItem(key, JSON.stringify(this.progress));
        } catch (error) {
            console.error('Progress System: Error saving progress', error);
        }
    }

    /**
     * Get current page from URL
     * @returns {string} Current page name
     */
    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html' || path === '/#welcome') {
            return 'welcome';
        }

        // Handle hash-based routing
        const hash = window.location.hash.replace('#', '');
        if (hash && this.pages.includes(hash)) {
            return hash;
        }

        // Handle file-based routing
        const pageName = path.replace('/', '').replace('.html', '');
        return this.pages.includes(pageName) ? pageName : 'welcome';
    }

    /**
     * Start tracking page changes
     */
    startTracking() {
        const checkPageChange = () => {
            const activeLink = document.querySelector('.nav-link.active');
            if (activeLink) {
                const newPage = activeLink.dataset.page || 'welcome';
                if (newPage !== this.currentPage) {
                    this.currentPage = newPage;
                    this.onPageChange();
                }
            }
        };

        // Monitor DOM changes for navigation
        this.observer = new MutationObserver(() => {
            checkPageChange();
        });

        // Observe changes to nav links
        const navElement = document.querySelector('.nav-list');
        if (navElement) {
            this.observer.observe(navElement, {
                attributes: true,
                attributeFilter: ['class'],
                subtree: true
            });
        }

        // Also check on click events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                setTimeout(() => {
                    checkPageChange();
                }, AppConstants.ANIMATION.FAST);
            }
        });

        // Track page changes
        window.addEventListener('hashchange', () => {
            checkPageChange();
        });

        window.addEventListener('popstate', () => {
            checkPageChange();
        });
    }

    /**
     * Handle page change event
     */
    onPageChange() {
        // Mark page as visited if it's new
        if (!this.progress.pagesVisited) {
            this.progress.pagesVisited = [];
        }

        if (!this.progress.pagesVisited.includes(this.currentPage)) {
            this.progress.pagesVisited.push(this.currentPage);
            this.showXPGain();
        }

        this.calculateTotalProgress();
        this.saveProgress();
        this.updateUI();
    }

    /**
     * Calculate total progress based on pages visited
     */
    calculateTotalProgress() {
        if (!this.progress.pagesVisited) {
            this.progress.pagesVisited = [];
        }

        // Each visited page counts as 1/6 of total progress
        const visitedCount = Math.min(this.progress.pagesVisited.length, this.pages.length);
        this.progress.totalProgress = Math.min(100, Math.floor((visitedCount / this.pages.length) * 100));
    }

    /**
     * Show XP gain animation
     */
    showXPGain() {
        const xpText = document.getElementById('progressPercentage');
        if (xpText) {
            // Add a pulse effect when XP increases
            xpText.style.transform = 'scale(1.3)';
            xpText.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                xpText.style.transform = 'scale(1)';
            }, AppConstants.ANIMATION.NORMAL);
        }
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Calculate total progress first
        this.calculateTotalProgress();

        // Ensure percentage is within bounds (0-100)
        const targetPercentage = Math.max(0, Math.min(100, this.progress.totalProgress || 0));

        // Update progress bar with smooth animation
        const progressBarFill = document.getElementById('progressBarFill');
        if (progressBarFill) {
            progressBarFill.style.width = `${targetPercentage}%`;
        }

        // Animate percentage text counter
        const progressPercentage = document.getElementById('progressPercentage');
        if (progressPercentage) {
            // Parse current value and ensure it's valid
            const currentText = progressPercentage.textContent.replace('%', '').trim();
            let currentValue = parseInt(currentText) || 0;

            // Ensure current value is within bounds
            if (isNaN(currentValue) || currentValue < 0 || currentValue > 100) {
                currentValue = 0;
            }

            this.animateCounter(progressPercentage, currentValue, targetPercentage);
        }
    }

    /**
     * Animate counter from start to end value
     * @param {HTMLElement} element - Element to animate
     * @param {number} start - Start value
     * @param {number} end - End value
     */
    animateCounter(element, start, end) {
        // Clear any existing animation
        if (this.counterTimer) {
            clearInterval(this.counterTimer);
            this.counterTimer = null;
        }

        // Ensure values are valid numbers and within bounds (0-100)
        start = parseInt(start) || 0;
        end = parseInt(end) || 0;
        start = Math.max(0, Math.min(100, start));
        end = Math.max(0, Math.min(100, end));

        // If no change needed, just set the value
        if (start === end) {
            element.textContent = `${end}%`;
            return;
        }

        const duration = AppConstants.ANIMATION.NORMAL;
        const range = Math.abs(end - start);
        const increment = end > start ? 1 : -1;
        const stepTime = Math.max(10, Math.floor(duration / range));
        let current = start;

        this.counterTimer = setInterval(() => {
            current += increment;

            // Ensure current stays within bounds
            current = Math.max(0, Math.min(100, current));

            // Check if we've reached the target
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = Math.max(0, Math.min(100, end));
                element.textContent = `${current}%`;
                clearInterval(this.counterTimer);
                this.counterTimer = null;
            } else {
                element.textContent = `${current}%`;
            }
        }, stepTime);
    }

    /**
     * Listen for persona changes
     */
    listenForPersonaChanges() {
        // Listen for storage changes (cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === AppConstants.STORAGE_KEYS.PERSONA && e.newValue !== this.currentPersona) {
                this.handlePersonaChange(e.newValue);
            }
        });

        // Listen for custom persona change events
        window.addEventListener('personaChanged', (e) => {
            if (e.detail && e.detail.persona !== this.currentPersona) {
                this.handlePersonaChange(e.detail.persona);
            }
        });
    }

    /**
     * Handle persona change
     * @param {string} newPersona - New persona name
     */
    handlePersonaChange(newPersona) {
        // Save current progress with old persona before switching
        const oldPersona = this.currentPersona;
        this.saveProgress(oldPersona);

        // Update current persona
        this.currentPersona = newPersona;

        // Load new persona's progress
        const savedProgress = this.loadProgress();
        if (savedProgress) {
            this.progress = savedProgress;
        } else {
            // Initialize new persona
            this.progress = this.initializeProgress();
            const currentPage = this.getCurrentPage();
            if (!this.progress.pagesVisited.includes(currentPage)) {
                this.progress.pagesVisited.push(currentPage);
            }
            this.progress.initialized = true;
            this.saveProgress(newPersona);
        }

        // Update UI
        this.currentPage = this.getCurrentPage();
        this.calculateTotalProgress();
        this.updateUI();
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.counterTimer) {
            clearInterval(this.counterTimer);
            this.counterTimer = null;
        }
    }
}

// Initialize when DOM is ready
(function() {
    function init() {
        if (window.progressSystem) {
            // Clean up existing instance if any
            if (window.progressSystem.destroy) {
                window.progressSystem.destroy();
            }
        }
        window.progressSystem = new ProgressSystem();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
