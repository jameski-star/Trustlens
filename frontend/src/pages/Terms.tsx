import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Terms() {
  return (
    <>
      <SEOHead title="Terms of Service" description="TrustLens terms of service. By using our security analysis tools, you agree to these terms and conditions." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
        <div className="max-w-3xl mx-auto prose prose-gray text-[var(--text-secondary)]">
          <h1 className="font-heading font-700 text-xl md:text-4xl text-[var(--text-primary)]">Terms of Service</h1>
          <p className="text-sm">Last updated: January 1, 2025</p>

          <h2>Acceptance of Terms</h2>
          <p>By using TrustLens, you agree to these terms. If you do not agree, do not use our services.</p>

          <h2>Service Description</h2>
          <p>TrustLens provides automated security analysis tools for educational and informational purposes. Our analysis is based on available data and algorithms and should not be the sole factor in security decisions.</p>

          <h2>Limitations</h2>
          <ul>
            <li>Our analysis does not guarantee 100% accuracy</li>
            <li>We are not liable for damages resulting from use of our service</li>
            <li>Results are provided "as is" without warranty</li>
            <li>Do not use our service for illegal purposes</li>
          </ul>

          <h2>Acceptable Use</h2>
          <p>You agree not to misuse our services, including but not limited to: automated scanning at high rates, submitting illegal content, or attempting to compromise our systems.</p>

          <h2>Changes</h2>
          <p>We reserve the right to update these terms. Continued use after changes constitutes acceptance.</p>
        </div>
      </div>
    </>
  );
}
