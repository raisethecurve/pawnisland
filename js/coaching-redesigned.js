/**
 * Pawn Island Coaching Experience
 * Advanced interactive coaching page with dynamic features
 * v3.0 - Professional Edition
 */

document.addEventListener('DOMContentLoaded', function() {
    // Performance monitoring
    performance.mark('coaching-init-start');
    
    // Initialize core features
    initServiceNavigation();
    enhanceSectionVisibility();
    initTestimonialSlider();
    initCoachingMetrics();
    initGalleryLightbox();
    enhanceFormInteractions();
    
    // Initialize advanced features when the page is idle
    requestIdleCallback(() => {
        enhanceScrollEffects();
        initLiveAvailability();
    });
    
    // Render visible sections immediately
    revealVisibleSections();
    
    // Track performance
    performance.mark('coaching-init-end');
    performance.measure('coaching-initialization', 'coaching-init-start', 'coaching-init-end');
    const perfEntry = performance.getEntriesByName('coaching-initialization')[0];
    console.log(`Coaching page initialized in ${Math.round(perfEntry.duration)}ms`);
});

/**
 * Initialize navigation with enhanced performance
 */
function initServiceNavigation() {
    const navItems = document.querySelectorAll('.service-nav-item');
    const sections = document.querySelectorAll('.detailed-section');
    const navMap = new Map();
    
    // Build a map for faster lookups
    sections.forEach(section => {
        navMap.set('#' + section.id, section);
    });
    
    // Throttled scroll handler for better performance
    let lastScrollTime = 0;
    window.addEventListener('scroll', function() {
        if (Date.now() - lastScrollTime < 50) return; // Throttle to 50ms
        lastScrollTime = Date.now();
        
        let currentSectionId = null;
        let closestDistance = Infinity;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top - 150);
            
            // Find section closest to viewport top
            if (distance < closestDistance) {
                closestDistance = distance;
                currentSectionId = section.id;
            }
        });
        
        // Update active nav item
        if (currentSectionId) {
            navItems.forEach(item => {
                item.classList.toggle('active', item.getAttribute('href') === `#${currentSectionId}`);
            });
        }
    }, { passive: true });
    
    // Click handler with optimized scrolling
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = navMap.get(targetId);
            
            if (targetSection) {
                // Mark as active immediately for better UX
                navItems.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const offset = 80;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize first nav item as active
    if (navItems.length > 0) {
        navItems[0].classList.add('active');
    }
}

/**
 * Enhance animations with Intersection Observer
 */
function enhanceSectionVisibility() {
    // Use a single IntersectionObserver instance for better performance
    const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                
                // Calculate delay based on position in parent
                const parent = item.parentElement;
                const index = Array.from(parent.children).indexOf(item);
                const delay = index * 100;
                
                // Set transition delay and add revealed class
                item.style.transitionDelay = `${delay}ms`;
                item.classList.add('revealed');
                
                // Stop observing once revealed
                featureObserver.unobserve(item);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px' // Trigger slightly before element is fully visible
    });
    
    // Observe all feature items
    document.querySelectorAll('.feature-item').forEach(item => {
        featureObserver.observe(item);
    });
    
    // Optimized parallax effect
    const parallaxItems = document.querySelectorAll('.section-image img');
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                parallaxItems.forEach(img => {
                    const parent = img.parentElement;
                    const rect = parent.getBoundingClientRect();
                    
                    // Only process visible images
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const scrollPosition = window.pageYOffset;
                        const speed = 0.1;
                        const yPos = -(scrollPosition - rect.top - scrollPosition) * speed;
                        img.style.transform = `translateY(${yPos}px)`;
                    }
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // Add hover effects with optimized handlers
    document.querySelectorAll('.coaching-card').forEach(card => {
        const img = card.querySelector('.card-image-wrapper img');
        if (!img) return;
        
        card.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.08)';
        });
        
        card.addEventListener('mouseleave', () => {
            img.style.transform = '';
        });
    });
}

/**
 * Immediately reveal sections that are already visible on page load
 */
function revealVisibleSections() {
    document.querySelectorAll('.detailed-section').forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            const features = section.querySelectorAll('.feature-item');
            features.forEach((feature, i) => {
                setTimeout(() => {
                    feature.classList.add('revealed');
                }, i * 100);
            });
        }
    });
}

/**
 * Initialize interactive testimonial slider
 */
function initTestimonialSlider() {
    const slider = document.querySelector('.testimonials');
    if (!slider) return;
    
    const testimonials = slider.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.slider-dot');
    const totalSlides = testimonials.length;
    let currentSlide = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let autoplayInterval;
    
    // Set up slider
    function showSlide(index) {
        if (index >= totalSlides) index = 0;
        if (index < 0) index = totalSlides - 1;
        
        slider.style.transform = `translateX(-${index * 100}%)`;
        currentSlide = index;
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
    
    // Set up dot navigation
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            showSlide(i);
            resetAutoplay();
        });
    });
    
    // Touch controls for mobile
    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        pauseAutoplay();
    }, { passive: true });
    
    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        resetAutoplay();
    }, { passive: true });
    
    function handleSwipe() {
        const diffX = touchStartX - touchEndX;
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left
                showSlide(currentSlide + 1);
            } else {
                // Swipe right
                showSlide(currentSlide - 1);
            }
        }
    }
    
    // Autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }
    
    function pauseAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    function resetAutoplay() {
        pauseAutoplay();
        startAutoplay();
    }
    
    // Initialize slider
    showSlide(0);
    startAutoplay();
    
    // Pause autoplay when the slider is hovered
    const testimonialContainer = document.querySelector('.testimonial-slider');
    if (testimonialContainer) {
        testimonialContainer.addEventListener('mouseenter', pauseAutoplay);
        testimonialContainer.addEventListener('mouseleave', startAutoplay);
    }
}

/**
 * Animated metrics counter
 */
function initCoachingMetrics() {
    const metrics = document.querySelectorAll('.metric-value');
    if (!metrics.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const metric = entry.target;
                const targetValue = parseInt(metric.getAttribute('data-value'), 10);
                const duration = 2000; // Animation duration in milliseconds
                const startTime = performance.now();
                const startValue = 0;
                
                // Animate counter
                function updateCounter(timestamp) {
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Use easing function for smoother animation
                    const easeOutQuad = progress * (2 - progress);
                    const currentValue = Math.floor(startValue + easeOutQuad * (targetValue - startValue));
                    
                    metric.textContent = currentValue;
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        metric.textContent = targetValue;
                    }
                }
                
                requestAnimationFrame(updateCounter);
                observer.unobserve(metric);
            }
        });
    }, { threshold: 0.5 });
    
    metrics.forEach(metric => {
        observer.observe(metric);
    });
}

/**
 * Gallery lightbox functionality
 */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;
    
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <img src="" alt="Fullsize image" class="lightbox-image">
            <div class="lightbox-caption"></div>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    
    // Add click handlers to gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').getAttribute('src');
            const caption = this.querySelector('.gallery-caption').textContent;
            
            lightboxImg.setAttribute('src', imgSrc);
            lightboxCaption.textContent = caption;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close lightbox functionality
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Enhanced scroll effects
 */
function enhanceScrollEffects() {
    // Progress indicator for sections
    const sections = document.querySelectorAll('.detailed-section');
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'section-progress';
    document.body.appendChild(progressIndicator);
    
    function updateProgress() {
        // Find the section currently in view
        let currentSection = null;
        let maxVisibility = 0;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const visibleHeight = Math.min(rect.bottom, viewportHeight) - 
                                 Math.max(rect.top, 0);
            const visibility = visibleHeight / viewportHeight;
            
            if (visibility > maxVisibility) {
                maxVisibility = visibility;
                currentSection = section;
            }
        });
        
        // Update progress indicator
        if (currentSection) {
            const sectionId = currentSection.id;
            const navItem = document.querySelector(`.service-nav-item[href="#${sectionId}"]`);
            const progress = Math.min(maxVisibility * 1.5, 1);
            
            if (navItem) {
                progressIndicator.style.width = `${progress * 100}%`;
                progressIndicator.style.backgroundColor = getComputedStyle(navItem).backgroundColor;
            }
        }
    }
    
    // Use requestAnimationFrame for smooth updates
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateProgress();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // Initial update
    updateProgress();
}

/**
 * Enhanced form interactions with validation
 */
function enhanceFormInteractions() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const formInputs = contactForm.querySelectorAll('input, textarea');
    
    // Add floating label effect
    formInputs.forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.className = 'floating-input-wrapper';
        
        // Get the label associated with this input
        const label = contactForm.querySelector(`label[for="${input.id}"]`);
        if (!label) return;
        
        // Replace standard input with floating label
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        
        // Handle input state changes
        input.addEventListener('focus', () => {
            wrapper.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            wrapper.classList.toggle('has-content', input.value.trim() !== '');
            wrapper.classList.remove('focused');
        });
        
        // Check initial state
        if (input.value.trim() !== '') {
            wrapper.classList.add('has-content');
        }
    });
    
    // Real-time validation feedback
    contactForm.addEventListener('input', validateFormField);
    contactForm.addEventListener('submit', handleFormSubmit);
    
    function validateFormField(e) {
        const input = e.target;
        if (!input.checkValidity()) {
            input.closest('.floating-input-wrapper').classList.add('invalid');
        } else {
            input.closest('.floating-input-wrapper').classList.remove('invalid');
        }
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Check if form is valid
        const isValid = contactForm.checkValidity();
        if (!isValid) {
            formInputs.forEach(input => {
                if (!input.checkValidity()) {
                    input.closest('.floating-input-wrapper').classList.add('invalid');
                }
            });
            return;
        }
        
        // Form is valid, show success message
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            contactForm.innerHTML = `
                <div class="form-success">
                    <div class="success-icon">✓</div>
                    <h3>Message Sent Successfully!</h3>
                    <p>Thank you for reaching out. We'll get back to you shortly.</p>
                </div>
            `;
        }, 1500);
    }
}

/**
 * Show live coaching availability status
 */
function initLiveAvailability() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    if (!ctaButtons.length) return;
    
    // Get live availability status (simulated)
    // In production, this would be an API call to check actual availability
    fetch('https://api.pawnislandacademy.com/availability', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Add authentication headers as needed
        }
    })
    .then(response => {
        // Use mock data for demo
        return {
            status: 'available',
            nextAvailable: '2023-05-20',
            slotsRemaining: 3
        };
    })
    .then(data => {
        ctaButtons.forEach(button => {
            const statusIndicator = document.createElement('span');
            statusIndicator.className = 'availability-indicator';
            
            if (data.status === 'available') {
                statusIndicator.classList.add('available');
                statusIndicator.innerHTML = `<span class="pulse"></span> ${data.slotsRemaining} slots available`;
            } else {
                statusIndicator.classList.add('booked');
                statusIndicator.textContent = `Next available: ${formatDate(data.nextAvailable)}`;
            }
            
            // Insert before the button
            button.parentNode.insertBefore(statusIndicator, button);
        });
    })
    .catch(error => {
        console.error('Error fetching availability:', error);
    });
    
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

/**
 * Polyfill for requestIdleCallback for older browsers
 */
window.requestIdleCallback = window.requestIdleCallback || function(cb) {
    return setTimeout(function() {
        const start = Date.now();
        cb({
            didTimeout: false,
            timeRemaining: function() {
                return Math.max(0, 50 - (Date.now() - start));
            }
        });
    }, 1);
};
