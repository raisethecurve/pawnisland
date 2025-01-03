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
                        <img src="${testimonial.image}" alt="${testimonial.name}">
                        <h3>${testimonial.name}</h3>
                        <p>${testimonial.text}</p>
                    </div>
                `;
                carouselInner.appendChild(item);
            });

            // Automatically transition to the next testimonial every 7 seconds
            const carouselInterval = setInterval(() => {
                $('#testimonialCarousel').carousel('next');
            }, 7000);

            let isPaused = false;

            const carousel = document.getElementById('testimonialCarousel');
            carousel.addEventListener('click', () => {
                if (isPaused) {
                    $('#testimonialCarousel').carousel('cycle');
                } else {
                    $('#testimonialCarousel').carousel('pause');
                }
                isPaused = !isPaused;
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
