import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

export default function SEOHead({ title, description, canonical, ogImage }: SEOHeadProps) {
  useEffect(() => {
    const siteName = 'TrustLens';
    const fullTitle = `${title} | ${siteName}`;
    const origin = window.location.origin;
    const autoCanonical = canonical || `${origin}${window.location.pathname}`;

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

    setMeta('description', description);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:site_name', siteName, true);
    if (ogImage) setMeta('og:image', ogImage, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    if (ogImage) setMeta('twitter:image', ogImage);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', autoCanonical);
  }, [title, description, canonical, ogImage]);

  return null;
}
