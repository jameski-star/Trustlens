import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Privacy() {
  return (
    <>
      <SEOHead title="Privacy Policy" description="TrustLens privacy policy. Learn how we protect your data and what information we collect when you use our security analysis tools." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        <div className="max-w-3xl mx-auto prose prose-gray text-[#475569]">
          <h1 className="font-heading font-700 text-xl md:text-4xl text-[#0F172A]">Privacy Policy</h1>
          <p className="text-sm">Last updated: January 1, 2025</p>

          <h2>Information We Collect</h2>
          <p>We collect minimal information necessary to provide our security analysis services:</p>
          <ul>
            <li>The URLs, email addresses, or phone numbers you submit for analysis</li>
            <li>Anonymous usage statistics to improve our service</li>
            <li>Account information (email, name) if you choose to register</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To perform security analysis on submitted content</li>
            <li>To improve our threat detection algorithms</li>
            <li>To communicate with you if you have an account</li>
          </ul>

          <h2>Data Storage</h2>
          <p>We do not store submitted content longer than necessary. Analysis results are stored anonymously with a unique share ID. Account information is stored securely using industry-standard encryption.</p>

          <h2>Third-Party Services</h2>
          <p>We do not sell, trade, or share your personal information with third parties. We may use third-party services for hosting and infrastructure.</p>

          <h2>Your Rights</h2>
          <p>You have the right to request deletion of your data at any time by contacting us. We will respond within 30 days.</p>

          <h2>Contact</h2>
          <p>For privacy-related inquiries, contact us through our <a href="/contact" className="text-[#2563EB]">contact page</a>.</p>
        </div>
      </div>
    </>
  );
}
