import { useEffect } from 'react';

const SITE_ORIGIN = 'https://www.distributedmailsystem.com';
const DEFAULT_TITLE = 'QMail — Quantum-Safe, Spam-Resistant Email | Get Paid to Receive Mail';
const DEFAULT_DESC =
  'Claim a QMail mailbox from $10. Private, spam-resistant email by design. Subscribe for credits or join as an influencer (Phase II).';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * @param {object} opts
 * @param {string} [opts.title]
 * @param {string} [opts.description]
 * @param {string} [opts.path] - route path for canonical (e.g. "/register")
 * @param {string} [opts.image]
 * @param {boolean} [opts.noindex]
 */
export function useDocumentMeta({ title, description, path, image, noindex } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | QMail` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESC;
    const canonicalPath = path != null ? path : window.location.pathname;
    const canonical = `${SITE_ORIGIN}${canonicalPath === '/' ? '/' : canonicalPath}`;
    const ogImage = image || DEFAULT_OG_IMAGE;

    document.title = fullTitle;

    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'QMail');
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertLink('canonical', canonical);

    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow');
    } else {
      const robots = document.querySelector('meta[name="robots"]');
      if (robots) robots.setAttribute('content', 'index, follow');
    }

    return () => {
      document.title = DEFAULT_TITLE;
      upsertMeta('name', 'description', DEFAULT_DESC);
      upsertMeta('property', 'og:title', DEFAULT_TITLE);
      upsertMeta('property', 'og:description', DEFAULT_DESC);
      upsertMeta('property', 'og:url', `${SITE_ORIGIN}/`);
      upsertMeta('name', 'robots', 'index, follow');
    };
  }, [title, description, path, image, noindex]);
}
