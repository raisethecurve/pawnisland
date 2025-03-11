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
                    
                    if (project.keywords.some(kw => ['community', 'education', 'collaboration'].includes(kw.toLowerCase()))) {
                        project.categories.push('community');
                    }
                    
                    if (project.keywords.some(kw => ['poetry', 'literary', 'creativity', 'writing', 'blog'].includes(kw.toLowerCase()))) {
                        project.categories.push('creative');
                    }
                }
                
                // If no categories were assigned, add 'other'
                if (project.categories.length === 0) {
                    project.categories.push('other');
                }
            }
            
            // Ensure we have at least a description if overview is missing
            if (!project.overview && project.description) {
                project.overview = project.description;
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
        
        allProjects.forEach(project => {
            if (project.categories) {
                project.categories.forEach(category => {
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                });
            }
        });
        
        // Update filter buttons with counts
        filterButtons.forEach(btn => {
            const category = btn.getAttribute('data-filter');
            const count = categoryCounts[category] || 0;
            
            // Add count badge to button
            if (btn.querySelector('.badge') === null) {
                const badgeSpan = document.createElement('span');
                badgeSpan.className = 'badge badge-light ml-2';
                badgeSpan.textContent = count;
                btn.appendChild(badgeSpan);
            } else {
                btn.querySelector('.badge').textContent = count;
            }
        });
    }
    
    /**
     * Filter and display projects with infinite scroll
     */
    function filterProjects() {
        const filteredProjects = activeFilter === 'all' 
            ? allProjects 
            : allProjects.filter(project => project.categories && project.categories.includes(activeFilter));
        
        // Show/hide no results message
        if (filteredProjects.length === 0) {
            projectsContainer.innerHTML = '';
            noProjectsMessage.style.display = 'block';
        } else {
            noProjectsMessage.style.display = 'none';
            
            // Reset visible count and container
            visibleCount = 0;
            projectsContainer.innerHTML = '';
            
            // Create row for grid system
            const row = document.createElement('div');
            row.className = 'row project-grid';
            projectsContainer.appendChild(row);
            
            // Add sentinel element at the bottom to trigger loading
            const sentinel = document.createElement('div');
            sentinel.id = 'scroll-sentinel';
            sentinel.style.height = '10px';
            sentinel.style.marginTop = '20px';
            projectsContainer.appendChild(sentinel);
            
            // Load initial batch of projects
            loadMoreProjects(filteredProjects);
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
                        : allProjects.filter(project => project.categories && project.categories.includes(activeFilter));
                    
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
     * Load more projects with staggered animation
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
            loadingMore.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="sr-only">Loading more projects...</span></div>';
            projectsContainer.insertBefore(loadingMore, document.getElementById('scroll-sentinel'));
        }
        loadingMore.style.display = 'block';
        
        // Add a small delay for visual effect
        setTimeout(() => {
            const row = document.querySelector('.project-grid');
            const startIdx = visibleCount;
            const endIdx = Math.min(visibleCount + loadIncrement, filteredProjects.length);
            
            // Add each project with a staggered animation
            for (let i = startIdx; i < endIdx; i++) {
                const project = filteredProjects[i];
                const projectCard = createProjectCard(project, i - startIdx);
                
                // Apply initial styles for animation
                projectCard.style.opacity = '0';
                projectCard.style.transform = 'translateY(30px)';
                
                row.appendChild(projectCard);
                
                // Trigger animation after a small delay
                setTimeout(() => {
                    projectCard.style.opacity = '1';
                    projectCard.style.transform = 'translateY(0)';
                }, (i - startIdx) * 150); // Staggered delay
            }
            
            // Update visible count
            visibleCount = endIdx;
            
            // Hide loading indicator
            loadingMore.style.display = 'none';
            
            // Initialize lazy loading for new images
            lazyLoadProjectImages();
            
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
        const col = document.createElement('div');
        col.className = 'col-12 mb-4 project-item';
        col.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Determine the card text (use description or shortened overview)
        let cardText = project.description || '';
        if (!cardText && project.overview) {
            cardText = project.overview.length > 250 
                ? project.overview.substring(0, 250) + '...'
                : project.overview;
        }
        
        // Create tech tags HTML
        const techTags = project.technologies && project.technologies.length
            ? `<div class="tech-tags">
                ${project.technologies.slice(0, 5).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                ${project.technologies.length > 5 ? `<span class="tech-tag">+${project.technologies.length - 5} more</span>` : ''}
              </div>`
            : '';
        
        col.innerHTML = `
            <div class="card project-card h-100">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        <div class="card-img-container h-100">
                            <img src="${imageSrc}" class="card-img h-100 w-100" alt="${project.title}" style="object-fit: cover;">
                            ${project.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${project.title}</h5>
                            <div class="project-meta mb-2">
                                ${project.role ? `<span class="mr-3"><i class="fas fa-user-tie mr-1"></i>${project.role}</span>` : ''}
                                ${project.duration || project.date ? `<span><i class="fas fa-calendar-alt mr-1"></i>${project.duration || formatDate(project.date)}</span>` : ''}
                            </div>
                            <p class="card-text">${cardText}</p>
                            ${techTags}
                            <div class="mt-3">
                                <button class="btn btn-primary btn-sm view-details" data-project-id="${project.id}">
                                    <i class="fas fa-info-circle mr-1"></i>View Details
                                </button>
                                ${project.details && project.details.links && project.details.links.length > 0 ? 
                                    `<a href="${project.details.links[0].url}" class="btn btn-sm btn-outline-primary ml-2" target="_blank">
                                        <i class="fas ${project.details.links[0].icon || 'fa-external-link-alt'} mr-1"></i> ${project.details.links[0].label}
                                    </a>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return col;
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
