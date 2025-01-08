document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    // Determine the relative path to footer.html
    let footerPath = "partials/footer.html";
    if (path.includes("/landing/")) footerPath = "../partials/footer.html";
    // For index.html in /pages: footerPath remains "partials/footer.html"

    fetch(footerPath)
        .then(response => response.text())
        .then(data => {
            // Insert footer
            document.getElementById("footer-placeholder").innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
});
