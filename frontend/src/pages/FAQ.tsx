import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

const faqs = [
  { q: 'Is TrustLens free to use?', a: 'Yes, TrustLens is completely free. No account or payment required for basic analysis.' },
  { q: 'How accurate is the risk analysis?', a: 'Our analysis combines multiple data sources and AI detection to provide high accuracy, but no system is 100% perfect. Always use multiple sources when evaluating online threats.' },
  { q: 'Do you store my submitted data?', a: 'Submitted URLs and content are stored temporarily with anonymized share IDs. No personal data is associated with your scans unless you create an account.' },
  { q: 'What types of content can I analyze?', a: 'You can analyze websites (URLs), email addresses, SMS messages, phone numbers, screenshots, and QR codes.' },
  { q: 'How is the risk score calculated?', a: 'The risk score considers multiple factors including SSL status, domain age, blacklist presence, AI analysis, and community reports, each weighted by importance.' },
  { q: 'Can I download analysis reports?', a: 'Yes, every analysis report can be downloaded as a PDF for your records.' },
  { q: 'Do you offer an API?', a: 'Yes, we offer a REST API for developers. Check our API Documentation page for details.' },
  { q: 'How can I report a scam?', a: 'Use our Community Reports page to submit a report. Our team will review and publish verified reports.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <SEOHead title="Frequently Asked Questions" description="Find answers to common questions about TrustLens, our security analysis tools, privacy practices, and how to stay safe online." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'FAQ' }]} />
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-xl flex items-center justify-center"><HelpCircle className="w-5 h-5 text-[var(--text-accent)]" /></div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">Frequently Asked Questions</h1>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between text-left">
                  <span className="font-semibold text-[var(--text-primary)] pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[var(--text-secondary)] flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === i && <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>}
              </Card>
            ))}
          </div>

          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }} />
        </div>
      </div>
    </>
  );
}
