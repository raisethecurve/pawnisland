document.addEventListener("DOMContentLoaded", function() {
    fetch('../../pages/partials/footer.html')
        .then(response => response.text())
        .then(data => {
            const footerPlaceholders = document.querySelectorAll('.footer-placeholder');
            footerPlaceholders.forEach(placeholder => {
                placeholder.innerHTML = data;
            });
        })
        .catch(error => console.error('Error loading footer:', error));
});