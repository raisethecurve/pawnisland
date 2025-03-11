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
 * Loads testimonials from JSON and populates the carousel
 * First tries coaching-specific testimonials, then falls back to general testimonials
 */
function loadTestimonials() {
    const testimonialContainer = document.getElementById('testimonialContainer');
    const testimonialIndicators = document.getElementById('testimonialIndicators');
    const loadingElement = document.getElementById('testimonialLoading');
    
    if (!testimonialContainer || !testimonialIndicators) return;
    
    // First try to load coaching-specific testimonials
    fetch('../../data/coaching-testimonials.json')
        .then(response => {
            if (!response.ok) {
                // If coaching testimonials don't exist, fall back to general testimonials
                throw new Error('Coaching testimonials not found, trying general testimonials');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.testimonials && data.testimonials.length > 0) {
                processTestimonials(data.testimonials);
            } else {
                throw new Error('No coaching testimonials available');
            }
        })
        .catch(error => {
            console.log('Falling back to general testimonials: ', error);
            
            // Fall back to general testimonials
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
                    console.error('Error loading testimonials:', error);
                    showLoadingError('Failed to load testimonials. Please try again later.');
                });
        });

    /**
     * Process testimonials data and display in carousel
     */
    function processTestimonials(testimonials) {
        // Hide loading spinner
        if (loadingElement) loadingElement.style.display = 'none';
        
        // Create carousel items
        testimonials.forEach((testimonial, index) => {
            createTestimonialItem(testimonial, index, testimonialContainer, testimonialIndicators);
        });
        
        // Activate first testimonial
        const firstItem = testimonialContainer.querySelector('.carousel-item');
        if (firstItem) firstItem.classList.add('active');
        
        const firstIndicator = testimonialIndicators.querySelector('li');
        if (firstIndicator) firstIndicator.classList.add('active');
        
        // Initialize carousel with custom settings
        $(document).ready(function(){
            $('#testimonialCarousel').carousel({
                interval: 8000, // 8 seconds per slide
                pause: 'hover',
                wrap: true,
                keyboard: true
            });
        });
    }
}

/**
 * Creates a testimonial item for the carousel
 */
function createTestimonialItem(testimonial, index, container, indicators) {
    // Create carousel item
    const item = document.createElement('div');
    item.className = 'carousel-item';
    
    // Handle different JSON formats (accommodate both formats)
    const testimonialText = testimonial.text || testimonial.quote || '';
    const testimonialDesignation = testimonial.designation || testimonial.title || '';
    
    // Create testimonial card
    const hasImage = testimonial.image && testimonial.image.trim() !== '';
    const cardClass = hasImage ? 'testimonial-modern-card' : 'testimonial-modern-card no-image';
    
    let testimonialHTML = `
        <div class="${cardClass}">
    `;
    
    // Add image section if available
    if (hasImage) {
        testimonialHTML += `
            <div class="testimonial-image-section">
                <div class="squircle-container">
                    <img src="${testimonial.image}" class="squircle-image" alt="${testimonial.name}" loading="lazy">
                </div>
            </div>
        `;
    }
    
    // Add content section
    const contentClass = hasImage ? 'testimonial-content-section' : 'testimonial-content-section full-width';
    testimonialHTML += `
        <div class="${contentClass}">
            <span class="quote-marks">"</span>
            <div class="testimonial-text">
                ${testimonialText}
            </div>
            <div class="testimonial-author-info">
                <div class="author-name">${testimonial.name}</div>
                ${testimonialDesignation ? `<div class="author-title">${testimonialDesignation}</div>` : ''}
            </div>
        </div>
    </div>
    `;
    
    item.innerHTML = testimonialHTML;
    container.appendChild(item);
    
    // Create indicator
    const indicator = document.createElement('li');
    indicator.setAttribute('data-target', '#testimonialCarousel');
    indicator.setAttribute('data-slide-to', index.toString());
    indicators.appendChild(indicator);
}

/**
 * Show error message when testimonials fail to load
 */
function showLoadingError(message) {
    const loadingElement = document.getElementById('testimonialLoading');
    if (loadingElement) {
        loadingElement.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                ${message}
            </div>
        `;
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
