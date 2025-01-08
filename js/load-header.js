document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const path = window.location.pathname;
    // Adjust partial path based on directory
    let partialPath = "partials/header.html";
    if (path.includes("/landing/")) partialPath = "../partials/header.html";
    // For index.html in /pages: partialPath remains "partials/header.html"

    fetch(partialPath)
        .then(response => response.text())
        .then(data => {
            // Insert header
            document.getElementById("header-placeholder").innerHTML = data;
            // Setup brand toggle
            const logo = document.querySelector('#brand-toggle');
            const dayLogo = document.querySelector('.day-logo');
            const nightLogo = document.querySelector('.night-logo');
            logo.addEventListener('click', () => {
                const isDayTheme = body.classList.contains('day-theme');
                if (isDayTheme) {
                    body.classList.replace('day-theme', 'night-theme');
                    dayLogo.classList.add('d-none');
                    nightLogo.classList.remove('d-none');
                    document.getElementById('theme-stylesheet').href = body.baseURI.includes('/landing/') 
                        ? '../../css/themes/night/night-theme.css' 
                        : '../css/themes/night/night-theme.css';
                } else {
                    body.classList.replace('night-theme', 'day-theme');
                    nightLogo.classList.add('d-none');
                    dayLogo.classList.remove('d-none');
                    document.getElementById('theme-stylesheet').href = body.baseURI.includes('/landing/') 
                        ? '../../css/themes/day/day-theme.css' 
                        : '../css/themes/day/day-theme.css';
                }
            });
        });
});
