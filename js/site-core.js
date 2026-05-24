const ANALYTICS_ID = 'G-T12VEHM2PY';

document.addEventListener('DOMContentLoaded', () => {
    initializeAnalytics();
    initializeRevealAnimations();
    initializeSmoothAnchors();
    initializeBackToTop();
    initializeSiteTracking();
    initializeFaqAccordions();
    initializeCounters();
});

function initializeAnalytics() {
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function gtag() {
            window.dataLayer.push(arguments);
        };
        return;
    }

    if (window.gtag) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
        window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_ID, { transport_type: 'beacon' });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
    document.head.append(script);
}

function initializeRevealAnimations() {
    const animatedElements = Array.from(document.querySelectorAll('[data-aos]'));
    if (!animatedElements.length) return;

    animatedElements.forEach((element) => {
        const delay = Number(element.dataset.aosDelay || 0);
        if (delay) element.style.setProperty('--reveal-delay', `${Math.min(delay, 600)}ms`);
    });

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
        animatedElements.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    animatedElements.forEach((element) => observer.observe(element));
}

function initializeSmoothAnchors() {
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start'
        });
    });
}

function initializeBackToTop() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'site-back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 5l7 7-1.4 1.4-4.6-4.55V20h-2V8.85l-4.6 4.55L5 12l7-7z" fill="currentColor"></path>
        </svg>
    `;

    document.body.append(button);
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });

    const update = () => button.classList.toggle('is-visible', window.scrollY > 320);
    update();
    window.addEventListener('scroll', update, { passive: true });
}

function initializeSiteTracking() {
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const linkText = link.textContent.trim().replace(/\s+/g, ' ');

        if (href.includes('schedule.html')) {
            trackSiteEvent('schedule_cta_click', {
                link_text: linkText,
                link_url: link.href
            });
        }

        if (href.startsWith('mailto:')) {
            trackSiteEvent('email_click', {
                link_text: linkText || 'Email',
                link_url: href
            });
        }
    });
}

function initializeFaqAccordions() {
    const faqItems = Array.from(document.querySelectorAll('.faq-item'));
    faqItems.forEach((item, index) => {
        const header = item.querySelector('.faq-header-item');
        const content = item.querySelector('.faq-content');
        if (!header || !content) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'faq-toggle';
        button.id = `faq-toggle-${index + 1}`;
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', `faq-panel-${index + 1}`);

        while (header.firstChild) button.append(header.firstChild);
        header.append(button);

        content.id = `faq-panel-${index + 1}`;
        content.setAttribute('role', 'region');
        content.setAttribute('aria-labelledby', button.id);

        button.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            faqItems.forEach((other) => {
                other.classList.remove('active');
                other.querySelector('.faq-toggle')?.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

function initializeCounters() {
    const counters = Array.from(document.querySelectorAll('[data-value]'))
        .filter((element) => element.classList.contains('stat-number') || element.classList.contains('metric-value'));
    if (!counters.length) return;

    const animate = (counter) => {
        if (counter.dataset.counted === 'true') return;
        counter.dataset.counted = 'true';

        const raw = counter.dataset.value || counter.textContent || '0';
        const target = Number.parseInt(raw, 10);
        const suffix = raw.includes('+') ? '+' : '';
        if (!Number.isFinite(target)) return;

        if (prefersReducedMotion()) {
            counter.textContent = `${target}${suffix}`;
            return;
        }

        const start = performance.now();
        const duration = 1200;
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            counter.textContent = `${Math.floor(progress * target)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
        counters.forEach(animate);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animate(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.4 });

    counters.forEach((counter) => observer.observe(counter));
}

function trackSiteEvent(eventName, parameters = {}) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, {
        event_category: 'site_engagement',
        ...parameters
    });
}

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
