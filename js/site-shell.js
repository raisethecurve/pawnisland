document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    void initializeSiteShell();
});

async function initializeSiteShell() {
    ensureSkipLink();

    await Promise.all([
        loadPartial('navbar-placeholder', partialPath('navbar.html')),
        loadPartial('footer-placeholder', partialPath('footer.html'))
    ]);

    normalizeShellAssetPaths();
    initializeNavbar();
    initializeFooter();
    document.dispatchEvent(new CustomEvent('pia:shell-ready'));
}

async function loadPartial(targetId, path) {
    const target = document.getElementById(targetId);
    if (!target) return;

    try {
        const response = await fetch(path, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        target.innerHTML = await response.text();
    } catch (error) {
        target.hidden = true;
        console.warn(`Pawn Island shell partial failed: ${path}`, error);
    }
}

function partialPath(filename) {
    return isLandingPage()
        ? `../../pages/partials/${filename}`
        : `pages/partials/${filename}`;
}

function isLandingPage() {
    return window.location.pathname.includes('/pages/landing/');
}

function normalizeShellAssetPaths() {
    const shell = document.querySelectorAll('#navbar-placeholder, #footer-placeholder');
    shell.forEach((root) => {
        root.querySelectorAll('img[src*="images/brand-icons"]').forEach((image) => {
            const rawSrc = image.getAttribute('src') || '';
            const normalized = rawSrc.replace(/^(\.\.\/)+/, '/').replace(/^\.\//, '/');
            image.setAttribute('src', normalized.startsWith('/') ? normalized : `/${normalized}`);
            image.decoding = 'async';
            image.loading = 'eager';
        });
    });
}

function initializeNavbar() {
    const navbar = document.querySelector('.chess-navbar');
    if (!navbar) return;

    const toggle = navbar.querySelector('.mobile-menu-toggle');
    const overlay = navbar.querySelector('.mobile-menu-overlay');
    const links = navbar.querySelectorAll('.nav-link, .mobile-nav-link');

    setActiveLinks(links);
    setNavbarScrollState(navbar);
    window.addEventListener('scroll', () => setNavbarScrollState(navbar), { passive: true });

    if (!toggle || !overlay) return;

    const closeMenu = ({ restoreFocus = false } = {}) => {
        toggle.classList.remove('active');
        overlay.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('has-open-menu');
        if (restoreFocus) toggle.focus();
    };

    const openMenu = () => {
        toggle.classList.add('active');
        overlay.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('has-open-menu');
        overlay.querySelector('.mobile-nav-link')?.focus();
    };

    toggle.addEventListener('click', () => {
        overlay.classList.contains('active') ? closeMenu() : openMenu();
    });

    toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle.click();
        }
    });

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeMenu();
    });

    overlay.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('active')) {
            closeMenu({ restoreFocus: true });
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeMenu();
    });
}

function setNavbarScrollState(navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
}

function setActiveLinks(links) {
    const current = normalizePath(window.location.pathname);
    links.forEach((link) => {
        const target = normalizePath(new URL(link.getAttribute('href'), window.location.origin).pathname);
        const isActive = current === target || current.endsWith(target);
        if (!isActive) return;
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-current');
    });
}

function normalizePath(path) {
    return path.replace(/\/index\.html$/, '/');
}

function initializeFooter() {
    const year = document.querySelector('#current-year');
    if (year) year.textContent = String(new Date().getFullYear());
}

function ensureSkipLink() {
    if (document.querySelector('.skip-link')) return;

    const skip = document.createElement('a');
    skip.href = '#main-content';
    skip.className = 'skip-link';
    skip.textContent = 'Skip to main content';
    document.body.prepend(skip);
}
