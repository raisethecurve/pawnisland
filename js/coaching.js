document.addEventListener('DOMContentLoaded', () => {
    void hydrateTestimonials();
});

async function hydrateTestimonials() {
    const container = document.getElementById('testimonialContainer');
    const loading = document.getElementById('testimonialLoading');
    if (!container) return;

    try {
        const response = await fetch('../../data/testimonials.json', { cache: 'force-cache' });
        if (!response.ok) throw new Error(`Testimonials unavailable: ${response.status}`);
        const data = await response.json();
        const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
        if (!testimonials.length) return;

        container.replaceChildren(...buildTestimonialLayout(testimonials));
    } catch (error) {
        console.warn('Pawn Island testimonials are using static fallback content.', error);
    } finally {
        if (loading) loading.hidden = true;
    }
}

function buildTestimonialLayout(testimonials) {
    const normalized = testimonials
        .map(normalizeTestimonial)
        .sort((first, second) => first.displayOrder - second.displayOrder);
    const featured = normalized.find((testimonial) => testimonial.featured) || normalized[0];
    const supporting = normalized
        .filter((testimonial) => testimonial !== featured)
        .slice(0, 4);

    const supportingList = document.createElement('div');
    supportingList.className = 'supporting-testimonials';
    supporting.forEach((testimonial) => {
        supportingList.append(createSupportingTestimonial(testimonial));
    });

    return [createFeaturedTestimonial(featured), supportingList];
}

function normalizeTestimonial(testimonial) {
    const fullText = cleanText(testimonial.text || testimonial.quote || '');
    return {
        ...testimonial,
        fullText,
        shortQuote: cleanText(testimonial.shortQuote || fullText),
        audience: testimonial.audience || testimonial.designation || 'Student',
        result: testimonial.result || 'Student progress',
        proof: testimonial.proof || 'Personalized coaching',
        displayOrder: Number(testimonial.displayOrder || 99)
    };
}

function createFeaturedTestimonial(testimonial) {
    const article = element('article', 'testimonial-feature');
    const content = element('div', 'testimonial-feature-content');
    const label = element('div', 'testimonial-label');
    label.append(createIcon('fa-chart-line'), document.createTextNode(testimonial.result));

    const quote = document.createElement('blockquote');
    quote.textContent = testimonial.shortQuote;
    content.append(label, quote);

    const proofList = element('div', 'testimonial-proof-list');
    proofList.append(
        createProofPoint('Result', testimonial.result),
        createProofPoint('Why it worked', testimonial.proof)
    );

    const footer = element('footer', 'testimonial-feature-footer');
    footer.append(createAvatar(testimonial), createAuthor(testimonial));
    article.append(content, proofList, footer);
    return article;
}

function createSupportingTestimonial(testimonial) {
    const card = element('article', 'testimonial-card');
    const header = element('header', 'testimonial-card-header');
    const outcome = element('strong', 'testimonial-outcome', testimonial.result);
    const quote = document.createElement('blockquote');
    quote.textContent = testimonial.shortQuote;

    header.append(createAuthor(testimonial), outcome);
    card.append(header, quote);
    return card;
}

function createProofPoint(label, value) {
    const proof = element('div', 'testimonial-proof');
    proof.append(element('span', '', label), element('strong', '', value));
    return proof;
}

function createAvatar(testimonial) {
    if (testimonial.image) {
        const image = document.createElement('img');
        image.src = testimonial.image;
        image.alt = `${testimonial.name || 'Student'}, chess coaching student`;
        image.className = 'testimonial-avatar';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.width = 96;
        image.height = 96;
        return image;
    }

    const initials = element('div', 'testimonial-avatar testimonial-initials', getInitials(testimonial.name || 'Student'));
    initials.setAttribute('aria-hidden', 'true');
    return initials;
}

function createAuthor(testimonial) {
    const author = element('div', 'testimonial-author');
    author.append(
        element('cite', '', testimonial.name || 'Student'),
        element('span', '', testimonial.audience)
    );
    return author;
}

function createIcon(iconClass) {
    const icon = document.createElement('i');
    icon.className = `fas ${iconClass}`;
    icon.setAttribute('aria-hidden', 'true');
    return icon;
}

function element(tag, className = '', text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

function cleanText(text) {
    return String(text)
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/?p>/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getInitials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}
