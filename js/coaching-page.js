/**
 * Coaching Page Enhanced Functionality
 * Handles custom features for the chess coaching page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load coaching-specific testimonials
    loadCoachingTestimonials();
    
    // Handle approach card hover effects
    initApproachCard();
    
    // Initialize metric animations with improved performance
    initMetricAnimations();
    
    /**
     * Load coaching-specific testimonials from dedicated JSON file
     */
    function loadCoachingTestimonials() {
        const testimonialContainer = document.getElementById('testimonialContainer');
        const testimonialLoading = document.getElementById('testimonialLoading');
        const testimonialIndicators = document.getElementById('testimonialIndicators');
        
        if (!testimonialContainer) return;
        
        fetch('../../data/coaching-testimonials.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load testimonials: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayTestimonials(data.testimonials);
                if (testimonialLoading) {
                    testimonialLoading.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error loading coaching testimonials:', error);
                if (testimonialContainer) {
                    testimonialContainer.innerHTML = `
                        <div class="alert alert-warning" role="alert">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Unable to load testimonials. Please try again later.
                        </div>
                    `;
                }
                if (testimonialLoading) {
                    testimonialLoading.style.display = 'none';
                }
            });

        /**
         * Display testimonials in carousel
         */
        function displayTestimonials(testimonials) {
            if (!testimonials || testimonials.length === 0) {
                testimonialContainer.innerHTML = `
                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle mr-2"></i>
                        No testimonials available at this time.
                    </div>
                `;
                return;
            }

            // Create carousel indicators
            let indicatorsHTML = '';
            testimonials.forEach((_, index) => {
                indicatorsHTML += `
                    <li data-target="#testimonialCarousel" 
                        data-slide-to="${index}" 
                        class="${index === 0 ? 'active' : ''}"></li>
                `;
            });
            
            if (testimonialIndicators) {
                testimonialIndicators.innerHTML = indicatorsHTML;
            }

            // Create carousel items
            let itemsHTML = '';
            testimonials.forEach((testimonial, index) => {
                const hasImage = testimonial.image && testimonial.image.trim() !== '';
                
                itemsHTML += `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <div class="testimonial-modern-card ${!hasImage ? 'no-image' : ''}">
                            ${hasImage ? `
                                <div class="testimonial-image-section">
                                    <div class="squircle-container">
                                        <img src="${testimonial.image}" alt="${testimonial.name}" class="squircle-image">
                                    </div>
                                </div>
                            ` : ''}
                            <div class="testimonial-content-section ${!hasImage ? 'full-width' : ''}">
                                <div class="quote-marks">"</div>
                                <p class="testimonial-text">${testimonial.quote}</p>
                                <div class="testimonial-author-info">
                                    <div class="author-name">${testimonial.name}</div>
                                    <div class="author-title">${testimonial.title || ''}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            testimonialContainer.innerHTML = itemsHTML;
            
            // Initialize carousel with custom settings
            $(document).ready(function(){
                $('#testimonialCarousel').carousel({
                    interval: 6000,
                    pause: 'hover',
                    wrap: true,
                    keyboard: true
                });
            });
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
});
