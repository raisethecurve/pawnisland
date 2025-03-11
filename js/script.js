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
    
    // Existing jump to top button functionality
    const jumpToTopBtn = document.getElementById('jumpToTopBtn');
    
    if (jumpToTopBtn) {
        window.onscroll = function() {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                jumpToTopBtn.style.display = "flex";
                jumpToTopBtn.classList.add('fade-in');
            } else {
                jumpToTopBtn.classList.remove('fade-in');
                setTimeout(() => {
                    if (document.body.scrollTop <= 100 && document.documentElement.scrollTop <= 100) {
                        jumpToTopBtn.style.display = "none";
                    }
                }, 300);
            }
        };
        
        jumpToTopBtn.onclick = function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };
    }
    
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
