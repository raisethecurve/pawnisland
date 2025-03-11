document.addEventListener('DOMContentLoaded', function() {
    // Handle the navbar background change on scroll with enhanced effect
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        // Add initial animation class
        navbar.classList.add('navbar-animation');
        
        // Initial check for scroll position
        checkScroll();
        
        // Add scroll listener
        window.addEventListener('scroll', checkScroll);
        
        function checkScroll() {
            if (window.scrollY > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }
    
    // Remove redundant jump to top button functionality - it's now in jump-to-top.js
    
    // Initialize parallax effect for specific elements
    initParallaxEffects();
});

// Initialize parallax effects for elements with .parallax-element class
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-parallax-speed') || 0.2);
                const offset = scrollPosition * speed;
                element.style.transform = `translateY(${offset}px)`;
            });
        });
    }
}
