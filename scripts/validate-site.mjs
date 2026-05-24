import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = [
  'index.html',
  ...walk(path.join(root, 'pages', 'landing')).filter((file) => file.endsWith('.html')).map(relative)
].sort();

const errors = [];
const canonicalUrls = new Set();

for (const file of htmlFiles) {
  const html = read(file);
  validateHead(file, html);
  validateJsonLd(file, html);
  validateLocalReferences(file, html);
}

validateSitemap();
validateJsonFiles(['data/scheduler-config.json', 'data/testimonials.json', 'site-facts.json', 'site.webmanifest']);

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML pages, sitemap coverage, local references, and JSON assets.`);

function validateHead(file, html) {
  const title = matchContent(html, /<title>([\s\S]*?)<\/title>/i);
  const description = getMeta(html, 'description');
  const canonical = matchContent(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (!title) errors.push(`${file}: missing <title>`);
  if (!description || description.length < 80 || description.length > 165) {
    errors.push(`${file}: meta description should be 80-165 characters`);
  }
  if (!canonical?.startsWith('https://www.pawnislandacademy.com/')) {
    errors.push(`${file}: canonical must use the www production host`);
  } else {
    canonicalUrls.add(canonical);
  }
  if (h1Count !== 1) errors.push(`${file}: expected exactly one h1, found ${h1Count}`);
  if (!html.includes('css/foundation.css')) errors.push(`${file}: missing foundation.css`);
  if (!html.includes('js/site-shell.js')) errors.push(`${file}: missing site-shell.js`);
  if (!html.includes('js/site-core.js')) errors.push(`${file}: missing site-core.js`);
}

function validateJsonLd(file, html) {
  for (const script of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(script[1].trim());
    } catch (error) {
      errors.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }
}

function validateLocalReferences(file, html) {
  for (const tag of html.matchAll(/<(?:a|link|script|img)\b[^>]*(?:href|src)=["']([^"']+)["'][^>]*>/gi)) {
    const url = tag[1];
    const resolved = resolveLocal(file, url);
    if (!resolved) continue;
    if (!fs.existsSync(resolved)) {
      errors.push(`${file}: missing local reference ${url}`);
    }
  }
}

function validateSitemap() {
  const sitemap = read('sitemap.xml');
  const urls = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
  for (const canonical of canonicalUrls) {
    if (!urls.has(canonical)) errors.push(`sitemap.xml: missing ${canonical}`);
  }
  for (const url of urls) {
    if (!canonicalUrls.has(url)) errors.push(`sitemap.xml: extra URL without matching canonical ${url}`);
  }
}

function validateJsonFiles(files) {
  for (const file of files) {
    try {
      JSON.parse(read(file));
    } catch (error) {
      errors.push(`${file}: invalid JSON (${error.message})`);
    }
  }
}

function getMeta(html, name) {
  return matchContent(html, new RegExp(`<meta\\s+[^>]*name=["']${escapeRegExp(name)}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'));
}

function matchContent(value, regex) {
  return value.match(regex)?.[1]?.trim() || '';
}

function resolveLocal(fromFile, rawUrl) {
  if (/^(?:https?:)?\/\//i.test(rawUrl) || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:') || rawUrl.startsWith('#')) {
    return null;
  }

  const withoutHash = rawUrl.split('#')[0].split('?')[0];
  if (!withoutHash) return null;
  if (withoutHash.startsWith('/')) return path.join(root, withoutHash);
  return path.resolve(root, path.dirname(fromFile), withoutHash);
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
