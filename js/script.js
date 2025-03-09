document.addEventListener('DOMContentLoaded', function() {
    // Apply day theme by default
    document.body.classList.remove('night-theme');
    document.body.classList.add('day-theme');
    
    // Set appropriate background and text colors
    updateThemeColors();
    
    // Toggle logo visibility
    updateLogoVisibility();
});

function updateThemeColors() {
    document.body.classList.add('bg-light', 'text-dark');
    document.body.classList.remove('bg-dark', 'text-white');
    
    // Update navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.add('navbar-light', 'bg-light');
        navbar.classList.remove('navbar-dark', 'bg-dark');
    }
}

function updateLogoVisibility() {
    // Use day logos only
    const dayLogos = document.querySelectorAll('.day-logo');
    const nightLogos = document.querySelectorAll('.night-logo');
    
    dayLogos.forEach(logo => {
        logo.classList.remove('d-none');
    });
    
    nightLogos.forEach(logo => {
        logo.classList.add('d-none');
    });
    
    // Update nav links text colors
    updateNavLinks();
}

function updateNavLinks() {
    // Update navbar text colors
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.add('text-dark');
        link.classList.remove('text-white');
    });
    
    // Update header text
    const headerTexts = document.querySelectorAll('.header .title, .header .subtitle');
    headerTexts.forEach(text => {
        text.classList.add('text-dark');
        text.classList.remove('text-white');
    });
}
