import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

const endpoints = [
  { method: 'POST', path: '/api/v1/scan/url', desc: 'Analyze a URL for security threats', body: '{ "input": "https://example.com" }' },
  { method: 'POST', path: '/api/v1/scan/email', desc: 'Analyze an email address or content', body: '{ "input": "email@example.com" }' },
  { method: 'POST', path: '/api/v1/scan/sms', desc: 'Analyze SMS or phone number', body: '{ "input": "+254712345678" }' },
  { method: 'GET', path: '/api/v1/scan/report/:shareId', desc: 'Retrieve a specific analysis report', body: '' },
  { method: 'GET', path: '/api/v1/community', desc: 'Get community reports', body: '' },
  { method: 'GET', path: '/api/v1/blog', desc: 'Get blog posts', body: '' },
  { method: 'POST', path: '/api/v1/contact', desc: 'Submit a contact message', body: '{ "name": "...", "email": "...", "subject": "...", "message": "..." }' },
];

export default function APIDocs() {
  return (
    <>
      <SEOHead title="API Documentation" description="TrustLens API documentation. Integrate security analysis into your applications with our RESTful API." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'API Documentation' }]} />
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)] mb-2">API Documentation</h1>
          <p className="text-[var(--text-secondary)] mb-8">Integrate TrustLens security analysis into your applications using our RESTful API.</p>

          <div className="space-y-3 mb-8">
            <h2 className="font-heading font-700 text-xl text-[var(--text-primary)] mb-4">Base URL</h2>
            <Card className="font-mono text-sm">https://api.trustlens.app/api/v1</Card>
          </div>

          <div className="space-y-3 mb-8">
            <h2 className="font-heading font-700 text-xl text-[var(--text-primary)] mb-4">Authentication</h2>
            <Card>
              <p className="text-sm text-[var(--text-secondary)] mb-3">API requests require an API key in the header:</p>
              <div className="bg-[var(--bg-muted)] rounded-xl p-3 font-mono text-sm">
                Authorization: Bearer your_api_key_here
              </div>
            </Card>
          </div>

          <h2 className="font-heading font-700 text-xl text-[var(--text-primary)] mb-4">Endpoints</h2>
          <div className="space-y-4">
            {endpoints.map((ep) => (
              <Card key={ep.path}>
                <div className="flex items-start gap-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg flex-shrink-0 ${
                    ep.method === 'GET' ? 'bg-[var(--bg-accent)] text-[var(--text-accent)]' : 'bg-[#F0FDF4] text-[#16A34A]'
                  }`}>{ep.method}</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-sm text-[var(--text-primary)] font-mono break-all">{ep.path}</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{ep.desc}</p>
                    {ep.body && (
                      <pre className="mt-2 bg-[var(--bg-muted)] rounded-lg p-3 text-xs font-mono text-[var(--text-secondary)] overflow-x-auto">{ep.body}</pre>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <h3 className="font-semibold mb-2">Rate Limits</h3>
            <p className="text-sm text-[var(--text-secondary)]">Free API: 100 requests per minute. Contact us for higher limits.</p>
          </Card>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'APIReference',
            name: 'TrustLens API Documentation',
            description: 'REST API for URL, email, SMS, and phone number security analysis. Free tier available.',
            url: 'https://www.trustlens.website/api-docs',
          }),
        }} />
      </div>
    </>
  );
}
