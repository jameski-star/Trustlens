export default function SchemaOrg() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://trustlens.app/#organization',
        name: 'TrustLens',
        url: 'https://trustlens.app/',
        logo: 'https://trustlens.app/favicon.svg',
        description: 'Free cybersecurity analysis platform. Check URLs, emails, SMS, and more for scams and phishing attempts.',
        sameAs: [
          'https://twitter.com/trustlens_app',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://trustlens.app/#website',
        url: 'https://trustlens.app/',
        name: 'TrustLens - Know Before You Click',
        description: 'Free security analysis tool for websites, emails, SMS messages, screenshots, and QR codes.',
        publisher: { '@id': 'https://trustlens.app/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://trustlens.app/url-checker?input={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
