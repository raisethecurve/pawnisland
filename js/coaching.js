/**
 * Combined Coaching Page JavaScript
 * Handles testimonials display and all coaching page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load testimonials
    loadTestimonials();

    // Initialize all coaching page functionality
    initCoachingFeatures();

    // Initialize metric animations
    initMetricAnimations();

    // Initialize approach card effects
    initApproachCard();
});

/**
 * Loads testimonials from JSON and populates the testimonial grid
 */
function loadTestimonials() {
    const testimonialContainer = document.getElementById('testimonialContainer');
    const loadingElement = document.getElementById('testimonialLoading');

    if (!testimonialContainer) return;

    fetch('../../data/testimonials.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch testimonials: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.testimonials && data.testimonials.length > 0) {
                processTestimonials(data.testimonials);
            } else {
                showLoadingError('No testimonials available');
            }
        })
        .catch(error => {
            showLoadingError('Failed to load testimonials. Please try again later.');
        });

    /**
     * Process testimonials data and display in the testimonial grid
     */
    function processTestimonials(testimonials) {
        if (loadingElement) loadingElement.style.display = 'none';
        testimonialContainer.textContent = '';

        testimonials.slice(0, 6).forEach((testimonial) => {
            createTestimonialItem(testimonial, testimonialContainer);
        });
    }
}

/**
 * Creates a testimonial card for the testimonials grid
 */
function createTestimonialItem(testimonial, container) {
    const testimonialText = testimonial.text || testimonial.quote || '';
    const testimonialDesignation = testimonial.designation || testimonial.title || '';
    const hasImage = testimonial.image && testimonial.image.trim() !== '';
    const card = document.createElement('article');
    card.className = hasImage ? 'testimonial-card with-image' : 'testimonial-card';

    if (hasImage) {
        const image = document.createElement('img');
        image.src = testimonial.image;
        image.alt = testimonial.name || 'Chess coaching student';
        card.appendChild(image);
    }

    const content = document.createElement('div');
    const quote = document.createElement('blockquote');
    quote.textContent = testimonialText
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/?p>/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const author = document.createElement('cite');
    author.textContent = testimonial.name || 'Student';
    content.appendChild(quote);
    content.appendChild(author);

    if (testimonialDesignation) {
        const designation = document.createElement('span');
        designation.textContent = testimonialDesignation;
        content.appendChild(designation);
    }

    card.appendChild(content);
    container.appendChild(card);
}

/**
 * Show error message when testimonials fail to load
 */
function showLoadingError(message) {
    const loadingElement = document.getElementById('testimonialLoading');
    if (loadingElement) {
        loadingElement.textContent = message;
        loadingElement.setAttribute('role', 'alert');
    }
}

/**
 * Initialize additional coaching page features
 */
function initCoachingFeatures() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation observers for approach list items
    const approachItems = document.querySelectorAll('.approach-list li');
    if (approachItems.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateX(-20px)';

                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                    }, 100);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        approachItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                observer.observe(item);
            }, index * 50);
        });
    }
}

/**
 * Initialize metric number animations with performance optimizations
 */
function initMetricAnimations() {
    const metrics = document.querySelectorAll('.metric-value');
    if (!metrics.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const value = target.getAttribute('data-value');
                const numValue = parseInt(value);

                if (!isNaN(numValue)) {
                    animateNumber(target, 0, numValue, 2000);
                }

                observer.unobserve(target);
            }
        });
    }, {threshold: 0.5});

    metrics.forEach(metric => {
        observer.observe(metric);
    });

    function animateNumber(element, start, end, duration) {
        // Use faster requestAnimationFrame for smooth animation
        const startTime = performance.now();
        const hasPlus = element.getAttribute('data-value').includes('+');

        const updateNumber = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);

            element.textContent = currentValue + (hasPlus ? '+' : '');

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }
}

/**
 * Initialize approach card interaction effects
 */
function initApproachCard() {
    const approachCard = document.querySelector('.approach-card');
    const approachList = document.querySelectorAll('.approach-list li');

    if (approachCard) {
        // Add subtle hover effect to approach list items
        approachList.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-pulse');
                    setTimeout(() => {
                        icon.classList.remove('fa-pulse');
                    }, 500);
                }
            });
        });
    }
}
