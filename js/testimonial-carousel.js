/**
 * Modern Testimonial Carousel with Squircle Images
 * Loads testimonials from JSON and displays them with images on the right
 */
document.addEventListener('DOMContentLoaded', function() {
    const testimonialContainer = document.getElementById('testimonialContainer');
    const testimonialLoading = document.getElementById('testimonialLoading');
    const testimonialIndicators = document.getElementById('testimonialIndicators');
    
    // Fetch testimonials from JSON file
    fetch('../../data/testimonials.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load testimonials: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Extract testimonials array from the JSON structure
            // Handle both direct array and nested object formats
            const testimonials = Array.isArray(data) ? data : (data.testimonials || []);
            
            console.log('Testimonials loaded:', testimonials.length);
            
            // Hide loading spinner
            if (testimonialLoading) {
                testimonialLoading.style.display = 'none';
            }
            
            if (testimonials.length === 0) {
                throw new Error('No testimonials found in the data');
            }
            
            // Create testimonial slides
            testimonials.forEach((testimonial, index) => {
                // Skip testimonials without essential information
                if (!testimonial.name || !(testimonial.quote || testimonial.text)) {
                    console.warn(`Skipping testimonial #${index+1} - missing required data`);
                    return;
                }
                
                // Use quote field or fall back to text field
                const testimonialText = testimonial.quote || testimonial.text;
                
                // Create carousel item
                const testimonialItem = document.createElement('div');
                testimonialItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                
                // Check if testimonial has an image
                const hasImage = testimonial.image && testimonial.image.trim() !== '';
                
                // Create the base structure with content section
                let cardHTML = `
                    <div class="testimonial-modern-card${!hasImage ? ' no-image' : ''}">
                        <div class="testimonial-content-section${!hasImage ? ' full-width' : ''}">
                            <div class="quote-marks">"</div>
                            <p class="testimonial-text">${testimonialText}</p>
                            <div class="testimonial-author-info">
                                <strong class="author-name">${testimonial.name}</strong>
                                <span class="author-title">${testimonial.title || testimonial.designation || ''}</span>
                            </div>
                        </div>`;
                
                // Only add image section if an image exists
                if (hasImage) {
                    // Resolve image path
                    let imagePath = testimonial.image;
                    
                    // If path is already absolute or starts with http/https, use as is
                    if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                        imagePath = `../../${imagePath}`;
                    }
                    
                    cardHTML += `
                        <div class="testimonial-image-section">
                            <div class="squircle-container">
                                <img src="${imagePath}" alt="${testimonial.name}" class="squircle-image">
                            </div>
                        </div>`;
                }
                
                // Close the card div
                cardHTML += `</div>`;
                
                testimonialItem.innerHTML = cardHTML;
                
                // Add to container
                testimonialContainer.appendChild(testimonialItem);
                
                // Add indicator
                if (testimonialIndicators) {
                    const indicator = document.createElement('li');
                    indicator.setAttribute('data-target', '#testimonialCarousel');
                    indicator.setAttribute('data-slide-to', index);
                    if (index === 0) {
                        indicator.classList.add('active');
                    }
                    testimonialIndicators.appendChild(indicator);
                }
            });
            
            // Initialize Bootstrap carousel
            if (window.jQuery && $('.carousel').carousel) {
                $('#testimonialCarousel').carousel({
                    interval: 6000,
                    pause: 'hover'
                });
                console.log('Carousel initialized successfully');
            } else {
                console.warn('Bootstrap carousel not available');
            }
        })
        .catch(error => {
            console.error('Error loading testimonials:', error);
            if (testimonialContainer) {
                testimonialContainer.innerHTML = `
                    <div class="carousel-item active">
                        <div class="testimonial-modern-card">
                            <div class="testimonial-content-section">
                                <p class="text-center">Error loading testimonials. Please try again later.</p>
                                <p class="text-center text-muted small">${error.message}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            if (testimonialLoading) {
                testimonialLoading.style.display = 'none';
            }
        });
});
