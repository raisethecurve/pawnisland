document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference or use default
    const savedTheme = localStorage.getItem('theme') || 'day-theme';
    
    // Apply the saved theme on initial load
    document.body.classList.remove('day-theme', 'night-theme');
    document.body.classList.add(savedTheme);
    
    // Set appropriate background and text colors
    updateThemeColors(savedTheme);
    
    // Toggle logo visibility based on current theme
    updateLogoVisibility(savedTheme);
    
    // Set up theme toggle functionality on dedicated button
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            toggleTheme();
        });
    }
    
    // Keep the brand toggle functionality as a secondary option
    const brandToggle = document.getElementById('brand-toggle');
    if (brandToggle) {
        brandToggle.addEventListener('click', function(e) {
            // Only toggle theme if clicking on the logo itself
            if (e.target.tagName.toLowerCase() === 'img') {
                toggleTheme();
            }
        });
    }
});

function updateThemeColors(theme) {
    if (theme === 'day-theme') {
        document.body.classList.add('bg-light', 'text-dark');
        document.body.classList.remove('bg-dark', 'text-white');
        
        // Update navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.add('navbar-light', 'bg-light');
            navbar.classList.remove('navbar-dark', 'bg-dark');
        }
    } else {
        document.body.classList.add('bg-dark', 'text-white');
        document.body.classList.remove('bg-light', 'text-dark');
        
        // Update navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.add('navbar-dark', 'bg-dark');
            navbar.classList.remove('navbar-light', 'bg-light');
        }
    }
}

function updateLogoVisibility(theme) {
    // Toggle logo visibility based on theme
    const dayLogos = document.querySelectorAll('.day-logo');
    const nightLogos = document.querySelectorAll('.night-logo');
    
    dayLogos.forEach(logo => {
        if (theme === 'day-theme') {
            logo.classList.remove('d-none');
        } else {
            logo.classList.add('d-none');
        }
    });
    
    nightLogos.forEach(logo => {
        if (theme === 'night-theme') {
            logo.classList.remove('d-none');
        } else {
            logo.classList.add('d-none');
        }
    });
    
    // Update nav links text colors
    updateNavLinks(theme);
}

function updateNavLinks(theme) {
    // Update navbar text colors
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (theme === 'day-theme') {
            link.classList.add('text-dark');
            link.classList.remove('text-white');
        } else {
            link.classList.add('text-white');
            link.classList.remove('text-dark');
        }
    });
    
    // Update header text
    const headerTexts = document.querySelectorAll('.header .title, .header .subtitle');
    headerTexts.forEach(text => {
        if (theme === 'day-theme') {
            text.classList.add('text-dark');
            text.classList.remove('text-white');
        } else {
            text.classList.add('text-white');
            text.classList.remove('text-dark');
        }
    });
}

function toggleTheme() {
    const isCurrentlyDay = document.body.classList.contains('day-theme');
    const newTheme = isCurrentlyDay ? 'night-theme' : 'day-theme';
    
    // Toggle body classes
    document.body.classList.remove('day-theme', 'night-theme');
    document.body.classList.add(newTheme);
    
    // Update theme colors
    updateThemeColors(newTheme);
    
    // Update logos visibility
    updateLogoVisibility(newTheme);
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
    
    // Fire a custom event that other scripts can listen for
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
}
