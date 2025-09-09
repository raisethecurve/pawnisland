// Community Carousel Gallery JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadCommunityGalleries();
});

async function loadCommunityGalleries() {
    try {
        const response = await fetch('../../data/community-galleries.json');
        const data = await response.json();
        
        // Create Frank DelBonis gallery
        const frankContainer = document.querySelector('[data-gallery="frank-gallery"]');
        if (frankContainer) {
            createCarouselFromData(frankContainer, data.frank_delbonis, 'frank-carousel');
        }
        
        // Create Alex Lumelsky gallery
        const alexContainer = document.querySelector('[data-gallery="alex-gallery"]');
        if (alexContainer) {
            createCarouselFromData(alexContainer, data.alex_lumelsky, 'alex-carousel');
        }
        
        // Initialize all carousels after data is loaded
        initializeCarousels();
        
    } catch (error) {
        console.error('Error loading community gallery data:', error);
        // Fallback to existing HTML structure
        initializeCarousels();
    }
}

function createCarouselFromData(container, photos, trackId) {
    const track = container.querySelector('.carousel-track');
    track.id = trackId;
    track.innerHTML = ''; // Clear existing content
    
    // Create slides from JSON data
    photos.forEach(photo => {
        if (photo.isLogo) return; // Skip logo entries in carousel
        
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.setAttribute('data-image', photo.image);
        slide.setAttribute('data-caption', photo.description);
        
        slide.innerHTML = `
            <img src="${photo.image}" alt="${photo.alt}" loading="lazy">
            <div class="carousel-caption">${photo.caption}</div>
        `;
        
        track.appendChild(slide);
    });
}

function initializeCarousels() {
    // Initialize all carousels
    const carousels = document.querySelectorAll('.carousel-container');
    carousels.forEach(container => {
        new CarouselGallery(container);
    });
    
    // Add entrance animations
    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };
    
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe galleries for entrance animation
    document.querySelectorAll('.photo-gallery').forEach(gallery => {
        gallery.style.opacity = '0';
        gallery.style.transform = 'translateY(30px)';
        gallery.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        galleryObserver.observe(gallery);
    });
}

class CarouselGallery {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('.carousel-track');
        this.slides = Array.from(container.querySelectorAll('.carousel-slide'));
        this.prevBtn = container.querySelector('.carousel-prev');
        this.nextBtn = container.querySelector('.carousel-next');
        this.indicatorsContainer = container.querySelector('.carousel-indicators');
        this.fullscreenBtn = container.querySelector('.fullscreen-toggle');
        
        this.currentIndex = 0;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        this.createIndicators();
        this.bindEvents();
        this.updateCarousel();
        this.autoAdvance();
    }
    
    createIndicators() {
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator';
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
        });
    }
    
    bindEvents() {
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prevSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextSlide();
        });
        
        this.fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openFullscreen();
        });
        
        // Touch/swipe support
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;
            const diffX = startX - currentX;
            
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            isDragging = false;
        });
        
        // Pause auto-advance on hover
        this.container.addEventListener('mouseenter', () => this.resetAutoAdvance());
        this.container.addEventListener('mouseleave', () => this.autoAdvance());
    }
    
    updateCarousel() {
        const slideWidth = this.slides[0].offsetWidth;
        const offset = -this.currentIndex * slideWidth;
        this.track.style.transform = `translateX(${offset}px)`;
        
        // Update indicators
        const indicators = this.container.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        
        this.currentIndex = index;
        this.updateCarousel();
        this.resetAutoAdvance();
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateCarousel();
        this.resetAutoAdvance();
    }
    
    prevSlide() {
        if (this.isTransitioning) return;
        
        this.currentIndex = this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1;
        this.updateCarousel();
        this.resetAutoAdvance();
    }
    
    autoAdvance() {
        this.autoAdvanceInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Auto-advance every 5 seconds
    }
    
    resetAutoAdvance() {
        clearInterval(this.autoAdvanceInterval);
        this.autoAdvance();
    }
    
    openFullscreen() {
        this.createFullscreenModal();
    }
    
    createFullscreenModal() {
        // Create modal structure
        const modal = document.createElement('div');
        modal.className = 'fullscreen-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'fullscreen-content';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullscreen-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close fullscreen gallery');
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'fullscreen-image-container';
        
        const image = document.createElement('img');
        image.className = 'fullscreen-image';
        
        const caption = document.createElement('div');
        caption.className = 'fullscreen-caption';
        
        const controls = document.createElement('div');
        controls.className = 'fullscreen-controls';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'fullscreen-prev';
        prevBtn.innerHTML = '&#8249;';
        prevBtn.setAttribute('aria-label', 'Previous image');
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'fullscreen-next';
        nextBtn.innerHTML = '&#8250;';
        nextBtn.setAttribute('aria-label', 'Next image');
        
        const indicators = document.createElement('div');
        indicators.className = 'fullscreen-indicators';
        
        // Build structure
        imageContainer.appendChild(image);
        controls.appendChild(prevBtn);
        controls.appendChild(nextBtn);
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(imageContainer);
        modalContent.appendChild(caption);
        modalContent.appendChild(controls);
        modalContent.appendChild(indicators);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Create indicators
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'fullscreen-indicator';
            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateFullscreen();
            });
            indicators.appendChild(indicator);
        });
        
        let currentIndex = this.currentIndex;
        
        function updateFullscreen() {
            const currentSlide = this.slides[currentIndex];
            const imageSrc = currentSlide.getAttribute('data-image');
            const imageCaption = currentSlide.getAttribute('data-caption');
            
            image.src = imageSrc;
            image.alt = currentSlide.querySelector('img').alt;
            caption.textContent = imageCaption;
            
            // Update indicators
            const allIndicators = indicators.querySelectorAll('.fullscreen-indicator');
            allIndicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % this.slides.length;
            updateFullscreen();
        }
        
        function prevSlide() {
            currentIndex = currentIndex === 0 ? this.slides.length - 1 : currentIndex - 1;
            updateFullscreen();
        }
        
        function closeModal() {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 400);
        }
        
        // Bind updateFullscreen to this context
        updateFullscreen = updateFullscreen.bind(this);
        nextSlide = nextSlide.bind(this);
        prevSlide = prevSlide.bind(this);
        
        // Event listeners
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        closeBtn.addEventListener('click', closeModal);
        
        indicators.querySelectorAll('.fullscreen-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateFullscreen();
            });
        });
        
        // Keyboard navigation
        const keyHandler = (e) => {
            switch(e.key) {
                case 'Escape':
                    closeModal();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSlide();
                    break;
            }
        };
        
        document.addEventListener('keydown', keyHandler);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Initialize and show
        updateFullscreen();
        document.body.style.overflow = 'hidden';
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Cleanup function
        modal.cleanup = () => {
            document.removeEventListener('keydown', keyHandler);
        };
    }
}
