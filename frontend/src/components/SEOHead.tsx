import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  keywords?: string;
}

export default function SEOHead({ title, description, canonical, ogImage, ogType, noIndex, keywords }: SEOHeadProps) {
  useEffect(() => {
    const siteName = 'TrustLens';
    const fullTitle = `${title} | ${siteName}`;
    const origin = window.location.origin;
    const path = window.location.pathname;
    const autoCanonical = canonical || `${origin}${path}`;
    const url = `${origin}${path}`;

    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const removeMeta = (name: string, property = false) => {
      const attr = property ? 'property' : 'name';
      const el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) el.remove();
    };

    setMeta('description', description);
    setMeta('keywords', keywords || 'cybersecurity, scam detection, phishing checker, URL checker, email security, SMS scam, online safety, fraud detection, trust analysis, security scanner');
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large');
    setMeta('googlebot', noIndex ? 'noindex' : 'index, follow, max-snippet:-1, max-image-preview:large');

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType || 'website', true);
    setMeta('og:site_name', siteName, true);
    setMeta('og:url', url, true);
    setMeta('og:locale', 'en_US', true);
    if (ogImage) setMeta('og:image', ogImage, true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:site', '@trustlens_app');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    if (ogImage) setMeta('twitter:image', ogImage);

    // Canonical
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', autoCanonical);

    // Robots link based on noIndex
    let robotsLink: HTMLLinkElement | null = document.querySelector('link[rel="noindex"]');
    if (noIndex) {
      if (!robotsLink) {
        robotsLink = document.createElement('link');
        robotsLink.setAttribute('rel', 'noindex');
        document.head.appendChild(robotsLink);
      }
    } else if (robotsLink) {
      robotsLink.remove();
    }
  }, [title, description, canonical, ogImage, ogType, noIndex, keywords]);

  return null;
}
