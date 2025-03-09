/**
 * ThemeManager - Simplified Version
 * 
 * Features:
 * - Proper contrast between background and text
 * - Consistent visual language across components
 * - Performance-optimized with debouncing
 */
const ThemeManager = (function() {
    // Simplified theme configuration - light theme only
    const theme = {
        name: 'day-theme',
        // Core visual properties
        backgroundColor: '#f8f9fa',
        textColor: '#212529',
        primaryColor: '#dd3649',
        secondaryColor: '#6c757d',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        // Component-specific colors
        navbar: { background: '#f8f9fa', text: '#212529' },
        footer: { background: '#f8f9fa', text: '#212529' },
        card: { background: '#ffffff', text: '#212529', muted: '#6c757d' },
        filter: { background: '#343a40', text: '#ffffff', active: '#dd3649' },
        button: { background: '#dd3649', text: '#ffffff' }
    };

    /**
     * Initialize the theme system
     */
    function initialize() {
        console.log("ThemeManager: Initializing...");
        
        // Apply the theme
        applyTheme();
        
        // Add window resize handler with debounce for performance
        window.addEventListener('resize', debounce(handleResize, 250));
        
        console.log(`ThemeManager: Initialized with day theme`);
    }
    
    /**
     * Apply theme to all document elements
     */
    function applyTheme() {
        // Update <body> element with theme classes
        updateBodyClasses();
        
        // Update various component types
        updateNavbar();
        updateCards();
        updateFooter();
        updateTextElements();
        updateFilterButtons();
        
        // Notify other components
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { 
                theme: 'day-theme', 
                isDark: false,
                colors: theme
            }
        }));
        
        console.log(`ThemeManager: Applied day theme`);
    }
    
    /**
     * Update body classes and CSS variables
     */
    function updateBodyClasses() {
        const body = document.body;
        
        // Add theme classes
        body.className = '';
        body.classList.add('day-theme', 'bg-light', 'text-dark');
        
        // Set CSS variables for global access
        body.style.setProperty('--theme-bg-color', theme.backgroundColor);
        body.style.setProperty('--theme-text-color', theme.textColor);
        body.style.setProperty('--theme-primary-color', theme.primaryColor);
        body.style.setProperty('--theme-border-color', theme.borderColor);
    }
    
    /**
     * Update the navbar with appropriate colors
     */
    function updateNavbar() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        // Update navbar
        navbar.classList.remove('navbar-dark', 'bg-dark');
        navbar.classList.add('navbar-light', 'bg-light');
        
        // Update navbar links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('text-white');
            link.classList.add('text-dark');
        });
    }
    
    /**
     * Update card elements
     */
    function updateCards() {
        document.querySelectorAll('.card, .event-card').forEach(card => {
            card.classList.remove('bg-dark', 'bg-secondary', 'text-white');
            card.classList.add('bg-light', 'text-dark');
            
            // Update card footer if present
            const footer = card.querySelector('.card-footer');
            if (footer) {
                footer.classList.remove('bg-dark');
                footer.classList.add('bg-light');
                footer.style.borderTopColor = theme.borderColor;
            }
        });
        
        // Handle muted text
        document.querySelectorAll('.text-light').forEach(el => {
            el.classList.remove('text-light');
            el.classList.add('text-muted');
        });
    }
    
    /**
     * Update footer styling with proper colors
     */
    function updateFooter() {
        const footer = document.querySelector('.footer');
        if (!footer) return;
        
        // Apply footer styles directly for immediate effect
        footer.style.backgroundColor = theme.footer.background;
        footer.style.color = theme.footer.text;
    }
    
    /**
     * Update other text elements throughout the page
     */
    function updateTextElements() {
        // Update header elements
        document.querySelectorAll('.header .title, .header .subtitle').forEach(el => {
            el.classList.remove('text-white');
            el.classList.add('text-dark');
        });
        
        // Update headings and text
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach(el => {
            if (!el.closest('.card') && !el.closest('.navbar') && !el.closest('.footer')) {
                const isInheritingColor = getComputedStyle(el).color === 'inherit';
                if (!isInheritingColor) {
                    el.style.color = theme.textColor;
                }
            }
        });
    }
    
    /**
     * Update filter buttons on the clearinghouse page
     */
    function updateFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn:not(.active)');
        filterButtons.forEach(btn => {
            btn.style.backgroundColor = theme.filter.background;
            btn.style.color = theme.filter.text;
        });
        
        // Update active filter buttons separately
        const activeFilterButtons = document.querySelectorAll('.filter-btn.active');
        activeFilterButtons.forEach(btn => {
            btn.style.backgroundColor = theme.primaryColor;
            btn.style.color = '#ffffff';
        });
        
        // Update no events message
        const noEventsMessage = document.getElementById('no-events-message');
        if (noEventsMessage) {
            noEventsMessage.classList.remove('bg-dark', 'text-white');
            noEventsMessage.classList.add('bg-light', 'text-dark');
        }
    }
    
    /**
     * Handle window resize events
     */
    function handleResize() {
        console.log('ThemeManager: Window resized, refreshing theme');
        applyTheme();
    }
    
    /**
     * Debounce function for performance optimization
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, arguments), wait);
        };
    }

    /**
     * Public API
     */
    return {
        initialize,
        applyTheme,
        getThemeData: () => theme
    };
})();

// Initialize the theme manager when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.initialize();
    
    // Reinitialize when footer is loaded to ensure footer elements get styled
    document.addEventListener('footerLoaded', function() {
        setTimeout(function() {
            ThemeManager.applyTheme();
        }, 100);
    });
});
