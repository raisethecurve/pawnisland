document.addEventListener('DOMContentLoaded', function() {
    // Create the script element with the exact Setmore source URL
    const script = document.createElement('script');
    script.id = "setmore_script";
    script.type = "text/javascript";
    script.src = "https://assets.setmore.com/integration/static/setmoreIframeLive.js";
    document.head.appendChild(script);
    
    // Create the booking button with enhanced styling
    const bookingButton = document.createElement('a');
    bookingButton.id = "Setmore_button_iframe";
    bookingButton.href = "https://pawnisland.setmore.com";
    bookingButton.style.float = "none";
    bookingButton.style.position = "fixed";
    bookingButton.style.right = "-2px";
    bookingButton.style.top = "30%";
    bookingButton.style.display = "block";
    bookingButton.style.zIndex = "2000"; // Increase z-index to ensure visibility
    bookingButton.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
    bookingButton.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
    bookingButton.style.borderTopLeftRadius = "8px";
    bookingButton.style.borderBottomLeftRadius = "8px";
    bookingButton.style.overflow = "hidden";
    
    // Check if current page is coaching page and adjust position if needed
    if (window.location.pathname.includes('/landing/coaching')) {
        bookingButton.style.top = "40%"; // Position slightly lower on coaching page
    }
    
    // Add hover effect with event listeners
    bookingButton.addEventListener('mouseover', function() {
        bookingButton.style.transform = "translateX(-5px)";
        bookingButton.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
    });
    
    bookingButton.addEventListener('mouseout', function() {
        bookingButton.style.transform = "translateX(0)";
        bookingButton.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
    });
    
    // Create the image element
    const img = document.createElement('img');
    img.border = "none";
    img.src = "https://storage.googleapis.com/full-assets/setmore/images/1.0/Calendar/Setmore-Book-Now.png";
    img.alt = "Book an appointment with Pawn Island using Setmore";
    img.style.display = "block";
    img.style.maxWidth = "100%";
    
    // Append elements
    bookingButton.appendChild(img);
    document.body.appendChild(bookingButton);
    
    console.log('Setmore widget loaded successfully');
});
