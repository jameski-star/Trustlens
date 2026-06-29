import { Shield, Users, Target, Award } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

const values = [
  { icon: Shield, title: 'Trust First', desc: 'Every decision we make prioritizes user safety and transparency.' },
  { icon: Users, title: 'Community Powered', desc: 'Our community helps identify and report threats for collective protection.' },
  { icon: Target, title: 'Accuracy Matters', desc: 'We continuously refine our analysis to provide the most reliable results.' },
  { icon: Award, title: 'Free for Everyone', desc: 'Security should not be a luxury. Our tools remain free for all users.' },
];

export default function About() {
  return (
    <>
      <SEOHead title="About TrustLens - Our Mission" description="TrustLens helps users determine whether online content is safe or fraudulent. Free security analysis for everyone." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'About' }]} />
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading font-700 text-xl md:text-4xl text-[var(--text-primary)] mb-4">About TrustLens</h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8">
            TrustLens is a free cybersecurity analysis platform that helps you determine if websites, emails, SMS messages, and online offers are safe or potentially fraudulent.
          </p>

          <div className="prose prose-gray max-w-none mb-12 text-[var(--text-secondary)] space-y-4">
            <p>
              Our mission is simple: <strong>know before you click</strong>. In an era where online scams and phishing attacks are increasingly sophisticated, we provide accessible tools that empower everyone to make informed decisions about online safety.
            </p>
            <p>
              Founded by cybersecurity professionals, TrustLens combines automated analysis, community reports, and AI-powered detection to provide comprehensive security assessments in seconds.
            </p>
            <p>
              We believe that security tools should be free, accessible, and transparent. No accounts required, no personal data stored, no hidden agendas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {values.map((v) => (
              <Card key={v.title}>
                <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-xl flex items-center justify-center mb-3">
                  <v.icon className="w-5 h-5 text-[var(--text-accent)]" />
                </div>
                <h3 className="font-semibold mb-1">{v.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{v.desc}</p>
              </Card>
            ))}
          </div>

          <Card>
            <h2 className="font-heading font-700 text-xl mb-3">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-secondary)]">
              <li>Submit a URL, email, phone number, or message for analysis</li>
              <li>Our system checks multiple security indicators simultaneously</li>
              <li>AI analysis evaluates the content for scam patterns</li>
              <li>Community reports are cross-referenced for additional context</li>
              <li>You receive a comprehensive risk assessment with recommendations</li>
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
