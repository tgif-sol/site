/**
 * Mobile Interaction Handler
 * Touch events, swipe navigation, and mobile-specific functionality
 *
 * @author Alan James Curtis
 * @version 2.0.0
 */

(function() {
    'use strict';

    /**
     * Mobile Detection Utility
     */
    const MobileDetect = {
        isMobile: () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   window.innerWidth <= 768;
        },

        isTablet: () => {
            return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768 && window.innerWidth <= 1024;
        },

        isTouchDevice: () => {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
    };

    /**
     * Swipe Handler for Character Selection
     */
    class SwipeHandler {
        constructor(element, options = {}) {
            this.element = element;
            this.options = {
                threshold: options.threshold || 50,
                restraint: options.restraint || 100,
                allowedTime: options.allowedTime || 300,
                ...options
            };

            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchEndX = 0;
            this.touchEndY = 0;
            this.touchStartTime = 0;

            this.init();
        }

        init() {
            this.element.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });
            this.element.addEventListener('touchend', this.handleEnd.bind(this), { passive: true });
        }

        handleStart(e) {
            const touch = e.touches[0];
            this.touchStartX = touch.pageX;
            this.touchStartY = touch.pageY;
            this.touchStartTime = new Date().getTime();
        }

        handleEnd(e) {
            const touch = e.changedTouches[0];
            this.touchEndX = touch.pageX;
            this.touchEndY = touch.pageY;

            const elapsedTime = new Date().getTime() - this.touchStartTime;

            if (elapsedTime <= this.options.allowedTime) {
                this.handleSwipe();
            }
        }

        handleSwipe() {
            const distX = this.touchEndX - this.touchStartX;
            const distY = this.touchEndY - this.touchStartY;

            if (Math.abs(distX) >= this.options.threshold && Math.abs(distY) <= this.options.restraint) {
                if (distX > 0) {
                    if (this.options.onSwipeRight) this.options.onSwipeRight();
                } else {
                    if (this.options.onSwipeLeft) this.options.onSwipeLeft();
                }
            }
        }
    }

    /**
     * Character Selection Mobile Enhancement
     */
    class CharacterSelectionMobile {
        constructor() {
            this.currentIndex = 0;
            this.cards = [];
            this.init();
        }

        init() {
            if (!MobileDetect.isMobile()) return;

            const grid = document.querySelector('.character-grid');
            if (!grid) return;

            this.cards = Array.from(document.querySelectorAll('.character-card'));
            if (this.cards.length === 0) return;

            // Restructure for mobile with swipe interface
            this.setupMobileLayout();

            // Setup swipe gestures
            this.setupSwipeGestures();

            // Don't auto-play videos - user must click to play

            // Setup stat progress bars
            this.setupStatBars();

            // Add mobile classes
            document.body.classList.add('is-mobile');
            if (MobileDetect.isTouchDevice()) {
                document.body.classList.add('is-touch');
            }

            // Note: Scroll fix removed - was causing initialization error
        }

        setupMobileLayout() {
            const grid = document.querySelector('.character-grid');

            // Create main display wrapper
            const mainDisplay = document.createElement('div');
            mainDisplay.className = 'character-main-display';

            // Move all cards to main display
            this.cards.forEach((card, index) => {
                if (index === 0) {
                    card.classList.add('active');
                    card.style.display = 'flex';
                    // Animate first card on load
                    setTimeout(() => {
                        this.animateCardNumbers(card);
                    }, 300);
                } else {
                    card.classList.remove('active');
                    card.style.display = 'none';
                }

                // Add click handler for ALL cards to prevent navigation and handle video toggle
                card.addEventListener('click', (e) => {
                    // Check if this was a swipe gesture - if so, ignore click
                    const mainDisplay = document.querySelector('.character-main-display');
                    if (mainDisplay && mainDisplay.hasAttribute('data-swipe-handled')) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                    // Always prevent any default navigation behavior on mobile
                    e.preventDefault();
                    e.stopPropagation();

                    // Only allow Select Role button to pass through
                    if (e.target.closest('.select-role-btn')) {
                        // Don't prevent the button from working
                        return;
                    }

                    // For cards with video, toggle playback
                    if (card.dataset.persona === 'founder' || card.dataset.persona === 'dad' || card.dataset.persona === 'operator' || card.dataset.persona === 'investor') {
                        this.toggleFounderVideo(card);  // Works for founder, dad, operator, and investor
                    }
                });

                // Remove click handlers from portrait, image and video elements
                // to allow swipe gestures to work properly on the entire card
                // The card-level click handler will handle video toggle when not swiping

                mainDisplay.appendChild(card);
            });

            // Clear grid and add main display
            grid.appendChild(mainDisplay);

            // Add swipe indicators
            const swipeIndicators = document.createElement('div');
            swipeIndicators.className = 'swipe-indicators';

            // Create dots for each card
            this.cards.forEach((card, index) => {
                const dot = document.createElement('div');
                dot.className = 'swipe-dot';
                if (index === 0) dot.classList.add('active');
                swipeIndicators.appendChild(dot);
            });

            grid.appendChild(swipeIndicators);

            // Add swipe hint
            const swipeHint = document.createElement('div');
            swipeHint.className = 'swipe-hint';
            swipeHint.innerHTML = '<span>Swipe to explore roles</span>';
            grid.appendChild(swipeHint);

            // Create and add Select Role button
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'select-role-container';

            const selectButton = document.createElement('button');
            selectButton.className = 'select-role-btn';
            selectButton.textContent = 'Select Role';
            selectButton.addEventListener('click', () => {
                this.selectCurrentCharacter();
            });

            buttonContainer.appendChild(selectButton);

            // Add footer text inside the button container
            const footerText = document.createElement('p');
            footerText.className = 'footer-text mobile-footer-text';
            footerText.textContent = 'Each perspective reveals different aspects of my journey';
            buttonContainer.appendChild(footerText);

            grid.appendChild(buttonContainer);

            // Hide the original footer on mobile
            const originalFooter = document.querySelector('.character-select-modal > .scroll-footer');
            if (originalFooter) {
                originalFooter.style.display = 'none';
            }

            // Store button reference for later use
            this.selectButton = selectButton;
        }

        setupSwipeGestures() {
            const mainDisplay = document.querySelector('.character-main-display');
            if (!mainDisplay) {
                console.log('CharacterSelectionMobile: mainDisplay not found for swipe gestures');
                return;
            }

            let startX = 0;
            let startY = 0;
            let isSwiping = false;
            let hasMoved = false; // Track if user has moved during touch
            let swipeHandled = false; // Track if we handled a swipe

            // Touch events for mobile - apply to the entire display area including cards
            mainDisplay.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                isSwiping = true;
                hasMoved = false;
                swipeHandled = false;
            }, { passive: true });

            mainDisplay.addEventListener('touchmove', (e) => {
                if (!isSwiping) return;
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - startX);
                const deltaY = Math.abs(touch.clientY - startY);
                
                // If moved more than 10px, consider it a swipe gesture
                if (deltaX > 10 || deltaY > 10) {
                    hasMoved = true;
                }
            }, { passive: true });

            mainDisplay.addEventListener('touchend', (e) => {
                if (!isSwiping) return;
                isSwiping = false;

                const touch = e.changedTouches[0];
                const endX = touch.clientX;
                const endY = touch.clientY;

                const deltaX = endX - startX;
                const deltaY = endY - startY;

                // Only process horizontal swipes (minimum 50px, horizontal movement > vertical)
                if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent click events
                    swipeHandled = true;
                    if (deltaX > 0) {
                        // Swipe right - go to previous card
                        console.log('Swipe right detected, going to previous card');
                        this.previousCard();
                    } else {
                        // Swipe left - go to next card
                        console.log('Swipe left detected, going to next card');
                        this.nextCard();
                    }
                    // Mark that we handled a swipe to prevent click events
                    mainDisplay.setAttribute('data-swipe-handled', 'true');
                    setTimeout(() => {
                        mainDisplay.removeAttribute('data-swipe-handled');
                    }, 300);
                } else if (hasMoved) {
                    // If user moved but it wasn't a swipe, still prevent click
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, { passive: false });

            // Also add touch events to individual cards and their child elements to ensure swipe works everywhere
            this.cards.forEach(card => {
                let cardStartX = 0;
                let cardStartY = 0;
                let cardIsSwiping = false;
                let cardHasMoved = false;

                const handleTouchStart = (e) => {
                    const touch = e.touches[0];
                    cardStartX = touch.clientX;
                    cardStartY = touch.clientY;
                    cardIsSwiping = true;
                    cardHasMoved = false;
                };

                const handleTouchMove = (e) => {
                    if (!cardIsSwiping) return;
                    const touch = e.touches[0];
                    const deltaX = Math.abs(touch.clientX - cardStartX);
                    const deltaY = Math.abs(touch.clientY - cardStartY);
                    
                    if (deltaX > 10 || deltaY > 10) {
                        cardHasMoved = true;
                    }
                };

                const handleTouchEnd = (e) => {
                    if (!cardIsSwiping) return;
                    cardIsSwiping = false;

                    const touch = e.changedTouches[0];
                    const endX = touch.clientX;
                    const endY = touch.clientY;

                    const deltaX = endX - cardStartX;
                    const deltaY = endY - cardStartY;

                    // Only process horizontal swipes (minimum 50px, horizontal movement > vertical)
                    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (deltaX > 0) {
                            this.previousCard();
                        } else {
                            this.nextCard();
                        }
                        mainDisplay.setAttribute('data-swipe-handled', 'true');
                        setTimeout(() => {
                            mainDisplay.removeAttribute('data-swipe-handled');
                        }, 300);
                    } else if (cardHasMoved) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                };

                // Add touch events to card
                card.addEventListener('touchstart', handleTouchStart, { passive: true });
                card.addEventListener('touchmove', handleTouchMove, { passive: true });
                card.addEventListener('touchend', handleTouchEnd, { passive: false });

                // Also add touch events to portrait, image, and video elements
                const portrait = card.querySelector('.character-portrait');
                const img = card.querySelector('.character-photo');
                const video = card.querySelector('.character-video');

                if (portrait) {
                    portrait.addEventListener('touchstart', handleTouchStart, { passive: true });
                    portrait.addEventListener('touchmove', handleTouchMove, { passive: true });
                    portrait.addEventListener('touchend', handleTouchEnd, { passive: false });
                }
                if (img) {
                    img.addEventListener('touchstart', handleTouchStart, { passive: true });
                    img.addEventListener('touchmove', handleTouchMove, { passive: true });
                    img.addEventListener('touchend', handleTouchEnd, { passive: false });
                }
                if (video) {
                    video.addEventListener('touchstart', handleTouchStart, { passive: true });
                    video.addEventListener('touchmove', handleTouchMove, { passive: true });
                    video.addEventListener('touchend', handleTouchEnd, { passive: false });
                }
            });
        }

        nextCard() {
            const nextIndex = (this.currentIndex + 1) % this.cards.length;
            this.switchToCard(nextIndex);
        }

        previousCard() {
            const prevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
            this.switchToCard(prevIndex);
        }

        switchToCard(index) {
            if (index === this.currentIndex) {
                // If clicking the same card that's already active
                const currentCard = this.cards[index];
                if (currentCard.dataset.persona === 'founder' || currentCard.dataset.persona === 'dad' || currentCard.dataset.persona === 'operator' || currentCard.dataset.persona === 'investor') {
                    // Toggle video playback for cards with video
                    this.toggleFounderVideo(currentCard);
                }
                return;
            }

            // Hide ALL cards first and stop any playing videos
            this.cards.forEach(card => {
                card.classList.remove('active');
                card.style.display = 'none';

                // Stop video and remove playing class
                if (card.dataset.persona === 'founder' || card.dataset.persona === 'dad' || card.dataset.persona === 'operator' || card.dataset.persona === 'investor') {
                    card.classList.remove('video-playing');
                    const video = card.querySelector('.character-video');
                    if (video) {
                        video.muted = true;  // Ensure muted
                        video.pause();
                        // Reset founder video to 2 seconds, others to 0
                        video.currentTime = card.dataset.persona === 'founder' ? 2 : 0;
                    }
                }
            });

            // Update swipe indicators
            document.querySelectorAll('.swipe-dot').forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            // Show ONLY the selected card
            this.cards[index].classList.add('active');
            this.cards[index].style.display = 'flex';

            // Animate the numbers from 0 to target value
            this.animateCardNumbers(this.cards[index]);

            this.currentIndex = index;

            // For Founder card, show static image initially (don't auto-play video)
            const newCard = this.cards[index];
            if (newCard.dataset.persona === 'founder') {
                // Just show the card with static image, don't start video
                newCard.classList.remove('video-playing');
            }
        }

        toggleFounderVideo(card) {  // Works for founder, dad, operator, and investor videos
            const video = card.querySelector('.character-video');
            if (!video) return;

            // Ensure video is muted
            video.muted = true;
            
            // Setup founder video to loop between 2-6 seconds
            if (card.dataset.persona === 'founder' && !video.hasAttribute('data-listener-added')) {
                video.loop = false; // Disable native loop
                video.setAttribute('data-listener-added', 'true');
                video.addEventListener('timeupdate', () => {
                    if (video.currentTime < 2) {
                        video.currentTime = 2; // Start from 2 seconds
                    } else if (video.currentTime >= 6) {
                        video.currentTime = 2; // Loop back to 2 seconds
                    }
                });
            }
            // Setup operator video to loop back at 4 seconds
            else if (card.dataset.persona === 'operator' && !video.hasAttribute('data-listener-added')) {
                video.loop = false; // Disable native loop
                video.setAttribute('data-listener-added', 'true');
                video.addEventListener('timeupdate', () => {
                    if (video.currentTime >= 4) {
                        video.currentTime = 0; // Loop back to start
                    }
                });
            }
            // Setup investor video to loop back at 4 seconds
            else if (card.dataset.persona === 'investor' && !video.hasAttribute('data-listener-added')) {
                video.loop = false; // Disable native loop
                video.setAttribute('data-listener-added', 'true');
                video.addEventListener('timeupdate', () => {
                    if (video.currentTime >= 4) {
                        video.currentTime = 0; // Loop back to start
                    }
                });
            }
            // Setup dad video to loop back at 6 seconds
            else if (card.dataset.persona === 'dad' && !video.hasAttribute('data-listener-added')) {
                video.loop = false; // Disable native loop
                video.setAttribute('data-listener-added', 'true');
                video.addEventListener('timeupdate', () => {
                    if (video.currentTime >= 6) {
                        video.currentTime = 0; // Loop back to start
                    }
                });
            }

            if (card.classList.contains('video-playing')) {
                // Stop video and go back to image
                card.classList.remove('video-playing');
                video.pause();
                // Reset founder video to 2 seconds, others to 0
                video.currentTime = card.dataset.persona === 'founder' ? 2 : 0;

                // Remove any inline styles that might override CSS
                video.removeAttribute('style');
                const photo = card.querySelector('.character-photo');
                if (photo) {
                    photo.removeAttribute('style');
                }
                
                // Remove any active/focus states that might cause border to appear
                card.blur();
                if (card.classList.contains('active')) {
                    // Force reflow to ensure border is removed
                    void card.offsetWidth;
                }
            } else {
                // Start video - only load when needed
                const videoSrc = video.getAttribute('data-src') || video.getAttribute('src');
                if (videoSrc) {
                    // Always set src from data-src if it exists
                    if (video.getAttribute('data-src') && video.src !== videoSrc) {
                        video.src = videoSrc;
                    }
                    
                    // Wait for video to be ready before playing
                    if (video.readyState === 0) {
                        video.load();
                        video.addEventListener('loadeddata', () => {
                            // Set founder video to start at 2 seconds
                            if (card.dataset.persona === 'founder') {
                                video.currentTime = 2;
                            }
                            card.classList.add('video-playing');
                            video.play().catch((e) => {
                                console.log('Video play failed:', e);
                                card.classList.remove('video-playing');
                            });
                        }, { once: true });
                    } else {
                        // Set founder video to start at 2 seconds
                        if (card.dataset.persona === 'founder') {
                            video.currentTime = 2;
                        }
                        // Video already loaded, play immediately
                        card.classList.add('video-playing');
                        video.play().catch((e) => {
                            console.log('Video play failed:', e);
                            card.classList.remove('video-playing');
                        });
                    }
                }
            }
        }

        selectCurrentCharacter() {
            // Get the currently active card
            const activeCard = this.cards[this.currentIndex];
            if (!activeCard) return;

            const persona = activeCard.dataset.persona;
            if (!persona) return;

            // Save selection to localStorage (same as desktop)
            localStorage.setItem('gaming_visited', 'true');
            localStorage.setItem('gaming_persona', persona);
            localStorage.setItem('selectedPersona', persona);

            // Hide character selection and show main content
            const characterSelect = document.getElementById('characterSelect');
            if (characterSelect) {
                characterSelect.classList.add('hidden');
                characterSelect.style.display = 'none';
            }

            // Show main container
            const mainContainer = document.getElementById('mainContainer');
            if (mainContainer) {
                mainContainer.classList.remove('hidden');
                mainContainer.style.display = '';
            }

            // Apply persona class to body
            document.body.className = '';
            document.body.classList.add(`persona-${persona}`);

            // Update persona badges
            const badges = document.querySelectorAll('.persona-badge .badge-text');
            badges.forEach(badge => {
                badge.textContent = persona.charAt(0).toUpperCase() + persona.slice(1);
            });

            // Update mobile role title
            const mobileRoleTitle = document.querySelector('.mobile-role-title .role-text');
            if (mobileRoleTitle) {
                mobileRoleTitle.textContent = persona.charAt(0).toUpperCase() + persona.slice(1);
            }

            // Reload page to apply persona properly
            window.location.reload();
        }

        // Removed duplicate setupSwipeGestures - using the one above

        setupSwipeNavigation(grid) {
            // Add scroll snap
            grid.style.scrollSnapType = 'x mandatory';
            grid.style.webkitOverflowScrolling = 'touch';

            // Update indicators on scroll
            grid.addEventListener('scroll', this.updateScrollIndicators.bind(this));

            // Add swipe handler
            new SwipeHandler(grid, {
                onSwipeLeft: () => this.navigateToCard(this.currentIndex + 1),
                onSwipeRight: () => this.navigateToCard(this.currentIndex - 1)
            });
        }

        navigateToCard(index) {
            if (index < 0 || index >= this.cards.length) return;

            this.currentIndex = index;
            const card = this.cards[index];
            card.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }

        setupScrollIndicators() {
            const container = document.querySelector('.character-select-modal');
            if (!container) return;

            const indicators = document.createElement('div');
            indicators.className = 'scroll-indicators';

            this.cards.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'scroll-dot';
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.navigateToCard(index));
                indicators.appendChild(dot);
            });

            container.appendChild(indicators);
            this.indicators = indicators.querySelectorAll('.scroll-dot');
        }

        updateScrollIndicators() {
            const grid = document.querySelector('.character-grid');
            const scrollLeft = grid.scrollLeft;
            const cardWidth = this.cards[0].offsetWidth + 20; // Including gap

            const newIndex = Math.round(scrollLeft / cardWidth);
            if (newIndex !== this.currentIndex) {
                this.currentIndex = newIndex;

                this.indicators.forEach((dot, index) => {
                    dot.classList.toggle('active', index === this.currentIndex);
                });
            }
        }

        autoPlayVideos() {
            const videos = document.querySelectorAll('.character-video');
            videos.forEach(video => {
                if (video) {
                    const card = video.closest('.character-card');
                    video.autoplay = true;
                    video.muted = true;  // Ensure all videos are muted
                    video.playsInline = true;
                    // Only auto-loop for non-operator videos
                    video.loop = card && card.dataset.persona !== 'operator';

                    // Set start time and loop behavior for operator video
                    if (card && card.dataset.persona === 'operator') {
                        video.currentTime = 3;

                        // Handle manual looping for operator
                        video.onended = () => {
                            video.currentTime = 3; // Loop back to 3 seconds
                            video.play();
                        };
                    }

                    video.play().catch(() => {
                        // Silent fail
                    });
                }
            });
        }

        setupStatBars() {
            // Stats removed per design update - keeping function in case of future use
            /*
            // Set up progress bar widths based on stat values for all cards
            this.cards.forEach((card, cardIndex) => {
                const statItems = card.querySelectorAll('.stat-item');
                statItems.forEach((item, statIndex) => {
                    const valueSpan = item.querySelector('span');
                    if (valueSpan) {
                        const value = parseInt(valueSpan.textContent);
                        // Add data attribute for the target width
                        item.setAttribute('data-value', value);

                        // Create unique class for this stat
                        const uniqueClass = `stat-card${cardIndex}-item${statIndex}`;
                        item.classList.add(uniqueClass);

                        // Create style for animation end state
                        const style = document.createElement('style');
                        style.textContent = `
                            .character-card.active .${uniqueClass}::before {
                                animation: fillBar-${uniqueClass} 1.2s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
                                animation-delay: ${statIndex * 0.1}s;
                            }
                            @keyframes fillBar-${uniqueClass} {
                                from { width: 0%; }
                                to { width: ${value}%; }
                            }
                        `;
                        document.head.appendChild(style);

                        // Also animate the number
                        this.animateNumber(valueSpan, value);
                    }
                });
            });
            */
        }

        animateNumber(element, targetValue) {
            // Store original value
            element.setAttribute('data-target', targetValue);
        }

        animateCardNumbers(card) {
            // Stats removed per design update - keeping function in case of future use
            /*
            const statItems = card.querySelectorAll('.stat-item span');
            statItems.forEach((span, index) => {
                const target = parseInt(span.getAttribute('data-target') || span.textContent);
                const duration = 1200; // 1.2 seconds
                const delay = index * 100; // Stagger animations
                const startTime = Date.now() + delay;

                // Set initial value to 0
                span.textContent = '0';

                const updateNumber = () => {
                    const now = Date.now();
                    const elapsed = Math.max(0, now - startTime);
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing function (ease-out-cubic)
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(target * eased);

                    span.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(updateNumber);
                    }
                };

                // Start animation after delay
                setTimeout(() => {
                    requestAnimationFrame(updateNumber);
                }, delay);
            });
            */
        }
    }

    /**
     * Mobile Navigation Handler
     */
    class MobileNavigation {
        constructor() {
            this.init();
        }

        init() {
            if (!MobileDetect.isMobile()) return;

            this.setupMobileHeader();
            this.setupHamburgerMenu();
            this.setupPersonaSwitcher();
            this.setupListToggle();
            this.preventBodyScroll();
        }

        setupMobileHeader() {
            // Don't add header if character selection is active
            if (document.querySelector('.character-select-overlay:not(.hidden)')) {
                // But still ensure hamburger exists for other pages
                let hamburger = document.getElementById('hamburger');
                if (!hamburger) {
                    hamburger = document.createElement('button');
                    hamburger.id = 'hamburger';
                    hamburger.className = 'hamburger';
                    hamburger.setAttribute('aria-label', 'Menu');
                    hamburger.innerHTML = '<span></span><span></span><span></span>';
                    document.body.appendChild(hamburger);
                }
                return;
            }

            // Create mobile header if it doesn't exist
            if (!document.querySelector('.mobile-header')) {
                const header = document.createElement('div');
                header.className = 'mobile-header';

                // Add site title
                const mobileTitle = document.createElement('div');
                mobileTitle.className = 'mobile-site-title';
                mobileTitle.textContent = 'Alan James Curtis';
                header.appendChild(mobileTitle);

                // Move persona switcher to header
                const personaSwitcher = document.querySelector('.persona-switcher');
                if (personaSwitcher) {
                    header.appendChild(personaSwitcher);
                }

                // Add header to body
                document.body.insertBefore(header, document.body.firstChild);
            }

            // Use existing hamburger from HTML - don't create new one
            const hamburger = document.getElementById('hamburger');
            if (hamburger) {
                // Make sure it's visible and properly positioned
                hamburger.style.display = 'flex';
                hamburger.style.visibility = 'visible';
            }

            // Add menu overlay
            if (!document.querySelector('.menu-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'menu-overlay';
                document.body.appendChild(overlay);
            }
        }

        setupHamburgerMenu() {
            // Don't create new hamburger - use the one from HTML
            // gaming-system.js will handle the click events
            // This method is intentionally empty to avoid conflicts
        }

        setupPersonaSwitcher() {
            // Setup for mobile/touch devices
            console.log('Setting up persona switcher for mobile');

            // Try multiple times in case elements aren't ready
            const trySetup = () => {
                const personaContainer = document.querySelector('.persona-icons-container');
                const personaBtn = document.querySelector('.persona-btn');
                const personaOptions = document.querySelectorAll('.persona-icon-btn');

                console.log('Persona elements found:', {
                    container: !!personaContainer,
                    button: !!personaBtn,
                    options: personaOptions.length
                });

                if (!personaContainer || !personaBtn) {
                    console.log('Persona elements not ready, retrying...');
                    setTimeout(trySetup, 500);
                    return;
                }

                // Remove any existing listeners by cloning
                const newBtn = personaBtn.cloneNode(true);
                personaBtn.parentNode.replaceChild(newBtn, personaBtn);

                // Flag to prevent double-firing
                let isHandling = false;

                const toggleOptions = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isHandling) return;
                    isHandling = true;

                    console.log('Persona button activated - toggling show-options');
                    personaContainer.classList.toggle('show-options');

                    setTimeout(() => {
                        isHandling = false;
                    }, 100);
                };

                // Handle both click and touch
                newBtn.addEventListener('click', toggleOptions);
                newBtn.addEventListener('touchend', toggleOptions, { passive: false });

                // Close options when tapping outside
                let closeHandler = (e) => {
                    if (!personaContainer.contains(e.target)) {
                        personaContainer.classList.remove('show-options');
                    }
                };

                document.addEventListener('click', closeHandler);
                document.addEventListener('touchstart', closeHandler, { passive: true });

                // Handle option selection
                personaOptions.forEach(btn => {
                    // Clone to remove old listeners
                    const newOptionBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newOptionBtn, btn);

                    let isSelecting = false;

                    const handleSelection = (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isSelecting) return;
                        isSelecting = true;

                        const persona = newOptionBtn.dataset.persona;
                        console.log('Persona selected:', persona);
                        if (!persona) {
                            isSelecting = false;
                            return;
                        }

                        // Update current persona image
                        const currentImg = document.getElementById('currentPersonaImage');
                        const optionImg = newOptionBtn.querySelector('.persona-icon-img');
                        if (currentImg && optionImg) {
                            currentImg.src = optionImg.src;
                            currentImg.alt = optionImg.alt;
                        }

                        // Update current role class for hiding
                        document.querySelectorAll('.persona-icon-btn').forEach(opt => {
                            opt.classList.remove('current-role');
                        });
                        newOptionBtn.classList.add('current-role');

                        // Call the main GamingSystem switchPersona method to properly update everything
                        console.log('[Mobile] Calling gamingSystem.switchPersona:', persona);
                        if (window.gamingSystem && window.gamingSystem.switchPersona) {
                            window.gamingSystem.switchPersona(persona);
                            console.log('[Mobile] switchPersona called successfully');
                        } else {
                            console.warn('[Mobile] gamingSystem not available, falling back to manual update');
                            // Fallback: manual updates if gamingSystem is not available
                            localStorage.setItem('gaming_persona', persona);
                            localStorage.setItem('selectedPersona', persona);

                            // Update body class
                            document.body.className = document.body.className.replace(/persona-\w+/, '');
                            document.body.classList.add(`persona-${persona}`);

                            // Update persona badges
                            const badges = document.querySelectorAll('.persona-badge .badge-text');
                            badges.forEach(badge => {
                                badge.textContent = persona.charAt(0).toUpperCase() + persona.slice(1);
                            });

                            // Update mobile role title
                            const mobileRoleTitle = document.querySelector('.mobile-role-title .role-text');
                            if (mobileRoleTitle) {
                                mobileRoleTitle.textContent = persona.charAt(0).toUpperCase() + persona.slice(1);
                            }
                        }

                        // Close the options after selection
                        setTimeout(() => {
                            personaContainer.classList.remove('show-options');
                            isSelecting = false;
                        }, 300);
                    };

                    // Use only click for options (touchend on main button is enough)
                    newOptionBtn.addEventListener('click', handleSelection);
                });

                console.log('Persona switcher setup complete');
            };

            // Start the setup process
            trySetup();
        }

        setupListToggle() {
            const listPane = document.querySelector('.list-pane');
            if (!listPane) return;

            const toggle = document.createElement('div');
            toggle.className = 'list-toggle';
            toggle.innerHTML = '<span>Articles</span>';

            listPane.insertBefore(toggle, listPane.firstChild);

            toggle.addEventListener('click', () => {
                listPane.classList.toggle('collapsed');
            });
        }

        preventBodyScroll() {
            // Prevent body scroll when menu is open
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            const observer = new MutationObserver(() => {
                if (sidebar.classList.contains('open')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });

            observer.observe(sidebar, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }

    /**
     * Touch Feedback Enhancement
     */
    class TouchFeedback {
        constructor() {
            this.init();
        }

        init() {
            if (!MobileDetect.isTouchDevice()) return;

            // Add touch feedback to interactive elements
            const elements = document.querySelectorAll('a, button, .touchable');

            elements.forEach(element => {
                element.addEventListener('touchstart', () => {
                    element.classList.add('touch-active');
                });

                element.addEventListener('touchend', () => {
                    setTimeout(() => {
                        element.classList.remove('touch-active');
                    }, 300);
                });
            });
        }
    }

    /**
     * Responsive View Manager
     * Handles switching between mobile and desktop views without page refresh
     */
    class ResponsiveViewManager {
        constructor() {
            this.currentView = null;
            this.mobileInstances = {
                characterSelection: null,
                navigation: null,
                touchFeedback: null
            };
            this.resizeTimeout = null;
            this.preventPullToRefreshListeners = [];
            this.init();
        }

        init() {
            // Initial setup
            this.updateView();

            // Handle resize events with debouncing
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.updateView();
                }, 250); // Debounce for 250ms to avoid too many updates
            });

            // Handle orientation changes
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.updateView();
                    window.scrollTo(0, 0);
                }, 100);
            });
        }

        updateView() {
            const isMobile = MobileDetect.isMobile();
            const newView = isMobile ? 'mobile' : 'desktop';

            // Only update if view has changed
            if (this.currentView === newView) {
                return;
            }

            console.log(`Switching to ${newView} view`);
            this.currentView = newView;

            if (isMobile) {
                this.initializeMobileView();
            } else {
                this.cleanupMobileView();
                this.initializeDesktopView();
            }
        }

        initializeMobileView() {
            // Clean up any existing instances first
            this.cleanupMobileView();

            // Initialize mobile features
            this.mobileInstances.characterSelection = new CharacterSelectionMobile();
            this.mobileInstances.navigation = new MobileNavigation();
            this.mobileInstances.touchFeedback = new TouchFeedback();

            // Add mobile-specific classes
            document.body.classList.add('mobile-view');

            // Initialize mobile role title with correct persona
            const savedPersona = localStorage.getItem('gaming_persona') || 'founder';
            const mobileRoleTitle = document.querySelector('.mobile-role-title .role-text');
            if (mobileRoleTitle) {
                mobileRoleTitle.textContent = savedPersona.charAt(0).toUpperCase() + savedPersona.slice(1);
            }
            document.body.classList.remove('desktop-view');

            // Reset character selection to show first card
            const cards = document.querySelectorAll('.character-card');
            cards.forEach((card, index) => {
                if (index === 0) {
                    card.classList.add('active');
                    card.style.display = 'flex';
                } else {
                    card.classList.remove('active');
                    card.style.display = 'none';
                }
            });

            // Add viewport meta if not present
            if (!document.querySelector('meta[name="viewport"]')) {
                const viewport = document.createElement('meta');
                viewport.name = 'viewport';
                viewport.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';
                document.head.appendChild(viewport);
            }

            // Setup pull-to-refresh prevention
            this.setupPullToRefreshPrevention();
        }

        setupPullToRefreshPrevention() {
            // Disabled - was causing scroll issues on mobile
            // Pull-to-refresh prevention not needed for this app
            return;
        }

        cleanupMobileView() {
            // Clean up mobile instances
            Object.keys(this.mobileInstances).forEach(key => {
                if (this.mobileInstances[key] && typeof this.mobileInstances[key].destroy === 'function') {
                    this.mobileInstances[key].destroy();
                }
                this.mobileInstances[key] = null;
            });

            // Remove pull-to-refresh prevention listeners
            this.preventPullToRefreshListeners.forEach(({ type, handler }) => {
                document.removeEventListener(type, handler);
            });
            this.preventPullToRefreshListeners = [];

            // Remove mobile event listeners from hamburger if they exist
            const hamburger = document.getElementById('hamburger');
            if (hamburger) {
                const newHamburger = hamburger.cloneNode(true);
                hamburger.parentNode.replaceChild(newHamburger, hamburger);
            }
        }

        initializeDesktopView() {
            // Add desktop-specific classes
            document.body.classList.add('desktop-view');
            document.body.classList.remove('mobile-view');

            // Reset all cards to be visible in grid layout for desktop
            const cards = document.querySelectorAll('.character-card');
            cards.forEach(card => {
                card.style.display = ''; // Remove inline display style
                card.classList.remove('active');
            });

            // Remove mobile-specific elements if they exist
            const thumbnails = document.querySelector('.character-thumbnails');
            if (thumbnails) {
                thumbnails.style.display = 'none';
            }

            // Ensure character select overlay is properly displayed
            const characterSelect = document.getElementById('characterSelect');
            if (characterSelect && characterSelect.style.display === 'none') {
                // If character was already selected on mobile, keep it hidden
                // Otherwise show the character selection screen
                const hasSelectedPersona = localStorage.getItem('selectedPersona');
                if (!hasSelectedPersona) {
                    characterSelect.style.display = 'block';
                }
            }
        }
    }

    // Initialize Responsive View Manager when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new ResponsiveViewManager();
        });
    } else {
        new ResponsiveViewManager();
    }

    // Export for global access
    window.MobileUtils = {
        MobileDetect,
        SwipeHandler,
        CharacterSelectionMobile,
        MobileNavigation,
        TouchFeedback,
        ResponsiveViewManager,
        // Add manual initialization for persona switcher
        initPersonaSwitcher: function() {
            console.log('Manually initializing persona switcher');
            const nav = new MobileNavigation();
            nav.setupPersonaSwitcher();
        }
    };

})();