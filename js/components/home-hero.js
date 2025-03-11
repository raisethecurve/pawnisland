/**
 * Home Hero Component
 * Creates the hero section for the home page
 * 
 * @param {string} containerId - The ID of the container element where the hero will be inserted
 * @param {Object} options - Optional configuration settings
 * @param {string} options.bgImage - Background image path (default: images/headers-pages/pawnisland-background.jpeg)
 * @param {string} options.title - Hero title text
 * @param {string} options.subtitle - Hero subtitle text
 * @param {string} options.buttonText - CTA button text
 * @param {string} options.buttonLink - CTA button link href
 */
function createHomeHero(containerId, options = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Hero container with ID "${containerId}" not found.`);
        return;
    }
    
    // Default options
    const defaults = {
        bgImage: 'images/headers-pages/pawnisland-background.jpeg',
        title: 'Welcome to Pawn Island Academy',
        subtitle: 'Where Chess Mastery Begins',
        buttonText: 'Discover More',
        buttonLink: '#destinations'
    };
    
    // Merge defaults with provided options
    const config = Object.assign({}, defaults, options);
    
    // Create hero HTML
    const heroHTML = `
        <header class="hero" style="background-image: url('${config.bgImage}');">
            <div class="hero-content" data-aos="fade-up">
                <h1 class="hero-title">${config.title}</h1>
                <p class="hero-subtitle">${config.subtitle}</p>
                <a href="${config.buttonLink}" class="btn btn-primary" data-aos="fade-up" data-aos-delay="500">${config.buttonText}</a>
            </div>
        </header>
    `;
    
    // Inject into container
    container.innerHTML = heroHTML;
}
