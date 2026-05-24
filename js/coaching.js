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
     * Process testimonials data and display in a curated proof layout
     */
    function processTestimonials(testimonials) {
        if (loadingElement) loadingElement.style.display = 'none';
        testimonialContainer.textContent = '';

        const normalizedTestimonials = testimonials.map(normalizeTestimonial);
        const featuredTestimonial = normalizedTestimonials.find(testimonial => testimonial.featured) || normalizedTestimonials[0];
        const supportingTestimonials = normalizedTestimonials
            .filter(testimonial => testimonial !== featuredTestimonial)
            .sort((first, second) => first.displayOrder - second.displayOrder)
            .slice(0, 4);

        testimonialContainer.appendChild(createFeaturedTestimonial(featuredTestimonial));

        const supportingList = document.createElement('div');
        supportingList.className = 'supporting-testimonials';

        supportingTestimonials.forEach((testimonial) => {
            supportingList.appendChild(createTestimonialItem(testimonial));
        });

        testimonialContainer.appendChild(supportingList);
    }
}

/**
 * Normalizes testimonial fields for display.
 */
function normalizeTestimonial(testimonial) {
    const fullText = cleanTestimonialText(testimonial.text || testimonial.quote || '');
    return {
        ...testimonial,
        fullText,
        shortQuote: cleanTestimonialText(testimonial.shortQuote || fullText),
        designation: testimonial.designation || testimonial.title || '',
        audience: testimonial.audience || testimonial.designation || 'Student',
        result: testimonial.result || '',
        proof: testimonial.proof || '',
        displayOrder: testimonial.displayOrder || 99
    };
}

/**
 * Creates the featured testimonial story.
 */
function createFeaturedTestimonial(testimonial) {
    const article = document.createElement('article');
    article.className = 'testimonial-feature';

    const content = document.createElement('div');
    content.className = 'testimonial-feature-content';

    const label = document.createElement('div');
    label.className = 'testimonial-label';
    label.appendChild(createIcon('fa-chart-line'));
    label.appendChild(document.createTextNode(testimonial.result || 'Measured student progress'));

    const quote = document.createElement('blockquote');
    quote.textContent = testimonial.shortQuote;

    content.appendChild(label);
    content.appendChild(quote);
    article.appendChild(content);

    const proofList = document.createElement('div');
    proofList.className = 'testimonial-proof-list';
    proofList.appendChild(createProofPoint('Result', testimonial.result || 'Student growth'));
    proofList.appendChild(createProofPoint('Why it worked', testimonial.proof || 'Tailored lessons'));
    article.appendChild(proofList);

    const footer = document.createElement('footer');
    footer.className = 'testimonial-feature-footer';
    footer.appendChild(createAvatar(testimonial, true));
    footer.appendChild(createAuthorBlock(testimonial));
    article.appendChild(footer);

    return article;
}

/**
 * Creates a supporting testimonial card.
 */
function createTestimonialItem(testimonial) {
    const card = document.createElement('article');
    card.className = 'testimonial-card';

    const header = document.createElement('header');
    header.className = 'testimonial-card-header';
    header.appendChild(createAuthorBlock(testimonial));

    if (testimonial.result) {
        const outcome = document.createElement('strong');
        outcome.className = 'testimonial-outcome';
        outcome.textContent = testimonial.result;
        header.appendChild(outcome);
    }

    const quote = document.createElement('blockquote');
    quote.textContent = testimonial.shortQuote;

    card.appendChild(header);
    card.appendChild(quote);

    return card;
}

function cleanTestimonialText(text) {
    return text
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/?p>/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function createIcon(iconClass) {
    const icon = document.createElement('i');
    icon.className = `fas ${iconClass}`;
    icon.setAttribute('aria-hidden', 'true');
    return icon;
}

function createProofPoint(label, value) {
    const proof = document.createElement('div');
    proof.className = 'testimonial-proof';

    const proofLabel = document.createElement('span');
    proofLabel.textContent = label;

    const proofValue = document.createElement('strong');
    proofValue.textContent = value;

    proof.appendChild(proofLabel);
    proof.appendChild(proofValue);
    return proof;
}

function createAvatar(testimonial, showImage) {
    if (showImage && testimonial.image && testimonial.image.trim() !== '') {
        const image = document.createElement('img');
        image.src = testimonial.image;
        image.alt = testimonial.name || 'Chess coaching student';
        image.className = 'testimonial-avatar';
        return image;
    }

    const initials = document.createElement('div');
    initials.className = 'testimonial-avatar testimonial-initials';
    initials.setAttribute('aria-hidden', 'true');
    initials.textContent = getInitials(testimonial.name || 'Student');
    return initials;
}

function createAuthorBlock(testimonial) {
    const author = document.createElement('div');
    author.className = 'testimonial-author';

    const name = document.createElement('cite');
    name.textContent = testimonial.name || 'Student';

    const details = document.createElement('span');
    details.textContent = testimonial.audience || testimonial.designation || 'Student';

    author.appendChild(name);
    author.appendChild(details);
    return author;
}

function getInitials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('');
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
