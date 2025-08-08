/**
 * ============================================================================
 * PAWN ISLAND ACADEMY - CHESS THEMED FOOTER SYSTEM 2025
 * Modern JavaScript with Glassmorphism & Dark Chess Theme
 * ============================================================================
 */

class ChessFooter {
    constructor() {
        this.footer = null;
        this.init();
    }

    /**
     * Initialize the chess footer system
     */
    async init() {
        try {
            await this.loadFooterHTML();
            this.setupAnimations();
            this.setupInteractions();
            this.fixAssetPaths();
            this.initializeAccessibility();
            
            console.log('Chess Footer initialized successfully');
            
            // Dispatch event that footer has been loaded
            document.dispatchEvent(new CustomEvent('footerLoaded'));
        } catch (error) {
            console.error('Failed to initialize Chess Footer:', error);
        }
    }

    /**
     * Load footer HTML from partial file
     */
    async loadFooterHTML() {
        try {
            const currentPath = window.location.pathname;
            const isLandingPage = currentPath.includes('/pages/landing/');
            const partialPath = isLandingPage ? '../../pages/partials/footer.html' : 'pages/partials/footer.html';
            
            const response = await fetch(partialPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch footer: ${response.status}`);
            }
            
            const footerHTML = await response.text();
            
            // Find footer placeholder or append to body
            const placeholders = document.querySelectorAll('.footer-placeholder, #footer-placeholder');
            if (placeholders.length > 0) {
                placeholders.forEach(placeholder => {
                    placeholder.innerHTML = footerHTML;
                });
            } else {
                document.body.insertAdjacentHTML('beforeend', footerHTML);
            }
            
            // Get footer element
            this.footer = document.querySelector('.chess-footer');
            
            if (!this.footer) {
                throw new Error('Footer element not found');
            }
            
        } catch (error) {
            console.error('Error loading footer:', error);
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
        const logos = this.footer.querySelectorAll('img[src*="images/brand-icons"]');
        logos.forEach(logo => {
            const src = logo.getAttribute('src');
            if (src.startsWith('../../') && !isLandingPage) {
                logo.setAttribute('src', src.replace('../../', basePath));
            } else if (!src.startsWith('../../') && isLandingPage) {
                logo.setAttribute('src', '../../' + src);
            }
        });
        
        // Fix internal navigation links
        const internalLinks = this.footer.querySelectorAll('a[href^="/pages/"]');
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
     * Setup animations and visual effects
     */
    setupAnimations() {
        // Intersection Observer for footer animation
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateFooterElements();
                }
            });
        }, observerOptions);

        if (this.footer) {
            observer.observe(this.footer);
        }

        // Add parallax effect to chess pieces
        this.setupParallaxEffect();
    }

    /**
     * Animate footer elements when they come into view
     */
    animateFooterElements() {
        const elements = this.footer.querySelectorAll('.footer-brand, .footer-social, .footer-links, .footer-copyright');
        
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 150);
        });

        // Initially hide elements for animation
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        });
    }

    /**
     * Setup parallax effect for chess pieces
     */
    setupParallaxEffect() {
        const chessPieces = this.footer.querySelectorAll('.chess-piece');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const footerRect = this.footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Only apply parallax when footer is visible
            if (footerRect.top < windowHeight && footerRect.bottom > 0) {
                chessPieces.forEach((piece, index) => {
                    const speed = 0.5 + (index * 0.1);
                    const yPos = -(scrolled * speed);
                    piece.style.transform = `translateY(${yPos}px) rotate(${yPos * 0.1}deg)`;
                });
            }
        }, { passive: true });
    }

    /**
     * Setup interactive elements
     */
    setupInteractions() {
        // Social link hover effects
        const socialLinks = this.footer.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', this.handleSocialHover.bind(this));
            link.addEventListener('mouseleave', this.handleSocialLeave.bind(this));
        });

        // Footer link hover effects
        const footerLinks = this.footer.querySelectorAll('.footer-link');
        footerLinks.forEach(link => {
            link.addEventListener('mouseenter', this.handleFooterLinkHover.bind(this));
            link.addEventListener('mouseleave', this.handleFooterLinkLeave.bind(this));
        });

        // Logo click effect
        const logo = this.footer.querySelector('.footer-logo');
        if (logo) {
            logo.addEventListener('click', this.handleLogoClick.bind(this));
        }
    }

    /**
     * Handle social link hover
     */
    handleSocialHover(e) {
        const link = e.currentTarget;
        const icon = link.querySelector('i');
        
        // Add ripple effect
        this.createRippleEffect(link, e);
        
        // Enhance icon animation
        if (icon) {
            icon.style.animation = 'socialIconPulse 0.6s ease-out';
        }
    }

    /**
     * Handle social link leave
     */
    handleSocialLeave(e) {
        const link = e.currentTarget;
        const icon = link.querySelector('i');
        
        if (icon) {
            icon.style.animation = '';
        }
    }

    /**
     * Handle footer link hover
     */
    handleFooterLinkHover(e) {
        const link = e.currentTarget;
        this.createRippleEffect(link, e);
    }

    /**
     * Handle footer link leave
     */
    handleFooterLinkLeave(e) {
        // Clean up any remaining ripple effects
        const ripples = e.currentTarget.querySelectorAll('.ripple');
        ripples.forEach(ripple => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        });
    }

    /**
     * Handle logo click effect
     */
    handleLogoClick(e) {
        const logo = e.currentTarget;
        logo.style.animation = 'logoSpinBurst 1s ease-out';
        
        setTimeout(() => {
            logo.style.animation = '';
        }, 1000);
    }

    /**
     * Create ripple effect on element
     */
    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.className = 'ripple';
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: rippleAnimation 0.6s linear;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        // Add proper ARIA labels to social links
        const socialLinks = this.footer.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            const existingLabel = link.getAttribute('aria-label');
            if (!existingLabel) {
                const icon = link.querySelector('i');
                if (icon) {
                    const platformName = this.getSocialPlatformName(icon.className);
                    link.setAttribute('aria-label', `Visit our ${platformName} page`);
                }
            }
        });

        // Add keyboard navigation support
        this.setupKeyboardNavigation();
    }

    /**
     * Get social platform name from icon class
     */
    getSocialPlatformName(iconClass) {
        if (iconClass.includes('facebook')) return 'Facebook';
        if (iconClass.includes('twitter') || iconClass.includes('x-twitter')) return 'X (Twitter)';
        if (iconClass.includes('instagram')) return 'Instagram';
        if (iconClass.includes('linkedin')) return 'LinkedIn';
        if (iconClass.includes('bullhorn')) return 'Truth Social';
        if (iconClass.includes('shopping-cart')) return 'Shop';
        if (iconClass.includes('envelope')) return 'Email';
        return 'Social Media';
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        const focusableElements = this.footer.querySelectorAll(
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
     * Update footer for theme (legacy support)
     */
    updateFooterForTheme() {
        // This method is kept for backward compatibility
        // The new footer already uses the dark chess theme
        console.log('Footer is already using dark chess theme');
    }

    /**
     * Destroy footer and cleanup
     */
    destroy() {
        if (this.footer) {
            this.footer.remove();
        }
    }
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleAnimation {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes socialIconPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
    }
    
    @keyframes logoSpinBurst {
        0% { transform: scale(1) rotateY(0deg); }
        50% { transform: scale(1.2) rotateY(180deg); }
        100% { transform: scale(1) rotateY(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chessFooter = new ChessFooter();
    });
} else {
    window.chessFooter = new ChessFooter();
}

// Legacy function for backward compatibility
function updateFooterForTheme() {
    if (window.chessFooter) {
        window.chessFooter.updateFooterForTheme();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessFooter;
}