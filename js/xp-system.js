/**
 * XP System - Game-like progression tracking for content reading
 * @module XPSystem
 * @author Alan James Curtis
 * @version 2.0.0
 */

'use strict';

/**
 * XP System Class
 * Tracks user progression through content with XP and leveling system
 */
class XPSystem {
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

        /** @type {object} */
        this.config = {
            xpPerScroll: 2,
            xpPerPageComplete: 50,
            xpPerLevel: 100,
            levelMultiplier: 1.5
        };

        /** @type {string} */
        this.currentPersona = Storage.getPersona();

        /** @type {object} */
        this.progress = this.loadProgress() || this.initializeProgress();

        /** @type {string} */
        this.currentPage = this.getCurrentPage();

        /** @type {number|null} */
        this.scrollTimeout = null;

        this.initializeUI();
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
            level: 1,
            currentXP: 0,
            totalXP: 0,
            pageProgress: {},
            completedPages: [],
            lastVisited: null,
            expireDate: Storage.getExpirationDate()
        };
    }

    /**
     * Load progress from localStorage
     * @returns {object|null} Progress data or null if not found/expired
     */
    loadProgress() {
        const key = AppConstants.STORAGE_KEYS.XP_PROGRESS(this.currentPersona);
        const saved = localStorage.getItem(key);

        if (!saved) {
            return null;
        }

        try {
            const data = JSON.parse(saved);

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
            console.error('XP System: Error parsing saved progress', error);
            return null;
        }
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        const key = AppConstants.STORAGE_KEYS.XP_PROGRESS(this.currentPersona);

        try {
            localStorage.setItem(key, JSON.stringify(this.progress));
        } catch (error) {
            console.error('XP System: Error saving progress', error);
        }
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Initialize page progress if not exists
        if (!this.progress.pageProgress[this.currentPage]) {
            this.progress.pageProgress[this.currentPage] = 0;
        }

        // Setup "Next Unread" button
        const nextUnreadBtn = document.getElementById('nextUnread');
        if (nextUnreadBtn) {
            nextUnreadBtn.addEventListener('click', () => this.goToNextUnread());
        }
    }

    /**
     * Get current page from URL
     * @returns {string} Current page name
     */
    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') {
            return 'welcome';
        }

        const pageName = path.replace('/', '').replace('.html', '');
        return this.pages.includes(pageName) ? pageName : 'welcome';
    }

    /**
     * Start tracking scroll and navigation
     */
    startTracking() {
        let lastScrollPercentage = this.progress.pageProgress[this.currentPage] || 0;

        // Track scroll progress
        window.addEventListener('scroll', () => {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }

            this.scrollTimeout = setTimeout(() => {
                const scrollPercentage = this.calculateScrollPercentage();
                const currentPageProgress = this.progress.pageProgress[this.currentPage] || 0;

                // Only update if scrolled further than before
                if (scrollPercentage > currentPageProgress) {
                    const progressDiff = scrollPercentage - currentPageProgress;
                    const xpGained = Math.floor(progressDiff / 10) * this.config.xpPerScroll;

                    if (xpGained > 0) {
                        this.addXP(xpGained, false);
                        this.showXPGain(xpGained);
                    }

                    this.progress.pageProgress[this.currentPage] = scrollPercentage;

                    // Check if page is complete
                    if (scrollPercentage >= 95 && !this.progress.completedPages.includes(this.currentPage)) {
                        this.progress.completedPages.push(this.currentPage);
                        this.addXP(this.config.xpPerPageComplete, false);
                        this.showXPGain(this.config.xpPerPageComplete, 'Page Complete! ');
                        this.showAchievement(`📖 ${this.getPageDisplayName(this.currentPage)} Completed!`);
                    }

                    this.saveProgress();
                    this.updateUI();
                }
            }, AppConstants.ANIMATION.FAST);
        });

        // Track page navigation
        window.addEventListener('popstate', () => {
            this.currentPage = this.getCurrentPage();
            this.updateUI();
        });
    }

    /**
     * Calculate scroll percentage
     * @returns {number} Scroll percentage (0-100)
     */
    calculateScrollPercentage() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;

        if (documentHeight <= 0) {
            return 100;
        }

        return Math.min(100, Math.floor((scrolled / documentHeight) * 100));
    }

    /**
     * Add XP to progress
     * @param {number} amount - XP amount to add
     * @param {boolean} showGain - Whether to show XP gain animation
     */
    addXP(amount, showGain = true) {
        this.progress.currentXP += amount;
        this.progress.totalXP += amount;

        // Check for level up
        const requiredXP = this.getRequiredXPForLevel(this.progress.level);

        while (this.progress.currentXP >= requiredXP) {
            this.progress.currentXP -= requiredXP;
            this.progress.level++;
            this.showLevelUp();
        }

        if (showGain) {
            this.showXPGain(amount);
        }
    }

    /**
     * Get required XP for a level
     * @param {number} level - Level number
     * @returns {number} Required XP
     */
    getRequiredXPForLevel(level) {
        return Math.floor(
            this.config.xpPerLevel * Math.pow(this.config.levelMultiplier, level - 1)
        );
    }

    /**
     * Show XP gain animation
     * @param {number} amount - XP amount gained
     * @param {string} prefix - Prefix text
     */
    showXPGain(amount, prefix = '') {
        const popup = document.createElement('div');
        popup.className = 'xp-gain-popup';
        popup.textContent = `${prefix}+${amount} XP`;

        // Position near the XP bar
        const xpBar = document.querySelector('.xp-bar-container');
        if (xpBar) {
            const rect = xpBar.getBoundingClientRect();
            popup.style.left = `${rect.left + rect.width / 2}px`;
            popup.style.top = `${rect.top}px`;
        }

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1500);
    }

    /**
     * Show level up notification
     */
    showLevelUp() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #2C1810;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.5rem;
            font-weight: bold;
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.6);
            z-index: 10001;
            animation: levelUpPulse 0.6s ease-out;
        `;
        notification.innerHTML = `
            <div>🎉 LEVEL UP! 🎉</div>
            <div style="font-size: 2rem; margin-top: 10px;">Level ${this.progress.level}</div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    /**
     * Show achievement notification
     * @param {string} text - Achievement text
     */
    showAchievement(text) {
        const achievement = document.createElement('div');
        achievement.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(40, 35, 50, 0.95));
            border: 2px solid #FFD700;
            color: #FFD700;
            padding: 15px 20px;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: bold;
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
        `;
        achievement.textContent = text;

        document.body.appendChild(achievement);
        setTimeout(() => achievement.remove(), 3000);
    }

    /**
     * Get display name for a page
     * @param {string} page - Page key
     * @returns {string} Display name
     */
    getPageDisplayName(page) {
        const names = {
            'welcome': 'Welcome',
            'bio': 'Biography',
            'writing': 'Writing',
            'quotes': 'Quotes',
            'questions': 'Questions',
            'investments': 'Investments'
        };
        return names[page] || page;
    }

    /**
     * Navigate to next unread page
     */
    goToNextUnread() {
        const unreadPages = this.pages.filter(page =>
            !this.progress.completedPages.includes(page) && page !== this.currentPage
        );

        if (unreadPages.length === 0) {
            this.showAchievement('🏆 All pages completed!');
            return;
        }

        // Sort by least progress
        unreadPages.sort((a, b) =>
            (this.progress.pageProgress[a] || 0) - (this.progress.pageProgress[b] || 0)
        );

        const nextPage = unreadPages[0];

        // Navigate to the page
        if (nextPage === 'welcome') {
            window.location.href = '/';
        } else {
            window.location.href = `/${nextPage}.html`;
        }
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
        // Save current progress before switching
        this.saveProgress();

        // Update current persona
        this.currentPersona = newPersona;

        // Load new persona's progress
        this.progress = this.loadProgress() || this.initializeProgress();

        // Reset current page tracking
        this.currentPage = this.getCurrentPage();
        if (!this.progress.pageProgress[this.currentPage]) {
            this.progress.pageProgress[this.currentPage] = 0;
        }

        // Update UI with new persona's progress
        this.updateUI();
    }

    /**
     * Update UI elements
     */
    updateUI() {
        const requiredXP = this.getRequiredXPForLevel(this.progress.level);
        const percentage = Math.floor((this.progress.currentXP / requiredXP) * 100);

        // Update level
        const levelElement = document.getElementById('currentLevel');
        if (levelElement) {
            levelElement.textContent = this.progress.level;
        }

        // Update XP
        const currentXPElement = document.getElementById('currentXP');
        if (currentXPElement) {
            currentXPElement.textContent = this.progress.currentXP;
        }

        const maxXPElement = document.getElementById('maxXP');
        if (maxXPElement) {
            maxXPElement.textContent = requiredXP;
        }

        // Update XP bar
        const xpBarFill = document.getElementById('xpBarFill');
        if (xpBarFill) {
            xpBarFill.style.width = `${percentage}%`;
        }

        // Update percentage
        const xpPercentage = document.getElementById('xpPercentage');
        if (xpPercentage) {
            xpPercentage.textContent = `${percentage}%`;
        }

        // Update pages read
        const pagesRead = document.getElementById('pagesRead');
        if (pagesRead) {
            pagesRead.textContent = `${this.progress.completedPages.length}/${this.pages.length}`;
        }

        // Update next unread button
        const nextUnread = document.getElementById('nextUnread');
        if (nextUnread) {
            const unreadCount = this.pages.length - this.progress.completedPages.length;
            if (unreadCount === 0) {
                const statValue = nextUnread.querySelector('.stat-value');
                if (statValue) {
                    statValue.textContent = 'All Done!';
                }
                nextUnread.style.opacity = '0.5';
                nextUnread.style.cursor = 'default';
            } else {
                const statValue = nextUnread.querySelector('.stat-value');
                if (statValue) {
                    statValue.textContent = `${unreadCount} left`;
                }
                nextUnread.style.opacity = '1';
                nextUnread.style.cursor = 'pointer';
            }
        }
    }
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes levelUpPulse {
        0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
(function() {
    function init() {
        if (window.xpSystem) {
            // Clean up existing instance if any
            return;
        }
        window.xpSystem = new XPSystem();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
