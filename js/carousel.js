document.addEventListener("DOMContentLoaded", function() {
    fetch('../../data/testimonials.json')
        .then(response => response.json())
        .then(data => {
            const carouselInner = document.getElementById('testimonialCarouselInner');
            data.testimonials.forEach((testimonial, index) => {
                const item = document.createElement('div');
                item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                item.innerHTML = `
                    <div class="testimonial-card text-center p-4">
                        <div class="watermark"></div>
                        <img src="${testimonial.image}" alt="${testimonial.name}" class="rounded-circle mb-3" width="150" height="150">
                        <h3 class="font-weight-bold">${testimonial.name}</h3>
                        <p class="designation">${testimonial.designation}</p>
                        <p>${testimonial.text}</p>
                    </div>
                `;
                carouselInner.appendChild(item);
            });

            // Automatically transition to the next testimonial every 7 seconds
            $('#testimonialCarousel').carousel({
                interval: 7000
            });

            // Ensure forward and backward buttons work correctly
            document.querySelector('.carousel-control-next').addEventListener('click', () => {
                $('#testimonialCarousel').carousel('next');
            });
            document.querySelector('.carousel-control-prev').addEventListener('click', () => {
                $('#testimonialCarousel').carousel('prev');
            });
        });
});
