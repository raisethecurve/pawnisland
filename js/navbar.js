/**
 * Navbar Component Manager
 * Handles loading, background detection, and responsive behavior
 */
class NavbarManager {
    constructor() {
        this.navbar = null;
        this.lastScrollY = 0;
        this.ticking = false;
        this.backgroundObserver = null;
        this.init();
    }

    /**
     * Initialize the navbar component
     */
    async init() {
        try {
            await this.loadNavbar();
            this.setupEventListeners();
            this.initBackgroundDetection();
            console.log('Navbar initialized successfully');
        } catch (error) {
            console.error('Error initializing navbar:', error);
        }
    }

    /**
     * Load navbar HTML from partial
     */
    async loadNavbar() {
        try {
            const response = await fetch('../../pages/partials/navbar.html');
            if (!response.ok) {
                throw new Error(`Failed to fetch navbar: ${response.status}`);
            }
            
            const navbarHTML = await response.text();
            const container = document.getElementById('navbar-container');
            
            if (!container) {
                console.warn('No navbar container found');
                return;
            }
            
            container.innerHTML = navbarHTML;
            this.navbar = container.querySelector('.navbar');
            
            // Fix relative paths based on current page location
            this.fixRelativePaths();
            
            // Dispatch event that navbar has been loaded
            document.dispatchEvent(new CustomEvent('navbarLoaded'));
            
        } catch (error) {
            console.error('Error loading navbar:', error);
        }
    }

    /**
     * Fix relative paths based on current page location
     */
    fixRelativePaths() {
        if (!this.navbar) return;

        const currentPath = window.location.pathname;
        const isRootPage = currentPath === '/' || currentPath.endsWith('/index.html');
        const isLandingPage = currentPath.includes('/pages/landing/');

        // Fix image paths
        const brandImg = this.navbar.querySelector('.brand-svg');
        if (brandImg) {
            if (isRootPage) {
                brandImg.src = 'images/brand-icons/pawn_island_vectorized.svg';
            } else if (isLandingPage) {
                brandImg.src = '../../images/brand-icons/pawn_island_vectorized.svg';
            }
        }

        // Fix navigation links
        const navLinks = this.navbar.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                if (isRootPage) {
                    // Convert relative paths to root-relative paths
                    link.href = href.replace('../../', '');
                } else if (isLandingPage) {
                    // Keep relative paths for landing pages
                    // They're already correct
                }
            }
        });

        // Fix home link
        const homeLink = this.navbar.querySelector('.brand-link');
        if (homeLink) {
            if (isRootPage) {
                homeLink.href = '#top';
            } else {
                homeLink.href = '/';
            }
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.navbar) return;

        // Scroll event with throttling
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Resize event
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Theme change detection
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', this.handleThemeChange.bind(this));
        }

        // Handle existing theme classes
        this.detectExistingTheme();
    }

    /**
     * Handle scroll events with throttling
     */
    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateNavbarOnScroll();
                this.detectBackgroundContrast();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    /**
     * Update navbar appearance based on scroll position
     */
    updateNavbarOnScroll() {
        const currentScrollY = window.scrollY;
        
        // Add subtle background on scroll for better visibility
        if (currentScrollY > 50) {
            this.navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            this.navbar.style.backdropFilter = 'blur(10px)';
            this.navbar.style.borderBottom = '1px solid var(--navbar-border)';
        } else {
            this.navbar.style.backgroundColor = 'transparent';
            this.navbar.style.backdropFilter = 'none';
            this.navbar.style.borderBottom = 'none';
        }
        
        this.lastScrollY = currentScrollY;
    }

    /**
     * Detect background contrast and adjust navbar colors
     */
    detectBackgroundContrast() {
        if (!this.navbar) return;

        try {
            // Get the element behind the navbar
            const navbarRect = this.navbar.getBoundingClientRect();
            const elementBelow = document.elementFromPoint(
                navbarRect.left + navbarRect.width / 2,
                navbarRect.bottom + 1
            );

            if (elementBelow) {
                const computedStyle = window.getComputedStyle(elementBelow);
                const backgroundColor = computedStyle.backgroundColor;
                
                // Simple brightness detection
                const isDark = this.isColorDark(backgroundColor);
                
                // Apply appropriate theme
                this.navbar.classList.toggle('dark-background', isDark);
                this.navbar.classList.toggle('light-background', !isDark);
            }
        } catch (error) {
            // Fallback: use default theme detection
            console.log('Using fallback theme detection');
        }
    }

    /**
     * Check if a color is considered dark
     */
    isColorDark(colorString) {
        // Handle transparent/rgba colors
        if (colorString.includes('rgba') && colorString.includes('0)')) {
            return false; // Transparent, assume light
        }

        // Convert color to RGB values
        let rgb;
        if (colorString.startsWith('rgb')) {
            rgb = colorString.match(/\d+/g).map(Number);
        } else if (colorString.startsWith('#')) {
            rgb = this.hexToRgb(colorString);
        } else {
            return false; // Default to light if can't parse
        }

        if (!rgb || rgb.length < 3) return false;

        // Calculate relative luminance
        const [r, g, b] = rgb;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance < 0.5;
    }

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Recalculate navbar layout if needed
        this.detectBackgroundContrast();
    }

    /**
     * Handle theme changes
     */
    handleThemeChange(e) {
        // Update navbar for system theme changes
        if (e.matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        setTimeout(() => this.detectBackgroundContrast(), 100);
    }

    /**
     * Detect existing theme classes
     */
    detectExistingTheme() {
        const body = document.body;
        const html = document.documentElement;
        
        // Check for existing theme classes
        const isDarkTheme = body.classList.contains('night-theme') || 
                           body.classList.contains('dark-theme') ||
                           html.dataset.theme === 'dark' ||
                           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDarkTheme) {
            this.navbar?.classList.add('dark-background');
        }
    }

    /**
     * Initialize background detection with intersection observer
     */
    initBackgroundDetection() {
        // Enhanced background detection for better performance
        if ('IntersectionObserver' in window) {
            this.backgroundObserver = new IntersectionObserver((entries) => {
                this.detectBackgroundContrast();
            }, {
                threshold: [0, 0.25, 0.5, 0.75, 1],
                rootMargin: '0px 0px -60px 0px' // Account for navbar height
            });

            // Observe main content sections
            const sections = document.querySelectorAll('section, main, .hero, .content');
            sections.forEach(section => {
                this.backgroundObserver.observe(section);
            });
        }
    }

    /**
     * Cleanup method
     */
    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        
        if (this.backgroundObserver) {
            this.backgroundObserver.disconnect();
        }
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navbarManager = new NavbarManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarManager;
}
