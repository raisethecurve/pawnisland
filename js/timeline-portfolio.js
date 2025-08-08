/**
 * Timeline Portfolio Manager
 * Handles loading and displaying projects in a timeline format
 */
document.addEventListener('DOMContentLoaded', function() {
    let allProjects = [];
    const timelineContainer = document.getElementById('timeline-projects');
    
    // Load projects data
    loadProjects();
    
    /**
     * Load projects from the JSON file
     */
    async function loadProjects() {
        try {
            const response = await fetch('../../data/portfolio.json');
            if (!response.ok) {
                throw new Error('Failed to load projects data');
            }
            
            const data = await response.json();
            if (!data || !Array.isArray(data.projects)) {
                throw new Error('Projects data is not in expected format');
            }
            
            // Store and sort projects by date (newest first)
            allProjects = data.projects
                .map(project => ({
                    ...project,
                    _dateObj: new Date(project.date || '2024-01-01')
                }))
                .sort((a, b) => b._dateObj - a._dateObj);
            
            // Display projects in timeline
            displayTimelineProjects();
            
        } catch (error) {
            console.error('Error loading projects:', error);
            showError();
        }
    }
    
    /**
     * Display projects in timeline format
     */
    function displayTimelineProjects() {
        timelineContainer.innerHTML = '';
        
        allProjects.forEach((project, index) => {
            const timelineItem = createTimelineItem(project, index);
            timelineContainer.appendChild(timelineItem);
        });
        
        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
    
    /**
     * Create a timeline item element
     */
    function createTimelineItem(project, index) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.setAttribute('data-aos', 'fade-up');
        item.setAttribute('data-aos-delay', (index * 100).toString());
        
        // Extract year from date
        const year = project._dateObj.getFullYear();
        
        // Create technologies HTML
        const techTags = project.technologies && project.technologies.length
            ? project.technologies.slice(0, 6).map(tech => 
                `<span class="tech-tag">${tech}</span>`
              ).join('')
            : '';
        
        // Create achievements HTML
        const achievementsHTML = project.achievements && project.achievements.length
            ? `<div class="project-achievements">
                 <div class="achievements-title">
                   <i class="fas fa-trophy"></i> Key Achievements
                 </div>
                 ${project.achievements.slice(0, 3).map(achievement => 
                   `<div class="achievement-item">${achievement}</div>`
                 ).join('')}
               </div>`
            : '';
        
        item.innerHTML = `
            <div class="timeline-content">
                <img src="${project.image || '../../images/placeholders/project-placeholder.jpg'}" 
                     alt="${project.title}" class="project-image" loading="lazy">
                
                <div class="project-header">
                    <h3 class="project-title">${project.title}</h3>
                    <div class="project-role">${project.role || 'Project Lead'}</div>
                    <div class="project-duration">${project.duration || year}</div>
                </div>
                
                <div class="project-description">
                    ${project.overview || project.description || 'No description available.'}
                </div>
                
                ${techTags ? `<div class="project-technologies">${techTags}</div>` : ''}
                
                ${achievementsHTML}
            </div>
            
            <div class="timeline-dot"></div>
        `;
        
        // Add click handler for more details
        const content = item.querySelector('.timeline-content');
        content.addEventListener('click', () => {
            showProjectModal(project);
        });
        
        return item;
    }
    
    /**
     * Show project details in a modal (placeholder)
     */
    function showProjectModal(project) {
        // For now, just log the project details
        console.log('Project details:', project);
        
        // You can implement a modal here if needed
        alert(`${project.title}\n\n${project.overview || project.description}`);
    }
    
    /**
     * Show error message
     */
    function showError() {
        timelineContainer.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--chess-white);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--chess-gold); margin-bottom: 1rem;"></i>
                <h3>Failed to load projects</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
});
