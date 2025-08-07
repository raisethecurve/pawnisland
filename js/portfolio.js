/**
 * Portfolio Projects Manager
 * Handles loading, filtering, and displaying projects from portfolio.json
 */
document.addEventListener('DOMContentLoaded', function() {
    // Store all projects data
    let allProjects = [];
    
    // DOM Elements
    const projectsContainer = document.getElementById('projects-container');
    const loadingIndicator = document.getElementById('loading-projects');
    const noProjectsMessage = document.getElementById('no-projects-message');
    const filterButtons = document.querySelectorAll('#categoryFilter .btn');
    
    // Scroll loading configuration
    let activeFilter = 'all';
    let isLoading = false;
    let visibleCount = 0;
    const loadIncrement = 3; // Number of projects to load at once
    
    // Load projects data
    loadProjects();
    
    // Setup event listeners
    setupEventListeners();
    
    /**
     * Load projects from the JSON file
     */
    async function loadProjects() {
        try {
            // Change path to portfolio.json
            const response = await fetch('../../data/portfolio.json');
            if (!response.ok) {
                throw new Error('Failed to load projects data');
            }
            
            const data = await response.json();
            if (!data || !Array.isArray(data.projects)) {
                throw new Error('Projects data is not in expected format');
            }
            
            // Store projects with proper date conversion for sorting
            allProjects = data.projects.map(project => {
                // Ensure date is parsed correctly for sorting
                if (project.date) {
                    project._dateObj = new Date(project.date);
                }
                return project;
            });
            
            console.log(`Loaded ${allProjects.length} projects from portfolio.json`);
            
            // Process projects (add categories based on keywords)
            processProjects();
            
            // Sort by newest first (default)
            sortProjectsByDate();
            
            // Hide loading indicator
            loadingIndicator.style.display = 'none';

            // Initialize category counts
            updateCategoryCounts();
            
            // Initialize scroll observer
            initScrollObserver();
        } catch (error) {
            console.error('Error loading projects:', error);
            loadingIndicator.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Failed to load projects. Please try again later.
                </div>
            `;
        }
    }
    
    /**
     * Process projects to add derived properties like categories
     */
    function processProjects() {
        allProjects.forEach(project => {
            // Derive categories from keywords if categories not already present
            if (!project.categories || project.categories.length === 0) {
                project.categories = [];
                
                if (project.keywords) {
                    if (project.keywords.some(kw => ['chess', 'tournament', 'organization'].includes(kw.toLowerCase()))) {
                        project.categories.push('chess');
                    }
                    
                    if (project.keywords.some(kw => ['ai', 'machine learning', 'neural networks', 'data', 'software', 'programming'].includes(kw.toLowerCase()))) {
                        project.categories.push('ai');
                    }
                    
                    if (project.keywords.some(kw => ['web', 'website', 'frontend', 'backend', 'fullstack'].includes(kw.toLowerCase()))) {
                        project.categories.push('web');
                    }
                    
                    if (project.keywords.some(kw => ['mobile', 'ios', 'android', 'app'].includes(kw.toLowerCase()))) {
                        project.categories.push('mobile');
                    }
                    
                    if (project.keywords.some(kw => ['community', 'education', 'collaboration', 'teaching'].includes(kw.toLowerCase()))) {
                        project.categories.push('education');
                    }
                    
                    if (project.keywords.some(kw => ['ecommerce', 'e-commerce', 'shop', 'store', 'commerce'].includes(kw.toLowerCase()))) {
                        project.categories.push('e-commerce');
                    }
                    
                    if (project.keywords.some(kw => ['poetry', 'literary', 'creativity', 'writing', 'blog'].includes(kw.toLowerCase()))) {
                        project.categories.push('creative');
                    }
                }
                
                // Default to 'web' if no categories were assigned
                if (project.categories.length === 0) {
                    project.categories.push('web');
                }
            }
            
            // Ensure we have at least a description if overview is missing
            if (!project.overview && project.description) {
                project.overview = project.description;
            }
            
            // Set default status to 'active' if not specified and not 'development'
            if (!project.status) {
                project.status = 'active';
            }
            
            // Remove 'concept' and 'other' statuses - convert to active
            if (project.status === 'concept' || project.status === 'other') {
                project.status = 'active';
            }
        });
    }
    
    /**
     * Update category filter buttons with counts
     */
    function updateCategoryCounts() {
        // Calculate counts for each category
        const categoryCounts = {
            all: allProjects.length
        };
        
        // Excluded categories that we don't want to show
        const excludedCategories = ['other', 'concept'];
        
        allProjects.forEach(project => {
            if (project.categories) {
                project.categories.forEach(category => {
                    if (!excludedCategories.includes(category.toLowerCase())) {
                        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                    }
                });
            }
            
            // Also count by single category field if it exists
            if (project.category && !excludedCategories.includes(project.category.toLowerCase())) {
                categoryCounts[project.category] = (categoryCounts[project.category] || 0) + 1;
            }
        });
        
        // Update filter buttons with counts
        filterButtons.forEach(btn => {
            const category = btn.getAttribute('data-filter');
            const count = categoryCounts[category] || 0;
            
            // Only show filter buttons that have projects
            if (count > 0 || category === 'all') {
                btn.style.display = 'inline-flex';
                
                // Add count badge to button
                if (btn.querySelector('.badge') === null) {
                    const badgeSpan = document.createElement('span');
                    badgeSpan.className = 'badge badge-light ml-2';
                    badgeSpan.textContent = count;
                    btn.appendChild(badgeSpan);
                } else {
                    btn.querySelector('.badge').textContent = count;
                }
            } else {
                btn.style.display = 'none';
            }
        });
    }
    
    /**
     * Filter and display projects with enhanced loading
     */
    function filterProjects() {
        const filteredProjects = activeFilter === 'all' 
            ? allProjects 
            : allProjects.filter(project => {
                // Improved filter logic - check both category and categories array
                if (project.category && project.category.toLowerCase() === activeFilter) {
                    return true;
                }
                if (project.categories && project.categories.some(cat => cat.toLowerCase() === activeFilter)) {
                    return true;
                }
                return false;
            });
        
        // Show/hide no results message
        if (filteredProjects.length === 0) {
            projectsContainer.innerHTML = '';
            projectsContainer.style.display = 'none';
            noProjectsMessage.style.display = 'block';
        } else {
            noProjectsMessage.style.display = 'none';
            
            // Reset visible count and container
            visibleCount = 0;
            projectsContainer.innerHTML = '';
            
            // Show skeleton loading first
            showSkeletonCards(Math.min(filteredProjects.length, loadIncrement));
            
            // Add sentinel element for infinite scroll
            const sentinel = document.createElement('div');
            sentinel.id = 'scroll-sentinel';
            sentinel.style.height = '10px';
            sentinel.style.marginTop = '20px';
            projectsContainer.appendChild(sentinel);
            
            // Load initial batch with delay for better UX
            setTimeout(() => {
                // Remove skeletons
                const skeletons = projectsContainer.querySelectorAll('.project-skeleton');
                skeletons.forEach(skeleton => skeleton.remove());
                
                // Load initial projects
                loadMoreProjects(filteredProjects);
            }, 500); // Reduced delay for better responsiveness
        }
    }
    
    /**
     * Show skeleton loading cards
     */
    function showSkeletonCards(count) {
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'project-skeleton';
            skeleton.setAttribute('data-aos', 'fade-in');
            skeleton.setAttribute('data-aos-duration', '400');
            projectsContainer.appendChild(skeleton);
        }
        
        if (projectsContainer.style.display === 'none') {
            projectsContainer.style.display = 'grid';
        }
    }
    
    /**
     * Initialize scroll observer for infinite loading
     */
    function initScrollObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px 200px 0px', // Load more when within 200px of the bottom
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isLoading) {
                    const filteredProjects = activeFilter === 'all' 
                        ? allProjects 
                        : allProjects.filter(project => {
                            // Improved filter logic - check both category and categories array
                            if (project.category && project.category.toLowerCase() === activeFilter) {
                                return true;
                            }
                            if (project.categories && project.categories.some(cat => cat.toLowerCase() === activeFilter)) {
                                return true;
                            }
                            return false;
                        });
                    
                    if (visibleCount < filteredProjects.length) {
                        loadMoreProjects(filteredProjects);
                    }
                }
            });
        }, observerOptions);
        
        // Create or observe the sentinel element
        let sentinel = document.getElementById('scroll-sentinel');
        if (!sentinel) {
            sentinel = document.createElement('div');
            sentinel.id = 'scroll-sentinel';
            sentinel.style.height = '10px';
            projectsContainer.appendChild(sentinel);
        }
        
        observer.observe(sentinel);
    }
    
    /**
     * Load more projects with enhanced animations
     */
    function loadMoreProjects(filteredProjects) {
        if (isLoading) return;
        
        isLoading = true;
        
        // Show a temporary loading indicator
        let loadingMore = document.getElementById('loading-more');
        if (!loadingMore) {
            loadingMore = document.createElement('div');
            loadingMore.id = 'loading-more';
            loadingMore.className = 'text-center py-3';
            loadingMore.style.cssText = `
                color: var(--chess-gold);
                font-family: 'Cinzel', serif;
                font-weight: 600;
                margin: 2rem 0;
            `;
            loadingMore.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                    <div class="spinner-border text-warning" role="status" style="width: 2rem; height: 2rem;">
                        <span class="sr-only">Loading more projects...</span>
                    </div>
                    <span>Loading more amazing projects...</span>
                </div>
            `;
            projectsContainer.insertBefore(loadingMore, document.getElementById('scroll-sentinel'));
        }
        loadingMore.style.display = 'block';
        
        // Add a small delay for visual effect
        setTimeout(() => {
            const startIdx = visibleCount;
            const endIdx = Math.min(visibleCount + loadIncrement, filteredProjects.length);
            
            // Add each project with a staggered animation
            for (let i = startIdx; i < endIdx; i++) {
                const project = filteredProjects[i];
                const projectCard = createProjectCard(project, i - startIdx);
                
                // Apply initial styles for animation
                projectCard.style.opacity = '0';
                projectCard.style.transform = 'translateY(50px) scale(0.9)';
                
                // Insert before the sentinel
                projectsContainer.insertBefore(projectCard, document.getElementById('scroll-sentinel'));
                
                // Trigger animation after a small delay
                setTimeout(() => {
                    projectCard.style.opacity = '1';
                    projectCard.style.transform = 'translateY(0) scale(1)';
                }, (i - startIdx) * 150); // Staggered delay
            }
            
            // Update visible count
            visibleCount = endIdx;
            
            // Hide loading indicator
            loadingMore.style.display = 'none';
            
            // Initialize AOS animations for new cards
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
            
            // Mark as not loading
            isLoading = false;
        }, 600);
    }
    
    /**
     * Sort projects by date (newest first)
     */
    function sortProjectsByDate() {
        allProjects.sort((a, b) => {
            // Use _dateObj if available, otherwise create a new Date object
            const dateA = a._dateObj || new Date(a.date || 0);
            const dateB = b._dateObj || new Date(b.date || 0);
            return dateB - dateA;
        });
        
        // Apply current filter
        filterProjects();
    }
    
    /**
     * Create a project card element
     */
    function createProjectCard(project, index) {
        // Get image source
        const imageSrc = project.thumbnail || project.image || '../../images/placeholders/project-placeholder.jpg';
        
        // Create card element
        const cardDiv = document.createElement('div');
        cardDiv.className = 'project-card';
        cardDiv.setAttribute('data-category', project.category || 'other');
        cardDiv.setAttribute('data-status', project.status || 'concept');
        cardDiv.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Determine the card description (use description or shortened overview)
        let cardDescription = project.description || '';
        if (!cardDescription && project.overview) {
            cardDescription = project.overview.length > 150 
                ? project.overview.substring(0, 150) + '...'
                : project.overview;
        }
        
        // Create tech tags HTML - smaller size
        const techTags = project.technologies && project.technologies.length
            ? project.technologies.slice(0, 4).map(tech => `<span class="project-tag">${tech}</span>`).join('')
            : '';
        
        // Calculate difficulty level (1-5 dots)
        const difficultyLevel = project.difficulty || 3;
        const difficultyDots = Array.from({length: 5}, (_, i) => 
            `<div class="difficulty-dot ${i < difficultyLevel ? 'active' : ''}"></div>`
        ).join('');
        
        // Determine status class and text - only show active and development
        const shouldShowStatus = project.status === 'development';
        const statusClass = project.status === 'development' ? 'status-development' : 'status-active';
        const statusText = project.status === 'development' ? 'In Progress' : 'Live';
        
        // Create links HTML
        const primaryLink = project.details?.links?.[0] || 
                           (project.demoUrl ? {url: project.demoUrl, label: 'View Live', icon: 'fa-external-link-alt'} : null);
        const secondaryLink = project.details?.links?.[1] || 
                             (project.githubUrl ? {url: project.githubUrl, label: 'Code', icon: 'fab fa-github'} : null);
        
        const linksHTML = `
            ${primaryLink ? `
                <a href="${primaryLink.url}" class="project-link" target="_blank" rel="noopener">
                    <i class="fas ${primaryLink.icon || 'fa-external-link-alt'}"></i>
                    ${primaryLink.label || 'View Live'}
                </a>
            ` : ''}
            ${secondaryLink ? `
                <a href="${secondaryLink.url}" class="project-link secondary" target="_blank" rel="noopener">
                    <i class="${secondaryLink.icon || 'fab fa-github'}"></i>
                    ${secondaryLink.label || 'Code'}
                </a>
            ` : ''}
        `;
        
        // Determine overlay icon based on project type
        const overlayIcon = project.category === 'web' ? 'fa-globe' :
                           project.category === 'mobile' ? 'fa-mobile-alt' :
                           project.category === 'education' ? 'fa-graduation-cap' :
                           project.category === 'e-commerce' ? 'fa-shopping-cart' :
                           project.category === 'chess' ? 'fa-chess' :
                           project.category === 'ai' ? 'fa-brain' :
                           'fa-expand-arrows-alt';
        
        cardDiv.innerHTML = `
            <div class="project-image-container">
                <img src="${imageSrc}" alt="${project.title}" class="project-image" loading="lazy">
                <div class="project-overlay">
                    <div class="project-overlay-content">
                        <i class="fas ${overlayIcon} overlay-icon"></i>
                        <div class="overlay-text">View Details</div>
                    </div>
                </div>
                ${shouldShowStatus ? `<div class="project-status ${statusClass}">${statusText}</div>` : ''}
                <div class="project-category">${project.category || 'Web'}</div>
            </div>
            <div class="project-content">
                <div class="project-header">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${cardDescription}</p>
                </div>
                <div class="project-tags">
                    ${techTags}
                </div>
                <div class="project-footer">
                    <div class="project-links">
                        ${linksHTML}
                    </div>
                    <div class="project-stats">
                        <div class="project-difficulty" title="Difficulty Level">
                            ${difficultyDots}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click handler for project details
        cardDiv.addEventListener('click', (e) => {
            // Don't trigger if clicking on a link
            if (e.target.closest('.project-link')) return;
            
            // Add ripple effect
            createRippleEffect(e, cardDiv);
            
            // Small delay for visual feedback
            setTimeout(() => {
                showProjectDetails(project.id);
            }, 150);
        });
        
        // Add hover sound effect (optional)
        cardDiv.addEventListener('mouseenter', () => {
            cardDiv.style.cursor = 'pointer';
        });
        
        // Add AOS animation
        cardDiv.setAttribute('data-aos', 'fade-up');
        cardDiv.setAttribute('data-aos-delay', (index * 100).toString());
        cardDiv.setAttribute('data-aos-duration', '800');
        
        return cardDiv;
    }
    
    /**
     * Create ripple effect on card click
     */
    function createRippleEffect(event, element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10;
            animation: ripple-animation 0.6s ease-out forwards;
        `;
        
        // Add ripple animation keyframes if not already present
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    /**
     * Lazy load project images
     */
    function lazyLoadProjectImages() {
        const lazyImages = document.querySelectorAll('.project-card img');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                img.dataset.src = img.src;
                img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3C/svg%3E";
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }
    
    /**
     * Show project details in modal
     */
    function showProjectDetails(projectId) {
        const project = allProjects.find(p => p.id === projectId);
        if (!project) return;
        
        const modalContent = document.getElementById('projectDetailContent');
        const modalTitle = document.getElementById('projectDetailModalLabel');
        
        modalTitle.textContent = project.title;
        
        // Build modal content with single column layout
        let content = `
            <div class="project-detail-header">
                <img src="${project.image || project.thumbnail || '../../images/placeholders/project-placeholder.jpg'}" 
                     class="img-fluid rounded" alt="${project.title}">
            </div>
            <div class="project-detail-body mt-4">
                <!-- Project metadata in single row -->
                <div class="project-meta d-flex flex-wrap mb-4">
                    ${project.role ? `
                    <div class="meta-item mr-4 mb-3">
                        <h5><i class="fas fa-user-circle mr-2"></i>Role</h5>
                        <p class="mb-0">${project.role}</p>
                    </div>` : ''}
                    
                    ${project.duration || project.date ? `
                    <div class="meta-item mr-4 mb-3">
                        <h5><i class="fas fa-calendar-alt mr-2"></i>Timeline</h5>
                        <p class="mb-0">${project.duration || formatDate(project.date)}</p>
                    </div>` : ''}
                    
                    ${project.technologies && project.technologies.length > 0 ? `
                    <div class="meta-item mb-3">
                        <h5><i class="fas fa-laptop-code mr-2"></i>Technologies</h5>
                        <p class="mb-0">${project.technologies.join(', ')}</p>
                    </div>` : ''}
                </div>
                
                <!-- Project content in single column -->
                <div>
                    <h4>Overview</h4>
                    <p>${project.overview || (project.details && project.details.overview) || project.description || 'No description available.'}</p>
                    
                    ${project.details && project.details.challenge ? `
                    <h4 class="mt-4">Challenge</h4>
                    <p>${project.details.challenge}</p>` : ''}
                        
                    ${project.details && project.details.development ? `
                    <h4 class="mt-4">Development</h4>
                    <p>${project.details.development}</p>` : ''}
                
                    ${project.contributions && project.contributions.length > 0 ? `
                    <div class="mt-4">
                        <h4>Contributions</h4>
                        <ul class="project-list">
                            ${project.contributions.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>` : ''}
                    
                    ${project.details && project.details.features && project.details.features.length > 0 ? `
                    <div class="mt-4">
                        <h4>Key Features</h4>
                        <ul class="project-list">
                            ${project.details.features.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>` : ''}
                    
                    ${project.achievements && project.achievements.length > 0 ? `
                    <div class="mt-4">
                        <h4>Achievements</h4>
                        <ul class="project-list">
                            ${project.achievements.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>` : ''}
                    
                    ${project.details && project.details.testimonial ? `
                    <div class="testimonial-box mt-4">
                        <blockquote>
                            <p><i class="fas fa-quote-left"></i> ${project.details.testimonial.quote} <i class="fas fa-quote-right"></i></p>
                            <footer>- ${project.details.testimonial.author}</footer>
                        </blockquote>
                    </div>` : ''}
                    
                    ${project.details && project.details.links && project.details.links.length > 0 ? `
                    <div class="mt-4">
                        <h4>Links</h4>
                        <div class="project-links">
                            ${project.details.links.map(link => 
                                `<a href="${link.url}" class="btn btn-primary mr-2 mb-2" target="_blank">
                                    <i class="fas ${link.icon || 'fa-external-link-alt'} mr-1"></i> ${link.label}
                                </a>`
                            ).join('')}
                        </div>
                    </div>` : ''}
                </div>
            </div>
        `;
        
        modalContent.innerHTML = content;
        
        // Show the modal
        $('#projectDetailModal').modal('show');
    }
    
    /**
     * Format date for display
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
    
    /**
     * Reset filters to show all projects
     */
    function resetFilters() {
        // Reset active filter
        activeFilter = 'all';
        
        // Update UI
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === 'all') {
                btn.classList.add('active');
            }
        });
        
        // Re-filter projects
        filterProjects();
    }
    
    /**
     * Setup event listeners for filters and project cards
     */
    function setupEventListeners() {
        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active filter
                activeFilter = this.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter projects
                filterProjects();
                
                // Smooth scroll back to top of projects section
                const projectsSection = document.querySelector('.projects-section');
                if (projectsSection) {
                    projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Project detail buttons (using event delegation)
        projectsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('view-details') || 
                e.target.parentElement.classList.contains('view-details')) {
                
                const button = e.target.classList.contains('view-details') 
                    ? e.target 
                    : e.target.parentElement;
                
                const projectId = button.getAttribute('data-project-id');
                showProjectDetails(projectId);
            }
        });
        
        // Handle window resize events
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // Adjust layout or refresh components if needed
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
            }, 250);
        });
        
        // No jump to top button code here - it's managed by the component
    }
    
    // Expose resetFilters to the global scope so it can be called from HTML
    window.resetFilters = resetFilters;
});
