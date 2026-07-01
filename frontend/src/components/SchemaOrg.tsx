export default function SchemaOrg() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.trustlens.website/#organization',
        name: 'TrustLens',
        url: 'https://www.trustlens.website/',
        logo: 'https://www.trustlens.website/favicon.svg',
        description: 'Free cybersecurity analysis platform. Check URLs, emails, SMS, and more for scams and phishing attempts.',
        sameAs: [
          'https://twitter.com/trustlens_app',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.trustlens.website/#website',
        url: 'https://www.trustlens.website/',
        name: 'TrustLens - Know Before You Click',
        description: 'Free security analysis tool for websites, emails, SMS messages, screenshots, and QR codes.',
        publisher: { '@id': 'https://www.trustlens.website/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.trustlens.website/url-checker?input={search_term_string}',
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
