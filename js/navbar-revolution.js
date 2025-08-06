/**
 * ============================================================================
 * PAWN ISLAND ACADEMY - REVOLUTIONARY NAVBAR SYSTEM 2025
 * Ultra-Modern JavaScript with Advanced Features & Performance Optimization
 * ============================================================================
 */

class NavbarRevolution {
    constructor() {
        this.navbar = null;
        this.lastScrollY = 0;
        this.scrollThreshold = 100;
        this.isScrollingDown = false;
        this.ticking = false;
        this.intersectionObserver = null;
        this.resizeObserver = null;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Performance tracking
        this.performanceMetrics = {
            initTime: 0,
            renderTime: 0,
            animationFrames: 0
        };
        
        this.init();
    }

    /**
     * Initialize the revolutionary navbar system
     */
    async init() {
        const startTime = performance.now();
        
        try {
            await this.createNavbarStructure();
            this.setupAdvancedEventListeners();
            this.initializeScrollBehavior();
            this.setupIntersectionObserver();
            this.setupResizeObserver();
            this.initializeAccessibility();
            this.setupPerformanceMonitoring();
            this.hideCurrentPageLink();
            
            this.performanceMetrics.initTime = performance.now() - startTime;
            this.logPerformanceMetrics();
            
            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('navbarRevolutionLoaded', {
                detail: { 
                    navbar: this.navbar,
                    metrics: this.performanceMetrics
                }
            }));
            
            console.log('🚀 Navbar Revolution initialized successfully!');
        } catch (error) {
            console.error('❌ Error initializing Navbar Revolution:', error);
        }
    }

    /**
     * Create the revolutionary navbar structure
     */
    async createNavbarStructure() {
        const renderStart = performance.now();
        
        // Create navbar elements with advanced structure
        const navbarHTML = this.generateNavbarHTML();
        
        // Insert into DOM
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
        this.navbar = document.querySelector('.navbar-revolution');
        
        // Fix paths based on current location
        this.fixAssetPaths();
        
        // Add initial classes and states
        this.navbar.classList.add('navbar-loaded');
        
        this.performanceMetrics.renderTime = performance.now() - renderStart;
    }

    /**
     * Generate the revolutionary navbar HTML structure
     */
    generateNavbarHTML() {
        const currentPath = window.location.pathname;
        const isLandingPage = currentPath.includes('/pages/landing/');
        const assetPath = isLandingPage ? '../../' : '';
        
        return `
        <nav class="navbar-revolution" id="navbar-revolution" role="navigation" aria-label="Main navigation">
            <div class="navbar-container-revolution">
                <!-- Revolutionary Brand Section -->
                <div class="brand-section-revolution">
                    <a href="${isLandingPage ? '../../index.html' : '/index.html'}" 
                       class="brand-link-revolution" 
                       aria-label="Pawn Island Academy - Return to Home">
                        <div class="brand-icon-revolution">
                            <img src="${assetPath}images/brand-icons/pawn_island_vectorized.svg" 
                                 alt="Pawn Island Academy Logo" 
                                 class="brand-svg-revolution" 
                                 width="32" 
                                 height="32"
                                 loading="eager">
                        </div>
                        <div class="brand-text-revolution">
                            <div class="brand-text-full">
                                <span class="brand-line-1-revolution">Pawn Island</span>
                                <span class="brand-line-2-revolution">Academy</span>
                            </div>
                            <div class="brand-text-compact">
                                <span class="brand-compact-revolution">PIA</span>
                            </div>
                        </div>
                    </a>
                </div>

                <!-- Ultra-Modern Navigation System -->
                <div class="nav-system-revolution">
                    <ul class="nav-links-revolution" role="menubar">
                        <li role="none">
                            <a href="${isLandingPage ? 'about-me.html' : 'pages/landing/about-me.html'}" 
                               class="nav-link-revolution" 
                               role="menuitem"
                               data-page="about">About</a>
                        </li>
                        <li role="none">
                            <a href="${isLandingPage ? 'clearinghouse.html' : 'pages/landing/clearinghouse.html'}" 
                               class="nav-link-revolution" 
                               role="menuitem"
                               data-page="events">Events</a>
                        </li>
                        <li role="none">
                            <a href="${isLandingPage ? 'coaching.html' : 'pages/landing/coaching.html'}" 
                               class="nav-link-revolution" 
                               role="menuitem"
                               data-page="coaching">Coaching</a>
                        </li>
                    </ul>
                </div>

                <!-- Revolutionary CTA System -->
                <div class="cta-system-revolution">
                    <a href="https://pawnisland.setmore.com/" 
                       class="cta-button-revolution book-me" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       aria-label="Schedule a chess coaching session">
                        <span>Appointments</span>
                    </a>
                    <a href="https://pawnisland.myshopify.com/collections" 
                       class="cta-button-revolution merch" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       aria-label="Visit our merchandise store">
                        <span>Store</span>
                    </a>
                </div>
            </div>
        </nav>`;
    }

    /**
     * Fix asset paths based on current page location
     */
    fixAssetPaths() {
        if (!this.navbar) return;

        const currentPath = window.location.pathname;
        const isLandingPage = currentPath.includes('/pages/landing/');
        
        // Update logo path if needed
        const logoImg = this.navbar.querySelector('.brand-svg-revolution');
        if (logoImg && !isLandingPage) {
            logoImg.src = logoImg.src.replace('../../', '');
        }
    }

    /**
     * Setup advanced event listeners with performance optimization
     */
    setupAdvancedEventListeners() {
        // Optimized scroll handler with requestAnimationFrame
        window.addEventListener('scroll', this.handleScroll.bind(this), { 
            passive: true,
            capture: false 
        });

        // Resize handler with debouncing
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250), {
            passive: true
        });

        // Advanced keyboard navigation
        this.navbar.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

        // Focus management
        this.navbar.addEventListener('focusin', this.handleFocusIn.bind(this));
        this.navbar.addEventListener('focusout', this.handleFocusOut.bind(this));

        // Hover effects with touch support
        this.setupHoverEffects();

        // Visibility API for performance optimization
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Match media for responsive changes
        this.setupMediaQueryListeners();
    }

    /**
     * Handle scroll events with advanced behavior
     */
    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateScrollState();
                this.ticking = false;
                this.performanceMetrics.animationFrames++;
            });
            this.ticking = true;
        }
    }

    /**
     * Update navbar state based on scroll position
     */
    updateScrollState() {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > this.lastScrollY;
        const crossedThreshold = currentScrollY > this.scrollThreshold;

        // Add/remove scrolled class
        this.navbar.classList.toggle('scrolled', crossedThreshold);

        // Detect background color and adjust navbar appearance
        this.detectBackgroundAndAdjust();

        // Advanced hide/show behavior
        if (crossedThreshold && scrollingDown && !this.isScrollingDown) {
            this.navbar.classList.add('hidden');
            this.isScrollingDown = true;
        } else if (!scrollingDown && this.isScrollingDown) {
            this.navbar.classList.remove('hidden');
            this.isScrollingDown = false;
        }

        this.lastScrollY = currentScrollY;
    }

    /**
     * Detect background color and adjust navbar appearance
     */
    detectBackgroundAndAdjust() {
        // Get the element directly below the navbar
        const navbarHeight = this.navbar.offsetHeight;
        const elementBelow = document.elementFromPoint(window.innerWidth / 2, navbarHeight + 10);
        
        if (!elementBelow) return;

        // Get computed styles of the element below
        const computedStyle = window.getComputedStyle(elementBelow);
        const backgroundColor = computedStyle.backgroundColor;
        const backgroundImage = computedStyle.backgroundImage;

        // Check if we're over a light background
        const isLightBackground = this.isLightColor(backgroundColor, backgroundImage, elementBelow);
        
        // Apply appropriate class
        this.navbar.classList.toggle('on-light-bg', isLightBackground);
    }

    /**
     * Determine if a background is light colored
     */
    isLightColor(backgroundColor, backgroundImage, element) {
        // Check for common light background indicators
        const lightClasses = ['bg-light', 'bg-white', 'light', 'white'];
        const hasLightClass = lightClasses.some(cls => element.classList.contains(cls));
        
        if (hasLightClass) return true;

        // Parse RGB/RGBA values from background color
        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
            const rgb = this.parseRgbColor(backgroundColor);
            if (rgb) {
                // Calculate relative luminance
                const luminance = this.calculateLuminance(rgb.r, rgb.g, rgb.b);
                return luminance > 0.6; // Threshold for "light" colors
            }
        }

        // Check if background image suggests light content
        if (backgroundImage && backgroundImage !== 'none') {
            // Look for common light background image patterns
            if (backgroundImage.includes('light') || backgroundImage.includes('white')) {
                return true;
            }
        }

        // Check parent elements for light backgrounds
        let parent = element.parentElement;
        let depth = 0;
        while (parent && depth < 3) {
            const parentStyle = window.getComputedStyle(parent);
            const parentBg = parentStyle.backgroundColor;
            
            if (parentBg && parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
                const rgb = this.parseRgbColor(parentBg);
                if (rgb) {
                    const luminance = this.calculateLuminance(rgb.r, rgb.g, rgb.b);
                    if (luminance > 0.6) return true;
                }
            }
            
            parent = parent.parentElement;
            depth++;
        }

        return false;
    }

    /**
     * Parse RGB color string to RGB values
     */
    parseRgbColor(color) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
        return null;
    }

    /**
     * Calculate relative luminance of RGB color
     */
    calculateLuminance(r, g, b) {
        // Normalize RGB values
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        // Calculate luminance using sRGB formula
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    /**
     * Initialize advanced scroll behavior
     */
    initializeScrollBehavior() {
        // Set initial scroll state
        this.updateScrollState();
        
        // Initial background detection
        setTimeout(() => {
            this.detectBackgroundAndAdjust();
        }, 100);
        
        // Smooth scroll for anchor links
        this.navbar.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    /**
     * Setup intersection observer for advanced animations
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.1, 0.5, 1]
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, options);

        // Observe navbar elements
        const observeElements = this.navbar.querySelectorAll(
            '.brand-section-revolution, .nav-system-revolution, .cta-system-revolution'
        );
        observeElements.forEach(el => this.intersectionObserver.observe(el));
    }

    /**
     * Setup resize observer for responsive behavior
     */
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    this.handleNavbarResize(entry.contentRect);
                }
            });
            this.resizeObserver.observe(this.navbar);
        }
    }

    /**
     * Handle navbar resize with advanced responsive behavior
     */
    handleNavbarResize(rect) {
        const width = rect.width;
        
        // Update CSS custom properties based on width
        if (width < 480) {
            this.navbar.style.setProperty('--navbar-mode', 'mobile');
        } else if (width < 768) {
            this.navbar.style.setProperty('--navbar-mode', 'tablet');
        } else {
            this.navbar.style.setProperty('--navbar-mode', 'desktop');
        }
    }

    /**
     * Advanced keyboard navigation
     */
    handleKeyboardNavigation(e) {
        const navLinks = this.navbar.querySelectorAll('.nav-link-revolution, .cta-button-revolution');
        const currentIndex = Array.from(navLinks).indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % navLinks.length;
                navLinks[nextIndex].focus();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + navLinks.length) % navLinks.length;
                navLinks[prevIndex].focus();
                break;
            case 'Home':
                e.preventDefault();
                navLinks[0].focus();
                break;
            case 'End':
                e.preventDefault();
                navLinks[navLinks.length - 1].focus();
                break;
            case 'Escape':
                document.activeElement.blur();
                break;
        }
    }

    /**
     * Setup hover effects with touch support
     */
    setupHoverEffects() {
        const interactiveElements = this.navbar.querySelectorAll(
            '.brand-link-revolution, .nav-link-revolution, .cta-button-revolution'
        );

        interactiveElements.forEach(element => {
            // Mouse events
            element.addEventListener('mouseenter', () => {
                if (!this.prefersReducedMotion) {
                    element.style.transform = 'translateY(-2px) scale(1.02)';
                }
            });

            element.addEventListener('mouseleave', () => {
                if (!this.prefersReducedMotion) {
                    element.style.transform = '';
                }
            });

            // Touch events for mobile
            element.addEventListener('touchstart', () => {
                element.classList.add('touch-active');
            }, { passive: true });

            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.classList.remove('touch-active');
                }, 150);
            }, { passive: true });
        });
    }

    /**
     * Hide current page navigation link
     */
    hideCurrentPageLink() {
        const currentPath = window.location.pathname;
        const navLinks = this.navbar.querySelectorAll('.nav-link-revolution');
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            const page = link.getAttribute('data-page');
            
            // Check if current page matches link
            if (this.isCurrentPage(currentPath, linkHref, page)) {
                link.classList.add('current-page');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    /**
     * Check if link represents current page
     */
    isCurrentPage(currentPath, linkHref, page) {
        // Normalize paths for comparison
        const normalizedCurrent = currentPath.toLowerCase().replace(/\/index\.html$/, '/');
        const normalizedLink = linkHref.toLowerCase();
        
        // Direct path match
        if (normalizedCurrent.endsWith(normalizedLink)) return true;
        
        // Page identifier match
        if (page && normalizedCurrent.includes(page)) return true;
        
        // Filename match
        const currentFilename = currentPath.split('/').pop().replace('.html', '');
        if (currentFilename === page) return true;
        
        return false;
    }

    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        // Set ARIA attributes
        this.navbar.setAttribute('role', 'navigation');
        this.navbar.setAttribute('aria-label', 'Main navigation');
        
        // Add skip link functionality
        this.addSkipLink();
        
        // Announce navbar state changes to screen readers
        this.setupAriaLiveRegion();
        
        // Enhanced focus indicators
        this.setupFocusManagement();
    }

    /**
     * Add skip link for accessibility
     */
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--pi-primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, this.navbar);
    }

    /**
     * Setup ARIA live region for announcements
     */
    setupAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'navbar-announcements';
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
    }

    /**
     * Setup enhanced focus management
     */
    setupFocusManagement() {
        // Track focus within navbar
        let focusedElement = null;
        
        this.navbar.addEventListener('focusin', (e) => {
            focusedElement = e.target;
            this.navbar.classList.add('has-focus');
        });
        
        this.navbar.addEventListener('focusout', (e) => {
            // Check if focus is still within navbar
            setTimeout(() => {
                if (!this.navbar.contains(document.activeElement)) {
                    this.navbar.classList.remove('has-focus');
                    focusedElement = null;
                }
            }, 10);
        });
    }

    /**
     * Handle focus in events
     */
    handleFocusIn(e) {
        e.target.classList.add('focused');
    }

    /**
     * Handle focus out events
     */
    handleFocusOut(e) {
        e.target.classList.remove('focused');
    }

    /**
     * Handle visibility change for performance optimization
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when page is not visible
            this.navbar.style.animationPlayState = 'paused';
        } else {
            // Resume animations when page becomes visible
            this.navbar.style.animationPlayState = 'running';
        }
    }

    /**
     * Setup media query listeners for responsive behavior
     */
    setupMediaQueryListeners() {
        const mediaQueries = [
            { query: '(max-width: 480px)', handler: this.handleMobileLayout.bind(this) },
            { query: '(min-width: 481px) and (max-width: 768px)', handler: this.handleTabletLayout.bind(this) },
            { query: '(min-width: 769px)', handler: this.handleDesktopLayout.bind(this) },
            { query: '(prefers-reduced-motion: reduce)', handler: this.handleReducedMotion.bind(this) }
        ];

        mediaQueries.forEach(({ query, handler }) => {
            const mq = window.matchMedia(query);
            mq.addListener(handler);
            handler(mq); // Call immediately
        });
    }

    /**
     * Handle mobile layout changes
     */
    handleMobileLayout(mq) {
        if (mq.matches) {
            this.navbar.classList.add('mobile-layout');
            this.announceToScreenReader('Mobile navigation layout activated');
        } else {
            this.navbar.classList.remove('mobile-layout');
        }
    }

    /**
     * Handle tablet layout changes
     */
    handleTabletLayout(mq) {
        if (mq.matches) {
            this.navbar.classList.add('tablet-layout');
        } else {
            this.navbar.classList.remove('tablet-layout');
        }
    }

    /**
     * Handle desktop layout changes
     */
    handleDesktopLayout(mq) {
        if (mq.matches) {
            this.navbar.classList.add('desktop-layout');
        } else {
            this.navbar.classList.remove('desktop-layout');
        }
    }

    /**
     * Handle reduced motion preference
     */
    handleReducedMotion(mq) {
        this.prefersReducedMotion = mq.matches;
        this.navbar.classList.toggle('reduced-motion', mq.matches);
        
        if (mq.matches) {
            this.announceToScreenReader('Animations reduced for accessibility');
        }
    }

    /**
     * Handle resize events
     */
    handleResize() {
        // Update navbar layout based on new dimensions
        this.updateResponsiveClasses();
        
        // Re-detect background after layout changes
        setTimeout(() => {
            this.detectBackgroundAndAdjust();
        }, 100);
        
        // Reset any transform states
        if (this.prefersReducedMotion) {
            const elements = this.navbar.querySelectorAll('[style*="transform"]');
            elements.forEach(el => el.style.transform = '');
        }
    }

    /**
     * Update responsive classes
     */
    updateResponsiveClasses() {
        const width = window.innerWidth;
        
        this.navbar.classList.toggle('mobile', width <= 480);
        this.navbar.classList.toggle('tablet', width > 480 && width <= 768);
        this.navbar.classList.toggle('desktop', width > 768);
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor scroll performance
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitorFrameRate = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.performanceMetrics.fps = fps;
                
                if (fps < 30) {
                    console.warn('⚠️ Navbar performance warning: Low frame rate detected');
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitorFrameRate);
        };
        
        monitorFrameRate();
    }

    /**
     * Announce messages to screen readers
     */
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
            
            // Clear message after announcement
            setTimeout(() => {
                this.liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Debounce utility function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        console.log('🔥 Navbar Revolution Performance Metrics:', {
            'Initialization Time': `${this.performanceMetrics.initTime.toFixed(2)}ms`,
            'Render Time': `${this.performanceMetrics.renderTime.toFixed(2)}ms`,
            'Animation Frames': this.performanceMetrics.animationFrames,
            'FPS': this.performanceMetrics.fps || 'Monitoring...'
        });
    }

    /**
     * Destroy navbar and cleanup
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        
        // Disconnect observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Remove navbar from DOM
        if (this.navbar) {
            this.navbar.remove();
        }
        
        // Remove live region
        if (this.liveRegion) {
            this.liveRegion.remove();
        }
        
        console.log('🗑️ Navbar Revolution destroyed');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.navbarRevolution = new NavbarRevolution();
    });
} else {
    window.navbarRevolution = new NavbarRevolution();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarRevolution;
}
