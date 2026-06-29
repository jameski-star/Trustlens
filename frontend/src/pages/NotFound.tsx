import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function NotFound() {
  return (
    <>
      <SEOHead title="Page Not Found" description="The page you are looking for does not exist." />
      <div className="container-page py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-[var(--bg-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-[var(--text-secondary)]" />
          </div>
          <h1 className="font-heading font-800 text-4xl text-[var(--text-primary)] mb-2">404</h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8">
            This page could not be found. The link may be broken or the page may have been removed.
          </p>
          <Link to="/" className="btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
