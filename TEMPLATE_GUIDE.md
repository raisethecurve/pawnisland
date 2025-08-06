# Pawn Island Academy Template System

## Overview
This template system provides a unified foundation for creating new landing pages that maintain consistent branding, styling, and user experience across the Pawn Island Academy website.

## Files Included
- `template.html` - Base HTML template with semantic structure
- `css/template.css` - Complete CSS system with brand colors, components, and responsive design

## Brand Guidelines

### Colors
Our brand color system is built around these core colors:

#### Primary Colors
- **Primary Blue**: `#2c5aa0` - Main brand color
- **Primary Dark**: `#1e3a8a` - Darker shade for depth
- **Primary Light**: `#3b82f6` - Lighter shade for accents

#### Secondary Colors
- **Secondary Gray**: `#343a40` - Text and UI elements
- **Accent Yellow**: `#f8d948` - Call-to-action and highlights
- **Accent Gold**: `#ffd700` - Premium elements and hover states
- **Accent Red**: `#dd3649` - Focus states and alerts

#### Text Colors
- **Dark Text**: `#2c3e50` - Primary text color
- **Muted Text**: `#6c757d` - Secondary text and descriptions
- **Light Text**: `#ffffff` - Text on dark backgrounds

#### Background Colors
- **Light Background**: `#f8f9fa` - Page background
- **White Background**: `#ffffff` - Card and content backgrounds

### Typography
- **Display Font**: 'Cinzel', serif - Used for headings and hero titles
- **Body Font**: 'Raleway', sans-serif - Used for body text and UI elements

### Design System

#### Spacing Scale
- **XS**: 0.5rem (8px)
- **SM**: 1rem (16px)
- **MD**: 1.5rem (24px)
- **LG**: 2rem (32px)
- **XL**: 3rem (48px)
- **XXL**: 4rem (64px)

#### Border Radius
- **Standard**: 12px
- **Large**: 20px
- **Extra Large**: 30px
- **Full**: 50px (circular)

#### Shadow System
- **Small**: Subtle shadows for cards
- **Medium**: Standard card elevation
- **Large**: Prominent elements
- **Hero**: Maximum impact shadows

## Using the Template

### 1. Copy the Template
Copy `template.html` and rename it for your new page:
```
cp template.html pages/landing/new-page.html
```

### 2. Update Meta Information
Replace the following placeholders in the `<head>` section:
- `Page Title | Pawn Island Academy` - Update with your page title
- Meta description and keywords
- OpenGraph properties
- Canonical URL

### 3. Customize the Hero Section
The hero section includes:
- **Hero Badge**: Small indicator (optional)
- **Hero Title**: Main page heading
- **Hero Description**: Brief page description
- **Hero Actions**: Primary and secondary call-to-action buttons

```html
<div class="hero-badge">
    <i class="fas fa-star"></i>
    <span>Your Badge Text</span>
</div>
<h1 class="hero-title">Your Page Title</h1>
<p class="hero-description">Your page description</p>
```

### 4. Add Your Content
Replace the content sections with your specific information:
- Main content section
- Feature cards
- Call-to-action sections

### 5. Update Navigation Paths
Ensure all relative paths are correct based on your page location:
- CSS files: `../../css/` (if in `pages/landing/`)
- Image files: `../../images/` (if in `pages/landing/`)
- JavaScript files: `../../js/` (if in `pages/landing/`)

## Available Components

### Buttons
The template includes several button styles:

#### Hero Buttons
- `.btn-hero-primary` - Main call-to-action
- `.btn-hero-secondary` - Secondary action

#### Content Buttons
- `.btn-primary-custom` - Standard primary button
- `.btn-cta-primary` - Prominent call-to-action
- `.btn-cta-secondary` - Secondary call-to-action

### Cards
- `.content-card` - Main content cards with header and body
- `.feature-card` - Feature highlight cards with icons

### Sections
- `.template-hero` - Full-screen hero section
- `.main-content-section` - Main content area
- `.features-section` - Feature showcase
- `.cta-banner` - Call-to-action banner

## CSS Variables
All brand colors and design tokens are available as CSS custom properties:

```css
/* Use brand colors */
color: var(--pi-primary-color);
background: var(--pi-gradient-primary);

/* Use spacing system */
margin: var(--pi-spacing-lg);
padding: var(--pi-spacing-xl);

/* Use typography */
font-family: var(--pi-font-display);
font-size: var(--pi-font-size-xl);
```

## Responsive Design
The template is fully responsive with breakpoints at:
- **Mobile**: 576px and below
- **Tablet**: 768px and below
- **Desktop**: 992px and above

## Accessibility Features
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Reduced motion support
- High contrast mode support

## Animation System
Uses AOS (Animate On Scroll) library with these common effects:
- `data-aos="fade-up"` - Fade in from bottom
- `data-aos="fade-left"` - Fade in from right
- `data-aos="zoom-in"` - Scale in effect
- `data-aos-delay="100"` - Stagger animations

## Best Practices

### Content Guidelines
1. **Hero Title**: Keep concise and impactful
2. **Hero Description**: 1-2 sentences maximum
3. **Section Headers**: Clear and descriptive
4. **Call-to-Actions**: Use action verbs

### Image Guidelines
1. Use high-quality images (minimum 1200px wide)
2. Optimize for web (WebP format preferred)
3. Include alt text for accessibility
4. Use images from the `images/headers-pages/` directory

### Performance
1. Compress images before uploading
2. Use modern image formats (WebP, AVIF)
3. Minimize custom CSS additions
4. Test on mobile devices

## Example Implementation

Here's a quick example of customizing the hero section:

```html
<section class="template-hero">
    <div class="hero-background">
        <div class="hero-overlay"></div>
        <img src="../../images/headers-pages/your-image.jpg" alt="Page Background" class="hero-bg-image">
    </div>
    <div class="container hero-container">
        <div class="row align-items-center min-vh-100">
            <div class="col-lg-8 mx-auto text-center" data-aos="fade-up">
                <div class="hero-badge">
                    <i class="fas fa-chess-knight"></i>
                    <span>New Program</span>
                </div>
                <h1 class="hero-title">Advanced Chess Tactics</h1>
                <p class="hero-description">
                    Master complex tactical patterns and elevate your game to the next level with our intensive training program.
                </p>
                <div class="hero-actions">
                    <a href="https://pawnisland.setmore.com/" target="_blank" class="btn-hero-primary">
                        <i class="fas fa-calendar-alt"></i>
                        Enroll Now
                    </a>
                    <a href="#curriculum" class="btn-hero-secondary">
                        <i class="fas fa-book"></i>
                        View Curriculum
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>
```

## Support
For questions about using this template system, refer to existing pages in the `pages/landing/` directory for examples, or consult the main stylesheets in the `css/` directory.

---

**Last Updated**: August 2025
**Version**: 1.0
