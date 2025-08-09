/**
 * Enhanced Ad Injector for Clearinghouse Page
 * 
 * Features:
 * - Visual parity with event cards using identical styling patterns
 * - Responsive design matching event card layouts
 * - Shopify Storefront API integration with smart product rotation
 * - Intelligent injection logic (min 1 ad when events present, max 1 per 3 events)
 * - Performance optimized with minimal render shift
 * - Maintains filter compatibility and accessibility
 * 
 * @author Pawn Island Academy
 * @version 2.0.0
 */

class EnhancedAdInjector {
    constructor() {
        // Optimized Configuration
        this.config = {
            INJECTION_INTERVAL: 3,          // Insert ad after every 3 visible events
            INITIAL_LOAD_DELAY: 800,        // Reduced delay for faster initialization
            OBSERVER_THROTTLE: 200,         // Faster response to changes
            IMAGE_ROTATION_INTERVAL: 25000, // Slightly faster rotation
            MAX_PRODUCTS_CACHE: 30,         // Reduced cache size for better performance
            DISABLE_AUTO_ROTATION: true,    // Keep manual rotation only
            MIN_EVENTS_FOR_AD: 2,          // Minimum events before showing ads
            MAX_ADS_PER_SESSION: 3         // Limit ads to prevent oversaturation
        };

        // Enhanced State management
        this.state = {
            productsCache: null,
            usedProductIds: new Set(),
            productLastShown: {},
            throttleTimer: null,
            filterChangeObserver: null,
            injectedAds: new Map(),
            isInitialized: false,
            lastEventCount: 0,
            injectionHistory: []
        };

        // Shopify configuration (guard if SHOPIFY_CONFIG missing)
        const hasShopify = (typeof SHOPIFY_CONFIG !== 'undefined');
        this.shopify = hasShopify ? {
            domain: SHOPIFY_CONFIG.STORE_DOMAIN,
            token: SHOPIFY_CONFIG.STOREFRONT_ACCESS_TOKEN,
            apiVersion: SHOPIFY_CONFIG.API_VERSION
        } : {
            domain: 'pawnisland.myshopify.com',
            token: '',
            apiVersion: '2023-01'
        };

        this.init();
    }

    /**
     * Initialize the ad injection system
     */
    async init() {
    try {
            console.log('Enhanced Ad Injector: Initializing...');
            
            // Wait for events to load
            await this.waitForEvents();
            
            // Fetch and cache products
            await this.loadProducts();
            
            // Setup observers and listeners
            this.setupEventListeners();
            
            // Initial ad injection
            this.injectAds();
            
            this.state.isInitialized = true;
            console.log('Enhanced Ad Injector: Successfully initialized');
        } catch (error) {
            console.error('Enhanced Ad Injector: Initialization failed', error);
        }
    }

    /**
     * Wait for events to be loaded in the DOM
     */
    waitForEvents() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // Wait up to 5 seconds
            
            const checkEvents = () => {
                const eventsContainer = document.getElementById('events-container');
                const events = document.querySelectorAll('.event-item:not(.promo-item)');
                
                console.log(`Enhanced Ad Injector: Checking for events (attempt ${attempts + 1}), found ${events.length} events`);
                
                if (eventsContainer && events.length > 0) {
                    console.log('Enhanced Ad Injector: Events found, proceeding with initialization');
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    console.warn('Enhanced Ad Injector: Timeout waiting for events, proceeding anyway');
                    resolve(false);
                } else {
                    attempts++;
                    setTimeout(checkEvents, 100);
                }
            };
            
            // Start checking immediately, no initial delay
            checkEvents();
        });
    }

    /**
     * Load products from Shopify API
     */
    async loadProducts() {
    if (this.state.productsCache) return;

        console.log('Enhanced Ad Injector: Loading products from Shopify...');

        try {
            // Quick health check to surface token/CORS issues early
            await this.verifyStorefrontAccess();
            let products = [];
            if (this.shopify && this.shopify.token) {
                products = await this.fetchShopifyProducts();
            } else {
                console.warn('Enhanced Ad Injector: SHOPIFY token missing, skipping API call');
            }
            
            if (products && products.length > 0) {
                // Shuffle once per visitor session for random order independent of cache
                this.state.productsCache = this.shuffleArray(products);
                console.log(`Enhanced Ad Injector: Loaded ${products.length} products from Shopify`);
            } else {
                throw new Error('No products returned from Shopify API');
            }
        } catch (error) {
            console.error('Enhanced Ad Injector: Failed to load products from Shopify:', error);
            // Do not use fictional fallback products; disable ads when products are unavailable
            this.state.productsCache = [];
            console.warn('Enhanced Ad Injector: No Shopify products available; ads will not be shown.');
        }
        
        // Ensure we always have products
        // If none available, leave empty to prevent ad injection
    }

    /**
     * Verify Storefront API is reachable with current token
     */
    async verifyStorefrontAccess() {
        const apiVersions = Array.from(new Set([
            this.shopify.apiVersion,
            '2025-04', '2024-10', '2024-07'
        ])).filter(Boolean);

        const probeQuery = `query { shop { name primaryDomain { url } } }`;
        let lastErr = null;
        for (const ver of apiVersions) {
            try {
                const url = `https://${this.shopify.domain}/api/${ver}/graphql.json`;
                const resp = await fetch(url, {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Shopify-Storefront-Access-Token': this.shopify.token
                    },
                    body: JSON.stringify({ query: probeQuery })
                });
                const text = await resp.text();
                if (!resp.ok) throw new Error(`Health check HTTP ${resp.status}: ${text.slice(0, 300)}`);
                const data = JSON.parse(text);
                if (data.errors) throw new Error(`Health check GraphQL errors: ${JSON.stringify(data.errors).slice(0, 300)}`);
                console.log(`Enhanced Ad Injector: Storefront access OK via API ${ver} (${data?.data?.shop?.name || 'unknown shop'})`);
                this.shopify.apiVersion = ver;
                return true;
            } catch (e) {
                console.warn('Enhanced Ad Injector: Storefront health check failed:', e);
                lastErr = e;
            }
        }
        throw lastErr || new Error('Storefront health check failed');
    }

    /**
     * Fetch products from Shopify Storefront API
     */
    async fetchShopifyProducts() {
        // Two query variants: modern first, then legacy fallback
        const modernQuery = `{
            products(first: ${this.config.MAX_PRODUCTS_CACHE}) {
                edges {
                    node {
                        id
                        title
                        handle
                        description
                        priceRange { minVariantPrice { amount currencyCode } }
                        images(first: 5) { edges { node { url altText } } }
                    }
                }
            }
        }`;

        const legacyQuery = `{
            products(first: ${this.config.MAX_PRODUCTS_CACHE}) {
                edges {
                    node {
                        id
                        title
                        handle
                        description
                        priceRange { minVariantPrice { amount currencyCode } }
                        images(first: 5) { edges { node { originalSrc altText } } }
                    }
                }
            }
        }`;

        const candidateApiVersions = Array.from(new Set([
            this.shopify.apiVersion,
            '2025-04', '2024-10', '2024-07'
        ])).filter(Boolean);

        let lastError = null;

        for (const apiVersion of candidateApiVersions) {
            for (const query of [modernQuery, legacyQuery]) {
                try {
                    const url = `https://${this.shopify.domain}/api/${apiVersion}/graphql.json`;
                    const response = await fetch(url, {
                        method: 'POST',
                        mode: 'cors',
                        cache: 'no-store',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Shopify-Storefront-Access-Token': this.shopify.token
                        },
                        body: JSON.stringify({ query })
                    });

                    const raw = await response.text();
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${raw.slice(0, 500)}`);
                    }

                    let data;
                    try { data = JSON.parse(raw); } catch (e) {
                        throw new Error(`Non-JSON response: ${raw.slice(0, 500)}`);
                    }
                    if (data.errors) {
                        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
                    }

                    const productsConnection = data?.data?.products;
                    if (!productsConnection) {
                        throw new Error('No products field in response');
                    }

                    const edges = productsConnection.edges || [];
                    const products = this.processShopifyProducts(edges);
                    if (products && products.length > 0) {
                        console.log(`Enhanced Ad Injector: Loaded ${products.length} products via API ${apiVersion} (${query === modernQuery ? 'modern' : 'legacy'} query)`);
                        // Update version to working one for future calls
                        this.shopify.apiVersion = apiVersion;
                        return products;
                    } else {
                        lastError = new Error('No usable products in response');
                    }
                } catch (err) {
                    console.warn(`Enhanced Ad Injector: Shopify fetch attempt failed (API ${apiVersion}, ${query === modernQuery ? 'modern' : 'legacy'}):`, err);
                    lastError = err;
                    // Continue to next query/version
                }
            }
        }

        throw lastError || new Error('Unable to fetch Shopify products');
    }

    /**
     * Process Shopify API response into usable product data
     */
    processShopifyProducts(productEdges) {
        return productEdges.map(edge => {
            const product = edge.node;
            let images = [];
            try {
                const imageNodes = (product.images?.edges || []).map(e => e.node) || [];
                images = imageNodes.map(n => n.url || n.originalSrc).filter(Boolean);
            } catch (e) {
                images = [];
            }
            
            if (images.length === 0) {
                images.push('/images/brand-icons/logo-light.png'); // Fallback image
            }

            const price = parseFloat(product.priceRange?.minVariantPrice?.amount || 0);
            const formattedPrice = `$${price.toFixed(2)}`;

            return {
                id: product.id,
                name: product.title || 'Chess Product',
                images: images,
                price: formattedPrice,
                description: this.truncateDescription(product.description || 'Quality chess product'),
                url: `https://${this.shopify.domain}/products/${product.handle}`
            };
        }).filter(product => product.name && product.images.length > 0);
    }

    /**
     * Truncate product description to reasonable length
     */
    truncateDescription(description, maxLength = 100) {
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength).trim() + '...';
    }

    // Removed fallback products to ensure only real Shopify products appear

    /**
     * Shuffle an array using crypto-backed randomness when available
     */
    shuffleArray(arr) {
        const a = Array.isArray(arr) ? arr.slice() : [];
        const rng = () => {
            if (window.crypto && window.crypto.getRandomValues) {
                const buf = new Uint32Array(1);
                window.crypto.getRandomValues(buf);
                return buf[0] / 0x100000000; // [0,1)
            }
            return Math.random();
        };
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /**
     * Setup event listeners and observers
     */
    setupEventListeners() {
        // Listen for filter changes
        document.addEventListener('filterStateChanged', () => {
            this.scheduleAdInjection();
        });

        // Setup mutation observer for DOM changes
        this.setupMutationObserver();

        // Listen for organizer filter changes
        const organizerButtons = document.querySelectorAll('.organizer-btn');
        organizerButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.scheduleAdInjection();
            });
        });
    }

    /**
     * Setup mutation observer to detect event visibility changes
     */
    setupMutationObserver() {
        const eventsContainer = document.getElementById('events-container');
        if (!eventsContainer) return;

        if (this.state.filterChangeObserver) {
            this.state.filterChangeObserver.disconnect();
        }

    this.state.filterChangeObserver = new MutationObserver((mutations) => {
            const hasRelevantChanges = mutations.some(mutation => {
                // Check for event items being added/removed or style changes
                return Array.from(mutation.addedNodes).some(node => 
                    node.classList?.contains('event-item')) ||
                Array.from(mutation.removedNodes).some(node => 
                    node.classList?.contains('event-item')) ||
    (mutation.type === 'attributes' && 
     (mutation.attributeName === 'style') &&
     mutation.target.classList?.contains('event-item'));
            });

            if (hasRelevantChanges) {
                this.scheduleAdInjection();
            }
        });

        this.state.filterChangeObserver.observe(eventsContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    /**
     * Schedule ad injection with throttling
     */
    scheduleAdInjection() {
        if (this.state.throttleTimer) {
            clearTimeout(this.state.throttleTimer);
        }

        this.state.throttleTimer = setTimeout(() => {
            const currentVisibleEvents = this.getVisibleEvents().length;
            const currentAds = document.querySelectorAll('.event-item.promo-item').length;
            const expectedAds = this.calculateExpectedAdCount(currentVisibleEvents);
            // Only inject when mismatch or none present
            if (currentVisibleEvents === 0 && currentAds > 0) {
                this.injectAds();
                return;
            }
            if (currentAds !== expectedAds || currentAds === 0) {
                this.injectAds();
            }
        }, this.config.OBSERVER_THROTTLE);
    }

    /**
     * Enhanced ad injection calculation with better positioning
     */
    calculateExpectedAdCount(eventCount) {
        // Strict rule: 0 if no events, otherwise floor(n/3) with minimum of 1
        if (eventCount <= 0) return 0;
        const computed = Math.floor(eventCount / this.config.INJECTION_INTERVAL);
        return Math.max(1, computed);
    }

    /**
     * Improved injection positioning with better spacing
     */
    calculateInjectionPositions(visibleEvents) {
        const positions = [];
        const eventCount = visibleEvents.length;
        const adCount = this.calculateExpectedAdCount(eventCount);

        if (adCount === 0) return positions;

        // After every 3 cards: indexes 2, 5, 8, ... respecting bounds
        for (let i = 1; i <= adCount; i++) {
            const idx = Math.min(i * this.config.INJECTION_INTERVAL - 1, eventCount - 1);
            positions.push(visibleEvents[idx]);
        }

        return positions;
    }

    /**
     * Enhanced main ad injection logic with performance optimizations
     */
    injectAds() {
        console.log('Enhanced Ad Injector: Starting optimized ad injection...');
        
        if (!this.state.productsCache || this.state.productsCache.length === 0) {
            console.warn('Enhanced Ad Injector: No Shopify products available — skipping ad injection');
            this.removeExistingAds();
            return;
        }

        const visibleEvents = this.getVisibleEvents();
        
        console.log(`Enhanced Ad Injector: Found ${visibleEvents.length} visible events`);
        
        this.state.lastEventCount = visibleEvents.length;
        
        if (visibleEvents.length === 0) {
            console.log('Enhanced Ad Injector: No visible events, removing any existing ads');
            this.removeExistingAds();
            return;
        }

        const expectedAdCount = this.calculateExpectedAdCount(visibleEvents.length);
        
        if (expectedAdCount === 0) {
            console.log('Enhanced Ad Injector: Not enough events for ads, removing existing ads');
            this.removeExistingAds();
            return;
        }

        // If already correctly positioned, skip to prevent product thrash
        if (this.areAdsInExpectedPositions && this.areAdsInExpectedPositions(visibleEvents)) {
            console.log('Enhanced Ad Injector: Ads already in correct positions, skipping');
            return;
        }

        // Remove existing ads before injecting new ones
        this.removeExistingAds();

    // Calculate injection positions using strict every-3 rule
        const injectionPositions = this.calculateInjectionPositions(visibleEvents);
        
        console.log(`Enhanced Ad Injector: Will inject ${injectionPositions.length} ads for ${visibleEvents.length} events`);

        // Inject ads at calculated positions
        this.insertAdsAtPositions(injectionPositions);
        
        // Track injection history
        this.state.injectionHistory.push({
            timestamp: Date.now(),
            eventCount: visibleEvents.length,
            adCount: injectionPositions.length
        });
        this.state.lastInjectionAt = Date.now();
        
        console.log('Enhanced Ad Injector: Ad injection completed successfully');
    }

    /**
     * Verify existing ads sit after each expected 3rd event card
     */
    areAdsInExpectedPositions(visibleEvents) {
        const expectedTargets = this.calculateInjectionPositions(visibleEvents);
        const existingAds = Array.from(document.querySelectorAll('.event-item.promo-item'));
        if (existingAds.length !== expectedTargets.length) return false;
        for (const target of expectedTargets) {
            const sib = target.nextElementSibling;
            if (!sib || !sib.classList.contains('promo-item')) return false;
        }
        return true;
    }

    /**
     * Check if existing ads are properly positioned
     */
    areAdsProperlyPositioned(visibleEvents, existingAds) {
        if (existingAds.length === 0) return false;
        
        // Simple check: if we have the right number of ads, assume they're positioned correctly
        // This prevents unnecessary re-injection cycles
        const expectedCount = this.calculateExpectedAdCount(visibleEvents.length);
        return existingAds.length === expectedCount;
    }

    /**
     * Get currently visible event elements
     */
    getVisibleEvents() {
    return Array.from(document.querySelectorAll('.event-item:not(.promo-item)'))
            .filter(event => {
                const style = window.getComputedStyle(event);
                // Consider elements visible if not display:none and not visibility:hidden.
                // Do NOT gate on opacity due to AOS setting opacity:0 before animation.
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
    }

    /**
     * Remove the old injection positioning logic
     */

    /**
     * Remove all existing ad cards
     */
    removeExistingAds() {
    const existingAds = document.querySelectorAll('.event-item.promo-item');
        existingAds.forEach(ad => {
            if (ad.parentNode) {
                ad.parentNode.removeChild(ad);
            }
        });
        
        this.state.injectedAds.clear();
        console.log(`Enhanced Ad Injector: Removed ${existingAds.length} existing ads`);
    }

    /**
     * Insert ads at specified positions
     */
    insertAdsAtPositions(eventElements) {
        if (!eventElements || eventElements.length === 0) return;
        // Build a randomized pool for this injection pass
        let pool = this.shuffleArray(this.state.productsCache || []);
        if (pool.length === 0) return;
        let cursor = 0;

        eventElements.forEach((event, index) => {
            if (cursor >= pool.length) {
                pool = this.shuffleArray(pool);
                cursor = 0;
            }
            const product = pool[cursor++];
            if (!product) return;

            const adCard = this.createAdCard(product, index);
            event.parentNode.insertBefore(adCard, event.nextSibling);
            this.state.injectedAds.set(adCard, {
                product,
                position: index,
                insertedAfter: event
            });
        });
    }

    /**
     * Select a product for injection with smart rotation
     */
    selectProduct(positionIndex = 0) {
        // Randomized selection; kept for potential external calls
        const products = this.state.productsCache;
        if (!products || products.length === 0) return null;
        const shuffled = this.shuffleArray(products);
        return shuffled[0];
    }

    /**
     * Select random product from given array
     */
    selectRandomProduct(products) {
        if (products.length === 0) return null;

        // Weight selection towards less recently shown products
        const weightedProducts = products.sort((a, b) => {
            const lastShownA = this.state.productLastShown[a.id] || 0;
            const lastShownB = this.state.productLastShown[b.id] || 0;
            return lastShownA - lastShownB;
        });

        // Select from top 3 candidates for some randomness
        const candidates = weightedProducts.slice(0, Math.min(3, weightedProducts.length));
        const selected = candidates[Math.floor(Math.random() * candidates.length)];

        // Track usage
        this.state.usedProductIds.add(selected.id);
        this.state.productLastShown[selected.id] = Date.now();

        return selected;
    }

    /**
     * Create ad card that matches event card styling
     */
    createAdCard(product, index) {
        if (!product) return null;

        const adCard = document.createElement('div');
    adCard.className = 'col-12 event-item promo-item';
        
        // Apply same AOS animations as events
        adCard.setAttribute('data-aos', 'fade-up');
        adCard.setAttribute('data-aos-delay', Math.min(index * 50, 800));
        adCard.setAttribute('data-aos-duration', '600');
        adCard.setAttribute('data-aos-easing', 'ease-out-cubic');

        // Generate unique ID for this ad
        const adId = `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        adCard.id = adId;

        // Create ad card HTML that matches event card structure
        adCard.innerHTML = this.generateAdCardHTML(product, adId);

        // Setup interactions after insertion
        setTimeout(() => {
            this.setupAdCardInteractions(adCard, product);
        }, 100);

        return adCard;
    }

    /**
     * Generate simplified HTML for ad card matching the new unified design
     */
    generateAdCardHTML(product, adId) {
        const primaryImage = product.images[0];
        const hasMultipleImages = product.images.length > 1;

        return `
            <div class="card event-card h-100 shop-product-card horizontal">
                            <div class="row no-gutters">
                                <div class="col-12 col-md-5 image-col">
                  <div class="event-img-container product-image-container">
                    <img src="${primaryImage}" 
                         class="event-img product-image" 
                         alt="${product.name}" 
                         loading="lazy"
                         data-product-id="${product.id}">
                  </div>
                </div>
                                <div class="col-12 col-md-7 d-flex">
                                    <div class="card-body product-card-body d-flex flex-column">
                    <h5 class="card-title product-title mb-3">${product.name}</h5>
                    <a href="${product.url}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="product-price-cta"
                       onclick="event.stopPropagation();">
                      ${product.price}
                      <i class="fas fa-external-link-alt ml-2"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
        `;
    }

    /**
     * Setup interactions for ad card
     */
    setupAdCardInteractions(adCard, product) {
        // Setup image rotation if multiple images
        if (product.images.length > 1) {
            this.setupImageRotation(adCard, product.images);
        }

        // Setup click tracking
        this.setupClickTracking(adCard, product);
    }

    /**
     * Setup image rotation for products with multiple images
     */
    setupImageRotation(adCard, images) {
        const img = adCard.querySelector('.product-image');
        if (!img || images.length <= 1) return;

        let currentIndex = 0;
        let isAnimating = false;

        // Preload all images for smooth transitions
        this.preloadImages(images);

        const rotateToNextImage = () => {
            if (isAnimating) return;
            isAnimating = true;

            const nextIndex = (currentIndex + 1) % images.length;
            
            // Add click pulse effect
            img.classList.add('clicking');
            
            setTimeout(() => {
                img.classList.remove('clicking');
                
                // Start swap out animation
                img.classList.add('swapping-out');
                
                setTimeout(() => {
                    // Change the image source
                    currentIndex = nextIndex;
                    img.src = images[currentIndex];
                    
                    // Remove swap out and add swap in
                    img.classList.remove('swapping-out');
                    img.classList.add('swapping-in');
                    
                    setTimeout(() => {
                        img.classList.remove('swapping-in');
                        isAnimating = false;
                    }, 450); // Match swapIn animation duration
                    
                }, 350); // Match swapOut animation duration
                
            }, 150); // Short delay after click pulse
        };

        // Setup click handler for manual image rotation
        img.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            rotateToNextImage();
        });

        // Add visual feedback that image is clickable
        img.style.cursor = 'pointer';
        img.title = `Click to view next image (${images.length} available)`;
    }

    /**
     * Preload images for smooth transitions
     */
    preloadImages(imageArray) {
        imageArray.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    /**
     * Note: hover effects removed to avoid layout shifts and keep click-only interactions
     */

    /**
     * Setup click tracking for analytics
     */
    setupClickTracking(adCard, product) {
        const ctaButton = adCard.querySelector('.product-cta');
        
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                // Track ad click event
                console.log('Enhanced Ad Injector: Product clicked', {
                    productId: product.id,
                    productName: product.name,
                    timestamp: new Date().toISOString()
                });

                // Could integrate with Google Analytics here
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'ad_click', {
                        'product_id': product.id,
                        'product_name': product.name,
                        'ad_position': adCard.dataset.adPosition || 'unknown'
                    });
                }
            });
        }
    }

    /**
     * Enhanced statistics with performance metrics
     */
    getStats() {
        const visibleEvents = this.getVisibleEvents();
    const currentAds = document.querySelectorAll('.event-item.promo-item');
        const recentInjections = this.state.injectionHistory.slice(-5);

        return {
            isInitialized: this.state.isInitialized,
            visibleEvents: visibleEvents.length,
            currentAds: currentAds.length,
            injectionInterval: this.config.INJECTION_INTERVAL,
            minEventsForAd: this.config.MIN_EVENTS_FOR_AD,
            maxAdsPerSession: this.config.MAX_ADS_PER_SESSION,
            productsAvailable: this.state.productsCache ? this.state.productsCache.length : 0,
            usedProducts: this.state.usedProductIds.size,
            injectedAdsTracked: this.state.injectedAds.size,
            recentInjections: recentInjections,
            performance: {
                lastEventCount: this.state.lastEventCount,
                totalInjections: this.state.injectionHistory.length,
                avgAdsPerInjection: recentInjections.length > 0 ? 
                    (recentInjections.reduce((sum, inj) => sum + inj.adCount, 0) / recentInjections.length).toFixed(2) : 0
            }
        };
    }

    /**
     * Performance monitoring method
     */
    getPerformanceMetrics() {
        const now = Date.now();
        const recent = this.state.injectionHistory.filter(h => now - h.timestamp < 60000); // Last minute
        
        return {
            injectionsLastMinute: recent.length,
            avgResponseTime: this.config.OBSERVER_THROTTLE,
            cacheHitRate: this.state.productsCache ? 
                ((this.state.productsCache.length - this.state.usedProductIds.size) / this.state.productsCache.length * 100).toFixed(1) + '%' : '0%',
            memoryUsage: {
                injectedAds: this.state.injectedAds.size,
                productCache: this.state.productsCache ? this.state.productsCache.length : 0,
                injectionHistory: this.state.injectionHistory.length
            }
        };
    }

    /**
     * Manually refresh ads (for debugging/external use)
     */
    refreshAds() {
        if (!this.state.isInitialized) {
            console.warn('Enhanced Ad Injector: Not initialized yet');
            return;
        }
        
        this.injectAds();
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.state.filterChangeObserver) {
            this.state.filterChangeObserver.disconnect();
        }
        
        if (this.state.throttleTimer) {
            clearTimeout(this.state.throttleTimer);
        }
        
        this.removeExistingAds();
        this.state.isInitialized = false;
        
        console.log('Enhanced Ad Injector: Destroyed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Avoid double initialization
    if (window.enhancedAdInjector) {
        console.log('Enhanced Ad Injector: Already initialized, skipping');
        return;
    }
    // Defer init to allow events.js to render
    setTimeout(() => {
        window.enhancedAdInjector = new EnhancedAdInjector();
        // Expose methods for debugging
        window.adInjector = {
            refreshAds: () => window.enhancedAdInjector.refreshAds(),
            getStats: () => window.enhancedAdInjector.getStats(),
            destroy: () => window.enhancedAdInjector.destroy()
        };
        console.log('Enhanced Ad Injector: API exposed to window.adInjector');
    }, 2500);
});
