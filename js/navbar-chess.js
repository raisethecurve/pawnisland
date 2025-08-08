/**
 * ============================================================================
 * PAWN ISLAND ACADEMY - CHESS THEMED NAVBAR SYSTEM 2025
 * Modern JavaScript with Glassmorphism & Dark Chess Theme
 * ============================================================================
 */

class ChessNavbar {
    constructor() {
        this.navbar = null;
        this.mobileToggle = null;
        this.mobileOverlay = null;
        this.lastScrollY = 0;
        this.scrollThreshold = 50;
        this.isScrollingDown = false;
        this.ticking = false;
        this.isMobileMenuOpen = false;
        
        this.init();
    }

    /**
     * Initialize the chess navbar system
     */
    async init() {
        try {
            await this.loadNavbarHTML();
            this.setupEventListeners();
            this.setupScrollBehavior();
            this.setupMobileMenu();
            this.hideCurrentPageLink();
            this.initializeAccessibility();
            
            console.log('Chess Navbar initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Chess Navbar:', error);
        }
    }

    /**
     * Load navbar HTML from partial file
     */
    async loadNavbarHTML() {
        try {
            const currentPath = window.location.pathname;
            const isLandingPage = currentPath.includes('/pages/landing/');
            const partialPath = isLandingPage ? '../../pages/partials/navbar.html' : 'pages/partials/navbar.html';
            
            const response = await fetch(partialPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch navbar: ${response.status}`);
            }
            
            const navbarHTML = await response.text();
            
            // Find navbar placeholder or insert at beginning of body
            const placeholder = document.getElementById('navbar-placeholder');
            if (placeholder) {
                placeholder.innerHTML = navbarHTML;
            } else {
                document.body.insertAdjacentHTML('afterbegin', navbarHTML);
            }
            
            // Get navbar elements
            this.navbar = document.querySelector('.chess-navbar');
            this.mobileToggle = document.querySelector('.mobile-menu-toggle');
            this.mobileOverlay = document.querySelector('.mobile-menu-overlay');
            
            if (!this.navbar) {
                throw new Error('Navbar element not found');
            }
            
            // Fix asset paths
            this.fixAssetPaths();
            
        } catch (error) {
            console.error('Error loading navbar:', error);
            throw error;
        }
    }

    /**
     * Fix asset paths based on current page location
     */
    fixAssetPaths() {
        const currentPath = window.location.pathname;
        const isLandingPage = currentPath.includes('/pages/landing/');
        const isRoot = currentPath === '/' || currentPath.endsWith('index.html');
        
        let basePath = '';
        if (isLandingPage) {
            basePath = '../../';
        } else if (!isRoot) {
            basePath = './';
        }
        
        // Fix logo paths
        const logos = this.navbar.querySelectorAll('img[src*="images/brand-icons"]');
        logos.forEach(logo => {
            const src = logo.getAttribute('src');
            if (src.startsWith('../../') && !isLandingPage) {
                logo.setAttribute('src', src.replace('../../', basePath));
            } else if (!src.startsWith('../../') && isLandingPage) {
                logo.setAttribute('src', '../../' + src);
            }
        });
        
        // Fix internal navigation links
        const internalLinks = this.navbar.querySelectorAll('a[href^="/pages/"]');
        internalLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (isLandingPage && !href.startsWith('../../')) {
                link.setAttribute('href', '../..' + href);
            } else if (!isLandingPage && href.startsWith('../../')) {
                link.setAttribute('href', href.replace('../../', './'));
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Resize events
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Click events for navigation links
        const navLinks = this.navbar.querySelectorAll('.nav-link, .mobile-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavLinkClick.bind(this));
        });
    }

    /**
     * Setup scroll behavior
     */
    setupScrollBehavior() {
        this.handleScroll();
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateScrollState();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    /**
     * Update navbar state based on scroll position
     */
    updateScrollState() {
        const currentScrollY = window.scrollY;
        
        // Add scrolled class when scrolled past threshold
        if (currentScrollY > this.scrollThreshold) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
        
        this.lastScrollY = currentScrollY;
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        if (!this.mobileToggle || !this.mobileOverlay) return;
        
        // Mobile toggle click
        this.mobileToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        
        // Close on overlay click
        this.mobileOverlay.addEventListener('click', (e) => {
            if (e.target === this.mobileOverlay) {
                this.closeMobileMenu();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Close on mobile nav link click
        const mobileLinks = this.mobileOverlay.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.isMobileMenuOpen = true;
        this.mobileToggle.classList.add('active');
        this.mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstLink = this.mobileOverlay.querySelector('.mobile-nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        this.mobileToggle.classList.remove('active');
        this.mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to toggle button
        this.mobileToggle.focus();
    }

    /**
     * Handle navigation link clicks
     */
    handleNavLinkClick(e) {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        // Don't prevent default for external links
        if (href.startsWith('http') || href.includes('setmore.com') || href.includes('myshopify.com')) {
            return;
        }
        
        // Add loading state for internal navigation
        link.style.opacity = '0.7';
        setTimeout(() => {
            if (link) link.style.opacity = '';
        }, 1000);
    }

    /**
     * Hide current page navigation link
     */
    hideCurrentPageLink() {
        const currentPath = window.location.pathname;
        const navLinks = this.navbar.querySelectorAll('.nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (this.isCurrentPage(currentPath, href)) {
                link.style.opacity = '0.5';
                link.style.pointerEvents = 'none';
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    /**
     * Check if link represents current page
     */
    isCurrentPage(currentPath, linkHref) {
        // Normalize paths
        const normalizeHref = linkHref.replace(/^\.\.\/\.\.\//, '/').replace(/^\.\//, '/');
        const normalizeCurrent = currentPath.replace(/\/index\.html$/, '/');
        
        // Check for exact matches or base path matches
        return normalizeCurrent === normalizeHref || 
               normalizeCurrent.endsWith(normalizeHref) ||
               (normalizeHref.includes('/about-me.html') && normalizeCurrent.includes('/about-me.html')) ||
               (normalizeHref.includes('/coaching.html') && normalizeCurrent.includes('/coaching.html')) ||
               (normalizeHref.includes('/clearinghouse.html') && normalizeCurrent.includes('/clearinghouse.html'));
    }

    /**
     * Handle resize events
     */
    handleResize() {
        // Close mobile menu on resize to larger screen
        if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        // Add skip link
        this.addSkipLink();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
        
        // Add ARIA labels
        this.setupAriaLabels();
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
            background: var(--chess-gold);
            color: var(--chess-black);
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
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        const focusableElements = this.navbar.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (element.tagName !== 'A') {
                        e.preventDefault();
                        element.click();
                    }
                }
            });
        });
    }

    /**
     * Setup ARIA labels
     */
    setupAriaLabels() {
        // Ensure mobile toggle has proper ARIA attributes
        if (this.mobileToggle) {
            this.mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.mobileToggle.setAttribute('aria-controls', 'mobile-menu');
        }
        
        // Update ARIA expanded state
        const originalToggle = this.toggleMobileMenu.bind(this);
        this.toggleMobileMenu = () => {
            originalToggle();
            if (this.mobileToggle) {
                this.mobileToggle.setAttribute('aria-expanded', this.isMobileMenuOpen.toString());
            }
        };
    }

    /**
     * Destroy navbar and cleanup
     */
    destroy() {
        window.removeEventListener('scroll', this.handleScroll.bind(this));
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        if (this.navbar) {
            this.navbar.remove();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chessNavbar = new ChessNavbar();
    });
} else {
    window.chessNavbar = new ChessNavbar();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessNavbar;
}
