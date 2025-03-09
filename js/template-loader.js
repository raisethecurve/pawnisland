/**
 * Template Loader - Modular layout system for static sites
 * Compatible with GitHub Pages and other static hosts
 */
class TemplateLoader {
    constructor() {
        this.loadedComponents = {};
        this.initComponents();
    }
    
    async initComponents() {
        try {
            // Use relative paths that work from any page depth
            const basePath = this.getBasePath();
            await Promise.all([
                this.loadComponent('navbar', `${basePath}/components/navbar.html`),
                this.loadComponent('footer', `${basePath}/components/footer.html`)
            ]);
            
            // Apply theme settings after components are loaded
            this.applyTheme();
            
            // Fire event when all components are loaded
            document.dispatchEvent(new CustomEvent('componentsLoaded'));
        } catch (error) {
            console.error('Failed to load page components:', error);
        }
    }
    
    // Helper function to determine the base path
    getBasePath() {
        // Get the current path and determine how many levels deep we are
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(p => p.length > 0);
        
        // Calculate relative path to project root
        // Each folder level needs to go up one directory
        return pathParts.length > 0 ? '../'.repeat(pathParts.length) : './';
    }

    async loadComponent(id, path) {
        try {
            const placeholder = document.getElementById(`${id}-placeholder`);
            if (!placeholder) return;
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
            const html = await response.text();
            placeholder.innerHTML = html;
            this.loadedComponents[id] = true;
            console.log(`Successfully loaded ${id} component`);
            
            // Process scripts in the component
            const scripts = placeholder.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    document.body.appendChild(newScript);
                } else if (script.textContent) {
                    eval(script.textContent);
                }
            });
            
            document.dispatchEvent(new CustomEvent(`${id}Loaded`));
        } catch (error) {
            console.error(`Error loading ${id} component:`, error);
        }
    }
    
    applyTheme() {
        // Apply day theme
        document.body.className = 'day-theme';
        document.body.classList.add('bg-light', 'text-dark');
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.templateLoader = new TemplateLoader();
});
