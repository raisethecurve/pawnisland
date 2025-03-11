/**
 * Simple Ad Injector
 * Injects a beautiful static product card from Shopify into the events page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Use configuration from shopify-config.js
    const SHOPIFY_DOMAIN = SHOPIFY_CONFIG.STORE_DOMAIN;
    const STOREFRONT_ACCESS_TOKEN = SHOPIFY_CONFIG.STOREFRONT_ACCESS_TOKEN;
    
    // Initialize the ad card
    const checkEventsInterval = setInterval(() => {
        const eventsContainer = document.getElementById('events-container');
        const eventItems = document.querySelectorAll('.event-item:not(.ad-item)');
        
        if (eventItems.length > 0) {
            clearInterval(checkEventsInterval);
            fetchShopifyProducts().then(products => {
                if (products && products.length > 0) {
                    // Insert product card after every third event
                    insertProductCards(eventsContainer, eventItems, products);
                }
            });
        }
    }, 500);
    
    /**
     * Insert product cards after every third event
     */
    function insertProductCards(container, eventItems, products) {
        const eventsArray = Array.from(eventItems);
        
        // Insert ad after every third event
        for (let i = 2; i < eventsArray.length; i += 3) {
            if (eventsArray[i]) {
                // Select a random product for each insertion point
                const randomProduct = getRandomProduct(products);
                
                // Create and insert the ad
                const adCard = createAdCard(randomProduct);
                eventsArray[i].parentNode.insertBefore(adCard, eventsArray[i].nextSibling);
            }
        }
    }
    
    /**
     * Get a random product, tracking used products to avoid duplicates
     */
    function getRandomProduct(products) {
        // Initialize tracking set if it doesn't exist
        if (!window.usedProductIds) {
            window.usedProductIds = new Set();
            console.log('Initializing product tracking set');
        }
        
        // Log total available products
        console.log(`Total products available: ${products.length}`);
        console.log(`Currently used products: ${window.usedProductIds.size} of ${products.length}`);
        
        // Filter out already used products
        let availableProducts = products.filter(p => !window.usedProductIds.has(p.id));
        
        // If we've used all products or too few remain, reset and allow all products again
        if (availableProducts.length === 0 || availableProducts.length < Math.max(2, Math.floor(products.length * 0.3))) {
            console.log('Resetting product tracking - all products have been used or too few remain');
            window.usedProductIds.clear();
            availableProducts = products;
        }
        
        // Sort by "staleness" - products not shown recently get priority
        if (!window.productLastShown) {
            window.productLastShown = {};
        }
        
        // Pick a random product with weighted randomness favoring products not shown recently
        availableProducts.sort((a, b) => {
            const lastShownA = window.productLastShown[a.id] || 0;
            const lastShownB = window.productLastShown[b.id] || 0;
            return lastShownA - lastShownB; // Older products first
        });
        
        // Take from first 3 products (or all if fewer) to maintain some randomness
        const selectionPool = availableProducts.slice(0, Math.min(3, availableProducts.length));
        const randomIndex = Math.floor(Math.random() * selectionPool.length);
        const selectedProduct = selectionPool[randomIndex];
        
        // Track this product as used
        window.usedProductIds.add(selectedProduct.id);
        window.productLastShown[selectedProduct.id] = Date.now();
        
        console.log(`Selected product: "${selectedProduct.name}" (ID: ${selectedProduct.id})`);
        
        return selectedProduct;
    }
    
    /**
     * Create a beautiful static ad card
     */
    function createAdCard(product) {
        const adCard = document.createElement('div');
        adCard.className = 'col-12 mb-4 event-item ad-item'; // Changed from col-lg-6 to col-12 for full width
        adCard.dataset.aos = 'fade-up';
        
        // Generate unique ID for this card instance
        const cardId = 'product-card-' + Math.random().toString(36).substr(2, 9);
        
        adCard.innerHTML = `
            <div class="premium-product-card horizontal-card" id="${cardId}">
                <div class="card-background"></div>
                
                <div class="card-content horizontal-layout">
                    <div class="product-image-wrapper">
                        <div class="image-container">
                            <img src="${product.images[0]}" alt="${product.name}" class="product-img">
                        </div>
                    </div>
                    
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <a href="${product.url}" class="product-cta" target="_blank">
                            <span class="price-tag">${product.price}</span>
                            <span class="cta-text">Shop Now</span>
                            <span class="cta-icon">
                                <i class="fas fa-arrow-right"></i>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // After adding to DOM, set up image rotation if multiple images exist
        setTimeout(() => {
            if (product.images.length > 1) {
                setupImageRotation(cardId, product.images);
            }
        }, 100);
        
        // Add inline styles to ensure proper layout
        setTimeout(() => {
            const card = document.getElementById(cardId);
            if (card) {
                // Ensure the card uses flexbox for horizontal layout
                const cardContent = card.querySelector('.card-content');
                if (cardContent) {
                    cardContent.style.display = 'flex';
                    cardContent.style.flexDirection = 'row';
                    cardContent.style.alignItems = 'stretch';
                }
                
                // Ensure the image container has proper dimensions
                const imageWrapper = card.querySelector('.product-image-wrapper');
                if (imageWrapper) {
                    imageWrapper.style.flex = '0 0 40%';
                    imageWrapper.style.maxWidth = '40%';
                    imageWrapper.style.display = 'flex';
                    imageWrapper.style.alignItems = 'center';
                    imageWrapper.style.justifyContent = 'center';
                }
                
                // Ensure the product info takes remaining space
                const productInfo = card.querySelector('.product-info');
                if (productInfo) {
                    productInfo.style.flex = '1';
                    productInfo.style.display = 'flex';
                    productInfo.style.flexDirection = 'column';
                    productInfo.style.justifyContent = 'space-between';
                    productInfo.style.padding = '2rem';
                }
                
                // Make image container maintain aspect ratio
                const imageContainer = card.querySelector('.image-container');
                if (imageContainer) {
                    imageContainer.style.height = '100%';
                    imageContainer.style.width = '100%';
                    imageContainer.style.display = 'flex';
                    imageContainer.style.alignItems = 'center';
                    imageContainer.style.justifyContent = 'center';
                    imageContainer.style.overflow = 'hidden';
                }
                
                // Make the image properly sized
                const productImg = card.querySelector('.product-img');
                if (productImg) {
                    productImg.style.width = '100%';
                    productImg.style.height = 'auto';
                    productImg.style.objectFit = 'contain';
                    productImg.style.maxHeight = '220px';
                }
                
                // Style product name with elegant typography
                const productName = card.querySelector('.product-name');
                if (productName) {
                    productName.style.fontSize = '1.6rem';
                    productName.style.fontWeight = '600';
                    productName.style.margin = '0 0 1.5rem';
                    productName.style.lineHeight = '1.3';
                    productName.style.color = '#333';
                    productName.style.fontFamily = "'Cinzel', sans-serif";
                    productName.style.letterSpacing = '-0.01em';
                    // Add text truncation for very long names
                    productName.style.overflow = 'hidden';
                    productName.style.textOverflow = 'ellipsis';
                    productName.style.display = '-webkit-box';
                    productName.style.webkitLineClamp = '2';
                    productName.style.webkitBoxOrient = 'vertical';
                }
                
                // Style the enhanced CTA button with eye-catching styling
                const cta = card.querySelector('.product-cta');
                if (cta) {
                    // Position and basic layout
                    cta.style.marginTop = 'auto';
                    cta.style.alignSelf = 'flex-start';
                    cta.style.display = 'flex';
                    cta.style.alignItems = 'center';
                    cta.style.justifyContent = 'center';
                    cta.style.textDecoration = 'none';
                    cta.style.position = 'relative';
                    cta.style.fontFamily = "'Cinzel', serif"; // Changed to Cinzel font
                    
                    // Base button styling - more prominent and attention-grabbing
                    // Reduced padding by 15% from 0.8rem 1.6rem to 0.68rem 1.36rem
                    cta.style.padding = '0.68rem 1.36rem';
                    cta.style.borderRadius = '50px';
                    cta.style.background = 'linear-gradient(135deg, #dd3649 0%, #c62c3e 100%)';
                    cta.style.color = 'white';
                    cta.style.boxShadow = '0 4px 15px rgba(221, 54, 73, 0.4), 0 2px 5px rgba(221, 54, 73, 0.2)';
                    cta.style.border = 'none';
                    cta.style.overflow = 'hidden';
                    cta.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1.2)';
                    cta.style.transform = 'translateY(0)';
                    
                    // Add subtle "shine" element to the button
                    const shine = document.createElement('div');
                    shine.classList.add('button-shine');
                    shine.style.position = 'absolute';
                    shine.style.top = '0';
                    shine.style.left = '-100%';
                    shine.style.width = '100%';
                    shine.style.height = '100%';
                    shine.style.background = 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)';
                    shine.style.transform = 'skewX(-20deg)';
                    shine.style.transition = 'all 0.7s ease';
                    cta.prepend(shine);
                    
                    // Price tag styling - integrated into button
                    const priceTag = cta.querySelector('.price-tag');
                    if (priceTag) {
                        priceTag.style.fontWeight = '700'; // Adjusted from 800 for Cinzel
                        priceTag.style.fontSize = '1.1rem'; // Reduced from 1.2rem for 15% smaller
                        priceTag.style.marginRight = '1rem';
                        priceTag.style.color = 'white';
                        priceTag.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
                        priceTag.style.transition = 'all 0.3s ease';
                        priceTag.style.position = 'relative';
                        priceTag.style.display = 'inline-block';
                        priceTag.style.fontFamily = "'Cinzel', serif";
                    }
                    
                    // Text styling
                    const ctaText = cta.querySelector('.cta-text');
                    if (ctaText) {
                        ctaText.style.fontSize = '0.9rem'; // Reduced from 1rem for 15% smaller
                        ctaText.style.fontWeight = '500'; // Cinzel is naturally heavier, so reduced from 600
                        ctaText.style.letterSpacing = '0.5px';
                        ctaText.style.textShadow = '0 1px 2px rgba(0,0,0,0.1)';
                        ctaText.style.transition = 'all 0.3s ease';
                        ctaText.style.fontFamily = "'Cinzel', serif";
                    }
                    
                    // Icon styling
                    const ctaIcon = cta.querySelector('.cta-icon');
                    if (ctaIcon) {
                        ctaIcon.style.display = 'flex';
                        ctaIcon.style.alignItems = 'center';
                        ctaIcon.style.justifyContent = 'center';
                        ctaIcon.style.marginLeft = '0.75rem';
                        ctaIcon.style.position = 'relative';
                        ctaIcon.style.transform = 'translateX(0)';
                        ctaIcon.style.transition = 'all 0.3s ease';
                        ctaIcon.style.opacity = '1';
                        
                        // Add inner icon styling
                        const icon = ctaIcon.querySelector('i');
                        if (icon) {
                            icon.style.fontSize = '0.8rem'; // Reduced from 0.9rem
                        }
                    }
                    
                    // Add dramatic hover effects with animation
                    cta.addEventListener('mouseenter', () => {
                        // Enhanced button effect
                        cta.style.transform = 'translateY(-3px)'; // Removed scale effect
                        cta.style.boxShadow = '0 10px 20px rgba(221, 54, 73, 0.45), 0 6px 10px rgba(221, 54, 73, 0.25)';
                        cta.style.background = 'linear-gradient(135deg, #e6394c 0%, #dd3649 100%)';
                        
                        // Trigger shine effect
                        shine.style.left = '100%';
                        
                        // Text animation
                        const text = cta.querySelector('.cta-text');
                        if (text) {
                            text.style.transform = 'scale(1.02)';
                            text.style.fontWeight = '600';
                        }
                        
                        // Price animation
                        const price = cta.querySelector('.price-tag');
                        if (price) {
                            price.style.transform = 'scale(1.05)';
                        }
                        
                        // Arrow animation
                        const icon = cta.querySelector('.cta-icon');
                        if (icon) {
                            icon.style.transform = 'translateX(5px)';
                            // Add slight bouncing animation to the icon
                            setTimeout(() => {
                                if (icon) icon.style.transform = 'translateX(3px)';
                                setTimeout(() => {
                                    if (icon) icon.style.transform = 'translateX(5px)';
                                }, 150);
                            }, 150);
                        }
                    });
                    
                    cta.addEventListener('mouseleave', () => {
                        // Reset to original state
                        cta.style.transform = 'translateY(0)'; // No scale reset needed
                        cta.style.boxShadow = '0 4px 15px rgba(221, 54, 73, 0.4), 0 2px 5px rgba(221, 54, 73, 0.2)';
                        cta.style.background = 'linear-gradient(135deg, #dd3649 0%, #c62c3e 100%)';
                        
                        // Reset shine position
                        shine.style.left = '-100%';
                        
                        // Reset text
                        const text = cta.querySelector('.cta-text');
                        if (text) {
                            text.style.transform = 'scale(1)';
                            text.style.fontWeight = '500'; // Changed from 600 to 500 for Cinzel
                        }
                        
                        // Reset price
                        const price = cta.querySelector('.price-tag');
                        if (price) {
                            price.style.transform = 'scale(1)';
                        }
                        
                        // Reset icon
                        const icon = cta.querySelector('.cta-icon');
                        if (icon) {
                            icon.style.transform = 'translateX(0)';
                        }
                    });
                    
                    // Add focus styles for accessibility
                    cta.addEventListener('focus', () => {
                        cta.style.transform = 'translateY(-2px)'; // Removed scale
                        cta.style.boxShadow = '0 5px 15px rgba(221, 54, 73, 0.4), 0 3px 10px rgba(221, 54, 73, 0.3)';
                        cta.style.outline = '2px solid #fff';
                        cta.style.outlineOffset = '3px';
                    });
                    
                    cta.addEventListener('blur', () => {
                        cta.style.transform = 'translateY(0)'; // No scale reset needed
                        cta.style.boxShadow = '0 4px 15px rgba(221, 54, 73, 0.4), 0 2px 5px rgba(221, 54, 73, 0.2)';
                        cta.style.outline = 'none';
                    });
                    
                    // Clean up pulse animation when card is removed
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (!document.body.contains(cta) && cta.pulseInterval) {
                                clearInterval(cta.pulseInterval);
                                observer.disconnect();
                            }
                        });
                    });
                    
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
            }
        }, 100);
        
        return adCard;
    }
    
    /**
     * Set up rotation between product images
     */
    function setupImageRotation(cardId, images) {
        const card = document.getElementById(cardId);
        if (!card) return;
        
        const imgElement = card.querySelector('.product-img');
        if (!imgElement) return;
        
        let currentIndex = 0;
        
        // Preload all images
        preloadImages(images);
        
        // Function to show next image with enhanced transitions
        function showNextImage() {
            // Calculate next image index
            const nextIndex = (currentIndex + 1) % images.length;
            
            // Start jiggle animation
            imgElement.classList.add('image-jiggle');
            
            // Immediately start loading the next image in the background
            const nextImage = new Image();
            nextImage.src = images[nextIndex];
            
            // After short jiggle (300ms instead of 500ms), start transition sequence
            setTimeout(() => {
                // Remove jiggle class and apply swipe-out animation
                imgElement.classList.remove('image-jiggle');
                imgElement.classList.add('image-swipe-out');
                
                // Start transitioning sooner - after 250ms instead of 350ms
                setTimeout(() => {
                    // Update to next image
                    currentIndex = nextIndex;
                    imgElement.src = images[currentIndex];
                    
                    // Remove swipe-out and add swipe-in immediately
                    imgElement.classList.remove('image-swipe-out');
                    imgElement.classList.add('image-swipe-in');
                    
                    // Clean up animation classes after animation completes
                    setTimeout(() => {
                        imgElement.classList.remove('image-swipe-in');
                    }, 400);
                }, 250);
            }, 300);
        }
        
        /**
         * Preload all images to avoid loading delays during transition
         */
        function preloadImages(imageArray) {
            imageArray.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }
        
        // Set interval to rotate images every 10 seconds
        const rotationInterval = setInterval(showNextImage, 10000);
        
        // Add touch interaction for manual rotation
        card.addEventListener('click', () => {
            clearTimeout(window.nextImageTimeout);
            showNextImage();
            
            // Reset the automatic rotation timer
            clearInterval(rotationInterval);
            window.nextImageTimeout = setTimeout(() => {
                window.rotationInterval = setInterval(showNextImage, 10000);
            }, 10000);
        });
        
        // Clean up interval if the element is removed from DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (!document.body.contains(card)) {
                    clearInterval(rotationInterval);
                    clearTimeout(window.nextImageTimeout);
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Fetch products from Shopify Storefront API
     */
    async function fetchShopifyProducts() {
        try {
            // GraphQL query to fetch products with multiple images
            const query = `{
                products(first: 20) {
                    edges {
                        node {
                            id
                            title
                            handle
                            description
                            priceRange {
                                minVariantPrice {
                                    amount
                                    currencyCode
                                }
                            }
                            images(first: 5) {
                                edges {
                                    node {
                                        originalSrc
                                        altText
                                    }
                                }
                            }
                        }
                    }
                }
            }`;
            
            // Send request to Shopify Storefront API
            const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_CONFIG.API_VERSION}/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
                },
                body: JSON.stringify({ query })
            });
            
            if (!response.ok) {
                throw new Error(`Shopify API request failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Check for errors in the response
            if (data.errors) {
                console.error('Shopify API returned errors:', data.errors);
                return fallbackToStaticProducts();
            }
            
            // Extract and format product data with multiple images
            const products = data.data.products.edges.map(edge => {
                const product = edge.node;
                
                // Extract all images into an array
                const images = product.images.edges.map(img => img.node.originalSrc);
                
                // If no images, use placeholder
                if (images.length === 0) {
                    images.push('https://cdn.shopify.com/s/files/1/0712/3686/2656/files/placeholder-product.jpg');
                }
                
                const price = product.priceRange.minVariantPrice.amount;
                const formattedPrice = `$${parseFloat(price).toFixed(2)}`;
                
                // Create a shorter description
                const fullDescription = product.description || '';
                const description = fullDescription.length > 120 
                    ? fullDescription.substring(0, 120) + '...' 
                    : fullDescription;
                
                return {
                    id: product.id,
                    name: product.title,
                    images: images, // Array of images instead of single image
                    price: formattedPrice,
                    description: description,
                    url: `https://${SHOPIFY_DOMAIN}/products/${product.handle}`
                };
            });
            
            return shuffleArray(products);
        } catch (error) {
            console.error('Error fetching Shopify products:', error);
            return fallbackToStaticProducts();
        }
    }
    
    /**
     * Fallback to static product data if API fails
     */
    function fallbackToStaticProducts() {
        console.log('Using fallback static product data');
        const products = [
            {
                id: 1,
                name: "Pawn Island Signature Chess Set",
                images: [
                    "https://cdn.shopify.com/s/files/1/0712/3686/2656/files/pawn-island-chess-set.jpg",
                    "https://cdn.shopify.com/s/files/1/0712/3686/2656/files/pawn-island-chess-set-2.jpg"
                ],
                price: "$79.99",
                description: "Our signature chess set featuring custom Pawn Island designs.",
                url: "https://pawnisland.myshopify.com/collections/chess-sets"
            },
            {
                id: 2,
                name: "Pawn Island Logo T-Shirt",
                images: [
                    "https://cdn.shopify.com/s/files/1/0712/3686/2656/files/pawn-island-tshirt.jpg",
                    "https://cdn.shopify.com/s/files/1/0712/3686/2656/files/pawn-island-tshirt-back.jpg"
                ],
                price: "$24.99",
                description: "Premium cotton t-shirt featuring our classic logo.",
                url: "https://pawnisland.myshopify.com/collections/apparel"
            },
            {
                id: 3,
                name: "Tournament Chess Clock",
                images: [
                    "https://cdn.shopify.com/s/files/1/0712/3686/2656/files/chess-clock.jpg"
                ],
                price: "$34.99",
                description: "Professional-grade chess clock for tournament play.",
                url: "https://pawnisland.myshopify.com/collections/accessories"
            },
            {
                id: 4,
                name: "Pawn Island Chess Book Collection",
                images: [
                    "https://cdn.shopify.com/s/files/1/0712/3686/2656/files/chess-books.jpg"
                ],
                price: "$49.99",
                description: "Curated collection of chess books for players of all levels.",
                url: "https://pawnisland.myshopify.com/collections/books"
            },
            {
                id: 5,
                name: "Chess Analysis Notebook",
                images: [
                    "https://cdn.shopify.com/s/files/1/0712/3686/2656/files/analysis-notebook.jpg"
                ],
                price: "$18.99",
                description: "Specially designed notebook for analyzing your chess games.",
                url: "https://pawnisland.myshopify.com/collections/accessories"
            }
        ];
        console.log(`Fallback products available: ${products.length}`);
        // Deep clone the array to ensure ID consistency between calls
        return shuffleArray(JSON.parse(JSON.stringify(products)));
    }
    
    /**
     * Shuffle array elements using Fisher-Yates algorithm
     */
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
});
