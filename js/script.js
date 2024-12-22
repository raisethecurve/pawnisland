document.getElementById('brand-toggle').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default action of the link
    toggleTheme(); // Call the toggleTheme function
});

function toggleTheme() {
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');
    const title = document.querySelector('.title');
    const dayLogos = document.querySelectorAll('.day-logo');
    const nightLogos = document.querySelectorAll('.night-logo');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle body classes for day and night themes
    body.classList.toggle('day-theme');
    body.classList.toggle('night-theme');
    body.classList.toggle('bg-light');
    body.classList.toggle('bg-dark');
    body.classList.toggle('text-dark');
    body.classList.toggle('text-white');

    // Toggle navbar classes for day and night themes
    navbar.classList.toggle('navbar-light');
    navbar.classList.toggle('navbar-dark');
    navbar.classList.toggle('bg-light');
    navbar.classList.toggle('bg-dark');

    // Toggle header classes for day and night themes
    header.classList.toggle('bg-light');
    header.classList.toggle('bg-dark');
    header.classList.toggle('text-dark');
    header.classList.toggle('text-white');

    // Toggle footer classes for day and night themes
    footer.classList.toggle('bg-dark');
    footer.classList.toggle('bg-light');
    footer.classList.toggle('text-white');
    footer.classList.toggle('text-dark');

    // Toggle title classes for day and night themes
    title.classList.toggle('text-dark');
    title.classList.toggle('text-white');

    // Toggle section classes for day and night themes
    sections.forEach(section => {
        section.classList.toggle('text-dark');
        section.classList.toggle('text-white');
    });

    // Toggle navbar and social icons logo visibility
    dayLogos.forEach(logo => logo.classList.toggle('d-none'));
    nightLogos.forEach(logo => logo.classList.toggle('d-none'));

    // Toggle nav-link text color for day and night themes
    navLinks.forEach(link => {
        link.classList.toggle('text-dark');
        link.classList.toggle('text-white');
    });
}
