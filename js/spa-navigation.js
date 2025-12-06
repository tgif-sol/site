/**
 * SPA Navigation System
 * Handles single-page application navigation for all pages
 */

(function() {
    'use strict';

    let currentPage = null;
    let writingSPAInitialized = false;

    /**
     * Initialize SPA Navigation
     */
    function initSPANavigation() {
        // Determine current page from URL or active nav
        const pathname = window.location.pathname;
        const activeNav = document.querySelector('.nav-link.active');

        if (activeNav) {
            currentPage = activeNav.dataset.page || extractPageFromPath(pathname);
        } else {
            currentPage = extractPageFromPath(pathname);
        }

        // Setup navigation handlers
        setupNavigationHandlers();

        // Setup browser history handlers
        setupHistoryHandlers();

        // Load the current page content if we're on the index page
        // This ensures content loads on refresh
        if ((pathname === '/' || pathname === '/index.html') && currentPage === 'welcome') {
            // Check if content area exists and is empty
            const contentArea = document.querySelector('.content');
            const hasWelcomeContent = contentArea && (contentArea.querySelector('.welcome-cards') || contentArea.classList.contains('welcome-page'));

            if (contentArea && !hasWelcomeContent) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    loadPageContent('welcome');
                }, 50);
            }
        }
    }

    /**
     * Extract page name from pathname
     */
    function extractPageFromPath(pathname) {
        if (pathname === '/' || pathname === '/index.html') return 'welcome';
        if (pathname.includes('bio')) return 'bio';
        if (pathname.includes('writing')) return 'writing';
        if (pathname.includes('quotes')) return 'quotes';
        if (pathname.includes('questions')) return 'questions';
        if (pathname.includes('investments')) return 'investments';
        return 'welcome';
    }

    /**
     * Load page content dynamically
     */
    function loadPageContent(pageKey) {
        const contentArea = document.querySelector('.content');
        if (!contentArea) return;

        // Update active navigation
        updateActiveNav(pageKey);

        // Load content based on page
        switch(pageKey) {
            case 'welcome':
                loadWelcomeContent(contentArea);
                break;
            case 'bio':
                loadBioContent(contentArea);
                break;
            case 'writing':
                loadWritingContent(contentArea);
                break;
            case 'quotes':
                loadQuotesContent(contentArea);
                break;
            case 'questions':
                loadQuestionsContent(contentArea);
                break;
            case 'investments':
                loadInvestmentsContent(contentArea);
                break;
        }

        currentPage = pageKey;

        // Update URL without reload
        const newUrl = `#${pageKey}`;
        if (window.location.hash !== newUrl) {
            history.pushState({ page: pageKey }, '', newUrl);
        }

        // Scroll to top on page change (especially important for mobile)
        scrollToTop();
    }

    /**
     * Scroll to top of page
     */
    function scrollToTop() {
        // Use requestAnimationFrame for smooth scroll
        requestAnimationFrame(() => {
            // Try multiple methods for better compatibility
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant' // Use 'instant' for immediate scroll, 'smooth' for animated
            });

            // Also scroll document element (for some browsers)
            if (document.documentElement) {
                document.documentElement.scrollTop = 0;
            }

            // Also scroll body (for some browsers)
            if (document.body) {
                document.body.scrollTop = 0;
            }

            // For mobile, also check content area
            const contentArea = document.querySelector('.content');
            if (contentArea) {
                contentArea.scrollTop = 0;
            }
        });
    }

    /**
     * Update active navigation state
     */
    function updateActiveNav(pageKey) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageKey);
        });

        // Update navigation icons after changing active state
        if (window.gamingSystem && window.gamingSystem.updateNavigationIcons) {
            window.gamingSystem.updateNavigationIcons(true);
        }
    }

    /**
     * Load Welcome content
     */
    /**
     * Load Welcome content
     * @param {HTMLElement} container - Container element
     */
    function loadWelcomeContent(container) {
        // Get persona-specific content
        const persona = Storage.getPersona();
        const isMobile = Device.isMobile();

        const personaData = {
            founder: {
                welcome: `Welcome to my personal website! This site's "job to be done" is to make me as legible as possible.`,
                focus: `A good place to start is with my <a href="/bio.html" class="text-link">bio</a>, my <a href="/writing/user-manual.html" class="text-link">user manual</a>, or my <a href="/writing/lattice-work.html" class="text-link">latticework</a>.`,
                ending: `Thanks for stopping by and please reach out on <a href="https://twitter.com/alanjamescurtis" target="_blank" class="text-link">X</a>, <a href="https://linkedin.com/in/alanjamescurtis" target="_blank" class="text-link">LinkedIn</a>, or <a href="mailto:alanjamescurtis@gmail.com" class="text-link">email</a> if we should be working together!`
            },
            operator: {
                welcome: `Welcome to my personal website! This site's "job to be done" is to make me as legible as possible.`,
                focus: `A good place to start is with my <a href="/bio.html" class="text-link">bio</a>, my <a href="/writing/user-manual.html" class="text-link">user manual</a>, or my <a href="/writing/lattice-work.html" class="text-link">latticework</a>.`,
                ending: `Thanks for stopping by and please reach out on <a href="https://twitter.com/alanjamescurtis" target="_blank" class="text-link">X</a>, <a href="https://linkedin.com/in/alanjamescurtis" target="_blank" class="text-link">LinkedIn</a>, or <a href="mailto:alanjamescurtis@gmail.com" class="text-link">email</a> if we should be working together!`
            },
            investor: {
                welcome: `Welcome to my personal website! This site's "job to be done" is to make me as legible as possible.`,
                focus: `A good place to start is with my <a href="/bio.html" class="text-link">bio</a>, my <a href="/writing/user-manual.html" class="text-link">user manual</a>, or my <a href="/writing/lattice-work.html" class="text-link">latticework</a>.`,
                ending: `Thanks for stopping by and please reach out on <a href="https://twitter.com/alanjamescurtis" target="_blank" class="text-link">X</a>, <a href="https://linkedin.com/in/alanjamescurtis" target="_blank" class="text-link">LinkedIn</a>, or <a href="mailto:alanjamescurtis@gmail.com" class="text-link">email</a> if we should be working together!`
            },
            dad: {
                welcome: `Welcome to my personal website! This site's "job to be done" is to make me as legible as possible.`,
                focus: `A good place to start is with my <a href="/bio.html" class="text-link">bio</a>, my <a href="/writing/user-manual.html" class="text-link">user manual</a>, or my <a href="/writing/lattice-work.html" class="text-link">latticework</a>.`,
                ending: `Thanks for stopping by and please reach out on <a href="https://twitter.com/alanjamescurtis" target="_blank" class="text-link">X</a>, <a href="https://linkedin.com/in/alanjamescurtis" target="_blank" class="text-link">LinkedIn</a>, or <a href="mailto:alanjamescurtis@gmail.com" class="text-link">email</a> if we should be working together!`
            }
        };

        const content = personaData[persona] || personaData.founder;

        // Use cards only on desktop, simple paragraphs on mobile
        if (isMobile) {
            container.className = 'content';
            container.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title">Welcome</h1>
                </div>
                <div class="content-body">
                    <p>${content.welcome}</p>
                    <p>${content.focus}</p>
                    <p>${content.ending}</p>
                </div>
            `;
        } else {
            container.className = 'content welcome-page';
            container.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title">Welcome</h1>
                </div>
                <div class="content-body welcome-cards cards-hidden">
                    <div class="welcome-card entrance-card">
                        <div class="card-number">I</div>
                        <div class="card-content">
                            <p>${content.welcome}</p>
                        </div>
                    </div>
                    <div class="welcome-card quest-card">
                        <div class="card-number">II</div>
                        <div class="card-content">
                            <p>${content.focus}</p>
                        </div>
                    </div>
                    <div class="welcome-card invitation-card">
                        <div class="card-number">III</div>
                        <div class="card-content">
                            <p>${content.ending}</p>
                        </div>
                    </div>
                </div>
            `;

            // Fade in the cards after a longer delay to ensure smooth loading
            setTimeout(() => {
                const cardsContainer = container.querySelector('.welcome-cards');
                if (cardsContainer) {
                    cardsContainer.classList.remove('cards-hidden');
                }
            }, 200);
        }

        // Setup internal links after content loads
        setTimeout(() => {
            setupWelcomeLinks();
        }, 300);
    }

    /**
     * Setup Welcome page internal links
     */
    function setupWelcomeLinks() {
        // Handle all text links in the welcome content
        const textLinks = document.querySelectorAll('.text-link');

        textLinks.forEach(link => {
            const href = link.getAttribute('href');

            // Skip external links (they should work normally)
            if (href && (href.startsWith('http') || href.startsWith('mailto:'))) {
                return;
            }

            // Handle internal navigation links
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Determine the page from the href
                let page = null;
                let article = null;

                if (href.includes('/bio')) {
                    page = 'bio';
                } else if (href.includes('/writing/')) {
                    // This is a specific article
                    page = 'writing';
                    // Extract article name from path
                    const match = href.match(/\/writing\/(.+)\.html/);
                    if (match) {
                        article = match[1];
                    }
                } else if (href.includes('/writing')) {
                    page = 'writing';
                } else if (href.includes('/investments')) {
                    page = 'investments';
                } else if (href.includes('/quotes')) {
                    page = 'quotes';
                } else if (href.includes('/questions')) {
                    page = 'questions';
                }

                if (page) {
                    loadPageContent(page);

                    // If it's a specific article, load it after the writing page loads
                    if (page === 'writing' && article) {
                        setTimeout(() => {

                            // Handle different naming conventions (e.g., lattice-work vs latticework)
                            let targetLink = document.querySelector(`[data-article="${article}"]`);

                            // If not found, try without hyphens
                            if (!targetLink && article.includes('-')) {
                                const articleWithoutHyphens = article.replace(/-/g, '');
                                targetLink = document.querySelector(`[data-article="${articleWithoutHyphens}"]`);
                            }

                            // If still not found, try with hyphens added
                            if (!targetLink && !article.includes('-')) {
                                // Try common hyphenation patterns
                                const hyphenated = article.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                                targetLink = document.querySelector(`[data-article="${hyphenated}"]`);
                            }

                            if (targetLink) {
                                targetLink.click();
                            }
                        }, 200);
                    }
                }
            });
        });

        // Handle all page links (legacy support)
        const pageLinks = document.querySelectorAll('.spa-link[data-page]');
        pageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    loadPageContent(page);
                }
            });
        });

        // Handle all article links (legacy support)
        const articleLinks = document.querySelectorAll('.spa-link[data-article]');
        articleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const article = link.dataset.article;
                if (article) {
                    loadPageContent('writing');
                    // After writing page loads, load the specific article
                    setTimeout(() => {
                        const targetLink = document.querySelector(`[data-article="${article}"]`);
                        if (targetLink) targetLink.click();
                    }, 200);
                }
            });
        });
    }

    /**
     * Load Bio content
     */
    function loadBioContent(container) {
        container.className = 'content';
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Bio</h1>
            </div>
            <div class="content-body">
                <div class="bio-introduction">
                    <p>Alan Curtis is a Founder, Operator, Investor, and most importantly, a Girl Dad.</p>
                    <p>As a Founder, Alan has five exits and has delivered a lifetime 300%+ IRR for investors across $100M+ raised from 75+ venture capital funds and 100+ angel investors.</p>
                    <p>As an Operator, Alan has been COO at EigenLayer during a $7B TGE ($EIGEN), CTO of Core Scientific during $4B IPO ($CORZ) and CSO at Blockcap during a $2B merger.</p>
                    <p>As an Investor, Alan has invested in 50+ companies (seven unicorns and five exits) and 10+ he was also the first Head of Platform at Blockchain Capital to launch post-investment support.</p>
                    <p>As a Girl Dad, Alan lives with his wife and two daughters outside Boulder, Colorado and is proud soccer coach, avid nail polish test subject, and amateur "rock stacker."</p>
                </div>

                <div class="bio-timeline">
                    <div class="timeline-item">
                        <span class="timeline-year">2025</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Founder and CEO, The Invention Network</h3>
                            <p class="timeline-description">We help inventors win</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2024</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">COO, Eigen Labs</h3>
                            <p class="timeline-description">Led $7B TGE ($EIGEN) and launched EigenCloud</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2023</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Co-Founder and CEO, Rio Network</h3>
                            <p class="timeline-description">Acquired by Eigen Labs for team and Liquid Restaking Network tech</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2022-2025</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Co-Founder, ScaleIP</h3>
                            <p class="timeline-description">Acquired by The Invention Network for team</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2022</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Head of Platform, Blockchain Capital</h3>
                            <p class="timeline-description">Launched post-investment support program</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2022</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Co-Founder, Multisig Media</h3>
                            <p class="timeline-description">Acquired by Bitwave to scale media efforts</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2021</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">CTO, Core Scientific</h3>
                            <p class="timeline-description">Turned around technology team for a $4B IPO ($CORZ)</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2021</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">CSO, Blockcap</h3>
                            <p class="timeline-description">Led integrations into Core Scientific after a $2B merger</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2017-2021</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Co-Founder and CEO, RADAR</h3>
                            <p class="timeline-description">Acquired by Blockcap for staking and trading businesses</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2016</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Co-Founder and CEO, The Horse and I</h3>
                            <p class="timeline-description">Acquired by The Right Horse for technology platform</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2014-2017</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Program Director, Innosphere</h3>
                            <p class="timeline-description">Managed accelerator: admissions, curriculum, and digital health vertical</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2010-2016</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Bachelor and Master's Degree, Economics, Business Administration, and Public Health</h3>
                            <p class="timeline-description">Survived, barely</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">2000-2010</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Grew up in Chicago suburbs</h3>
                            <p class="timeline-description">One giant strip mall</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <span class="timeline-year">1995-2000</span>
                        <div class="timeline-content">
                            <h3 class="timeline-title">Born and raised in New Hampshire</h3>
                            <p class="timeline-description">Live free or die</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add scroll animations for timeline items
        setTimeout(() => {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);

            const timelineItems = container.querySelectorAll('.timeline-item');
            timelineItems.forEach(item => {
                observer.observe(item);
            });
        }, 100);
    }

    /**
     * Load Writing content
     */
    function loadWritingContent(container) {
        container.className = 'content split-view';
        container.innerHTML = `
            <div class="list-pane">
                <div class="page-header">
                    <h1 class="page-title">Writing</h1>
                </div>
                <ul class="post-list">
                    <li><a href="#annual-retro" data-article="annual-retro">Annual Retro</a></li>
                    <li><a href="#asset-classes" data-article="asset-classes">Asset Classes</a></li>
                    <li><a href="#business-operating-systems" data-article="business-operating-systems">Business Operating Systems</a></li>
                    <li><a href="#communities-of-practice" data-article="communities-of-practice">Communities of Practice</a></li>
                    <li><a href="#culture" data-article="culture">Culture</a></li>
                    <li><a href="#entropy-golf" data-article="entropy-golf">Entropy Golf</a></li>
                    <li><a href="#family-strategy" data-article="family-strategy">Family Strategy</a></li>
                    <li><a href="#growth-strategies" data-article="growth-strategies">Growth Strategies</a></li>
                    <li><a href="#health-and-wellness-gear" data-article="health-and-wellness-gear">Health and Wellness Gear</a></li>
                    <li><a href="#latticework" data-article="latticework">Latticework</a></li>
                    <li><a href="#leadership" data-article="leadership">Leadership</a></li>
                    <li><a href="#metrics" data-article="metrics">Metrics</a></li>
                    <li><a href="#seven-basic-plots" data-article="seven-basic-plots">Seven Basic Plots</a></li>
                    <li><a href="#talent-investing" data-article="talent-investing">Talent Investing</a></li>
                    <li><a href="#therapy" data-article="therapy">Therapy</a></li>
                    <li><a href="#truth" data-article="truth">Truth</a></li>
                    <li><a href="#user-manual" data-article="user-manual">User Manual</a></li>
                </ul>
            </div>

            <div class="reading-pane">
                <div id="writing-content">
                    <p class="empty-state">Select an article to read</p>
                </div>
            </div>
        `;

        // Initialize writing sub-SPA after content loads
        setTimeout(() => {
            if (window.writingContent) {
                initWritingHandlers();
                writingSPAInitialized = true;
            }
        }, 100);
    }

    /**
     * Load Quotes content
     */
    function loadQuotesContent(container) {
        container.className = 'content split-view';
        container.innerHTML = `
            <div class="list-pane">
                <div class="page-header">
                    <h1 class="page-title">Quotes</h1>
                </div>
                <ul class="post-list">
                    <li><a href="#business" data-category="business">Business</a></li>
                    <li><a href="#communication" data-category="communication">Communication</a></li>
                    <li><a href="#health" data-category="health">Health</a></li>
                    <li><a href="#investing" data-category="investing">Investing</a></li>
                    <li><a href="#leadership" data-category="leadership">Leadership & Management</a></li>
                    <li><a href="#life" data-category="life">Life</a></li>
                    <li><a href="#productivity" data-category="productivity">Planning & Productivity</a></li>
                    <li><a href="#psychology" data-category="psychology">Psychology</a></li>
                    <li><a href="#thinking" data-category="thinking">Thinking</a></li>
                </ul>
            </div>

            <div class="reading-pane">
                <div id="quotes-content">
                    <p class="empty-state">Select a category to view quotes</p>
                </div>
            </div>
        `;

        // Initialize quotes handlers after content loads
        setTimeout(() => {
            if (window.quotesContent) {
                initQuotesHandlers();
            } else {
                setTimeout(() => {
                    if (window.quotesContent) {
                        initQuotesHandlers();
                    }
                }, 500);
            }
        }, 100);
    }

    /**
     * Load Questions content
     */
    function loadQuestionsContent(container) {
        container.className = 'content split-view';
        container.innerHTML = `
            <div class="list-pane">
                <div class="page-header">
                    <h1 class="page-title">Questions</h1>
                </div>
                <ul class="post-list">
                    <li><a href="#brainstorming" data-section="brainstorming">Brainstorming</a></li>
                    <li><a href="#business-formation" data-section="business-formation">Business Formation</a></li>
                    <li><a href="#business-model" data-section="business-model">Business Model</a></li>
                    <li><a href="#execution" data-section="execution">Execution</a></li>
                    <li><a href="#interview" data-section="interview">Interview</a></li>
                    <li><a href="#investor-dd" data-section="investor-dd">Investor Due Diligence</a></li>
                    <li><a href="#market" data-section="market">Market</a></li>
                    <li><a href="#people" data-section="people">People</a></li>
                    <li><a href="#product" data-section="product">Product</a></li>
                    <li><a href="#risks" data-section="risks">Risks</a></li>
                </ul>
            </div>

            <div class="reading-pane">
                <div id="questions-content">
                    <p class="empty-state">Select a category to view questions</p>
                </div>
            </div>
        `;

        // Initialize questions handlers after content loads
        setTimeout(() => {
            if (window.questionsContent) {
                initQuestionsHandlers();
            } else {
                setTimeout(() => {
                    if (window.questionsContent) {
                        initQuestionsHandlers();
                    }
                }, 500);
            }
        }, 100);
    }

    /**
     * Load Investments content
     */
    function loadInvestmentsContent(container) {
        container.className = 'content split-view';
        container.innerHTML = `
            <div class="list-pane">
                <div class="page-header">
                    <h1 class="page-title">Investments</h1>
                </div>
                <ul class="post-list">
                    <li><a href="#funds" data-investment="funds">Funds</a></li>
                    <li><a href="#tech" data-investment="tech">Tech</a></li>
                    <li><a href="#crypto" data-investment="crypto">Crypto</a></li>
                </ul>
            </div>

            <div class="reading-pane">
                <div id="investments-content">
                    <p class="empty-state">Select a category to view investments</p>
                </div>
            </div>
        `;

        // Initialize investments handlers after content loads
        setTimeout(() => {
            if (window.investmentsContent) {
                initInvestmentsHandlers();
            } else {
                setTimeout(() => {
                    if (window.investmentsContent) {
                        initInvestmentsHandlers();
                    }
                }, 500);
            }
        }, 100);
    }


    /**
     * Initialize Writing article handlers
     */
    function initWritingHandlers() {
        const postLinks = document.querySelectorAll('.post-list a');
        const writingContentDiv = document.getElementById('writing-content');

        if (!writingContentDiv) {
            return;
        }

        if (!window.writingContent) {
            console.warn('Writing content data not loaded');
            return;
        }

        postLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const articleKey = link.dataset.article;

                if (articleKey && window.writingContent[articleKey]) {
                    const article = window.writingContent[articleKey];

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
                    postLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    // Update URL
                    history.pushState({ page: 'writing', article: articleKey }, '', `#writing/${articleKey}`);

                    // Scroll to top of reading pane
                    writingContentDiv.scrollTop = 0;

                    // On mobile, scroll to article title after a short delay
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            const articleTitle = writingContentDiv.querySelector('.article-title');
                            if (articleTitle) {
                                // Get the position and scroll with offset for mobile header
                                const titleRect = articleTitle.getBoundingClientRect();
                                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                                const targetPosition = titleRect.top + currentScroll - 80; // 80px offset for mobile header
                                
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                            } else {
                                // Fallback to reading pane if title not found
                                const readingPane = document.querySelector('.reading-pane');
                                if (readingPane) {
                                    const paneRect = readingPane.getBoundingClientRect();
                                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                                    const targetPosition = paneRect.top + currentScroll - 80;
                                    
                                    window.scrollTo({
                                        top: targetPosition,
                                        behavior: 'smooth'
                                    });
                                }
                            }
                        }, 150);
                    }
                } else {
                    console.warn('Article not found:', articleKey);
                }
            });
        });

        console.log('Writing handlers initialized with', postLinks.length, 'article links');
    }

    /**
     * Initialize Quotes handlers
     */
    function initQuotesHandlers() {
        const categoryLinks = document.querySelectorAll('.post-list a');
        const quotesContentDiv = document.getElementById('quotes-content');

        if (!quotesContentDiv) {
            console.warn('Quotes content div not found');
            return;
        }

        if (!window.quotesContent) {
            console.warn('Quotes content data not loaded');
            return;
        }

        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryKey = link.dataset.category;

                if (categoryKey && window.quotesContent[categoryKey]) {
                    const category = window.quotesContent[categoryKey];

                    quotesContentDiv.innerHTML = `
                        <div class="article-header">
                            <h2 class="article-title">${category.title}</h2>
                        </div>
                        <div class="quotes-container">
                            ${category.items.map(item => {
                                const parts = item.split(' - ');
                                const quote = parts[0];
                                const author = parts[1] || '';
                                return `
                                    <div class="quote-item">
                                        <blockquote class="quote-text">"${quote}"</blockquote>
                                        ${author ? `<cite class="quote-author">— ${author}</cite>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;

                    // Update active state
                    categoryLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    // Update URL
                    history.pushState({ page: 'quotes', category: categoryKey }, '', `#quotes/${categoryKey}`);

                    // Scroll to top of reading pane
                    quotesContentDiv.scrollTop = 0;

                    // On mobile, scroll to article title after a short delay
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            const articleTitle = quotesContentDiv.querySelector('.article-title');
                            if (articleTitle) {
                                // Get the position and scroll with offset for mobile header
                                const titleRect = articleTitle.getBoundingClientRect();
                                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                                const targetPosition = titleRect.top + currentScroll - 80; // 80px offset for mobile header
                                
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                            } else {
                                // Fallback to reading pane if title not found
                                const readingPane = document.querySelector('.reading-pane');
                                if (readingPane) {
                                    const paneRect = readingPane.getBoundingClientRect();
                                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                                    const targetPosition = paneRect.top + currentScroll - 80;
                                    
                                    window.scrollTo({
                                        top: targetPosition,
                                        behavior: 'smooth'
                                    });
                                }
                            }
                        }, 150);
                    }

                    // Add scroll animations for quote items
                    setTimeout(() => {
                        const observerOptions = {
                            threshold: 0.1,
                            rootMargin: '0px 0px -50px 0px'
                        };

                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    entry.target.classList.add('visible');
                                }
                            });
                        }, observerOptions);

                        const quoteItems = quotesContentDiv.querySelectorAll('.quote-item');
                        quoteItems.forEach(item => {
                            observer.observe(item);
                        });
                    }, 100);
                } else {
                    console.warn('Category not found:', categoryKey);
                }
            });
        });

        console.log('Quotes handlers initialized with', categoryLinks.length, 'category links');
    }

    /**
     * Initialize Questions handlers
     */
    function initQuestionsHandlers() {
        const sectionLinks = document.querySelectorAll('.post-list a');
        const questionsContentDiv = document.getElementById('questions-content');

        if (!questionsContentDiv) {
            console.warn('Questions content div not found');
            return;
        }

        if (!window.questionsContent) {
            console.warn('Questions content data not loaded');
            return;
        }

        sectionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionKey = link.dataset.section;

                if (sectionKey && window.questionsContent[sectionKey]) {
                    const section = window.questionsContent[sectionKey];

                    questionsContentDiv.innerHTML = `
                        <div class="article-header">
                            <h2 class="article-title">${section.title}</h2>
                        </div>
                        <div class="questions-container">
                            ${section.items.map(item => {
                                // Check if item starts with <strong> for headers
                                if (item.startsWith('<strong>')) {
                                    return `<h3 class="questions-section-header">${item}</h3>`;
                                } else {
                                    return `<p class="question-item">${item}</p>`;
                                }
                            }).join('')}
                        </div>
                    `;

                    // Update active state
                    sectionLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    // Update URL
                    history.pushState({ page: 'questions', section: sectionKey }, '', `#questions/${sectionKey}`);

                    // Scroll to top of reading pane
                    questionsContentDiv.scrollTop = 0;

                    // On mobile, scroll to article title after a short delay
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            const articleTitle = questionsContentDiv.querySelector('.article-title');
                            if (articleTitle) {
                                // Get the position and scroll with offset for mobile header
                                const titleRect = articleTitle.getBoundingClientRect();
                                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                                const targetPosition = titleRect.top + currentScroll - 80; // 80px offset for mobile header
                                
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                            } else {
                                // Fallback to reading pane if title not found
                                const readingPane = document.querySelector('.reading-pane');
                                if (readingPane) {
                                    const paneRect = readingPane.getBoundingClientRect();
                                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                                    const targetPosition = paneRect.top + currentScroll - 80;
                                    
                                    window.scrollTo({
                                        top: targetPosition,
                                        behavior: 'smooth'
                                    });
                                }
                            }
                        }, 150);
                    }

                    // Add scroll animations for question items
                    setTimeout(() => {
                        const observerOptions = {
                            threshold: 0.1,
                            rootMargin: '0px 0px -50px 0px'
                        };

                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    entry.target.classList.add('visible');
                                }
                            });
                        }, observerOptions);

                        const questionItems = questionsContentDiv.querySelectorAll('.question-item');
                        questionItems.forEach(item => {
                            observer.observe(item);
                        });
                    }, 100);
                } else {
                    console.warn('Section not found:', sectionKey);
                }
            });
        });

        console.log('Questions handlers initialized with', sectionLinks.length, 'section links');
    }

    /**
     * Initialize Investments handlers
     */
    function initInvestmentsHandlers() {
        const categoryLinks = document.querySelectorAll('.post-list a');
        const investmentsContentDiv = document.getElementById('investments-content');

        if (!investmentsContentDiv) {
            console.warn('Investments content div not found');
            return;
        }

        if (!window.investmentsContent) {
            console.warn('Investments content data not loaded');
            return;
        }

        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryKey = link.dataset.investment;

                if (categoryKey && window.investmentsContent[categoryKey]) {
                    const category = window.investmentsContent[categoryKey];

                    investmentsContentDiv.innerHTML = `
                        <div class="article-header">
                            <h2 class="article-title">${category.title}</h2>
                        </div>
                        <ul class="investment-list">
                            ${category.items.map(item => `
                                <li>
                                    <a href="${item.url}" class="external-link" target="_blank">${item.name}</a>
                                    ${item.status ? `<span class="investment-status">${item.status}</span>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    `;

                    // Update active state
                    categoryLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    // Update URL
                    history.pushState({ page: 'investments', category: categoryKey }, '', `#investments/${categoryKey}`);

                    // Scroll to top of reading pane
                    investmentsContentDiv.scrollTop = 0;

                    // On mobile, scroll to article title after a short delay
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            const articleTitle = investmentsContentDiv.querySelector('.article-title');
                            if (articleTitle) {
                                // Get the position and scroll with offset for mobile header
                                const titleRect = articleTitle.getBoundingClientRect();
                                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                                const targetPosition = titleRect.top + currentScroll - 80; // 80px offset for mobile header
                                
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                            } else {
                                // Fallback to reading pane if title not found
                                const readingPane = document.querySelector('.reading-pane');
                                if (readingPane) {
                                    const paneRect = readingPane.getBoundingClientRect();
                                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                                    const targetPosition = paneRect.top + currentScroll - 80;
                                    
                                    window.scrollTo({
                                        top: targetPosition,
                                        behavior: 'smooth'
                                    });
                                }
                            }
                        }, 150);
                    }

                    // Add scroll animations for investment items - sequential animation from top to bottom
                    setTimeout(() => {
                        const investmentItems = investmentsContentDiv.querySelectorAll('.investment-list li');
                        
                        // Animate all items sequentially from top to bottom
                        // Remove any existing visible class first to ensure clean animation
                        investmentItems.forEach(item => {
                            item.classList.remove('visible');
                        });
                        
                        // Add visible class sequentially with delay
                        investmentItems.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('visible');
                            }, index * 50); // 50ms delay between each item
                        });
                    }, 100);
                } else {
                    console.warn('Category not found:', categoryKey);
                }
            });
        });

    }

    /**
     * Setup navigation click handlers
     */
    function setupNavigationHandlers() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const pageKey = link.dataset.page;

                e.preventDefault();

                if (pageKey && pageKey !== currentPage) {
                    loadPageContent(pageKey);
                }
            });
        });
    }

    /**
     * Setup browser history handlers
     */
    function setupHistoryHandlers() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                loadPageContent(e.state.page);
            } else {
                // Check hash
                const hash = window.location.hash.substring(1);
                if (hash) {
                    const pageKey = hash.split('/')[0];
                    if (pageKey) {
                        loadPageContent(pageKey);
                    }
                }
            }
            // Scroll to top on browser navigation
            scrollToTop();
        });

        // Handle initial hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            const parts = hash.split('/');
            const pageKey = parts[0];
            const articleKey = parts[1];

            if (pageKey && pageKey !== currentPage) {
                loadPageContent(pageKey);

                // If there's an article, load it after the page loads
                if (pageKey === 'writing' && articleKey) {
                    setTimeout(() => {
                        // Handle different naming conventions (e.g., lattice-work vs latticework)
                        let targetLink = document.querySelector(`[data-article="${articleKey}"]`);

                        // If not found, try without hyphens
                        if (!targetLink && articleKey.includes('-')) {
                            const articleWithoutHyphens = articleKey.replace(/-/g, '');
                            targetLink = document.querySelector(`[data-article="${articleWithoutHyphens}"]`);
                        }

                        if (targetLink) {
                            targetLink.click();
                        }
                    }, 200);
                }
            }
        }
    }

    // Expose loadPageContent globally for character selection
    window.loadPageContent = loadPageContent;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSPANavigation);
    } else {
        initSPANavigation();
    }

})();