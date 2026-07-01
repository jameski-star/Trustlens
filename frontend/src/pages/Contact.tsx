import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactInput } from '../validation/schemas';
import { submitContact } from '../api/client';
import { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    setIsSubmitting(true);
    try {
      await submitContact(data);
      toast.success('Message sent successfully! We will respond within 24 hours.');
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Contact Us" description="Get in touch with TrustLens. Contact our team for support, partnership inquiries, or report an issue." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Contact' }]} />
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-xl flex items-center justify-center"><MessageSquare className="w-5 h-5 text-[var(--text-accent)]" /></div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">Contact Us</h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-8">Have a question, suggestion, or need help? Send us a message and we will get back to you within 24 hours.</p>

          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Name</label>
                <input {...register('name')} className="input-field" placeholder="Your name" />
                {errors.name && <p className="text-sm text-[#DC2626] mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email</label>
                <input {...register('email')} type="email" className="input-field" placeholder="your@email.com" />
                {errors.email && <p className="text-sm text-[#DC2626] mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Subject</label>
                <input {...register('subject')} className="input-field" placeholder="How can we help?" />
                {errors.subject && <p className="text-sm text-[#DC2626] mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Message</label>
                <textarea {...register('message')} rows={5} className="input-field resize-none" placeholder="Describe your question or issue..." />
                {errors.message && <p className="text-sm text-[#DC2626] mt-1">{errors.message.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </Card>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            '@id': 'https://trustlens.app/contact',
            name: 'Contact TrustLens Support',
            description: 'Get in touch with the TrustLens team for support, questions, or feedback about our cybersecurity analysis tools.',
            mainEntity: {
              '@type': 'Organization',
              name: 'TrustLens',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: 'support@trustlens.app',
                url: 'https://trustlens.app/contact',
              },
            },
          }),
        }} />
      </div>
    </>
  );
}
