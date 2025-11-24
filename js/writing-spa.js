/**
 * Writing SPA Handler
 * Manages Single Page Application functionality for writing articles
 */

(function() {
    'use strict';

    /**
     * Initialize Writing SPA functionality
     */
    function initWritingSPA() {
        const writingContentDiv = document.getElementById('writing-content');
        const postLinks = document.querySelectorAll('.post-list a');

        if (!writingContentDiv || !window.writingContent) {
            console.warn('Writing SPA: Required elements not found');
            return;
        }

        /**
         * Load and display an article
         * @param {string} articleKey - The article identifier
         */
        function loadArticle(articleKey) {
            const article = window.writingContent[articleKey];

            if (!article) {
                writingContentDiv.innerHTML = '<p class="empty-state">Article not found</p>';
                return;
            }

            // Render article content
            writingContentDiv.innerHTML = `
                <div class="article-header">
                    <h2 class="article-title">${article.title}</h2>
                </div>
                <div class="article-content">
                    ${article.content}
                </div>
            `;

            // Apply accent color to numbered paragraphs (1. 2. 3. 4. etc.)
            const articleContent = writingContentDiv.querySelector('.article-content');
            if (articleContent) {
                const paragraphs = articleContent.querySelectorAll('p');
                paragraphs.forEach(p => {
                    const text = p.textContent.trim();
                    // Match patterns like "1. ", "2. ", "3. ", etc. at the start
                    const numberMatch = text.match(/^(\d+)\.\s/);
                    if (numberMatch && !p.querySelector('.number')) {
                        const number = numberMatch[1];
                        const restOfText = text.substring(numberMatch[0].length);
                        
                        // Check if it's already wrapped in strong
                        const strong = p.querySelector('strong');
                        if (strong) {
                            const strongText = strong.textContent.trim();
                            const strongNumberMatch = strongText.match(/^(\d+)\.\s/);
                            if (strongNumberMatch) {
                                const strongNumber = strongNumberMatch[1];
                                const strongRest = strongText.substring(strongNumberMatch[0].length);
                                strong.innerHTML = `<span class="number">${strongNumber}.</span> ${strongRest}`;
                            }
                        } else {
                            // Replace the entire paragraph content, preserving any HTML
                            const originalHTML = p.innerHTML;
                            const htmlMatch = originalHTML.match(/^(\d+)\.\s/);
                            if (htmlMatch) {
                                p.innerHTML = originalHTML.replace(/^(\d+)\.\s/, '<span class="number">$1.</span> ');
                            } else {
                                p.innerHTML = `<span class="number">${number}.</span> ${restOfText}`;
                            }
                        }
                    }
                });
            }

            // Update active state
            postLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.article === articleKey);
            });

            // Scroll to top of reading pane
            writingContentDiv.scrollTop = 0;
        }

        /**
         * Handle article link clicks
         */
        function setupClickHandlers() {
            postLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const articleKey = link.dataset.article;

                    if (articleKey) {
                        loadArticle(articleKey);
                        // Update URL without reload
                        history.pushState({ article: articleKey }, '', `#${articleKey}`);
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
                if (e.state && e.state.article) {
                    loadArticle(e.state.article);
                } else {
                    // Load from hash if no state
                    const hash = window.location.hash.substring(1);
                    if (hash && window.writingContent[hash]) {
                        loadArticle(hash);
                    }
                }
            });
        }

        /**
         * Initialize from URL
         */
        function loadInitialArticle() {
            const hash = window.location.hash.substring(1);
            if (hash && window.writingContent[hash]) {
                loadArticle(hash);
            }
        }

        // Initialize all components
        setupClickHandlers();
        setupNavigationHandlers();
        loadInitialArticle();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWritingSPA);
    } else {
        initWritingSPA();
    }

})();