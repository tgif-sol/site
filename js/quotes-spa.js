/**
 * Quotes SPA Handler
 * Manages Single Page Application functionality for quote collections
 */

(function() {
    'use strict';

    /**
     * Initialize Quotes SPA functionality
     */
    function initQuotesSPA() {
        const quoteContentDiv = document.getElementById('quote-content');
        const quoteLinks = document.querySelectorAll('.quote-list a');

        if (!quoteContentDiv || !window.quotesData) {
            console.warn('Quotes SPA: Required elements not found');
            return;
        }

        /**
         * Render a single quote element
         * @param {Object} quote - Quote data
         * @returns {string} HTML string
         */
        function renderQuote(quote) {
            if (typeof quote === 'string') {
                return `<blockquote class="quote">${quote}</blockquote>`;
            }

            if (quote.text && quote.author) {
                return `
                    <blockquote class="quote">
                        <p>${quote.text}</p>
                        <cite>— ${quote.author}</cite>
                    </blockquote>
                `;
            }

            // Legacy format support
            if (quote.quote && quote.author) {
                return `
                    <blockquote class="quote">
                        <p>${quote.quote}</p>
                        <cite>— ${quote.author}</cite>
                    </blockquote>
                `;
            }

            return `<blockquote class="quote">${JSON.stringify(quote)}</blockquote>`;
        }

        /**
         * Load and display quotes for a category
         * @param {string} category - The quote category
         */
        function loadQuotes(category) {
            const quotes = window.quotesData[category];

            if (!quotes) {
                quoteContentDiv.innerHTML = '<p class="empty-state">No quotes found for this category</p>';
                return;
            }

            // Format title
            const title = category === 'all'
                ? 'All Quotes'
                : category.charAt(0).toUpperCase() + category.slice(1);

            // Render quotes
            const quotesHtml = Array.isArray(quotes)
                ? quotes.map(q => renderQuote(q)).join('')
                : renderQuote(quotes);

            quoteContentDiv.innerHTML = `
                <div class="quotes-header">
                    <h2 class="quotes-title">${title}</h2>
                </div>
                <div class="quotes-content">
                    ${quotesHtml}
                </div>
            `;

            // Update active state
            quoteLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.quote === category);
            });

            // Scroll to top
            quoteContentDiv.scrollTop = 0;
        }

        /**
         * Handle quote link clicks
         */
        function setupClickHandlers() {
            quoteLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = link.dataset.quote;

                    if (category) {
                        loadQuotes(category);
                        // Update URL without reload
                        history.pushState({ quote: category }, '', `#${category}`);
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
                if (e.state && e.state.quote) {
                    loadQuotes(e.state.quote);
                } else {
                    // Load from hash if no state
                    const hash = window.location.hash.substring(1);
                    if (hash && window.quotesData[hash]) {
                        loadQuotes(hash);
                    }
                }
            });
        }

        /**
         * Initialize from URL
         */
        function loadInitialQuotes() {
            const hash = window.location.hash.substring(1);
            if (hash && window.quotesData[hash]) {
                loadQuotes(hash);
            } else if (window.quotesData && Object.keys(window.quotesData).length > 0) {
                // Load first category if no hash
                const firstCategory = Object.keys(window.quotesData)[0];
                loadQuotes(firstCategory);
            }
        }

        // Initialize all components
        setupClickHandlers();
        setupNavigationHandlers();
        loadInitialQuotes();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuotesSPA);
    } else {
        initQuotesSPA();
    }

})();