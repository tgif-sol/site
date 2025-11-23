/**
 * Simple Progress System - Tracks reading progress across all pages
 */
class ProgressSystem {
    constructor() {
        this.pages = [
            'welcome',
            'bio',
            'writing',
            'quotes',
            'questions',
            'investments'
        ];

        // Get current persona for persona-specific progress
        this.currentPersona = localStorage.getItem('bustling_v2_persona') || 'founder';

        // Load or initialize progress (now persona-specific)
        this.progress = this.loadProgress() || this.initializeProgress();

        // Initialize pagesVisited array if it doesn't exist
        if (!this.progress.pagesVisited) {
            this.progress.pagesVisited = [];
        }

        // Mark current page as visited on first visit for this persona
        if (!this.progress.initialized) {
            const currentPage = this.getCurrentPage();
            if (!this.progress.pagesVisited.includes(currentPage)) {
                this.progress.pagesVisited.push(currentPage);
                console.log(`Progress System: Initial page ${currentPage} added for ${this.currentPersona}`);
            }
            this.progress.initialized = true;
            this.saveProgress();
        }

        // Initialize tracking
        this.currentPage = this.getCurrentPage();
        this.startTracking();
        this.updateUI();

        // Listen for persona changes
        this.listenForPersonaChanges();
    }

    initializeProgress() {
        return {
            initialized: false,
            pagesVisited: [],
            totalProgress: 0
        };
    }

    loadProgress() {
        // Load persona-specific progress
        const key = `readingProgress_${this.currentPersona}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                const data = JSON.parse(saved);

                // If old format with timestamp, extract just the progress
                if (data.timestamp && data.progress) {
                    console.log(`Progress System: Migrating old format for ${this.currentPersona}`);
                    return data.progress;
                }

                // Otherwise use data directly
                console.log(`Progress System: Loaded progress for ${this.currentPersona}`, data);
                return data;
            } catch (e) {
                console.error('Progress System: Error parsing saved progress', e);
                return null;
            }
        }

        return null;
    }

    saveProgress(persona = null) {
        // Use provided persona or current persona
        const targetPersona = persona || this.currentPersona;
        
        // Verify that we're saving to the correct persona
        const actualPersona = localStorage.getItem('bustling_v2_persona') || 'founder';
        if (targetPersona !== actualPersona) {
            console.log(`Progress System: Skipping save - persona mismatch. Target: ${targetPersona}, Actual: ${actualPersona}`);
            return;
        }

        // Save persona-specific progress
        const key = `readingProgress_${targetPersona}`;

        try {
            localStorage.setItem(key, JSON.stringify(this.progress));
            console.log(`Progress System: Saved progress for ${targetPersona}`, this.progress);
        } catch (e) {
            console.error('Progress System: Error saving progress', e);
        }
    }


    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html' || path === '/#welcome') return 'welcome';

        // Handle hash-based routing
        const hash = window.location.hash.replace('#', '');
        if (hash && this.pages.includes(hash)) return hash;

        // Handle file-based routing
        const pageName = path.replace('/', '').replace('.html', '');
        return this.pages.includes(pageName) ? pageName : 'welcome';
    }

    startTracking() {
        // Removed scroll tracking since we only track page visits now

        // Track SPA navigation by monitoring active nav links
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
        const observer = new MutationObserver(() => {
            checkPageChange();
        });

        // Observe changes to nav links
        const navElement = document.querySelector('.nav-list');
        if (navElement) {
            observer.observe(navElement, {
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
                }, 100);
            }
        });

        // Track page changes
        window.addEventListener('hashchange', () => {
            checkPageChange();
        });

        // Also track popstate for browser navigation
        window.addEventListener('popstate', () => {
            checkPageChange();
        });
    }

    onPageChange() {
        console.log('Page changed to:', this.currentPage);

        // Mark page as visited if it's new
        if (!this.progress.pagesVisited) {
            this.progress.pagesVisited = [];
        }

        if (!this.progress.pagesVisited.includes(this.currentPage)) {
            this.progress.pagesVisited.push(this.currentPage);
            console.log('New page visited:', this.currentPage);
            console.log('Pages visited so far:', this.progress.pagesVisited);
            this.showXPGain();
        }

        this.calculateTotalProgress();
        this.saveProgress();
        this.updateUI();

        console.log('Total pages visited:', this.progress.pagesVisited.length + '/6');
        console.log('Total progress:', this.progress.totalProgress + '%');
    }

    calculateTotalProgress() {
        // Calculate progress based on pages visited (each page = 16.67% of total)
        if (!this.progress.pagesVisited) {
            this.progress.pagesVisited = [];
        }

        // Each visited page counts as 1/6 of total progress
        const visitedCount = Math.min(this.progress.pagesVisited.length, this.pages.length);
        this.progress.totalProgress = Math.min(100, Math.floor((visitedCount / this.pages.length) * 100));
    }

    showXPGain() {
        const xpText = document.getElementById('progressPercentage');
        if (xpText) {
            // Add a pulse effect when XP increases
            xpText.style.transform = 'scale(1.3)';
            xpText.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                xpText.style.transform = 'scale(1)';
            }, 300);
        }
    }

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

        // No celebration at 100% per user request
    }

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

        const duration = 300; // Faster animation
        const range = Math.abs(end - start);
        const increment = end > start ? 1 : -1;
        const stepTime = Math.max(10, Math.floor(duration / range)); // Minimum 10ms per step
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
        console.log(`Progress System: Switching from ${this.currentPersona} to ${newPersona}`);

        // Save current progress with old persona before switching
        const oldPersona = this.currentPersona;
        this.saveProgress(oldPersona);

        // Update current persona
        this.currentPersona = newPersona;

        // Load new persona's progress
        const savedProgress = this.loadProgress();
        if (savedProgress) {
            this.progress = savedProgress;
            console.log(`Progress System: Loaded existing progress for ${newPersona}`, this.progress);
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
        
        console.log(`Progress System: Progress for ${newPersona} - Pages visited: ${this.progress.pagesVisited.length}, Total progress: ${this.progress.totalProgress}%`);
    }

}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Clean up existing instance if any
        if (window.progressSystem) {
            console.log('Progress System: Cleaning up existing instance');
        }
        window.progressSystem = new ProgressSystem();
    });
} else {
    // Clean up existing instance if any
    if (window.progressSystem) {
        console.log('Progress System: Cleaning up existing instance');
    }
    window.progressSystem = new ProgressSystem();
}