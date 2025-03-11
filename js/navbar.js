/**
 * Navbar Component
 * Creates a responsive navbar with dynamic styling based on scroll position
 */
document.addEventListener('DOMContentLoaded', function () {
    // Get the navbar container
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    // Define the navbar HTML with modern styling and square logo
    const navbarHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center" href="../../index.html">
                    <div class="logo-container mr-2">
                        <img src="../../images/brand-icons/logo-light.png" alt="Pawn Island Logo" class="logo">
                    </div>
                    <span class="brand-text">Pawn Island</span>
                </a>
                
                <!-- Island Merch Button - Updated -->
                <a href="https://pawnisland.myshopify.com/collections/" class="island-merch-btn d-none d-lg-flex" target="_blank" rel="noopener">
                    <i class="fas fa-store mr-1"></i>
                    Merch
                </a>
                
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="../../index.html">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../landing/about-me.html">About</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../landing/coaching.html">Coaching</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../landing/clearinghouse.html">Events</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="https://chess.com/blog/squarethecurve" target="_blank" rel="noopener">
                                <i class="fas fa-newspaper mr-1"></i>Blog
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="mailto:info@pawnislandacademy.com">
                                <i class="fas fa-envelope mr-1"></i>Contact
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="https://pawnisland.setmore.com" target="_blank" rel="noopener">
                                <i class="fas fa-calendar-alt mr-1"></i>
                                Book Now
                            </a>
                        </li>
                        <!-- Island Merch Button for mobile - Updated -->
                        <li class="nav-item d-lg-none">
                            <a class="nav-link" href="https://pawnisland.myshopify.com/collections/" target="_blank" rel="noopener">
                                <i class="fas fa-store mr-1"></i>
                                Merch
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;

    // Insert the navbar into the container
    navbarContainer.innerHTML = navbarHTML;

    // Set the active state for the current page
    setActiveNavItem();
    
    // Apply day/night theme to navbar if theme manager is available
    if (typeof applyThemeToNavbar === 'function') {
        applyThemeToNavbar();
    }

    // Handle the navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Add initial animation class
        navbar.classList.add('navbar-animation');
        
        // Initial check for scroll position
        checkScroll();
        
        // Add scroll listener
        window.addEventListener('scroll', checkScroll);
        
        function checkScroll() {
            if (window.scrollY > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    /**
     * Set the active nav item based on current URL
     */
    function setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        console.log('Current path:', currentPath); // Debugging
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            
            // Remove 'active' class from all links
            link.classList.remove('active');
            
            // Extract page name from path
            const currentPageName = currentPath.split('/').pop();
            const linkPageName = linkHref.split('/').pop();
            
            console.log('Comparing:', currentPageName, 'with', linkPageName); // Debugging
            
            // Special case for about-me.html - it should highlight the About link
            if (currentPageName === 'about-me.html' && linkPageName === 'about.html') {
                link.classList.add('active');
                return;
            }
            
            // Handle home page matching
            if ((currentPath.endsWith('/') || currentPath.endsWith('index.html')) && 
                linkHref.includes('index.html') && 
                linkHref === '../../index.html') {
                link.classList.add('active');
                return;
            }
            
            // Match any other pages
            if ((currentPath.includes(linkHref) && linkHref !== '../../index.html') || 
                (currentPageName === linkPageName)) {
                link.classList.add('active');
            }
        });
    }
});
