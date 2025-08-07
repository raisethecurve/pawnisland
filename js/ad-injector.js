/**
 * Enhanced Ad Injector for Clearinghouse Page
 * 
 * Features:
 * - Ensures minimum of 1 ad when events are present
 * - Maximum of 1 ad every 3 event cards
 * - Intelligent positioning based on visible events
 * - Adaptive to filter changes for fluid user experience
 * - Respects accessibility and performance guidelines
 */
document.addEventListener('DOMContentLoaded', function() {
    // Use configuration from shopify-config.js
    const SHOPIFY_DOMAIN = SHOPIFY_CONFIG.STORE_DOMAIN;
    const STOREFRONT_ACCESS_TOKEN = SHOPIFY_CONFIG.STOREFRONT_ACCESS_TOKEN;
    
    // Config
    const AD_INSERTION_INTERVAL = 3; // Show an ad after every N events (when visible)
    const INITIAL_LOAD_DELAY = 1000; // Wait for events to load
    const OBSERVER_THROTTLE = 300; // Milliseconds to wait before handling DOM changes
    
    // Track ad state
    let productsCache = null;
    let throttleTimer = null;
    let filterChangeObserver = null;
    
    // Initialize the ad injection system
    setTimeout(() => {
        initAdSystem();
    }, INITIAL_LOAD_DELAY);
    
    /**
     * Initialize the ad system - fetch products and set up observers
     */
    async function initAdSystem() {
        // Get event container
        const eventsContainer = document.getElementById('events-container');
        if (!eventsContainer) {
            console.warn('Ad Injector: Events container not found');
            return;
        }
        
        // Fetch products only once and cache them
        if (!productsCache) {
            try {
                productsCache = await fetchShopifyProducts();
                if (!productsCache || productsCache.length === 0) {
                    console.warn('Ad Injector: No products available');
                    return;
                }
            } catch (error) {
                console.error('Ad Injector: Failed to fetch products', error);
                return;
            }
        }
        
        // Initial injection of ads
        positionAdsBasedOnVisibleEvents();
        
        // Set up observers for filter changes and DOM mutations
        setupFilterObserver();
        setupMutationObserver(eventsContainer);
        
        console.log('Ad Injector: System initialized');
    }
    
    /**
     * Set up observer for the filter state changes
     */
    function setupFilterObserver() {
        // Listen for custom event from filter system
        document.addEventListener('filterStateChanged', function(event) {
            console.log('Ad Injector: Filter state changed, repositioning ads');
            // Wait a moment for the DOM to update after filter changes
            setTimeout(() => {
                positionAdsBasedOnVisibleEvents();
            }, 300);
        });
        
        // For backward compatibility, also watch for click events on filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn, .organizer-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Throttle to prevent multiple rapid executions
                if (throttleTimer) clearTimeout(throttleTimer);
                throttleTimer = setTimeout(() => {
                    console.log('Ad Injector: Filter button clicked, will reposition ads');
                    setTimeout(() => positionAdsBasedOnVisibleEvents(), 350);
                }, OBSERVER_THROTTLE);
            });
        });
    }
    
    /**
     * Set up mutation observer to detect when events are added or removed
     */
    function setupMutationObserver(container) {
        if (filterChangeObserver) {
            filterChangeObserver.disconnect();
        }
        
        filterChangeObserver = new MutationObserver(function(mutations) {
            // Throttle to prevent multiple rapid executions
            if (throttleTimer) clearTimeout(throttleTimer);
            throttleTimer = setTimeout(() => {
                // Check if the mutations affected event visibility
                const visibilityChanged = mutations.some(mutation => {
                    return Array.from(mutation.addedNodes).some(node => 
                        node.classList && node.classList.contains('event-item')) ||
                    Array.from(mutation.removedNodes).some(node => 
                        node.classList && node.classList.contains('event-item')) ||
                    Array.from(mutation.target.querySelectorAll('.event-item')).some(el => 
                        mutation.attributeName === 'style' && 
                        (el.style.display === 'none' || el.style.display === 'block'));
                });
                
                if (visibilityChanged) {
                    console.log('Ad Injector: Event visibility changed, repositioning ads');
                    positionAdsBasedOnVisibleEvents();
                }
            }, OBSERVER_THROTTLE);
        });
        
        filterChangeObserver.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }
    
    /**
     * Reposition ads based on currently visible events
     */
    function positionAdsBasedOnVisibleEvents() {
        // Remove existing ads first
        removeExistingAds();
        
        // Get visible events (excluding ads)
        const visibleEvents = Array.from(
            document.querySelectorAll('.event-item:not(.ad-item)')
        ).filter(event => {
            const style = window.getComputedStyle(event);
            return style.display !== 'none' && style.opacity !== '0';
        });
        
        // If no visible events, don't add ads
        if (visibleEvents.length === 0) {
            console.log('Ad Injector: No visible events found, skipping ad insertion');
            return;
        }
        
        console.log(`Ad Injector: Found ${visibleEvents.length} visible events`);
        
        // Debug logging for testing
        console.log('Ad Injector Debug:', {
            totalEvents: visibleEvents.length,
            adInterval: AD_INSERTION_INTERVAL,
            expectedAdPositions: visibleEvents.length > 0 ? 
                Math.max(1, Math.floor(visibleEvents.length / AD_INSERTION_INTERVAL)) : 0
        });
        
        // Calculate insertion points - ensure minimum of 1 ad, maximum of 1 ad every 3 events
        const insertionPoints = [];
        
        // Ensure we always have at least one ad if there are events
        if (visibleEvents.length >= 1) {
            // For 1-2 events: place ad after the last event
            if (visibleEvents.length <= 2) {
                insertionPoints.push(visibleEvents[visibleEvents.length - 1]);
            } else {
                // For 3+ events: place ads after every 3rd event, starting from the 3rd
                for (let i = AD_INSERTION_INTERVAL - 1; i < visibleEvents.length; i += AD_INSERTION_INTERVAL) {
                    insertionPoints.push(visibleEvents[i]);
                }
                
                // If the last ad isn't close to the end, add one more ad after the last event
                const lastInsertionIndex = insertionPoints.length > 0 
                    ? visibleEvents.indexOf(insertionPoints[insertionPoints.length - 1])
                    : -1;
                const lastEventIndex = visibleEvents.length - 1;
                
                // Add a final ad if there are at least 2 events after the last ad position
                if (lastEventIndex - lastInsertionIndex >= 2) {
                    insertionPoints.push(visibleEvents[lastEventIndex]);
                }
            }
        }
        
        console.log(`Ad Injector: Will insert ads at ${insertionPoints.length} positions`);
        
        // Insert ads at calculated positions
        if (insertionPoints.length > 0) {
            insertAdsAtPositions(insertionPoints);
        }
    }
    
    /**
     * Remove all existing ad cards
     */
    function removeExistingAds() {
        const existingAds = document.querySelectorAll('.event-item.ad-item');
        existingAds.forEach(ad => ad.parentNode.removeChild(ad));
        console.log(`Ad Injector: Removed ${existingAds.length} existing ads`);
    }
    
    /**
     * Insert ads after specified event elements
     */
    function insertAdsAtPositions(eventElements) {
        if (!productsCache || productsCache.length === 0) {
            console.warn('Ad Injector: No products available for insertion');
            return;
        }
        
        console.log(`Ad Injector: Inserting ads at ${eventElements.length} positions`);
        
        // Insert ad after each specified event
        eventElements.forEach((event, index) => {
            // Get a product for this position, avoiding duplicates when possible
            const product = getRandomProduct(productsCache);
            
            // Create and insert the ad
            const adCard = createAdCard(product);
            
            // Add custom attribute to track insertion order for debugging
            adCard.dataset.adPosition = index + 1;
            
            // Insert after the event
            event.parentNode.insertBefore(adCard, event.nextSibling);
        });
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
        // Changed the condition to be more lenient - reset when we've used 70% of products
        if (availableProducts.length === 0 || availableProducts.length <= Math.floor(products.length * 0.3)) {
            console.log('Resetting product tracking - all products have been used or too few remain');
            window.usedProductIds.clear();
            availableProducts = products;
        }
        
        // If for some reason we still have no products, use emergency fallback
        if (availableProducts.length === 0) {
            console.error('Critical error: No products available even after reset');
            // Create an emergency product as last resort
            return createEmergencyProduct();
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
     * Emergency fallback to create a product when all else fails
     */
    function createEmergencyProduct() {
        // Generate a random ID to avoid overwriting existing products
        const randomId = 'emergency-' + Math.random().toString(36).substr(2, 9);
        
        return {
            id: randomId,
            name: "Chess Equipment & Supplies",
            images: [
                "https://cdn.shopify.com/s/files/1/0712/3686/2656/files/chess-equipment.jpg",
                "https://cdn.shopify.com/s/files/1/0712/3686/2656/files/chess-supplies.jpg"
            ],
            price: "$29.99",
            description: "Essential chess equipment for players of all levels.",
            url: `https://${SHOPIFY_DOMAIN}/collections/all`
        };
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
                console.error(`Shopify API request failed with status: ${response.status}`);
                return fallbackToStaticProducts();
            }
            
            const data = await response.json();
            
            // Check for errors in the response
            if (data.errors) {
                console.error('Shopify API returned errors:', data.errors);
                return fallbackToStaticProducts();
            }
            
            // Check if we got a valid products array
            if (!data.data?.products?.edges || !Array.isArray(data.data.products.edges)) {
                console.error('Shopify API returned unexpected data structure:', data);
                return fallbackToStaticProducts();
            }
            
            // Extract and format product data with multiple images
            const products = data.data.products.edges.map(edge => {
                const product = edge.node;
                
                // Extract all images into an array
                const images = product.images?.edges?.map(img => img.node.originalSrc) || [];
                
                // If no images, use placeholder
                if (images.length === 0) {
                    images.push('https://cdn.shopify.com/s/files/1/0712/3686/2656/files/placeholder-product.jpg');
                }
                
                const price = product.priceRange?.minVariantPrice?.amount || "0.00";
                const formattedPrice = `$${parseFloat(price).toFixed(2)}`;
                
                // Create a shorter description
                const fullDescription = product.description || '';
                const description = fullDescription.length > 120 
                    ? fullDescription.substring(0, 120) + '...' 
                    : fullDescription;
                
                return {
                    id: product.id || `product-${Math.random().toString(36).substring(2, 11)}`,
                    name: product.title || "Chess Product",
                    images: images, // Array of images instead of single image
                    price: formattedPrice,
                    description: description,
                    url: `https://${SHOPIFY_DOMAIN}/products/${product.handle || "all"}`
                };
            });
            
            // Add some error checking if products array is empty
            if (products.length === 0) {
                console.warn('No products returned from Shopify API');
                return fallbackToStaticProducts();
            }
            
            console.log(`Successfully fetched ${products.length} products from Shopify`);
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
    
    // Expose refresh method for external use and debugging
    window.adInjector = {
        refreshAds: positionAdsBasedOnVisibleEvents,
        getStats: function() {
            const visibleEvents = Array.from(
                document.querySelectorAll('.event-item:not(.ad-item)')
            ).filter(event => {
                const style = window.getComputedStyle(event);
                return style.display !== 'none' && style.opacity !== '0';
            });
            const adCount = document.querySelectorAll('.event-item.ad-item').length;
            
            return {
                visibleEvents: visibleEvents.length,
                currentAds: adCount,
                adInterval: AD_INSERTION_INTERVAL,
                productsAvailable: productsCache ? productsCache.length : 0
            };
        }
    };
});
