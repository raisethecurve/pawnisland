/**
 * Modern Testimonial Carousel with Squircle Images
 * Loads testimonials from JSON and displays them with modern styling
 */
document.addEventListener('DOMContentLoaded', function() {
    const testimonialContainer = document.getElementById('testimonialContainer');
    const testimonialLoading = document.getElementById('testimonialLoading');
    const testimonialIndicators = document.getElementById('testimonialIndicators');
    
    // Exit if no container found
    if (!testimonialContainer) return;
    
    // Fetch testimonials from JSON file
    fetch('../../data/testimonials.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load testimonials: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayTestimonials(data.testimonials);
            // Hide loading spinner
            if (testimonialLoading) {
                testimonialLoading.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error loading testimonials:', error);
            // Show error message in container
            testimonialContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Unable to load testimonials. Please try again later.
                </div>
            `;
            // Hide loading spinner
            if (testimonialLoading) {
                testimonialLoading.style.display = 'none';
            }
        });

    /**
     * Display testimonials in carousel
     * @param {Array} testimonials - Array of testimonial objects
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

        // Filter out testimonials that have proper quote field and limit to 5
        const validTestimonials = testimonials
            .filter(t => t.quote || t.text) // Use either quote or text field
            .slice(0, 5); // Limit to first 5 testimonials

        // Create carousel indicators
        let indicatorsHTML = '';
        validTestimonials.forEach((_, index) => {
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
        validTestimonials.forEach((testimonial, index) => {
            // Handle both quote and text fields for compatibility
            const testimonialText = testimonial.quote || testimonial.text;
            // Clean up any HTML tags in the text
            const cleanText = testimonialText.replace(/<br\s*\/?>/gi, ' ').replace(/<\/?[^>]+(>|$)/g, '');
            
            // Ensure image path is valid
            let imagePath = '';
            if (testimonial.image && testimonial.image.trim() !== '') {
                // If path doesn't already start with "../../" prefix, add it
                imagePath = testimonial.image.startsWith('../../') ? 
                    testimonial.image : 
                    '../../images/testimonials/' + testimonial.image.split('/').pop();
            }
            
            const hasImage = imagePath !== '';
            const name = testimonial.name || 'Anonymous';
            const title = testimonial.title || testimonial.designation || '';
            
            itemsHTML += `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <div class="testimonial-modern-card ${!hasImage ? 'no-image' : ''}">
                        ${hasImage ? `
                            <div class="testimonial-image-section">
                                <div class="squircle-container">
                                    <img src="${imagePath}" alt="${name}" class="squircle-image">
                                </div>
                            </div>
                        ` : ''}
                        <div class="testimonial-content-section ${!hasImage ? 'full-width' : ''}">
                            <div class="quote-marks">"</div>
                            <p class="testimonial-text">${cleanText}</p>
                            <div class="testimonial-author-info">
                                <div class="author-name">${name}</div>
                                ${title ? `<div class="author-title">${title}</div>` : ''}
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
});
