/**
 * ThemeManager v3.0 - Enhanced Professional Theme Management System
 * 
 * Features:
 * - Seamless dynamic theme toggle button transitions
 * - Proper contrast between background and text
 * - Thorough element handling with defensive techniques
 * - Consistent visual language across components
 * - Performance-optimized with debouncing
 */
const ThemeManager = (function() {
    // Complete theme configuration
    const themes = {
        light: {
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
            button: { background: '#dd3649', text: '#ffffff' },
            // Toggle button
            toggle: { background: '#343a40', icon: 'sun', iconColor: '#ffc107' }
        },
        dark: {
            name: 'night-theme',
            // Core visual properties
            backgroundColor: '#212529',
            textColor: '#f8f9fa',
            primaryColor: '#ff4c63',
            secondaryColor: '#adb5bd',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            // Component-specific colors
            navbar: { background: '#1e2124', text: '#f8f9fa' },
            footer: { background: '#212529', text: '#f8f9fa' },
            card: { background: '#2c2f33', text: '#f8f9fa', muted: '#adb5bd' },
            filter: { background: '#212529', text: '#ffffff', active: '#ff4c63' },
            button: { background: '#ff4c63', text: '#ffffff' },
            // Toggle button
            toggle: { background: '#495057', icon: 'moon', iconColor: '#f8f9fa' }
        }
    };

    // State tracking
    let currentTheme = localStorage.getItem('theme') || 'light';
    let isTransitioning = false;
    let transitionTimeout = null;
    
    /**
     * Initialize the theme system
     */
    function initialize() {
        console.log("ThemeManager: Initializing...");
        
        // Apply the saved theme or default
        applyTheme(currentTheme, false);
        
        // Set up the theme toggle button with optimized event handling
        setupToggleButton();
        
        // Add window resize handler with debounce for performance
        window.addEventListener('resize', debounce(handleResize, 250));
        
        console.log(`ThemeManager: Initialized with theme: ${currentTheme}`);
    }
    
    /**
     * Set up the theme toggle button with proper event handling
     */
    function setupToggleButton() {
        const toggleButton = document.getElementById('themeToggle');
        if (!toggleButton) {
            console.warn("ThemeManager: Theme toggle button not found");
            return;
        }
        
        // Clean previous listeners by cloning the button
        const newButton = toggleButton.cloneNode(true);
        toggleButton.parentNode.replaceChild(newButton, toggleButton);
        
        // Add click handler to the new button
        newButton.addEventListener('click', handleToggleClick);
        
        // Set initial button state
        updateToggleButtonVisuals(currentTheme === 'dark');
        
        console.log("ThemeManager: Toggle button configured");
    }
    
    /**
     * Handle toggle button clicks with debouncing
     */
    function handleToggleClick() {
        if (isTransitioning) return;
        
        isTransitioning = true;
        const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Update toggle button immediately for responsive feel
        updateToggleButtonVisuals(targetTheme === 'dark');
        
        // Apply theme changes with smooth transition
        applyTheme(targetTheme, true);
        
        // Reset transition lock after animations complete
        clearTimeout(transitionTimeout);
        transitionTimeout = setTimeout(() => {
            isTransitioning = false;
            console.log("ThemeManager: Theme transition completed");
        }, 400);
    }
    
    /**
     * Apply theme to all document elements
     */
    function applyTheme(themeName, animate = false) {
        if (!themes[themeName]) {
            console.error(`ThemeManager: Invalid theme name: ${themeName}`);
            themeName = 'light';
        }
        
        const prevTheme = currentTheme;
        currentTheme = themeName;
        const theme = themes[themeName];
        const prevThemeObj = themes[prevTheme];
        
        // Update <body> element with theme classes
        updateBodyClasses(theme, prevThemeObj);
        
        // Update various component types
        updateNavbar(theme);
        updateCards(theme);
        updateFooter(theme);
        updateTextElements(theme);
        updateIcons(theme, animate);
        updateFilterButtons(theme);
        updateToggleButtonVisuals(themeName === 'dark');
        updateElementsForTheme(themeName);

        // Store preference
        localStorage.setItem('theme', themeName);
        
        // Notify other components
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { 
                theme: themeName, 
                isDark: themeName === 'dark',
                colors: theme
            }
        }));
        
        console.log(`ThemeManager: Applied theme "${themeName}"`);
    }
    
    /**
     * Update body classes and CSS variables
     */
    function updateBodyClasses(theme, prevTheme) {
        const body = document.body;
        
        // Remove previous theme classes
        body.classList.remove(
            prevTheme.name, 
            `bg-${prevTheme.name.split('-')[0]}`, 
            `text-${prevTheme.name === 'day-theme' ? 'dark' : 'white'}`
        );
        
        // Add new theme classes
        body.classList.add(
            theme.name, 
            `bg-${theme.name.split('-')[0]}`, 
            `text-${theme.name === 'day-theme' ? 'dark' : 'white'}`
        );
        
        // Set CSS variables for global access
        body.style.setProperty('--theme-bg-color', theme.backgroundColor);
        body.style.setProperty('--theme-text-color', theme.textColor);
        body.style.setProperty('--theme-primary-color', theme.primaryColor);
        body.style.setProperty('--theme-border-color', theme.borderColor);
    }
    
    /**
     * Update the navbar with appropriate colors
     */
    function updateNavbar(theme) {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        // Update navbar
        navbar.classList.remove('navbar-light', 'navbar-dark', 'bg-light', 'bg-dark');
        navbar.classList.add(
            theme.name === 'day-theme' ? 'navbar-light' : 'navbar-dark',
            theme.name === 'day-theme' ? 'bg-light' : 'bg-dark'
        );
        
        // Update navbar links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('text-dark', 'text-white');
            link.classList.add(theme.name === 'day-theme' ? 'text-dark' : 'text-white');
        });
        
        // Flip logo: day-theme shows dark logo, dark-theme shows light logo
        const dayLogo = navbar.querySelector('.day-logo');
        const nightLogo = navbar.querySelector('.night-logo');
        if (dayLogo && nightLogo) {
            if (theme.name === 'day-theme') {
                // For day theme show dark logo (nightLogo) only
                dayLogo.classList.add('d-none');
                nightLogo.classList.remove('d-none');
            } else {
                // For dark theme show light logo (dayLogo) only
                dayLogo.classList.remove('d-none');
                nightLogo.classList.add('d-none');
            }
        }
    }
    
    /**
     * Update card elements
     */
    function updateCards(theme) {
        document.querySelectorAll('.card, .event-card').forEach(card => {
            const isPastEvent = card.closest('.event-item')?.classList.contains('past-event');
            
            card.classList.remove('bg-light', 'bg-dark', 'bg-secondary', 'text-dark', 'text-white');
            
            if (theme.name === 'day-theme') {
                card.classList.add('bg-light', 'text-dark');
            } else {
                card.classList.add(isPastEvent ? 'bg-secondary' : 'bg-dark', 'text-white');
            }
            
            // Update card footer if present
            const footer = card.querySelector('.card-footer');
            if (footer) {
                footer.classList.remove('bg-light', 'bg-dark');
                footer.classList.add(theme.name === 'day-theme' ? 'bg-light' : 'bg-dark');
                footer.style.borderTopColor = theme.borderColor;
            }
        });
        
        // Handle muted text
        document.querySelectorAll('.text-muted, .text-light').forEach(el => {
            el.classList.remove('text-muted', 'text-light');
            el.classList.add(theme.name === 'day-theme' ? 'text-muted' : 'text-light');
        });
    }
    
    /**
     * Update footer styling with proper colors
     */
    function updateFooter(theme) {
        const footer = document.querySelector('.footer');
        if (!footer) return;
        
        // Apply footer styles directly for immediate effect
        footer.style.backgroundColor = theme.footer.background;
        footer.style.color = theme.footer.text;
        
        // Handle social icons
        const dayIcons = footer.querySelectorAll('.social-icon.day-logo');
        const nightIcons = footer.querySelectorAll('.social-icon.night-logo');
        
        dayIcons.forEach(icon => {
            icon.style.display = theme.name === 'day-theme' ? 'inline-block' : 'none';
        });
        
        nightIcons.forEach(icon => {
            icon.style.display = theme.name === 'night-theme' ? 'inline-block' : 'none';
        });
    }
    
    /**
     * Update other text elements throughout the page
     */
    function updateTextElements(theme) {
        // Update header elements
        document.querySelectorAll('.header .title, .header .subtitle').forEach(el => {
            el.classList.remove('text-dark', 'text-white');
            el.classList.add(theme.name === 'day-theme' ? 'text-dark' : 'text-white');
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
     * Update icons throughout the site
     */
    function updateIcons(theme, animate) {
        const isDark = theme.name === 'night-theme';
        
        // Update page icons
        const allDayIcons = document.querySelectorAll('.day-logo:not(.social-icon)');
        const allNightIcons = document.querySelectorAll('.night-logo:not(.social-icon)');
        
        if (animate) {
            fadeElements(allDayIcons, !isDark);
            fadeElements(allNightIcons, isDark);
        } else {
            allDayIcons.forEach(icon => icon.classList.toggle('d-none', isDark));
            allNightIcons.forEach(icon => icon.classList.toggle('d-none', !isDark));
        }
    }
    
    /**
     * Update filter buttons on the clearinghouse page
     */
    function updateFilterButtons(theme) {
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
            noEventsMessage.classList.remove('bg-light', 'bg-dark', 'text-light', 'text-dark');
            if (theme.name === 'day-theme') {
                noEventsMessage.classList.add('bg-light', 'text-dark');
            } else {
                noEventsMessage.classList.add('bg-dark', 'text-white');
            }
        }
    }
    
    /**
     * Update theme toggle button appearance with smooth transitions
     */
    function updateToggleButtonVisuals(isDark) {
        const button = document.getElementById('themeToggle');
        if (!button) return;
        
        // Get the theme setting
        const theme = isDark ? themes.dark : themes.light;

        // Update the button background color
        button.style.backgroundColor = theme.toggle.background;
        
        // Handle the icons - select both icons
        const sunIcon = button.querySelector('.day-icon');
        const moonIcon = button.querySelector('.night-icon');
        
        if (sunIcon && moonIcon) {
            // Animate the transition
            if (isDark) {
                // Switch to moon icon
                sunIcon.style.opacity = 0;
                sunIcon.style.transform = 'scale(0.5)';
                setTimeout(() => {
                    sunIcon.classList.add('d-none');
                    moonIcon.classList.remove('d-none');
                    moonIcon.style.opacity = 0;
                    moonIcon.style.transform = 'scale(0.5)';
                    
                    // Force reflow
                    void moonIcon.offsetWidth;
                    
                    // Animate in
                    moonIcon.style.opacity = 1;
                    moonIcon.style.transform = 'scale(1)';
                }, 150);
            } else {
                // Switch to sun icon
                moonIcon.style.opacity = 0;
                moonIcon.style.transform = 'scale(0.5)';
                setTimeout(() => {
                    moonIcon.classList.add('d-none');
                    sunIcon.classList.remove('d-none');
                    sunIcon.style.opacity = 0;
                    sunIcon.style.transform = 'scale(0.5)';
                    
                    // Force reflow
                    void sunIcon.offsetWidth;
                    
                    // Animate in
                    sunIcon.style.opacity = 1;
                    sunIcon.style.transform = 'scale(1)';
                }, 150);
            }
            
            // Set icon color
            sunIcon.style.color = themes.light.toggle.iconColor;
            moonIcon.style.color = themes.dark.toggle.iconColor;
        }
    }
    
    /**
     * Handle window resize events
     */
    function handleResize() {
        console.log('ThemeManager: Window resized, refreshing theme');
        applyTheme(currentTheme, false);
    }
    
    /**
     * Fade elements in/out with smooth animation
     */
    function fadeElements(elements, show) {
        elements.forEach(el => {
            if (show) {
                el.style.opacity = '0';
                el.classList.remove('d-none');
                
                // Force reflow to ensure transition works
                void el.offsetWidth;
                
                el.style.transition = 'opacity 0.3s ease';
                el.style.opacity = '1';
            } else {
                el.style.transition = 'opacity 0.3s ease';
                el.style.opacity = '0';
                
                setTimeout(() => {
                    el.classList.add('d-none');
                }, 300);
            }
        });
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

    function updateElementsForTheme(theme) {
        // Add coaching-specific updates
        if (document.querySelector('.coaching-nav')) {
            updateCoachingElements(theme);
        }
    }

    function updateCoachingElements(theme) {
        const isNight = theme === 'night-theme';
        
        // Update service cards
        document.querySelectorAll('.service-card').forEach(card => {
            if (isNight) {
                card.style.backgroundColor = '#2c2f33';
                card.style.color = '#f8f9fa';
            } else {
                card.style.backgroundColor = '#ffffff';
                card.style.color = '#333333';
            }
        });
        
        // Update service text
        document.querySelectorAll('.service-text').forEach(text => {
            if (isNight) {
                text.style.color = '#e4e4e4';
            } else {
                text.style.color = '#333333';
            }
        });
        
        // Update section titles and subtitles
        document.querySelectorAll('.section-title').forEach(title => {
            if (isNight) {
                title.style.color = '#f8f9fa';
            } else {
                title.style.color = '#343a40';
            }
        });
        
        document.querySelectorAll('.section-subtitle').forEach(subtitle => {
            if (isNight) {
                subtitle.style.color = '#adb5bd';
            } else {
                subtitle.style.color = '#6c757d';
            }
        });
        
        // Update coaching sections background
        document.querySelectorAll('.coaching-section').forEach(section => {
            const beforeElement = window.getComputedStyle(section, '::before');
            if (isNight) {
                section.style.setProperty('--coaching-bg-color', 'rgba(33, 37, 41, 0.7)');
            } else {
                section.style.setProperty('--coaching-bg-color', '#f8f9fa');
            }
        });
        
        // Update description box
        document.querySelectorAll('.description-box').forEach(box => {
            if (isNight) {
                box.style.backgroundColor = '#212529';
            } else {
                box.style.backgroundColor = '#343a40';
            }
        });
        
        // Update coaching nav items
        document.querySelectorAll('.coaching-nav-item').forEach(item => {
            if (isNight) {
                item.style.backgroundColor = '#212529';
            } else {
                item.style.backgroundColor = '#343a40';
            }
        });
    }

    /**
     * Public API
     */
    return {
        initialize,
        applyTheme,
        getCurrentTheme: () => currentTheme,
        getThemeData: (themeName) => themes[themeName] || themes.light
    };
})();

// Initialize the theme manager when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.initialize();
    
    // Reinitialize when footer is loaded to ensure footer elements get styled
    document.addEventListener('footerLoaded', function() {
        setTimeout(function() {
            const currentTheme = ThemeManager.getCurrentTheme();
            ThemeManager.applyTheme(currentTheme);
        }, 100);
    });
});
