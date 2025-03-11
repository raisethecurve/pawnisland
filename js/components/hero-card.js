/**
 * Stellar Hero Card Component
 * A premium, visually striking hero section with advanced animation effects
 * @version 2.0
 */
function createHeroCard(containerId, options) {
    // Default configuration
    const defaults = {
        // Content settings
        bgImage: 'https://via.placeholder.com/1920x1080',
        title: 'Hero Title',
        subtitle: 'Subtitle goes here',
        tagline: '', // Optional third line
        
        // Visual settings
        height: '90vh',
        minHeight: '500px',
        overlayColor: '0, 0, 0',
        overlayOpacity: 0.6,
        overlayGradient: true,
        textColor: '#ffffff',
        maxContentWidth: '1000px',
        
        // Animation settings
        animation: 'fade', // 'fade', 'slide', 'zoom', 'reveal'
        animationDuration: 1200,
        animationDelay: 300,
        animationStagger: 300,
        
        // Advanced visual effects
        parallax: true,
        parallaxIntensity: 0.15,
        backgroundScale: 1.1, // Subtle zoom effect for background
        stylizedOverlay: true, // Enable advanced overlay styling
        
        // Typography
        titleSize: '4.5rem',
        subtitleSize: '1.8rem',
        taglineSize: '1.3rem',
        titleWeight: 700,
        subtitleWeight: 400,
        letterSpacing: '1px',
        
        // Visual elements
        showSeparator: true,
        separatorColor: '#dd3649',
        separatorGlow: true,
        separatorAnimation: true,
        
        // Button options
        buttonText: '',
        buttonLink: '#',
        buttonStyle: 'fill', // 'fill', 'outline', 'minimal'
        buttonColor: '#dd3649',
        
        // Responsive adjustments
        mobileHeightReduction: 0.8, // Reduce height on mobile by this factor
    };
    
    // Merge provided options with defaults
    const settings = { ...defaults, ...options };
    
    // Get container
    const container = document.getElementById(containerId);
    if (!container) return console.error(`Hero card container with ID '${containerId}' not found`);
    
    // Generate dynamic styles
    const overlayStyle = settings.overlayGradient 
        ? `background: linear-gradient(135deg, 
            rgba(${settings.overlayColor}, ${Math.min(settings.overlayOpacity + 0.2, 0.9)}) 0%,
            rgba(${settings.overlayColor}, ${Math.max(settings.overlayOpacity - 0.2, 0.3)}) 50%,
            rgba(${settings.overlayColor}, ${settings.overlayOpacity}) 100%);`
        : `background: rgba(${settings.overlayColor}, ${settings.overlayOpacity});`;
    
    // Prepare animation classes
    const mainAnimation = getAnimationClass(settings.animation);
    
    // Generate separator style with optional glow
    let separatorStyle = `
        height: 4px;
        width: 100px;
        background: ${settings.separatorColor};
        margin: 24px auto 28px;
        border-radius: 2px;
    `;
    
    if (settings.separatorGlow) {
        separatorStyle += `
            box-shadow: 0 0 10px rgba(${settings.separatorColor.replace('#', '')}, 0.7);
        `;
    }
    
    if (settings.separatorAnimation) {
        separatorStyle += `
            background: linear-gradient(90deg, 
                ${settings.separatorColor} 0%, 
                ${lightenColor(settings.separatorColor, 50)} 50%, 
                ${settings.separatorColor} 100%);
            background-size: 200% auto;
            animation: shimmer 2.5s infinite linear;
        `;
    }
    
    // Button rendering
    let buttonHtml = '';
    if (settings.buttonText) {
        const buttonStyles = generateButtonStyles(settings);
        buttonHtml = `
            <a href="${settings.buttonLink}" class="hero-button ${mainAnimation}" style="${buttonStyles}">
                ${settings.buttonText}
            </a>
        `;
    }
    
    // Build the advanced Hero Card
    const heroTemplate = `
        <style>
            /* Hero Card Core Styles */
            .hero-container {
                position: relative;
                width: 100%;
                height: ${settings.height};
                min-height: ${settings.minHeight};
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .hero-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('${settings.bgImage}');
                background-size: cover;
                background-position: center;
                z-index: 1;
                transform: ${settings.parallax ? 'scale(' + settings.backgroundScale + ')' : 'none'};
                transition: transform 0.5s ease-out;
                will-change: transform;
            }
            
            .hero-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                ${overlayStyle}
            }
            
            /* Stylized overlay features */
            ${settings.stylizedOverlay ? `
            .hero-overlay::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 100%;
                background: linear-gradient(to bottom, 
                    rgba(0,0,0,0.3) 0%,
                    rgba(0,0,0,0) 30%,
                    rgba(0,0,0,0) 70%,
                    rgba(0,0,0,0.3) 100%);
                pointer-events: none;
            }
            
            .hero-overlay::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIgLAAAEDklEQVR4nHXY2ZKkIBAF0MVUZBGRRcD//9QJCKgtuA9DRGcUWZmHu3b/+cfNvfl3cyt+N8/N/+b2+Cn+Nk8+8+p8PR2fz8fj8TiO2OZ+NQ/+efN4ZPy8HY/n7fbwgdv9cbvdns9n/pEFz3w0t9v9fns8uCJ+sw4S9XEbkdtNjtzemd5RFl63r6/b/XYTPzIm0Xy73e4iIwxycg6UJfP1FRbpvDMTwDL8iocy3e4/GbmPQ1rEB0Lmkat+QCJQxsmImLKI7JLD+PM/R2ZMlGWSDIKESIdiZmTXRD7SM9P5JkciBLeLyKZ/dJxNsbJxFt4LnyZPRgR3bugVmn9dyj44mO1McN7LD04XkRViXRxL8C0EXrnMnAnGQu6b2eQcSyb3cSAES0D2oez44ACp3DiFxIG9sp1RC7476RG17xx3wxf7FaM5EQpGZyKyklXViYyslTJY2JmTxZkvbfdZYFcRYQeBdJM1zfOFOV5yDszI5mWfEVk7fYlYSCXLOa9SVbWciyoTIxnzzjCz9JgIY58lgm6SL0tVVEVRVwDXRbFUywLl7kwAUXYkcl4c5yA79FBRFfVSL8UL5jVQVziXZtIxmJWJ9Pn9nYdEYi3FUj+5oYBbF4tyVbMAsRDrXkY0G8J+9enyGcpb4LQAvdUC1MtLADJWxtyZJDvJzm98DlLyyCZCXq8C4+ze11KcIWBRHA/I+dqRX+/8TcxkRdpZfwi7QumQE7IPvDNFwdDGNPJY8P9HvhkxLpGdOZRwNSqeL4qsIZkXqxSCYmSNkWVhzGfkDXEiE5cIqcJ1fSzgilXBgO5MzZge6lVkcXaMdiBy0niJSLhI2ECUmK8ZkYi01uv4zMrUtFrXakCYOoBYm0nEl+z4yL5exY8wkmykMDuWCcRavdQroLBWA6LYSGIGpA3Ltu2HcWAQVmbfR/ZVgFfehvp9I4WAXLesUiomvTdrIujt9P4cR9jByJ7gGUXk+M6ZARPgDCsJSzZ7CFkmALsIfQzhVeK8TdNkLQdo8XDQZbJbjOWro4igX0FwKamyhbSyyfgPxmbzbI14oHza+D7CqmL3ut4raYMEoNRSm6G3VksBVK+0sk2mvRH8NzLOGmjvfd6/p+lZWdg0TdO0bjO0SRbGtm2SJOkmziBmk+7CNmgjMA2hlwXMNE1pM4zTODTDMNi2MQzb7qY+67q+7/tO6y0lkMzTOI7j83lH+v9Bx3F0CEPU7/uh6cehH8ax77o0Tdu2qdumbRsl63up75WuU1rXqlPbNl3XtV3bdp1oWrUypNMhiLZpeyVXqmbI1UrmTdPwMQvfkHdTpnRKrXLe8fP87P6qtD6nUqePnKdZkiRJd0Gapnh/EoVhGEVRFIVhGIUB4g3hwxsGWQTZvP9xvDdw3iDKw+j9Ng7COKD3m5+/PwGOrYohhNz7GQAAAABJRU5ErkJggg==');
                background-repeat: repeat;
                background-attachment: fixed;
                background-size: 50px;
                opacity: 0.15;
                pointer-events: none;
            }
            ` : ''}
            
            .hero-content-container {
                position: relative;
                z-index: 3;
                width: 100%;
                max-width: ${settings.maxContentWidth};
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                color: ${settings.textColor};
                text-align: center;
            }
            
            .hero-title {
                font-size: ${settings.titleSize};
                font-weight: ${settings.titleWeight};
                letter-spacing: ${settings.letterSpacing};
                margin: 0 0 10px;
                line-height: 1.2;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                transform: translateY(20px);
                opacity: 0;
                animation: ${mainAnimation}-animation ${settings.animationDuration}ms forwards ${settings.animationDelay}ms;
            }
            
            .hero-separator {
                ${separatorStyle}
                transform: scaleX(0);
                opacity: 0;
                animation: separator-animation ${settings.animationDuration}ms forwards ${settings.animationDelay + settings.animationStagger}ms;
            }
            
            .hero-subtitle {
                font-size: ${settings.subtitleSize};
                font-weight: ${settings.subtitleWeight};
                margin: 0 0 10px;
                max-width: 80%;
                line-height: 1.4;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                transform: translateY(20px);
                opacity: 0;
                animation: ${mainAnimation}-animation ${settings.animationDuration}ms forwards ${settings.animationDelay + settings.animationStagger * 2}ms;
            }
            
            .hero-tagline {
                font-size: ${settings.taglineSize};
                font-weight: ${settings.subtitleWeight};
                margin: 5px 0 20px;
                opacity: 0.9;
                max-width: 70%;
                line-height: 1.6;
                transform: translateY(20px);
                opacity: 0;
                animation: ${mainAnimation}-animation ${settings.animationDuration}ms forwards ${settings.animationDelay + settings.animationStagger * 3}ms;
            }
            
            .hero-button {
                margin-top: 15px;
                transform: translateY(20px);
                opacity: 0;
                animation: ${mainAnimation}-animation ${settings.animationDuration}ms forwards ${settings.animationDelay + settings.animationStagger * 4}ms;
                cursor: pointer;
                text-decoration: none;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .hero-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 0%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.2);
                transition: width 0.5s ease;
                z-index: -1;
            }
            
            .hero-button:hover::before {
                width: 100%;
            }
            
            .hero-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            /* Animation Keyframes */
            @keyframes fade-animation {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slide-animation {
                from { opacity: 0; transform: translateX(-50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes zoom-animation {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            @keyframes reveal-animation {
                0% { opacity: 0; clip-path: inset(0 100% 0 0); }
                100% { opacity: 1; clip-path: inset(0 0 0 0); }
            }
            
            @keyframes separator-animation {
                0% { transform: scaleX(0); opacity: 0; }
                100% { transform: scaleX(1); opacity: 1; }
            }
            
            @keyframes shimmer {
                0% { background-position: 200% center; }
                100% { background-position: -200% center; }
            }
            
            /* Responsive Design */
            @media (max-width: 1280px) {
                .hero-title { font-size: calc(${settings.titleSize} * 0.9); }
                .hero-subtitle { font-size: calc(${settings.subtitleSize} * 0.9); }
            }
            
            @media (max-width: 992px) {
                .hero-title { font-size: calc(${settings.titleSize} * 0.8); }
                .hero-subtitle { font-size: calc(${settings.subtitleSize} * 0.8); }
                .hero-subtitle, .hero-tagline { max-width: 90%; }
            }
            
            @media (max-width: 768px) {
                .hero-container { height: calc(${settings.height} * ${settings.mobileHeightReduction}); }
                .hero-title { font-size: calc(${settings.titleSize} * 0.6); }
                .hero-subtitle { font-size: calc(${settings.subtitleSize} * 0.7); }
                .hero-tagline { font-size: calc(${settings.taglineSize} * 0.8); }
                .hero-subtitle, .hero-tagline { max-width: 100%; }
                .hero-separator { width: 80px; }
            }
            
            @media (max-width: 576px) {
                .hero-title { font-size: calc(${settings.titleSize} * 0.5); }
                .hero-subtitle { font-size: calc(${settings.subtitleSize} * 0.6); }
                .hero-tagline { font-size: calc(${settings.taglineSize} * 0.7); }
            }
        </style>
        
        <div class="hero-container">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            
            <div class="hero-content-container">
                <h1 class="hero-title">${settings.title}</h1>
                
                ${settings.showSeparator ? '<div class="hero-separator"></div>' : ''}
                
                <h2 class="hero-subtitle">${settings.subtitle}</h2>
                
                ${settings.tagline ? `<p class="hero-tagline">${settings.tagline}</p>` : ''}
                
                ${buttonHtml}
            </div>
        </div>
    `;
    
    // Insert the hero card into the container
    container.innerHTML = heroTemplate;
    
    // Initialize parallax effect if enabled
    if (settings.parallax) {
        initParallaxEffect(container);
    }
    
    // Return the container for potential method chaining
    return container;
    
    // Helper Functions
    
    /**
     * Initialize parallax scrolling effect
     */
    function initParallaxEffect(container) {
        const bg = container.querySelector('.hero-background');
        const intensity = settings.parallaxIntensity;
        
        // Initial position
        let initial = 0;
        let ticking = false;
        
        function updateParallax(scrollPos) {
            const containerRect = container.getBoundingClientRect();
            const containerTop = containerRect.top;
            const containerHeight = containerRect.height;
            const viewportHeight = window.innerHeight;
            
            // Only apply effect when element is in viewport
            if (containerTop < viewportHeight && containerTop + containerHeight > 0) {
                const relativePos = containerTop / viewportHeight;
                const translate = relativePos * intensity * 100;
                bg.style.transform = `translateY(${translate}px) scale(${settings.backgroundScale})`;
            }
            
            ticking = false;
        }
        
        function requestParallax() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateParallax(window.scrollY);
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestParallax, { passive: true });
        
        // Initial update
        updateParallax(window.scrollY);
    }
    
    /**
     * Get animation class based on animation type
     */
    function getAnimationClass(animation) {
        switch (animation) {
            case 'slide': return 'slide';
            case 'zoom': return 'zoom';
            case 'reveal': return 'reveal';
            default: return 'fade';
        }
    }
    
    /**
     * Generate styled button based on settings
     */
    function generateButtonStyles(settings) {
        let styles = `
            display: inline-block;
            padding: 12px 28px;
            font-size: 1rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            border-radius: 50px;
            text-align: center;
        `;
        
        if (settings.buttonStyle === 'fill') {
            styles += `
                background-color: ${settings.buttonColor};
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            `;
        } else if (settings.buttonStyle === 'outline') {
            styles += `
                background-color: transparent;
                color: ${settings.buttonColor};
                border: 2px solid ${settings.buttonColor};
            `;
        } else { // minimal
            styles += `
                background-color: transparent;
                color: ${settings.buttonColor};
                border: none;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-size: 0.9rem;
                padding: 12px 0;
            `;
        }
        
        return styles;
    }
    
    /**
     * Lighten a color by amount percentage
     */
    function lightenColor(color, amount) {
        if (color.charAt(0) === '#') {
            color = color.substring(1);
        }
        
        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        
        return "#" + (((r << 16) | (g << 8) | b).toString(16).padStart(6, '0'));
    }
}
