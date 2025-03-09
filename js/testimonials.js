/**
 * Testimonials Manager for Pawn Island
 * Loads testimonials from JSON file and renders them in the testimonial carousel
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page with the testimonial carousel
    const testimonialContainer = document.getElementById('testimonialContainer');
    const testimonialIndicators = document.getElementById('testimonialIndicators');
    
    if (testimonialContainer && testimonialIndicators) {
        loadTestimonials();
    }
});

/**
 * Fetches testimonials from the JSON file and populates the carousel
 */
function loadTestimonials() {
    fetch('../../data/testimonials.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderTestimonials(data.testimonials);
        })
        .catch(error => {
            console.error('Error loading testimonials:', error);
            document.getElementById('testimonialContainer').innerHTML = 
                `<div class="carousel-item active">
                    <div class="testimonial-card">
                        <div class="testimonial-content">
                            <p>Unable to load testimonials. Please try again later.</p>
                        </div>
                    </div>
                </div>`;
        });
}

/**
 * Renders testimonials in the carousel
 * @param {Array} testimonials - Array of testimonial objects
 */
function renderTestimonials(testimonials) {
    // Hide loading indicator
    const loadingIndicator = document.getElementById('testimonialLoading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Get container elements
    const testimonialContainer = document.getElementById('testimonialContainer');
    const testimonialIndicators = document.getElementById('testimonialIndicators');
    
    // Clear any existing content
    testimonialContainer.innerHTML = '';
    testimonialIndicators.innerHTML = '';
    
    // Process and render each testimonial
    testimonials.forEach((testimonial, index) => {
        // Create carousel item
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        
        // Default image if none provided
        const imageSrc = testimonial.image || '../../images/avatars/placeholder.svg';
        
        // Create testimonial card content with new modern design
        carouselItem.innerHTML = `
            <div class="modern-testimonial">
                <div class="testimonial-image-container">
                    <div class="testimonial-image" style="background-image: url('${imageSrc}')"></div>
                </div>
                <div class="testimonial-content-wrapper">
                    <div class="testimonial-quote-icon">
                        <i class="fas fa-quote-right"></i>
                    </div>
                    <div class="testimonial-text-content">
                        <p class="testimonial-message">${testimonial.text}</p>
                        <div class="testimonial-client-info">
                            <h4 class="client-name">${testimonial.name}</h4>
                            <p class="client-designation">${testimonial.designation}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to carousel
        testimonialContainer.appendChild(carouselItem);
        
        // Create indicator
        const indicator = document.createElement('li');
        indicator.dataset.target = '#testimonialCarousel';
        indicator.dataset.slideTo = index;
        if (index === 0) {
            indicator.className = 'active';
        }
        testimonialIndicators.appendChild(indicator);
    });
}
