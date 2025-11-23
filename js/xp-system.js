/**
 * XP System - Game-like progression tracking for content reading
 */
class XPSystem {
    constructor() {
        this.pages = [
            'welcome',
            'bio',
            'writing',
            'quotes',
            'questions',
            'investments'
        ];

        // XP configuration
        this.config = {
            xpPerScroll: 2, // XP gained per 10% of page scrolled
            xpPerPageComplete: 50, // Bonus XP for completing a page
            xpPerLevel: 100, // XP needed per level (increases by 50 each level)
            levelMultiplier: 1.5 // Level requirement multiplier
        };

        // Get current persona
        this.currentPersona = localStorage.getItem('bustling_v2_persona') || 'founder';

        // Load saved progress or initialize (now persona-specific)
        this.progress = this.loadProgress() || this.initializeProgress();

        // Initialize UI
        this.initializeUI();

        // Start tracking
        this.startTracking();

        // Update UI immediately
        this.updateUI();

        // Listen for persona changes
        this.listenForPersonaChanges();
    }

    initializeProgress() {
        return {
            level: 1,
            currentXP: 0,
            totalXP: 0,
            pageProgress: {},
            completedPages: [],
            lastVisited: null
        };
    }

    loadProgress() {
        // Load persona-specific progress
        const key = `xpSystemProgress_${this.currentPersona}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                const data = JSON.parse(saved);
                console.log(`XP System: Loaded progress for ${this.currentPersona}`, data);
                return data;
            } catch (e) {
                console.error('XP System: Error parsing saved progress', e);
                return null;
            }
        }

        return null;
    }

    saveProgress() {
        // Save persona-specific progress (no timestamp, just data)
        const key = `xpSystemProgress_${this.currentPersona}`;

        try {
            localStorage.setItem(key, JSON.stringify(this.progress));
            console.log(`XP System: Saved progress for ${this.currentPersona}`, this.progress);
        } catch (e) {
            console.error('XP System: Error saving progress', e);
        }
    }

    initializeUI() {
        // Add scroll tracking for current page
        this.currentPage = this.getCurrentPage();

        // Initialize page progress if not exists
        if (!this.progress.pageProgress[this.currentPage]) {
            this.progress.pageProgress[this.currentPage] = 0;
        }

        // Click handler for "Next Unread" button
        const nextUnreadBtn = document.getElementById('nextUnread');
        if (nextUnreadBtn) {
            nextUnreadBtn.addEventListener('click', () => this.goToNextUnread());
        }
    }

    getCurrentPage() {
        // Get current page from URL or active nav link
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'welcome';

        const pageName = path.replace('/', '').replace('.html', '');
        return this.pages.includes(pageName) ? pageName : 'welcome';
    }

    startTracking() {
        let scrollTimeout;
        let lastScrollPercentage = this.progress.pageProgress[this.currentPage] || 0;

        // Track scroll progress
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
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
            }, 200);
        });

        // Track page navigation
        window.addEventListener('popstate', () => {
            this.currentPage = this.getCurrentPage();
            this.updateUI();
        });
    }

    calculateScrollPercentage() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;

        if (documentHeight <= 0) return 100;

        const percentage = Math.min(100, Math.floor((scrolled / documentHeight) * 100));
        return percentage;
    }

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

    getRequiredXPForLevel(level) {
        return Math.floor(this.config.xpPerLevel * Math.pow(this.config.levelMultiplier, level - 1));
    }

    showXPGain(amount, prefix = '') {
        const popup = document.createElement('div');
        popup.className = 'xp-gain-popup';
        popup.textContent = `${prefix}+${amount} XP`;

        // Position near the XP bar
        const xpBar = document.querySelector('.xp-bar-container');
        if (xpBar) {
            const rect = xpBar.getBoundingClientRect();
            popup.style.left = rect.left + rect.width / 2 + 'px';
            popup.style.top = rect.top + 'px';
        }

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1500);
    }

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

    goToNextUnread() {
        // Find the next unread page
        const unreadPages = this.pages.filter(page =>
            !this.progress.completedPages.includes(page) && page !== this.currentPage
        );

        if (unreadPages.length > 0) {
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
        } else {
            this.showAchievement('🏆 All pages completed!');
        }
    }

    listenForPersonaChanges() {
        // Listen for storage changes (persona switches)
        window.addEventListener('storage', (e) => {
            if (e.key === 'bustling_v2_persona' && e.newValue !== this.currentPersona) {
                this.handlePersonaChange(e.newValue);
            }
        });

        // Also listen for custom persona change events
        window.addEventListener('personaChanged', (e) => {
            if (e.detail && e.detail.persona !== this.currentPersona) {
                this.handlePersonaChange(e.detail.persona);
            }
        });
    }

    handlePersonaChange(newPersona) {
        console.log(`XP System: Switching from ${this.currentPersona} to ${newPersona}`);

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

    updateUI() {
        const requiredXP = this.getRequiredXPForLevel(this.progress.level);
        const percentage = Math.floor((this.progress.currentXP / requiredXP) * 100);

        // Update level
        const levelElement = document.getElementById('currentLevel');
        if (levelElement) levelElement.textContent = this.progress.level;

        // Update XP
        const currentXPElement = document.getElementById('currentXP');
        if (currentXPElement) currentXPElement.textContent = this.progress.currentXP;

        const maxXPElement = document.getElementById('maxXP');
        if (maxXPElement) maxXPElement.textContent = requiredXP;

        // Update XP bar
        const xpBarFill = document.getElementById('xpBarFill');
        if (xpBarFill) {
            xpBarFill.style.width = `${percentage}%`;
        }

        // Update percentage
        const xpPercentage = document.getElementById('xpPercentage');
        if (xpPercentage) xpPercentage.textContent = `${percentage}%`;

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
                nextUnread.querySelector('.stat-value').textContent = 'All Done!';
                nextUnread.style.opacity = '0.5';
                nextUnread.style.cursor = 'default';
            } else {
                nextUnread.querySelector('.stat-value').textContent = `${unreadCount} left`;
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Clean up existing instance if any
        if (window.xpSystem) {
            console.log('XP System: Cleaning up existing instance');
        }
        window.xpSystem = new XPSystem();
    });
} else {
    // Clean up existing instance if any
    if (window.xpSystem) {
        console.log('XP System: Cleaning up existing instance');
    }
    window.xpSystem = new XPSystem();
}