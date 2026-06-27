import { Link } from 'react-router-dom';
import { Shield, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0]">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-800 text-lg">TrustLens</span>
            </Link>
            <p className="text-sm text-[#475569] leading-relaxed mb-4">
              Know before you click. Free security analysis for websites, emails, and messages.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-[#0F172A] mb-4">Tools</h4>
            <ul className="space-y-2.5">
              <li><Link to="/url-checker" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">URL Checker</Link></li>
              <li><Link to="/email-checker" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">Email Checker</Link></li>
              <li><Link to="/sms-checker" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">SMS Checker</Link></li>
              <li><Link to="/screenshot-scanner" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">Screenshot Scanner</Link></li>
              <li><Link to="/qr-scanner" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">QR Code Scanner</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-[#0F172A] mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><Link to="/community-reports" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">Community Reports</Link></li>
              <li><Link to="/scam-alerts" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">Scam Alerts</Link></li>
              <li><Link to="/knowledge-center" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">Knowledge Center</Link></li>
              <li><Link to="/blog" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">Blog</Link></li>
              <li><Link to="/faq" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-[#0F172A] mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">Terms of Service</Link></li>
              <li><Link to="/api-docs" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">API Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-[#0F172A] mb-4">Status</h4>
            <ul className="space-y-2.5">
              <li><Link to="/status" className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">System Status</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#475569]">
            &copy; {new Date().getFullYear()} TrustLens. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#475569] font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
