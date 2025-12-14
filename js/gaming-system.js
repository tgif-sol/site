/**
 * Gaming System - Character Selection & Persona Management
 * Professional Game-Inspired Portfolio JavaScript
 * @module GamingSystem
 * @author Alan James Curtis
 * @version 2.0.0
 */

'use strict';

/**
 * Gaming System Class
 * Manages character selection, persona switching, and navigation
 */
class GamingSystem {
    /**
     * @constructor
     */
    constructor() {
        /** @type {string|null} */
        this.currentPersona = null;

        /** @type {boolean} */
        this.isFirstVisit = !Storage.hasVisited();

        // Persona configuration
        this.personaData = {
            founder: {
                name: 'Founder',
                theme: 'persona-founder',
                image: '/assets/founder.png',
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
                name: 'Girl Dad',
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
            Storage.clearAll();
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
            const savedPersona = Storage.getPersona();
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
                // Wait for spa-navigation.js to load
                const tryLoadWelcome = (attempts = 0) => {
                    const contentArea = document.querySelector('.content');
                    const hasWelcomeContent = contentArea && (contentArea.querySelector('.welcome-cards') || contentArea.querySelector('.welcome-page'));

                    if (!hasWelcomeContent) {
                        if (window.loadPageContent) {
                        window.loadPageContent('welcome');
                        } else if (attempts < 10) {
                            // Retry if spa-navigation.js hasn't loaded yet
                            setTimeout(() => tryLoadWelcome(attempts + 1), 100);
                    }
                    }
                };
                setTimeout(() => tryLoadWelcome(), 200);
            }
        }

        this.setupEventListeners();
        this.setupMobileMenu();

        // Setup hashchange listener to update navigation when URL hash changes
        window.addEventListener('hashchange', () => {
            this.setActiveNavigation();
            this.updateNavigationIcons(true);
        });

        // Update navigation icons after everything is initialized
        // This ensures the sword appears on the correct page
        // Check hash on initial load - wait for spa-navigation to process first
        const checkHashAndUpdate = () => {
            const hash = window.location.hash;
            if (hash) {
                // Extract page from hash
                const hashParts = hash.substring(1).split('/');
                const pageKey = hashParts[0];
                
                // Find and activate the correct nav link
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.page === pageKey) {
                        link.classList.add('active');
                    }
                });
                
                // Update icons after setting active state
                this.updateNavigationIcons(true);
            } else {
                // No hash, just update icons normally
                this.updateNavigationIcons();
            }
        };
        
        // Wait a bit longer to ensure spa-navigation has processed the hash
        setTimeout(checkHashAndUpdate, 300);
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
    /**
     * Setup character selection cards
     */
    setupCharacterSelection() {
        const characterCards = document.querySelectorAll('.character-card');
        const isMobile = Device.isMobile();

        characterCards.forEach(card => {
            const persona = card.dataset.persona;

            // Setup video for cards with video
            if (card.dataset.persona === 'founder' || card.dataset.persona === 'dad' || card.dataset.persona === 'operator' || card.dataset.persona === 'investor') {
                const video = card.querySelector('.character-video');
                if (video) {
                    // Ensure video is muted
                    video.muted = true;
                    
                    // Handle founder video - play from start
                    if (card.dataset.persona === 'founder') {
                        video.loop = true; // Use native loop
                    }
                    // Handle operator video - loop back to start at 4 seconds
                    else if (card.dataset.persona === 'operator') {
                        video.loop = false; // Disable native loop
                        video.addEventListener('timeupdate', () => {
                            if (video.currentTime >= 4) {
                                video.currentTime = 0; // Loop back to start
                                // No pause - keep playing
                            }
                        });
                    }
                    // Handle investor video - loop back to start at 4 seconds
                    else if (card.dataset.persona === 'investor') {
                        video.loop = false; // Disable native loop
                        video.addEventListener('timeupdate', () => {
                            if (video.currentTime >= 4) {
                                video.currentTime = 0; // Loop back to start
                                // No pause - keep playing
                            }
                        });
                    }
                    // Handle dad video - loop back to start at 6 seconds
                    else if (card.dataset.persona === 'dad') {
                        video.loop = false; // Disable native loop
                        video.addEventListener('timeupdate', () => {
                            if (video.currentTime >= 6) {
                                video.currentTime = 0; // Loop back to start
                                // No pause - keep playing
                            }
                        });
                    }

                    // DESKTOP behavior
                    if (!isMobile) {
                        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                            const videoSrc = video.getAttribute('data-src') || video.getAttribute('src');
                            if (videoSrc) {
                            if (video.getAttribute('data-src')) {
                                    video.src = videoSrc;
                                }
                            video.muted = true;
                            video.playsInline = true;
                            video.preload = 'auto';
                            
                            if (isSafari) {
                                video.setAttribute('webkit-playsinline', 'true');
                                video.setAttribute('playsinline', 'true');
                            }
                            
                                    video.load();
                            
                            if (isSafari) {
                                const warmUpVideo = () => {
                                    if (video.readyState >= 2) {
                                        video.currentTime = 0;
                                        video.pause();
                                    }
                                };
                                
                                video.addEventListener('loadedmetadata', warmUpVideo, { once: true });
                                video.addEventListener('canplay', warmUpVideo, { once: true });
                                video.addEventListener('canplaythrough', () => {
                                    video.currentTime = 0;
                                    video.pause();
                                }, { once: true });
                                
                                card.addEventListener('mouseenter', () => {
                                    if (video.readyState >= 2 && video.paused) {
                                        video.currentTime = 0;
                                    }
                                }, { passive: true });
                            }
                        }
                        
                        card.addEventListener('mouseenter', () => {
                            let playAttempts = 0;
                            const maxAttempts = 5;
                            
                            const playVideo = () => {
                                video.currentTime = 0;
                                
                                if (isSafari && video.readyState < 2) {
                                    video.load();
                                }
                                
                                const playPromise = video.play();
                                if (playPromise !== undefined) {
                                    playPromise.then(() => {
                                        requestAnimationFrame(() => {
                                            card.classList.add('video-playing');
                                            if (isSafari) {
                                                video.style.opacity = '';
                                            }
                                        });
                                    }).catch(e => {
                                        if (playAttempts < maxAttempts) {
                                            playAttempts++;
                                            const delay = isSafari ? Math.min(100 * playAttempts, 300) : 50;
                                            setTimeout(() => {
                                                if (video.readyState >= 2) {
                                                    playVideo();
                                                }
                                            }, delay);
                                        } else {
                                            console.log('Video play failed after retries:', e);
                                        }
                                    });
                                } else {
                                    if (playAttempts < maxAttempts && video.readyState >= 2) {
                                        playAttempts++;
                                        setTimeout(() => {
                                            playVideo();
                                        }, 100);
                                    }
                                }
                            };

                            if (isSafari) {
                                playVideo();
                                
                                if (video.readyState < 3) {
                                    const playWhenReady = () => {
                                        if (video.paused && video.readyState >= 2) {
                                            requestAnimationFrame(() => {
                                                playVideo();
                                            });
                                        }
                                    };
                                    video.addEventListener('canplaythrough', playWhenReady, { once: true });
                                    video.addEventListener('canplay', playWhenReady, { once: true });
                                    video.addEventListener('loadeddata', playWhenReady, { once: true });
                                }
                            } else {
                                if (video.readyState >= 2) {
                                    playVideo();
                                } else {
                                    playVideo();
                                    const playWhenReady = () => {
                                        if (video.paused) {
                                            playVideo();
                                        }
                                    };
                                    video.addEventListener('canplay', playWhenReady, { once: true });
                                    video.addEventListener('loadeddata', playWhenReady, { once: true });
                                }
                            }
                        });

                        card.addEventListener('mouseleave', () => {
                            video.pause();
                            card.classList.remove('video-playing');
                            // Reset all videos to 0 seconds
                            video.currentTime = 0;
                        });
                    }
                    // MOBILE behavior - Show video preview by default, click to play/pause
                    else {
                        const videoSrc = video.getAttribute('data-src') || video.getAttribute('src');
                        if (videoSrc) {
                            if (!video.src || video.readyState === 0) {
                                if (video.getAttribute('data-src') && video.src !== videoSrc) {
                                    video.src = videoSrc;
                                }
                                video.muted = true;
                                video.playsInline = true;
                                video.preload = 'auto'; // Preload for instant playback
                                video.setAttribute('webkit-playsinline', 'true');
                                video.setAttribute('playsinline', 'true');
                                video.setAttribute('x-webkit-airplay', 'allow');
                                
                                const setupPreview = () => {
                                // CRITICAL: Fix video position to 25% via inline style with !important
                                // This prevents browser reflow from causing position jumps in Chrome/Safari
                                video.style.setProperty('object-position', 'center 25%', 'important');
                                video.style.setProperty('-webkit-object-position', 'center 25%', 'important');
                                video.style.setProperty('transform', 'translateZ(0)', 'important');
                                video.style.setProperty('-webkit-transform', 'translateZ(0)', 'important');
                                video.style.setProperty('transition', 'none', 'important');
                                video.style.setProperty('-webkit-transition', 'none', 'important');
                                    
                                    video.currentTime = 0;
                                    video.pause();
                                    
                                    // Wait for first frame to be ready, then show video (prevents poster/first frame flash)
                                    if (video.readyState >= 2) {
                                        video.currentTime = 0.1;
                                        setTimeout(() => {
                                            video.currentTime = 0;
                                            // Re-enforce position to 25% (browser reflow might reset it)
                                            video.style.setProperty('object-position', 'center 25%', 'important');
                                            video.style.setProperty('-webkit-object-position', 'center 25%', 'important');
                                            // Now show the video - first frame is ready (for desktop, video is shown on hover/click)
                                        }, 50);
                                    } else {
                                        // Wait for video to be ready
                                        const showWhenReady = () => {
                                            if (video.readyState >= 2) {
                                                video.currentTime = 0;
                                                // Video will be shown on hover/click for desktop
                                            }
                                        };
                                        video.addEventListener('loadeddata', showWhenReady, { once: true });
                                        video.addEventListener('canplay', showWhenReady, { once: true });
                                    }
                                };
                                
                                video.load();
                                video.addEventListener('loadedmetadata', setupPreview, { once: true });
                                video.addEventListener('loadeddata', setupPreview, { once: true });
                            } else {
                                video.currentTime = 0;
                                video.pause();
                            }
                        }

                        // Click on card toggles between video preview/playing
                        const portrait = card.querySelector('.character-portrait');
                        const img = card.querySelector('.character-photo');
                        const videoElement = card.querySelector('.character-video');

                        // Function to handle the toggle
                        const handleToggle = (e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Prevent any bubbling

                            if (card.classList.contains('video-playing')) {
                                // CRITICAL: Fix video position to 25% via inline style with !important
                                // This prevents browser reflow from causing position jumps in Chrome/Safari
                                video.style.setProperty('object-position', 'center 25%', 'important');
                                video.style.setProperty('-webkit-object-position', 'center 25%', 'important');
                                video.style.setProperty('transform', 'translateZ(0)', 'important');
                                video.style.setProperty('-webkit-transform', 'translateZ(0)', 'important');
                                video.style.setProperty('transition', 'none', 'important');
                                video.style.setProperty('-webkit-transition', 'none', 'important');
                                
                                // Pause video - show image
                                card.classList.remove('video-playing');
                                card.classList.add('video-paused');
                                video.pause();
                                video.currentTime = 0;
                                
                                // Re-enforce position to 25% after class change (browser reflow might reset it)
                                requestAnimationFrame(() => {
                                    video.style.setProperty('object-position', 'center 25%', 'important');
                                    video.style.setProperty('-webkit-object-position', 'center 25%', 'important');
                                    video.style.setProperty('transform', 'translateZ(0)', 'important');
                                    video.style.setProperty('-webkit-transform', 'translateZ(0)', 'important');
                                });
                            } else {
                                // CRITICAL: Fix video position to 25% via inline style with !important
                                // This prevents browser reflow from causing position jumps in Chrome/Safari
                                video.style.setProperty('object-position', 'center 25%', 'important');
                                video.style.setProperty('-webkit-object-position', 'center 25%', 'important');
                                video.style.setProperty('transform', 'translateZ(0)', 'important');
                                video.style.setProperty('-webkit-transform', 'translateZ(0)', 'important');
                                video.style.setProperty('transition', 'none', 'important');
                                video.style.setProperty('-webkit-transition', 'none', 'important');
                                
                                // Start video playback - optimized for instant playback
                                const videoSrc = video.getAttribute('data-src') || video.getAttribute('src');
                                if (videoSrc) {
                                    if (video.getAttribute('data-src') && video.src !== videoSrc) {
                                        video.src = videoSrc;
                                    }
                                    
                                    // Add playing class immediately to prevent black screen
                                    // Position is already fixed above, so no jumping will occur
                                    card.classList.remove('video-paused');
                                    card.classList.add('video-playing');
                                    
                                    // Re-enforce position to 25% after class change (browser reflow might reset it)
                                    requestAnimationFrame(() => {
                                        video.style.setProperty('object-position', 'center 25%', 'important');
                                        video.style.setProperty('-webkit-object-position', 'center 25%', 'important');
                                        video.style.setProperty('transform', 'translateZ(0)', 'important');
                                        video.style.setProperty('-webkit-transform', 'translateZ(0)', 'important');
                                    });
                                    
                                    // Play immediately - video should be preloaded
                                    const playVideo = () => {
                                        video.currentTime = 0;
                                        const playPromise = video.play();
                                        if (playPromise !== undefined) {
                                            playPromise.then(() => {
                                                // Video is playing
                                            }).catch(err => {
                                                console.log('Video play failed:', err);
                                                // Fix position to 25% before class change to prevent jumping
                                                video.style.setProperty('object-position', 'center 25%', 'important');
                                                video.style.setProperty('-webkit-object-position', 'center 25%', 'important');
                                                video.style.transform = 'translateZ(0)';
                                                video.style.webkitTransform = 'translateZ(0)';
                                                card.classList.remove('video-playing');
                                                card.classList.add('video-paused');
                                            });
                                        }
                                    };
                                    
                                    // Try to play immediately if ready
                                    if (video.readyState >= 2) {
                                        playVideo();
                                    } else {
                                        // Wait for minimum data, then play
                                        const playWhenReady = () => {
                                            playVideo();
                                        };
                                        video.addEventListener('loadeddata', playWhenReady, { once: true });
                                        video.addEventListener('canplay', playWhenReady, { once: true });
                                        // Fallback: play after short delay
                                        setTimeout(() => {
                                            if (video.readyState >= 2 && video.paused) {
                                                playVideo();
                                            }
                                        }, 100);
                                    }
                                }
                            }
                        };

                        // Add handler to portrait container and all child elements
                        // Only use click event - touchend is handled by mobile.js swipe detection
                        if (portrait) {
                            portrait.addEventListener('click', (e) => {
                                // Check if this was a swipe gesture - if so, ignore click
                                const mainDisplay = document.querySelector('.character-main-display');
                                if (mainDisplay && mainDisplay.hasAttribute('data-swipe-handled')) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return;
                                }
                                handleToggle(e);
                            });
                        }
                        if (img) {
                            img.addEventListener('click', (e) => {
                                // Check if this was a swipe gesture - if so, ignore click
                                const mainDisplay = document.querySelector('.character-main-display');
                                if (mainDisplay && mainDisplay.hasAttribute('data-swipe-handled')) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return;
                                }
                                handleToggle(e);
                            });
                        }
                        if (videoElement) {
                            videoElement.addEventListener('click', (e) => {
                                // Check if this was a swipe gesture - if so, ignore click
                                const mainDisplay = document.querySelector('.character-main-display');
                                if (mainDisplay && mainDisplay.hasAttribute('data-swipe-handled')) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return;
                                }
                                handleToggle(e);
                            });
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
        if (Device.isMobile()) {
            // Mobile: Use tap to show/hide icons
            if (personaBtn && personaContainer) {
                // Add click event listener to the persona button
                personaBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    personaContainer.classList.toggle('show-options');
                });

                // Also add touchstart for better mobile responsiveness
                personaBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    personaContainer.classList.toggle('show-options');
                }, { passive: false });

                // Close when tapping outside
                document.addEventListener('click', (e) => {
                    // Check if click is outside the persona switcher
                    if (!personaSwitcher.contains(e.target)) {
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
        const currentPersona = Storage.getPersona();
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
    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        // Only setup mobile menu on mobile devices
        if (!Device.isMobile()) return;

        // Use a small delay to ensure DOM is ready
        setTimeout(() => {
            const hamburger = document.getElementById('hamburger');
            const sidebar = document.querySelector('.sidebar');

            if (!hamburger || !sidebar) {
                // Try again if elements not found
                setTimeout(() => this.setupMobileMenu(), 500);
                return;
            }

            // Fix hamburger position if needed
            const rect = hamburger.getBoundingClientRect();
            if (rect.x < 0) {
                hamburger.style.left = '15px';
                hamburger.style.position = 'fixed';
                hamburger.style.transform = 'none';
            }

            // Don't remove event listeners, just add new one
            // Check if handler already exists
            if (!hamburger.hasAttribute('data-handler-added')) {
                hamburger.setAttribute('data-handler-added', 'true');

                hamburger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    sidebar.classList.toggle('open');
                    hamburger.classList.toggle('active');
                    document.body.classList.toggle('menu-open');
                });
            }

            // Setup overlay click handler
            const overlay = document.querySelector('.menu-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => {
                    sidebar.classList.remove('open');
                    hamburger.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            }

            // Close menu when clicking outside
            // Use a named function so we can remove it later if needed
            const handleOutsideClick = (e) => {
                if (sidebar.classList.contains('open') &&
                    !sidebar.contains(e.target) &&
                    !hamburger.contains(e.target) &&
                    !overlay?.contains(e.target)) {
                    sidebar.classList.remove('open');
                    hamburger.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            };

            // Remove existing listener if any, then add new one
            document.removeEventListener('click', handleOutsideClick);
            document.addEventListener('click', handleOutsideClick);

            // Close menu when clicking on a nav link
            const navLinks = sidebar.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('open');
                        hamburger.classList.remove('active');
                        document.body.classList.remove('menu-open');
                    }
                });
            });

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
    /**
     * Render the Hearthstone-style card deck
     */
    renderCardDeck() {
        // Don't render on mobile
        if (!Device.isDesktop()) return;

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
    /**
     * Select a character and initialize the site
     * @param {string} persona - The selected persona
     */
    selectCharacter(persona) {
        // Save selection
        Storage.markVisited();
        Storage.setPersona(persona);

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
            const tryLoadWelcome = (attempts = 0) => {
                if (window.loadPageContent) {
                    window.loadPageContent('welcome');
                } else if (attempts < 10) {
                    setTimeout(() => tryLoadWelcome(attempts + 1), 100);
                }
            };
            setTimeout(() => tryLoadWelcome(), 500);
        }

        // Event dispatch is now handled in setPersona()
    }

    /**
     * Switch to a different persona
     * @param {string} persona - The persona to switch to
     */
    /**
     * Switch to a different persona
     * @param {string} persona - The persona to switch to
     */
    switchPersona(persona) {
        if (persona === this.currentPersona) {
            return;
        }

        // Save to localStorage - this will trigger storage event for cross-tab sync
        Storage.setPersona(persona);

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
        // Force immediate navigation icon update after persona switch
        requestAnimationFrame(() => {
            this.updateNavigationIcons();
            // Double update to ensure it takes effect
            setTimeout(() => {
                this.updateNavigationIcons();
            }, 50);
        });

        // If we're on the welcome page, reload it to update content and links - optimized for Safari
        const activeNav = document.querySelector('.nav-link.active');
        const isWelcomePage = !activeNav || activeNav.dataset.page === 'welcome';
        if (isWelcomePage) {
            requestAnimationFrame(() => {
                if (window.loadPageContent) {
                    window.loadPageContent('welcome');
                } else {
                    // Fallback: try to load after short delay
                    const tryLoadWelcome = (attempts = 0) => {
                        if (window.loadPageContent) {
                            window.loadPageContent('welcome');
                        } else if (attempts < 5) {
                            setTimeout(() => tryLoadWelcome(attempts + 1), 50);
                        }
                    };
                    setTimeout(() => tryLoadWelcome(), 10);
                }
            });
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
    /**
     * Reset to character selection screen
     */
    resetToCharacterSelection() {
        // Clear localStorage
        Storage.clearAll();

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
                    const tryLoadWelcome = (attempts = 0) => {
                    if (window.loadPageContent) {
                        window.loadPageContent('welcome');
                        } else if (attempts < 10) {
                            setTimeout(() => tryLoadWelcome(attempts + 1), 100);
                    }
                    };
                    tryLoadWelcome();

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
                subtitle: 'Systems Thinker'
            },
            investor: {
                name: 'Investor',
                subtitle: 'Capital Allocator'
            },
            dad: {
                name: 'Girl Dad',
                subtitle: 'Stuffie Wrangler'
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
            founder: '/assets/founder.png',
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
        const hash = window.location.hash;
        const navLinks = document.querySelectorAll('.nav-link');

        // Extract page from hash (e.g., #writing/user-manual -> writing)
        let currentPage = null;
        if (hash) {
            const hashParts = hash.substring(1).split('/');
            currentPage = hashParts[0]; // Get the first part (writing, bio, etc.)
        }

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const dataPage = link.dataset.page;
            link.classList.remove('active');

            // Check if this is the current page based on hash
            if (currentPage && dataPage === currentPage) {
                link.classList.add('active');
            }
            // Fallback to pathname check
            else if (currentPath === href ||
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
    /**
     * Update navigation icons based on persona
     * @param {boolean} skipActiveUpdate - Skip active state update
     */
    updateNavigationIcons(skipActiveUpdate = false) {

        // Only set active navigation if not called from click handler
        if (!skipActiveUpdate) {
            this.setActiveNavigation();
        }

        const navItems = document.querySelectorAll('.nav-item');

        const isFounder = this.currentPersona === 'founder';
        const isOperator = this.currentPersona === 'operator';
        const isInvestor = this.currentPersona === 'investor';
        const isDad = this.currentPersona === 'dad';

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

        // Pixel art whiteboard icon for operator
        const whiteboardSvg = `<svg width="20" height="20" viewBox="0 0 20 20" style="image-rendering: pixelated; image-rendering: crisp-edges;">
            <!-- Whiteboard frame (outer border) -->
            <rect x="3" y="3" width="14" height="12" fill="#E0E0E0" stroke="#B0B0B0" stroke-width="1"/>
            
            <!-- Whiteboard surface (white) -->
            <rect x="4" y="4" width="12" height="10" fill="#FFFFFF"/>
            
            <!-- Frame details (top and bottom) -->
            <rect x="3" y="3" width="14" height="1" fill="#C0C0C0"/>
            <rect x="3" y="14" width="14" height="1" fill="#C0C0C0"/>
            <rect x="3" y="3" width="1" height="12" fill="#C0C0C0"/>
            <rect x="16" y="3" width="1" height="12" fill="#C0C0C0"/>
            
            <!-- Hand-drawn lines on whiteboard (dark grey) - top straight, bottom wavy -->
            <!-- First line (straight line) -->
            <rect x="5" y="7" width="6" height="2" fill="#4A4A4A"/>
            
            <!-- Second wavy line (subtle wave) -->
            <rect x="5" y="10" width="1" height="2" fill="#4A4A4A"/>
            <rect x="6" y="9" width="1" height="2" fill="#4A4A4A"/>
            <rect x="7" y="10" width="1" height="2" fill="#4A4A4A"/>
            <rect x="8" y="10" width="1" height="2" fill="#4A4A4A"/>
            <rect x="9" y="10" width="1" height="2" fill="#4A4A4A"/>
            <rect x="10" y="9" width="1" height="2" fill="#4A4A4A"/>
            <rect x="11" y="10" width="1" height="2" fill="#4A4A4A"/>
            <rect x="12" y="10" width="1" height="2" fill="#4A4A4A"/>
            
            <!-- Marker/pen at bottom (red) -->
            <rect x="2" y="16" width="3" height="1" fill="#DC143C"/>
            <rect x="2" y="17" width="3" height="1" fill="#FF0000"/>
        </svg>`;

        // Perfect circle dollar coin icon for investor - deep green coin
        const moneyStackSvg = `<svg width="20" height="20" viewBox="0 0 20 20">
            <!-- Perfect circle coin (deep green) -->
            <circle cx="10" cy="10" r="7" fill="#166534" stroke="#14532D" stroke-width="1"/>
            
            <!-- Dollar sign (white for contrast) -->
            <!-- Vertical line -->
            <rect x="9" y="5" width="1" height="1" fill="#FFFFFF"/>
            <rect x="9" y="6" width="1" height="1" fill="#FFFFFF"/>
            <rect x="9" y="7" width="1" height="1" fill="#FFFFFF"/>
            <rect x="9" y="8" width="1" height="1" fill="#FFFFFF"/>
            <rect x="9" y="9" width="1" height="1" fill="#FFFFFF"/>
            <rect x="9" y="10" width="1" height="1" fill="#FFFFFF"/>
            <rect x="9" y="11" width="1" height="1" fill="#FFFFFF"/>
            <rect x="9" y="12" width="1" height="1" fill="#FFFFFF"/>
            <rect x="9" y="13" width="1" height="1" fill="#FFFFFF"/>

            <!-- S shape -->
            <rect x="8" y="6" width="3" height="1" fill="#FFFFFF"/>
            <rect x="7" y="7" width="1" height="1" fill="#FFFFFF"/>
            <rect x="8" y="8" width="2" height="1" fill="#FFFFFF"/>
            <rect x="10" y="9" width="2" height="1" fill="#FFFFFF"/>
            <rect x="11" y="10" width="1" height="1" fill="#FFFFFF"/>
            <rect x="8" y="11" width="3" height="1" fill="#FFFFFF"/>
        </svg>`;

        // Pixel art stuffed bear toy icon for dad - reddish-brown, sitting, facing right
        const houseSvg = `<svg width="20" height="20" viewBox="0 0 20 20" style="image-rendering: pixelated; image-rendering: crisp-edges;">
            <!-- Bear head outline (darker reddish-brown) -->
            <rect x="6" y="3" width="8" height="7" fill="#8B4513"/>
            <rect x="5" y="4" width="1" height="5" fill="#8B4513"/>
            <rect x="14" y="4" width="1" height="5" fill="#8B4513"/>
            <rect x="6" y="2" width="1" height="1" fill="#8B4513"/>
            <rect x="13" y="2" width="1" height="1" fill="#8B4513"/>
            
            <!-- Bear head fill (medium reddish-brown) -->
            <rect x="6" y="4" width="8" height="5" fill="#A0522D"/>
            <rect x="5" y="5" width="1" height="3" fill="#A0522D"/>
            <rect x="14" y="5" width="1" height="3" fill="#A0522D"/>
            
            <!-- Left ear (back) -->
            <rect x="5" y="3" width="2" height="2" fill="#8B4513"/>
            <rect x="5" y="4" width="2" height="1" fill="#A0522D"/>
            <rect x="5" y="4" width="1" height="1" fill="#CD853F"/>
            
            <!-- Right ear (front, slightly larger) -->
            <rect x="13" y="3" width="3" height="2" fill="#8B4513"/>
            <rect x="13" y="4" width="3" height="1" fill="#A0522D"/>
            <rect x="14" y="4" width="1" height="1" fill="#CD853F"/>
            
            <!-- Muzzle (lighter tan-like reddish-brown, oval-shaped) -->
            <rect x="7" y="7" width="6" height="3" fill="#CD853F"/>
            <rect x="6" y="8" width="1" height="1" fill="#CD853F"/>
            <rect x="13" y="8" width="1" height="1" fill="#CD853F"/>
            <rect x="7" y="9" width="6" height="1" fill="#CD853F"/>
            
            <!-- Left eye (aligned) -->
            <rect x="7" y="5" width="1" height="1" fill="#000000"/>
            
            <!-- Right eye (aligned, same level) -->
            <rect x="10" y="5" width="1" height="1" fill="#000000"/>
            
            <!-- Nose (single black pixel at top center of muzzle) -->
            <rect x="9" y="8" width="1" height="1" fill="#000000"/>
            
            <!-- Mouth (inverted T/Y shape: vertical line + horizontal line of 3 pixels) -->
            <rect x="9" y="9" width="1" height="1" fill="#000000"/>
            <rect x="8" y="10" width="3" height="1" fill="#000000"/>
            
            <!-- Body outline (darker reddish-brown, pear-shaped) -->
            <rect x="5" y="10" width="10" height="6" fill="#8B4513"/>
            <rect x="4" y="11" width="1" height="4" fill="#8B4513"/>
            <rect x="15" y="11" width="1" height="4" fill="#8B4513"/>
            <rect x="5" y="16" width="10" height="1" fill="#8B4513"/>
            <rect x="6" y="15" width="8" height="1" fill="#8B4513"/>
            
            <!-- Body fill (medium reddish-brown) -->
            <rect x="5" y="11" width="10" height="5" fill="#A0522D"/>
            <rect x="4" y="12" width="1" height="3" fill="#A0522D"/>
            <rect x="15" y="12" width="1" height="3" fill="#A0522D"/>
            <rect x="6" y="16" width="8" height="1" fill="#A0522D"/>
            
            <!-- Belly patch (lighter tan-like reddish-brown, oval on lower central body) -->
            <rect x="7" y="13" width="6" height="3" fill="#CD853F"/>
            <rect x="6" y="14" width="1" height="1" fill="#CD853F"/>
            <rect x="13" y="14" width="1" height="1" fill="#CD853F"/>
            
            <!-- Left arm (stubby, bent at elbow, extending downward) -->
            <rect x="4" y="11" width="2" height="3" fill="#8B4513"/>
            <rect x="4" y="12" width="2" height="2" fill="#A0522D"/>
            <rect x="4" y="13" width="2" height="1" fill="#8B4513"/>
            <rect x="3" y="13" width="1" height="1" fill="#A0522D"/>
            
            <!-- Right arm (stubby, bent at elbow, extending downward) -->
            <rect x="14" y="11" width="2" height="3" fill="#8B4513"/>
            <rect x="14" y="12" width="2" height="2" fill="#A0522D"/>
            <rect x="14" y="13" width="2" height="1" fill="#8B4513"/>
            <rect x="16" y="13" width="1" height="1" fill="#A0522D"/>
            
            <!-- Left leg (bent, positioned forward, rounded foot) -->
            <rect x="6" y="15" width="2" height="3" fill="#8B4513"/>
            <rect x="6" y="16" width="2" height="2" fill="#A0522D"/>
            <rect x="6" y="17" width="2" height="1" fill="#8B4513"/>
            <rect x="5" y="17" width="1" height="1" fill="#A0522D"/>
            <rect x="6" y="18" width="2" height="1" fill="#8B4513"/>
            
            <!-- Right leg (bent, positioned forward, rounded foot) -->
            <rect x="11" y="15" width="2" height="3" fill="#8B4513"/>
            <rect x="11" y="16" width="2" height="2" fill="#A0522D"/>
            <rect x="11" y="17" width="2" height="1" fill="#8B4513"/>
            <rect x="13" y="17" width="1" height="1" fill="#A0522D"/>
            <rect x="11" y="18" width="2" height="1" fill="#8B4513"/>
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

                if (isFounder) {
                    // For founder: ONLY show sword on active page, hide ALL other icons
                    navIcon.innerHTML = isActive ? swordSvg : '';
                } else if (isOperator) {
                    // For operator: ONLY show whiteboard on active page, hide ALL other icons
                    navIcon.innerHTML = isActive ? whiteboardSvg : '';
                } else if (isInvestor) {
                    // For investor: ONLY show money stack on active page, hide ALL other icons
                    navIcon.innerHTML = isActive ? moneyStackSvg : '';
                } else if (isDad) {
                    // For dad: ONLY show stuffie bear on active page, hide ALL other icons
                    navIcon.innerHTML = isActive ? houseSvg : '';
                } else {
                    // Restore original icons for other personas
                    if (navIcon.dataset.originalIcon) {
                        navIcon.innerHTML = navIcon.dataset.originalIcon;
                    }
                }
            }
        });
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
        if (cardDeck && Device.isDesktop()) {
            cardDeck.classList.remove('hidden');
        }
    }
}

// Initialize when DOM is ready
function initializeGamingSystem() {
    window.gamingSystem = new GamingSystem();

    // Initialize role selection options
    if (window.gamingSystem) {
        window.gamingSystem.initializeRoleOptions();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGamingSystem);
} else {
    initializeGamingSystem();
}