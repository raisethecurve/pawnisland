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
        })
        .catch(error => console.error('Error loading footer:', error));
});

/**
 * Update footer elements
 */
function updateFooterForTheme() {
    const footer = document.querySelector('.footer');
    if (!footer) {
        console.warn("Footer not found when trying to update");
        return;
    }
    
    // Apply light theme styling
    footer.style.backgroundColor = '#f8f9fa';
    footer.style.color = '#212529';
    
    // Show day logos only
    const allDayIcons = footer.querySelectorAll('.social-icon.day-logo');
    const allNightIcons = footer.querySelectorAll('.social-icon.night-logo');
    
    console.log(`Found ${allDayIcons.length} day icons and ${allNightIcons.length} night icons`);
    
    // Use direct style properties
    allDayIcons.forEach(icon => {
        icon.style.display = 'inline-block';
    });
    
    allNightIcons.forEach(icon => {
        icon.style.display = 'none';
    });
    
    console.log('Footer updated for light theme');
}