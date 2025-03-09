document.addEventListener("DOMContentLoaded", function() {
    fetch('../../pages/partials/footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch footer: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const footerPlaceholders = document.querySelectorAll('.footer-placeholder');
            if (footerPlaceholders.length === 0) {
                console.warn("No footer placeholder found");
                return;
            }
            
            footerPlaceholders.forEach(placeholder => {
                placeholder.innerHTML = data;
            });
            
            console.log("Footer loaded");
            
            // Dispatch event that footer has been loaded
            document.dispatchEvent(new CustomEvent('footerLoaded'));
            
            // Apply current theme to footer
            const currentTheme = document.body.classList.contains('night-theme') ? 'dark' : 'light';
            updateFooterForTheme(currentTheme === 'dark');
        })
        .catch(error => console.error('Error loading footer:', error));
    
    // Listen for theme changes with more specific handling
    document.addEventListener('themeChanged', function(event) {
        console.log("Footer detected theme change:", event.detail.theme);
        // Use a slight delay to ensure DOM is updated
        setTimeout(() => {
            updateFooterForTheme(event.detail.isDark);
        }, 50);
    });
});

/**
 * Update footer elements based on theme - improved implementation
 */
function updateFooterForTheme(isDark) {
    const footer = document.querySelector('.footer');
    if (!footer) {
        console.warn("Footer not found when trying to update theme");
        return;
    }
    
    // Direct style application instead of using classes
    if (isDark) {
        footer.style.backgroundColor = '#212529';
        footer.style.color = '#ffffff';
    } else {
        footer.style.backgroundColor = '#f8f9fa';
        footer.style.color = '#212529';
    }
    
    // More direct handling of social icons with better logging
    const allDayIcons = footer.querySelectorAll('.social-icon.day-logo');
    const allNightIcons = footer.querySelectorAll('.social-icon.night-logo');
    
    console.log(`Found ${allDayIcons.length} day icons and ${allNightIcons.length} night icons`);
    
    // Use direct style properties instead of classes for more reliable control
    allDayIcons.forEach(icon => {
        icon.style.display = isDark ? 'none' : 'inline-block';
    });
    
    allNightIcons.forEach(icon => {
        icon.style.display = isDark ? 'inline-block' : 'none';
    });
    
    console.log(`Footer updated for ${isDark ? 'dark' : 'light'} theme`);
}