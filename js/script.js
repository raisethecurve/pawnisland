document.addEventListener('DOMContentLoaded', function() {
    initConversionTracking();

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

function trackSiteEvent(eventName, parameters) {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', eventName, {
        event_category: 'site_engagement',
        ...parameters
    });
}

function initConversionTracking() {
    document.addEventListener('click', function(event) {
        const link = event.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const label = link.textContent.trim().replace(/\s+/g, ' ');

        if (href.includes('schedule.html')) {
            trackSiteEvent('schedule_cta_click', {
                link_text: label,
                link_url: link.href
            });
        }

        if (href.startsWith('mailto:')) {
            trackSiteEvent('email_click', {
                link_text: label || 'Email',
                link_url: href
            });
        }
    });
}
