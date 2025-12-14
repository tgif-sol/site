/**
 * Main SPA Handler
 * Manages Single Page Application functionality for main navigation
 */

(function() {
    'use strict';

    let currentPage = 'welcome';
    let writingSPAInitialized = false;

    /**
     * Initialize Main SPA functionality
     */
    function initMainSPA() {
        const contentBody = document.querySelector('.content-body');
        const pageTitle = document.getElementById('pageTitle') || document.querySelector('.page-title');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!contentBody || !pageTitle) {
            console.warn('Main SPA: Required elements not found');
            return;
        }

        /**
         * Load and display a page
         * @param {string} pageKey - The page identifier
         */
        function loadPage(pageKey) {
            // Skip if it's the welcome page (handled by index redirect)
            if (pageKey === 'welcome') {
                // Redirect to index with persona reset
                window.location.href = '/?reset=true';
                return;
            }

            const pageData = window.pageContent[pageKey];

            if (!pageData) {
                contentBody.innerHTML = '<p class="empty-state">Page not found</p>';
                return;
            }

            // Update page title
            pageTitle.textContent = pageData.title;

            // Handle special case for writing page
            if (pageKey === 'writing') {
                // Update main content structure
                const mainContent = document.querySelector('.content');
                mainContent.classList.add('split-view');
                mainContent.innerHTML = `
                    <div class="page-header">
                        <h1 class="page-title" id="pageTitle">${pageData.title}</h1>
                    </div>
                    ${pageData.content}
                `;

                // Initialize writing SPA if needed
                if (!writingSPAInitialized && window.writingContent) {
                    setTimeout(() => {
                        initWritingSubSPA();
                        writingSPAInitialized = true;
                    }, 100);
                }
            } else {
                // Regular page content
                const mainContent = document.querySelector('.content');
                mainContent.classList.remove('split-view');
                mainContent.innerHTML = `
                    <div class="page-header">
                        <h1 class="page-title" id="pageTitle">${pageData.title}</h1>
                    </div>
                    <div class="content-body">
                        ${pageData.content}
                    </div>
                `;
            }

            // Update active navigation state
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.page === pageKey);
            });

            // Update current page
            currentPage = pageKey;

            // Scroll to top
            window.scrollTo(0, 0);
        }

        /**
         * Initialize Writing Sub-SPA
         */
        function initWritingSubSPA() {
            const writingContentDiv = document.getElementById('writing-content');
            const postLinks = document.querySelectorAll('.post-list a');

            if (!writingContentDiv || !window.writingContent) {
                return;
            }

            // Load article function
            function loadArticle(articleKey) {
                const article = window.writingContent[articleKey];

                if (!article) {
                    writingContentDiv.innerHTML = '<p class="empty-state">Article not found</p>';
                    return;
                }

                writingContentDiv.innerHTML = `
                    <div class="article-header">
                        <h2 class="article-title">${article.title}</h2>
                    </div>
                    <div class="article-content">
                        ${article.content}
                    </div>
                `;

                // Update active state
                postLinks.forEach(link => {
                    link.classList.toggle('active', link.dataset.article === articleKey);
                });

                writingContentDiv.scrollTop = 0;
            }

            // Setup click handlers for writing links
            postLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const articleKey = link.dataset.article;

                    if (articleKey) {
                        loadArticle(articleKey);
                        // Update URL with both page and article
                        history.pushState({ page: 'writing', article: articleKey }, '', `#writing/${articleKey}`);
                    }
                });
            });

            // Check if there's a specific article in the URL
            const hash = window.location.hash.substring(1);
            if (hash.startsWith('writing/')) {
                const articleKey = hash.replace('writing/', '');
                if (window.writingContent[articleKey]) {
                    loadArticle(articleKey);
                }
            }
        }

        /**
         * Handle navigation link clicks
         */
        function setupClickHandlers() {
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const pageKey = link.dataset.page;

                    // Allow normal navigation for welcome/home page
                    if (pageKey === 'welcome') {
                        return; // Let default behavior handle it
                    }

                    e.preventDefault();

                    if (pageKey && pageKey !== currentPage) {
                        loadPage(pageKey);
                        // Update URL without reload
                        history.pushState({ page: pageKey }, '', `#${pageKey}`);
                    }
                });
            });
        }

        /**
         * Handle browser navigation
         */
        function setupNavigationHandlers() {
            // Handle browser back/forward
            window.addEventListener('popstate', (e) => {
                if (e.state && e.state.page) {
                    loadPage(e.state.page);

                    // Handle writing article navigation
                    if (e.state.page === 'writing' && e.state.article) {
                        setTimeout(() => {
                            const articleLink = document.querySelector(`[data-article="${e.state.article}"]`);
                            if (articleLink) {
                                articleLink.click();
                            }
                        }, 100);
                    }
                } else {
                    // Load from hash if no state
                    const hash = window.location.hash.substring(1);
                    if (hash) {
                        const pageKey = hash.split('/')[0];
                        if (window.pageContent[pageKey]) {
                            loadPage(pageKey);
                        }
                    }
                }
            });
        }

        /**
         * Initialize from URL
         */
        function loadInitialPage() {
            const hash = window.location.hash.substring(1);
            if (hash) {
                const pageKey = hash.split('/')[0];
                if (window.pageContent[pageKey]) {
                    loadPage(pageKey);
                    return;
                }
            }

            // Check current page from nav
            const activeNav = document.querySelector('.nav-link.active');
            if (activeNav && activeNav.dataset.page && activeNav.dataset.page !== 'welcome') {
                currentPage = activeNav.dataset.page;
                // Load page content if we have it
                if (window.pageContent[currentPage]) {
                    loadPage(currentPage);
                }
            }
        }

        // Initialize all components
        setupClickHandlers();
        setupNavigationHandlers();

        // Load initial page after a short delay to ensure content is loaded
        setTimeout(loadInitialPage, 100);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMainSPA);
    } else {
        initMainSPA();
    }

})();