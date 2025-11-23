/**
 * The Bustling World v2 - Character Selection System
 * Professional Game-Inspired Portfolio JavaScript
 */

class BustlingWorldV2 {
    constructor() {
        // State management
        this.currentPersona = null;
        this.isFirstVisit = !localStorage.getItem('bustling_v2_visited');

        // Persona configuration
        this.personaData = {
            founder: {
                name: 'Founder',
                theme: 'persona-founder',
                image: '/assets/alan-2.jpeg',
                content: {
                    title: 'Welcome to the War Room',
                    welcome: "Welcome to my personal website! This site's \"job to be done\" is to make me as legible as possible.",
                    focus: "A good place to start is with my bio, my user manual, or my latticework.",
                    ending: "Thanks for stopping by and please reach out on X, LinkedIn, or email if we should be working together!"
                }
            },
            operator: {
                name: 'Operator',
                theme: 'persona-operator',
                image: '/assets/operator.png',
                content: {
                    title: 'Strategic Operations Center',
                    welcome: "Welcome to my personal website! This site's \"job to be done\" is to make me as legible as possible.",
                    focus: "A good place to start is with my bio, my user manual, or my latticework.",
                    ending: "Thanks for stopping by and please reach out on X, LinkedIn, or email if we should be working together!"
                }
            },
            investor: {
                name: 'Investor',
                theme: 'persona-investor',
                image: '/assets/investor.png',
                content: {
                    title: 'The Trading Hall',
                    welcome: "Welcome to my personal website! This site's \"job to be done\" is to make me as legible as possible.",
                    focus: "A good place to start is with my bio, my user manual, or my latticework.",
                    ending: "Thanks for stopping by and please reach out on X, LinkedIn, or email if we should be working together!"
                }
            },
            dad: {
                name: 'Dad',
                theme: 'persona-dad',
                image: '/assets/dad.png',
                content: {
                    title: "The Scholar's Sanctuary",
                    welcome: "Welcome to my personal website! This site's \"job to be done\" is to make me as legible as possible.",
                    focus: "A good place to start is with my bio, my user manual, or my latticework.",
                    ending: "Thanks for stopping by and please reach out on X, LinkedIn, or email if we should be working together!"
                }
            }
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        const path = window.location.pathname;
        const isIndexPage = path === '/' || path === '/index.html' || path.endsWith('/index.html');

        // Check if reset parameter is in URL
        const urlParams = new URLSearchParams(window.location.search);
        const shouldReset = urlParams.get('reset') === 'true';

        if (shouldReset) {
            // Clear the reset parameter from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Clear localStorage
            localStorage.removeItem('bustling_v2_visited');
            localStorage.removeItem('bustling_v2_persona');
            this.isFirstVisit = true;
        }

        // Check first visit status
        if (this.isFirstVisit) {
            if (isIndexPage) {
                this.showCharacterSelection();
            } else {
                // If first visit on a non-index page, redirect to index for character selection
                window.location.href = '/?reset=true';
            }
        } else {
            const savedPersona = localStorage.getItem('bustling_v2_persona') || 'founder';
            // Set persona - this will also dispatch the personaChanged event for XP system
            this.setPersona(savedPersona);
            this.hideCharacterSelection();

            // Update role selection active state after setting persona
            this.updateRoleSelectionActive(savedPersona);

            // Always show persona switcher on non-index pages
            if (!isIndexPage) {
                const switcher = document.getElementById('personaSwitcher');
                if (switcher) {
                    switcher.classList.remove('hidden');
                }
            } else {
                this.showMainContent();
                // Render the card deck for returning users
                this.renderCardDeck();
                // Load welcome content on index page after showing main content
                // This ensures the cards appear on refresh
                // But only if the welcome content doesn't already exist
                setTimeout(() => {
                    const contentArea = document.querySelector('.content');
                    const hasWelcomeContent = contentArea && (contentArea.querySelector('.welcome-cards') || contentArea.querySelector('.welcome-page'));

                    if (!hasWelcomeContent && window.loadPageContent) {
                        window.loadPageContent('welcome');
                    }
                }, 100);
            }
        }

        this.setupEventListeners();
        this.setupMobileMenu();

        // Update navigation icons after everything is initialized
        // This ensures the sword appears on the correct page
        setTimeout(() => {
            this.updateNavigationIcons();
        }, 100);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Character selection cards
        this.setupCharacterSelection();

        // Persona switcher
        this.setupPersonaSwitcher();

        // Navigation links
        this.setupNavigation();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup character selection cards
     */
    setupCharacterSelection() {
        const characterCards = document.querySelectorAll('.character-card');
        const isMobile = window.innerWidth <= 768;

        characterCards.forEach(card => {
            const persona = card.dataset.persona;

            // Setup video for cards with video
            if (card.dataset.persona === 'founder' || card.dataset.persona === 'dad' || card.dataset.persona === 'operator') {
                const video = card.querySelector('.character-video');
                if (video) {
                    // Ensure video is muted
                    video.muted = true;
                    // Enable auto-loop for founder and operator, handle dad manually
                    video.loop = card.dataset.persona === 'founder' || card.dataset.persona === 'operator';

                    // Handle dad video - loop back to start at 6 seconds
                    if (card.dataset.persona === 'dad') {
                        video.addEventListener('timeupdate', () => {
                            if (video.currentTime >= 6) {
                                video.currentTime = 0; // Loop back to start
                                // No pause - keep playing
                            }
                        });
                    }

                    // DESKTOP behavior
                    if (!isMobile) {
                        // Hover to play video - only load when needed
                        card.addEventListener('mouseenter', () => {
                            // Only load video source when first hovered
                            if (!video.src || video.readyState === 0) {
                                // Load from data-src if available, otherwise use src
                                const videoSrc = video.getAttribute('data-src') || video.getAttribute('src');
                                if (videoSrc && !video.src) {
                                    video.src = videoSrc;
                                }
                            }
                            video.play().catch(e => {
                                console.log('Video play failed:', e);
                            });
                        });

                        card.addEventListener('mouseleave', () => {
                            video.pause();
                            video.currentTime = 0;
                        });
                    }
                    // MOBILE behavior
                    else {
                        // Click on portrait toggles between image and video
                        const portrait = card.querySelector('.character-portrait');
                        const img = card.querySelector('.character-photo');
                        const videoElement = card.querySelector('.character-video');

                        // Function to handle the toggle
                        const handleToggle = (e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Prevent any bubbling

                            if (card.classList.contains('video-playing')) {
                                // Switch to image
                                card.classList.remove('video-playing');
                                video.pause();
                                video.currentTime = 0;
                            } else {
                                // Switch to video
                                card.classList.add('video-playing');
                                video.play().catch(err => console.log('Video play failed:', err));
                            }
                        };

                        // Add handler to portrait container and all child elements
                        if (portrait) {
                            portrait.addEventListener('click', handleToggle);
                            portrait.addEventListener('touchend', handleToggle);
                        }
                        if (img) {
                            img.addEventListener('click', handleToggle);
                            img.addEventListener('touchend', handleToggle);
                        }
                        if (videoElement) {
                            videoElement.addEventListener('click', handleToggle);
                            videoElement.addEventListener('touchend', handleToggle);
                        }

                        // Prevent any navigation on the card itself for mobile
                        card.addEventListener('click', (e) => {
                            // Check if the click is not on the select button
                            if (!e.target.closest('.select-role-btn')) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        });
                    }
                }
            }

            // DESKTOP ONLY: Click on card anywhere navigates (including on video)
            if (!isMobile) {
                card.addEventListener('click', (e) => {
                    // Always navigate on desktop, no exceptions
                    e.stopPropagation(); // Prevent bubbling
                    console.log('Desktop card clicked, navigating to:', persona);
                    this.selectCharacter(persona);
                });
            }
        });
    }

    /**
     * Setup persona switcher with horizontal hover icons
     */
    setupPersonaSwitcher() {
        const personaSwitcher = document.getElementById('personaSwitcher');
        if (!personaSwitcher) return;

        const iconBtns = personaSwitcher.querySelectorAll('.persona-icon-btn');
        const personaBtn = personaSwitcher.querySelector('.persona-btn');
        const personaContainer = personaSwitcher.querySelector('.persona-icons-container');

        // Handle both desktop and mobile with icon navigation
        if (window.innerWidth <= 768) {
            // Mobile: Use tap to show/hide icons
            if (personaBtn && personaContainer) {
                // Add click event listener to the persona button
                personaBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Mobile persona button clicked - toggling show-options');
                    personaContainer.classList.toggle('show-options');
                });

                // Also add touchstart for better mobile responsiveness
                personaBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Mobile persona button touched - toggling show-options');
                    personaContainer.classList.toggle('show-options');
                }, { passive: false });

                // Close when tapping outside
                document.addEventListener('click', (e) => {
                    // Check if click is outside the persona switcher
                    if (!personaSwitcher.contains(e.target)) {
                        console.log('Clicked outside - removing show-options');
                        personaContainer.classList.remove('show-options');
                    }
                });

                // Also handle touch events for closing
                document.addEventListener('touchstart', (e) => {
                    if (!personaSwitcher.contains(e.target)) {
                        personaContainer.classList.remove('show-options');
                    }
                }, { passive: true });
            }
        }

        // Handle icon button clicks (both desktop and mobile)
        iconBtns.forEach((btn, index) => {
            const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const persona = e.currentTarget.dataset.persona;
                console.log('Persona icon clicked:', persona);
                if (persona) {
                    // Update current role indicator using all buttons
                    const allBtns = personaSwitcher.querySelectorAll('.persona-icon-btn');
                    allBtns.forEach(b => b.classList.remove('current-role'));
                    e.currentTarget.classList.add('current-role');

                    // Update the main persona image
                    const currentImg = document.getElementById('currentPersonaImage');
                    const optionImg = e.currentTarget.querySelector('.persona-icon-img');
                    if (currentImg && optionImg) {
                        currentImg.src = optionImg.src;
                        currentImg.alt = optionImg.alt;
                    }

                    // Actually switch the persona
                    this.switchPersona(persona);

                    // On mobile, close the options after selection with smooth animation
                    if (window.innerWidth <= 768) {
                        // Add a small delay to show the selection, then smoothly close
                        setTimeout(() => {
                            personaContainer.classList.remove('show-options');
                        }, 150); // Reduced delay for smoother feel
                    }
                }
            };

            // Add event listener directly
            btn.addEventListener('click', handleClick);
            // Add touch handler for mobile
            if (window.innerWidth <= 768) {
                btn.addEventListener('touchstart', handleClick, { passive: false });
            }
        });

        // Update current role indicator on load
        const currentPersona = localStorage.getItem('bustling_v2_persona') || 'founder';
        iconBtns.forEach(btn => {
            btn.classList.remove('current-role');
            if (btn.dataset.persona === currentPersona) {
                btn.classList.add('current-role');
            }
        });

        // Also update the main button image based on current persona
        const currentImg = document.getElementById('currentPersonaImage');
        if (currentImg) {
            const currentBtn = document.querySelector(`.persona-icon-btn[data-persona="${currentPersona}"]`);
            if (currentBtn) {
                const img = currentBtn.querySelector('.persona-icon-img');
                if (img) {
                    currentImg.src = img.src;
                    currentImg.alt = img.alt;
                }
            }
        }
    }

    /**
     * Setup navigation links
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const path = window.location.pathname;
        const isIndexPage = path === '/' || path === '/index.html' || path.endsWith('/index.html');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // For founder/operator/investor/dad personas, immediately move the icon to clicked item
                if (this.currentPersona === 'founder' || this.currentPersona === 'operator' || this.currentPersona === 'investor' || this.currentPersona === 'dad') {
                    // Remove active from all links
                    navLinks.forEach(l => l.classList.remove('active'));
                    // Add active to clicked link
                    link.classList.add('active');
                    // Update icons immediately to move icon (skip active update since we just set it)
                    this.updateNavigationIcons(true);
                }

                // Only prevent default on index page for home link
                if (isIndexPage && href === '/') {
                    e.preventDefault();
                    // Update content for home page
                    this.updatePersonaContent();
                }
                // For other pages, let the navigation happen naturally
                // The browser will handle the navigation to other pages
            });
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+R to reset character selection
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.resetToCharacterSelection();
            }
        });
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        // Only setup mobile menu on mobile devices
        if (window.innerWidth > 768) return;

        // Use a small delay to ensure DOM is ready
        setTimeout(() => {
            const hamburger = document.getElementById('hamburger');
            const sidebar = document.querySelector('.sidebar');

            if (!hamburger || !sidebar) {
                console.log('Mobile menu elements not found - hamburger:', !!hamburger, 'sidebar:', !!sidebar);
                // Try again if elements not found
                setTimeout(() => this.setupMobileMenu(), 500);
                return;
            }

            // Debug hamburger visibility
            console.log('[BustlingWorld] Hamburger found, checking visibility...');
            const rect = hamburger.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(hamburger);
            console.log('[BustlingWorld] Hamburger details:', {
                position: rect,
                display: computedStyle.display,
                visibility: computedStyle.visibility,
                opacity: computedStyle.opacity,
                zIndex: computedStyle.zIndex,
                width: rect.width,
                height: rect.height,
                hasSpans: hamburger.querySelectorAll('span').length,
                parent: hamburger.parentElement ? hamburger.parentElement.tagName + '.' + hamburger.parentElement.className : 'body',
                computedLeft: computedStyle.left,
                computedTop: computedStyle.top
            });

            // Force position fix if needed
            if (rect.x < 0) {
                console.log('[BustlingWorld] Fixing hamburger position - was at x:', rect.x);
                hamburger.style.left = '15px !important';
                hamburger.style.position = 'fixed !important';
                hamburger.style.transform = 'none !important';
            }

            // Don't remove event listeners, just add new one
            // Check if handler already exists
            if (!hamburger.hasAttribute('data-handler-added')) {
                hamburger.setAttribute('data-handler-added', 'true');

                hamburger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Hamburger clicked - toggling sidebar');
                    sidebar.classList.toggle('open');
                    hamburger.classList.toggle('active');
                    document.body.classList.toggle('menu-open');
                });
            }

            // Setup overlay click handler
            const overlay = document.querySelector('.menu-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => {
                    console.log('Overlay clicked - closing sidebar');
                    sidebar.classList.remove('open');
                    hamburger.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            }

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (sidebar.classList.contains('open') &&
                    !sidebar.contains(e.target) &&
                    !hamburger.contains(e.target)) {
                    console.log('Closing sidebar - clicked outside');
                    sidebar.classList.remove('open');
                    hamburger.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });

            // Close menu when clicking on a nav link
            const navLinks = sidebar.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        console.log('Nav link clicked - closing sidebar');
                        sidebar.classList.remove('open');
                        hamburger.classList.remove('active');
                        document.body.classList.remove('menu-open');
                    }
                });
            });

            console.log('Mobile menu setup complete');
        }, 100); // Close the setTimeout
    }

    /**
     * Show character selection modal
     */
    showCharacterSelection() {
        const modal = document.getElementById('characterSelect');
        const path = window.location.pathname;
        const isIndexPage = path === '/' || path === '/index.html' || path.endsWith('/index.html');

        if (modal) {
            modal.classList.remove('hidden');
            // Add class to body to indicate character selection is active (for mobile styling)
            document.body.classList.add('character-select-active');
        } else if (!isIndexPage) {
            // If we're not on the main page and there's no modal, redirect to main page with reset
            window.location.href = '/?reset=true';
        }
    }

    /**
     * Hide character selection modal
     */
    hideCharacterSelection() {
        const modal = document.getElementById('characterSelect');
        if (modal) {
            modal.classList.add('hidden');
            // Remove the character-select-active class
            document.body.classList.remove('character-select-active');
        }
    }

    /**
     * Render the Hearthstone-style card deck
     */
    renderCardDeck() {
        // Don't render on mobile
        if (window.innerWidth <= 768) return;

        const deckContainer = document.getElementById('cardDeck');
        if (!deckContainer) return;

        // Clear existing deck
        deckContainer.innerHTML = '';
        deckContainer.classList.remove('hidden');

        // Add descriptions for each persona
        const personaDescriptions = {
            founder: "Build & conquer markets",
            operator: "Scale & optimize systems",
            investor: "Deploy capital wisely",
            dad: "Nurture & guide growth"
        };

        const personas = Object.keys(this.personaData);
        const totalCards = personas.length;
        const cards = [];

        // Create cards
        personas.forEach((personaKey, index) => {
            const data = this.personaData[personaKey];
            const card = document.createElement('div');
            card.className = 'deck-card';
            if (personaKey === this.currentPersona) {
                card.classList.add('active-card');
            }

            // Set background image
            card.style.backgroundImage = `url('${data.image}')`;

            // Card content with name and description
            card.innerHTML = `
                <div class="deck-card-inner">
                    <h3 class="deck-card-name">${data.name}</h3>
                    <p class="deck-card-desc">${personaDescriptions[personaKey]}</p>
                </div>
            `;

            // Store card data
            card.dataset.persona = personaKey;
            card.dataset.index = index;

            cards.push(card);
            deckContainer.appendChild(card);
        });

        // Use GSAP for animation if available
        if (typeof gsap !== 'undefined') {
            // Set initial state for all cards
            gsap.set(cards, {
                opacity: 0,
                scale: 0.8,
                y: 100
            });

            // Animate cards into fan position
            cards.forEach((card, index) => {
                const centerIndex = (totalCards - 1) / 2;
                const distanceFromCenter = index - centerIndex;

                // Fan calculations with tighter spacing for smaller cards
                const xPosition = distanceFromCenter * 90; // Tighter horizontal spacing
                const yPosition = Math.abs(distanceFromCenter) * Math.abs(distanceFromCenter) * 5; // Curve effect
                const rotation = distanceFromCenter * 10; // Rotation angle

                // Animate card to position with stagger
                gsap.to(card, {
                    x: xPosition,
                    y: yPosition,
                    rotation: rotation,
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    delay: index * 0.08,
                    ease: "power2.out",
                    transformOrigin: "center bottom"
                });

                // Set z-index
                card.style.zIndex = totalCards - Math.abs(distanceFromCenter);

                // Hover animations - lift card and expand size
                card.addEventListener('mouseenter', () => {
                    if (!card.classList.contains('active-card')) {
                        // Expand card and lift it up
                        gsap.to(card, {
                            y: yPosition - 30,
                            scale: 1.28, // Scale to compensate for size difference (180/140 ≈ 1.28)
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                        card.style.zIndex = 100;
                    }
                });

                card.addEventListener('mouseleave', () => {
                    if (!card.classList.contains('active-card')) {
                        // Return to normal size and position
                        gsap.to(card, {
                            y: yPosition,
                            scale: 1,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                        card.style.zIndex = totalCards - Math.abs(distanceFromCenter);
                    }
                });

                // Click handler
                card.addEventListener('click', () => {
                    const personaKey = card.dataset.persona;
                    if (this.currentPersona !== personaKey) {
                        this.switchPersona(personaKey);

                        // Update active states
                        cards.forEach(c => {
                            c.classList.remove('active-card');
                            const idx = parseInt(c.dataset.index);
                            const centerIdx = (totalCards - 1) / 2;
                            const dist = idx - centerIdx;
                            const yPos = Math.abs(dist) * Math.abs(dist) * 6;

                            // Reset non-active cards
                            if (c !== card) {
                                gsap.to(c, {
                                    y: yPos,
                                    scale: 1,
                                    duration: 0.3,
                                    ease: "power2.out"
                                });
                            }
                        });

                        card.classList.add('active-card');

                        // Lift active card and show it expanded
                        gsap.to(card, {
                            y: yPosition - 20,
                            scale: 1.2, // Keep it slightly expanded
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    }
                });
            });
        } else {
            // Fallback for non-GSAP
            const fanAngle = 15;
            const startAngle = -((totalCards - 1) * fanAngle) / 2;

            cards.forEach((card, index) => {
                const rotation = startAngle + (index * fanAngle);
                const centerIndex = (totalCards - 1) / 2;
                const distanceFromCenter = index - centerIndex;
                const xOffset = distanceFromCenter * 100;
                const yOffset = Math.abs(distanceFromCenter) * Math.abs(distanceFromCenter) * 5;

                card.style.transform = `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${rotation}deg)`;
                card.style.zIndex = index + 1;
                card.style.opacity = '1';

                // Click handler
                card.addEventListener('click', () => {
                    const personaKey = card.dataset.persona;
                    if (this.currentPersona !== personaKey) {
                        this.switchPersona(personaKey);
                        cards.forEach(c => c.classList.remove('active-card'));
                        card.classList.add('active-card');
                    }
                });
            });
        }
    }

    /**
     * Select a character and initialize the site
     * @param {string} persona - The selected persona
     */
    selectCharacter(persona) {
        console.log('selectCharacter called for:', persona);

        // Save selection
        localStorage.setItem('bustling_v2_visited', 'true');
        localStorage.setItem('bustling_v2_persona', persona);

        // Apply persona
        this.setPersona(persona);

        // Clear any existing content first to prevent duplicate
        const contentArea = document.querySelector('.content');
        if (contentArea) {
            contentArea.innerHTML = '';
        }

        // Transition to main content
        this.hideCharacterSelection();
        this.showMainContent();

        // Render the card deck
        this.renderCardDeck();

        // After showing main content, load Welcome as the default page
        const isIndexPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
        if (isIndexPage) {
            // Load welcome content after animation
            setTimeout(() => {
                console.log('Loading welcome content after character selection');
                if (window.loadPageContent) {
                    window.loadPageContent('welcome');
                }
            }, 500);
        }

        // Event dispatch is now handled in setPersona()
    }

    /**
     * Switch to a different persona
     * @param {string} persona - The persona to switch to
     */
    switchPersona(persona) {
        console.log('[switchPersona] Switching from', this.currentPersona, 'to', persona);
        if (persona === this.currentPersona) {
            console.log('[switchPersona] Same persona, skipping');
            return;
        }

        // Save to localStorage - this will trigger storage event for cross-tab sync
        localStorage.setItem('bustling_v2_persona', persona);

        // Set the persona which will dispatch the personaChanged event
        this.setPersona(persona);

        // Update role selection active state
        this.updateRoleSelectionActive(persona);

        // Re-render deck to update active state if needed,
        // or just update classes (handled in click listener for performance)
        // But if called from elsewhere (like top switcher), we should update deck
        const deckContainer = document.getElementById('cardDeck');
        if (deckContainer) {
            const cards = deckContainer.querySelectorAll('.deck-card');
            cards.forEach((card, index) => {
                const key = Object.keys(this.personaData)[index];
                if (key === persona) {
                    card.classList.add('active-card');
                } else {
                    card.classList.remove('active-card');
                }
            });
        }

        // Force immediate navigation icon update after persona switch
        // Use requestAnimationFrame to ensure DOM is ready
        console.log('[switchPersona] Scheduling navigation icon update');
        requestAnimationFrame(() => {
            console.log('[switchPersona] First update call');
            this.updateNavigationIcons();
            // Double update to ensure it takes effect
            setTimeout(() => {
                console.log('[switchPersona] Second update call');
                this.updateNavigationIcons();
            }, 50);
        });

        // If we're on the welcome page, reload it to update content and links
        const activeNav = document.querySelector('.nav-link.active');
        const isWelcomePage = !activeNav || activeNav.dataset.page === 'welcome';
        if (isWelcomePage && window.loadPageContent) {
            setTimeout(() => {
                window.loadPageContent('welcome');
            }, 100);
        }

        // Event dispatch is now handled in setPersona()
    }

    /**
     * Update the active state of role selection options
     * @param {string} persona - The current active persona
     */
    updateRoleSelectionActive(persona) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            const roleOptions = document.querySelectorAll('.role-option');

            if (roleOptions.length === 0) {
                console.log('No role options found, retrying...');
                // Retry after a short delay if elements not found
                setTimeout(() => {
                    const retryOptions = document.querySelectorAll('.role-option');
                    retryOptions.forEach(option => {
                        if (option.dataset.role === persona) {
                            option.classList.add('active');
                        } else {
                            option.classList.remove('active');
                        }
                    });
                }, 100);
                return;
            }

            roleOptions.forEach(option => {
                if (option.dataset.role === persona) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }, 0);
    }

    /**
     * Reset to character selection screen
     */
    resetToCharacterSelection() {
        // Clear localStorage
        localStorage.removeItem('bustling_v2_visited');
        localStorage.removeItem('bustling_v2_persona');

        // Check if we're on the main page with character selection
        const modal = document.getElementById('characterSelect');
        if (modal) {
            // We're on the main page, show the modal
            this.currentPersona = null;

            // Hide main content
            const container = document.getElementById('mainContainer');
            if (container) {
                container.style.opacity = '0';
            }

            const switcher = document.getElementById('personaSwitcher');
            if (switcher) {
                switcher.classList.add('hidden');
            }

            // Hide card deck
            const deckContainer = document.getElementById('cardDeck');
            if (deckContainer) {
                deckContainer.classList.add('hidden');
            }

            // Show character selection
            this.showCharacterSelection();
        } else {
            // We're on a detail page, redirect to main page
            window.location.href = '/?reset=true';
        }
    }
    /**
     * Set the current persona and update the UI
     * @param {string} persona - The persona to set
     */
    setPersona(persona) {
        if (!this.personaData[persona]) return;

        // Check if persona is actually changing
        const previousPersona = this.currentPersona;

        this.currentPersona = persona;
        const data = this.personaData[persona];

        // Update body theme class
        document.body.className = ''; // Clear existing classes
        document.body.classList.add(data.theme);

        // Always update role selection active state when persona changes
        this.updateRoleSelectionActive(persona);

        // Dispatch persona change event if persona actually changed
        if (previousPersona !== persona) {
            window.dispatchEvent(new CustomEvent('personaChanged', {
                detail: { persona: persona }
            }));
        }

        // Update persona badge
        const badge = document.getElementById('personaBadge');
        if (badge) {
            const badgeText = badge.querySelector('.badge-text');
            if (badgeText) badgeText.textContent = data.name;
        }

        // Update role card
        this.updateRoleCard(persona);

        // Update mobile role title
        const mobileTitle = document.getElementById('mobileRoleTitle');
        if (mobileTitle) {
            const roleText = mobileTitle.querySelector('.role-text');
            if (roleText) roleText.textContent = data.name;
        }

        // Update current persona image in switcher
        const currentImg = document.getElementById('currentPersonaImage');
        if (currentImg) {
            currentImg.src = data.image;
            currentImg.alt = data.name;
        }

        // Update content
        this.updatePersonaContent();
    }

    /**
     * Update content based on current persona
     */
    updatePersonaContent() {
        if (!this.currentPersona) return;

        const data = this.personaData[this.currentPersona];

        // Update navigation icons for founder persona
        this.updateNavigationIcons();

        // Update welcome page content if we're on the welcome page
        // This is a bit of a hack since the content is dynamically loaded by spa-navigation.js
        // We'll try to find the elements and update them if they exist

        // We can also dispatch a custom event that spa-navigation.js could listen to
        // But for now, let's just update what we can find

        // Note: The actual content update logic might need to be more robust
        // depending on how spa-navigation.js renders the welcome page.
        // For now, we'll assume the structure matches what we expect.
    }

    /**
     * Initialize role selection options
     */
    initializeRoleOptions() {
        const roleOptions = document.querySelectorAll('.role-option');

        roleOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const role = option.dataset.role;

                // Update active state
                roleOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // Switch persona (this updates all UI elements)
                this.switchPersona(role);

                // Navigate to welcome page to show the persona-specific content
                // Check if we're on the index page
                const isIndexPage = window.location.pathname === '/' || window.location.pathname === '/index.html';

                if (isIndexPage) {
                    // If we have the SPA navigation function, use it
                    if (window.loadPageContent) {
                        window.loadPageContent('welcome');
                    }

                    // Update the navigation to show welcome as active
                    const navLinks = document.querySelectorAll('.nav-link');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.dataset.page === 'welcome') {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }

    /**
     * Update role card display
     */
    updateRoleCard(persona) {
        const roleCard = document.getElementById('roleCard');
        const roleCardIcon = document.getElementById('roleCardIcon');
        const roleCardName = document.getElementById('roleCardName');
        const roleCardSubtitle = document.getElementById('roleCardSubtitle');

        if (!roleCard || !roleCardIcon) return;

        // Update character names and subtitles (from main page second line)
        const characters = {
            founder: {
                name: 'Founder',
                subtitle: 'Startup Warrior'
            },
            operator: {
                name: 'Operator',
                subtitle: 'Systems Architect'
            },
            investor: {
                name: 'Investor',
                subtitle: 'Capital Allocator'
            },
            dad: {
                name: 'Dad',
                subtitle: 'Life Mentor'
            }
        };

        const character = characters[persona] || characters.founder;

        if (roleCardName) {
            roleCardName.textContent = character.name;
        }
        if (roleCardSubtitle) {
            roleCardSubtitle.textContent = character.subtitle;
        }

        // Update with character avatars - same as top-right corner
        const avatars = {
            founder: '/assets/alan-2.jpeg',
            operator: '/assets/operator.png',
            investor: '/assets/investor.png',
            dad: '/assets/dad.png'
        };

        const avatarUrl = avatars[persona] || avatars.founder;
        roleCardIcon.innerHTML = `<img src="${avatarUrl}" alt="${character.name}">`;
    }

    /**
     * Set active navigation based on current page
     */
    setActiveNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');

            // Check if this is the current page
            if (currentPath === href ||
                (currentPath === '/' && href === '/') ||
                (currentPath === '/index.html' && href === '/') ||
                (currentPath.includes(href) && href !== '/')) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Update navigation icons based on persona
     */
    updateNavigationIcons(skipActiveUpdate = false) {
        console.log('[updateNavigationIcons] Called with persona:', this.currentPersona);
        console.log('[updateNavigationIcons] skipActiveUpdate:', skipActiveUpdate);

        // Only set active navigation if not called from click handler
        if (!skipActiveUpdate) {
            this.setActiveNavigation();
        }

        const navItems = document.querySelectorAll('.nav-item');
        console.log('[updateNavigationIcons] Found nav items:', navItems.length);

        const isFounder = this.currentPersona === 'founder';
        const isOperator = this.currentPersona === 'operator';
        const isInvestor = this.currentPersona === 'investor';
        const isDad = this.currentPersona === 'dad';
        console.log('[updateNavigationIcons] Persona checks - Founder:', isFounder, 'Operator:', isOperator, 'Investor:', isInvestor, 'Dad:', isDad);

        // Pixel art sword SVG icon - diagonal design
        const swordSvg = `<svg width="20" height="20" viewBox="0 0 20 20" style="image-rendering: pixelated; image-rendering: crisp-edges;">
            <!-- Blade -->
            <rect x="13" y="2" width="2" height="2" fill="#E0E0E0"/>
            <rect x="12" y="3" width="2" height="2" fill="#E0E0E0"/>
            <rect x="11" y="4" width="2" height="2" fill="#E0E0E0"/>
            <rect x="10" y="5" width="2" height="2" fill="#E0E0E0"/>
            <rect x="9" y="6" width="2" height="2" fill="#E0E0E0"/>
            <rect x="8" y="7" width="2" height="2" fill="#E0E0E0"/>

            <!-- Blade edge (darker) -->
            <rect x="14" y="2" width="1" height="1" fill="#B0B0B0"/>
            <rect x="13" y="3" width="1" height="1" fill="#B0B0B0"/>
            <rect x="12" y="4" width="1" height="1" fill="#B0B0B0"/>
            <rect x="11" y="5" width="1" height="1" fill="#B0B0B0"/>
            <rect x="10" y="6" width="1" height="1" fill="#B0B0B0"/>
            <rect x="9" y="7" width="1" height="1" fill="#B0B0B0"/>

            <!-- Guard/Crossguard -->
            <rect x="6" y="8" width="1" height="1" fill="#8B7355"/>
            <rect x="7" y="7" width="1" height="1" fill="#8B7355"/>
            <rect x="7" y="8" width="2" height="2" fill="#8B7355"/>
            <rect x="8" y="9" width="1" height="1" fill="#8B7355"/>
            <rect x="9" y="8" width="1" height="1" fill="#8B7355"/>

            <!-- Handle (diagonal) -->
            <rect x="6" y="9" width="1" height="1" fill="#654321"/>
            <rect x="5" y="10" width="1" height="1" fill="#8B4513"/>
            <rect x="4" y="11" width="1" height="1" fill="#654321"/>
            <rect x="3" y="12" width="1" height="1" fill="#8B4513"/>

            <!-- Handle wrap details -->
            <rect x="6" y="10" width="1" height="1" fill="#DAA520"/>
            <rect x="5" y="11" width="1" height="1" fill="#DAA520"/>
            <rect x="4" y="12" width="1" height="1" fill="#DAA520"/>

            <!-- Pommel -->
            <rect x="2" y="13" width="2" height="2" fill="#DAA520"/>
            <rect x="2" y="14" width="1" height="1" fill="#B8860B"/>
        </svg>`;

        // Pixel art wrench icon for operator - simple vertical design (rotated via CSS)
        const screwdriverSvg = `<svg width="20" height="20" viewBox="0 0 20 20" style="image-rendering: pixelated; image-rendering: crisp-edges; transform: rotate(45deg); transform-origin: center;">
            <!-- C-shaped head at top (opening facing up) -->
            <!-- Left side of C -->
            <rect x="6" y="2" width="2" height="5" fill="#8C8C8C"/>
            <rect x="6" y="2" width="1" height="5" fill="#A0A0A0"/>

            <!-- Right side of C -->
            <rect x="12" y="2" width="2" height="5" fill="#8C8C8C"/>
            <rect x="13" y="2" width="1" height="5" fill="#A0A0A0"/>

            <!-- Bottom bar of C -->
            <rect x="6" y="6" width="8" height="2" fill="#8C8C8C"/>
            <rect x="7" y="7" width="6" height="1" fill="#A0A0A0"/>

            <!-- Handle (vertical stick) -->
            <rect x="9" y="8" width="2" height="10" fill="#A0A0A0"/>

            <!-- Left edge shadow on handle -->
            <rect x="8" y="8" width="1" height="10" fill="#8C8C8C"/>

            <!-- Right edge highlight on handle -->
            <rect x="11" y="8" width="1" height="10" fill="#B0B0B0"/>

            <!-- Light center line on handle for depth -->
            <rect x="10" y="8" width="1" height="10" fill="#C0C0C0"/>
        </svg>`;

        // Pixel art dollar coin icon for investor - gold/yellow coin
        const moneyStackSvg = `<svg width="20" height="20" viewBox="0 0 20 20" style="image-rendering: pixelated; image-rendering: crisp-edges;">
            <!-- Black outline for coin -->
            <rect x="7" y="3" width="6" height="1" fill="#000000"/>
            <rect x="5" y="4" width="2" height="1" fill="#000000"/>
            <rect x="13" y="4" width="2" height="1" fill="#000000"/>
            <rect x="4" y="5" width="1" height="2" fill="#000000"/>
            <rect x="15" y="5" width="1" height="2" fill="#000000"/>
            <rect x="3" y="7" width="1" height="6" fill="#000000"/>
            <rect x="16" y="7" width="1" height="6" fill="#000000"/>
            <rect x="4" y="13" width="1" height="2" fill="#000000"/>
            <rect x="15" y="13" width="1" height="2" fill="#000000"/>
            <rect x="5" y="15" width="2" height="1" fill="#000000"/>
            <rect x="13" y="15" width="2" height="1" fill="#000000"/>
            <rect x="7" y="16" width="6" height="1" fill="#000000"/>

            <!-- Gold coin body -->
            <rect x="7" y="4" width="6" height="1" fill="#FFD700"/>
            <rect x="5" y="5" width="10" height="1" fill="#FFC107"/>
            <rect x="4" y="6" width="12" height="1" fill="#FFD700"/>
            <rect x="4" y="7" width="12" height="1" fill="#FFC107"/>
            <rect x="4" y="8" width="12" height="1" fill="#FFD700"/>
            <rect x="4" y="9" width="12" height="1" fill="#FFC107"/>
            <rect x="4" y="10" width="12" height="1" fill="#FFD700"/>
            <rect x="4" y="11" width="12" height="1" fill="#FFC107"/>
            <rect x="4" y="12" width="12" height="1" fill="#FFD700"/>
            <rect x="5" y="13" width="10" height="1" fill="#FFC107"/>
            <rect x="5" y="14" width="10" height="1" fill="#FFD700"/>
            <rect x="7" y="15" width="6" height="1" fill="#FFC107"/>

            <!-- Dollar sign (more prominent) -->
            <!-- Vertical line -->
            <rect x="9" y="5" width="1" height="1" fill="#654321"/>
            <rect x="9" y="6" width="1" height="1" fill="#654321"/>
            <rect x="9" y="7" width="1" height="1" fill="#654321"/>
            <rect x="9" y="8" width="1" height="1" fill="#654321"/>
            <rect x="9" y="9" width="1" height="1" fill="#654321"/>
            <rect x="9" y="10" width="1" height="1" fill="#654321"/>
            <rect x="9" y="11" width="1" height="1" fill="#654321"/>
            <rect x="9" y="12" width="1" height="1" fill="#654321"/>
            <rect x="9" y="13" width="1" height="1" fill="#654321"/>

            <!-- S shape -->
            <rect x="8" y="6" width="3" height="1" fill="#654321"/>
            <rect x="7" y="7" width="1" height="1" fill="#654321"/>
            <rect x="8" y="8" width="2" height="1" fill="#654321"/>
            <rect x="10" y="9" width="2" height="1" fill="#654321"/>
            <rect x="11" y="10" width="1" height="1" fill="#654321"/>
            <rect x="8" y="11" width="3" height="1" fill="#654321"/>

            <!-- Shine/highlight -->
            <rect x="6" y="5" width="2" height="1" fill="#FFF8DC"/>
            <rect x="5" y="6" width="2" height="1" fill="#FFF8DC"/>
        </svg>`;

        // Pixel art house icon for dad - clear simple design
        const houseSvg = `<svg width="20" height="20" viewBox="0 0 20 20" style="image-rendering: pixelated; image-rendering: crisp-edges;">
            <!-- Black outline for roof -->
            <rect x="10" y="3" width="1" height="1" fill="#2C2C2C"/>
            <rect x="9" y="4" width="1" height="1" fill="#2C2C2C"/>
            <rect x="11" y="4" width="1" height="1" fill="#2C2C2C"/>
            <rect x="8" y="5" width="1" height="1" fill="#2C2C2C"/>
            <rect x="12" y="5" width="1" height="1" fill="#2C2C2C"/>
            <rect x="7" y="6" width="1" height="1" fill="#2C2C2C"/>
            <rect x="13" y="6" width="1" height="1" fill="#2C2C2C"/>
            <rect x="6" y="7" width="1" height="1" fill="#2C2C2C"/>
            <rect x="14" y="7" width="1" height="1" fill="#2C2C2C"/>
            <rect x="5" y="8" width="1" height="1" fill="#2C2C2C"/>
            <rect x="15" y="8" width="1" height="1" fill="#2C2C2C"/>

            <!-- Coral roof fill to match Dad theme -->
            <rect x="10" y="4" width="1" height="1" fill="#FF7F50"/>
            <rect x="9" y="5" width="3" height="1" fill="#FF7F50"/>
            <rect x="8" y="6" width="5" height="1" fill="#FF7F50"/>
            <rect x="7" y="7" width="7" height="1" fill="#FF7F50"/>
            <rect x="6" y="8" width="9" height="1" fill="#FF7F50"/>

            <!-- Black outline for walls -->
            <rect x="5" y="9" width="1" height="6" fill="#2C2C2C"/>
            <rect x="15" y="9" width="1" height="6" fill="#2C2C2C"/>
            <rect x="5" y="15" width="11" height="1" fill="#2C2C2C"/>

            <!-- Beige/tan walls -->
            <rect x="6" y="9" width="9" height="6" fill="#F5DEB3"/>

            <!-- Brown door -->
            <rect x="9" y="11" width="2" height="4" fill="#8B4513"/>

            <!-- Chimney on the right -->
            <rect x="14" y="6" width="2" height="3" fill="#8B4513"/>
            <rect x="14" y="5" width="2" height="1" fill="#654321"/>

            <!-- Animated smoke (will be animated with CSS) -->
            <g class="house-smoke">
                <rect x="14" y="3" width="1" height="1" fill="#444444" opacity="0.9"/>
                <rect x="15" y="2" width="1" height="1" fill="#444444" opacity="0.8"/>
                <rect x="14" y="1" width="1" height="1" fill="#444444" opacity="0.7"/>
            </g>

            <g class="house-smoke" style="animation-delay: 0.5s;">
                <rect x="13" y="3" width="1" height="1" fill="#444444" opacity="0.9"/>
                <rect x="14" y="2" width="1" height="1" fill="#444444" opacity="0.8"/>
                <rect x="15" y="1" width="1" height="1" fill="#444444" opacity="0.7"/>
            </g>

            <g class="house-smoke" style="animation-delay: 1s;">
                <rect x="15" y="3" width="1" height="1" fill="#444444" opacity="0.9"/>
                <rect x="14" y="2" width="1" height="1" fill="#444444" opacity="0.8"/>
                <rect x="13" y="1" width="1" height="1" fill="#444444" opacity="0.7"/>
            </g>
        </svg>`;

        navItems.forEach(item => {
            const navIcon = item.querySelector('.nav-icon');
            const navLink = item.querySelector('.nav-link');

            if (navIcon && navLink) {
                // Save original icon if not already saved
                if (!navIcon.dataset.originalIcon) {
                    navIcon.dataset.originalIcon = navIcon.innerHTML;
                }

                const isActive = navLink.classList.contains('active');
                const pageName = navLink.dataset.page || 'unknown';
                console.log(`[updateNavigationIcons] Processing ${pageName} - Active: ${isActive}`);

                if (isFounder) {
                    // For founder: ONLY show sword on active page, hide ALL other icons
                    if (isActive) {
                        console.log(`[updateNavigationIcons] Setting sword icon for active page: ${pageName}`);
                        navIcon.innerHTML = swordSvg;
                    } else {
                        navIcon.innerHTML = '';
                    }
                } else if (isOperator) {
                    // For operator: ONLY show wrench on active page, hide ALL other icons
                    if (isActive) {
                        console.log(`[updateNavigationIcons] Setting screwdriver icon for active page: ${pageName}`);
                        navIcon.innerHTML = screwdriverSvg;
                    } else {
                        navIcon.innerHTML = '';
                    }
                } else if (isInvestor) {
                    // For investor: ONLY show money stack on active page, hide ALL other icons
                    if (isActive) {
                        console.log(`[updateNavigationIcons] Setting money stack icon for active page: ${pageName}`);
                        navIcon.innerHTML = moneyStackSvg;
                    } else {
                        navIcon.innerHTML = '';
                    }
                } else if (isDad) {
                    // For dad: ONLY show house on active page, hide ALL other icons
                    if (isActive) {
                        console.log(`[updateNavigationIcons] Setting house icon for active page: ${pageName}`);
                        navIcon.innerHTML = houseSvg;
                    } else {
                        navIcon.innerHTML = '';
                    }
                } else {
                    // Restore original icons for other personas
                    if (navIcon.dataset.originalIcon) {
                        console.log(`[updateNavigationIcons] Restoring original icon for ${pageName}`);
                        navIcon.innerHTML = navIcon.dataset.originalIcon;
                    }
                }
            }
        });
        console.log('[updateNavigationIcons] Update complete');
    }

    /**
     * Show the main content and hide character selection
     */
    showMainContent() {
        const modal = document.getElementById('characterSelect');
        const mainContainer = document.getElementById('mainContainer');
        const personaSwitcher = document.getElementById('personaSwitcher');
        const cardDeck = document.getElementById('cardDeck');

        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('character-select-active');
        }

        if (mainContainer) {
            mainContainer.style.opacity = '1';
        }

        if (personaSwitcher) {
            personaSwitcher.classList.remove('hidden');
        }

        // Show card deck only on desktop
        if (cardDeck && window.innerWidth > 768) {
            cardDeck.classList.remove('hidden');
        }
    }
}

// Initialize when DOM is ready
function initializeBustlingWorld() {
    window.bustlingWorldV2 = new BustlingWorldV2();

    // Initialize role selection options
    if (window.bustlingWorldV2) {
        window.bustlingWorldV2.initializeRoleOptions();
    }

    // Note: Removed duplicate mobile persona initialization
    // It's already handled in the setupPersonaSwitcher method

    // Debug: Check if background image is loading
    if (window.innerWidth > 768) {
        const img = new Image();
        img.onload = function () {
            console.log('Background image loaded successfully: /assets/bg3.png');
        };
        img.onerror = function () {
            console.error('Failed to load background image: /assets/bg3.png');
        };
        img.src = '/assets/bg3.png';

        // Check computed styles
        const bodyStyles = window.getComputedStyle(document.body, '::before');
        console.log('Body::before background-image:', bodyStyles.backgroundImage);
        console.log('Body::before opacity:', bodyStyles.opacity);
        console.log('Body::before z-index:', bodyStyles.zIndex);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBustlingWorld);
} else {
    initializeBustlingWorld();
}