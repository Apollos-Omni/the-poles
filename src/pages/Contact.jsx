import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PublicBetaLayout, { BetaDisclosurePanel, PublicBetaBadge } from '@/components/public/PublicBetaLayout';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      await base44.integrations.Core.SendEmail({
        to: 'support@thepolesplatform.com',
        subject: `[Public Beta Support] ${form.subject}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
      });
      setSent(true);
    } catch (submitError) {
      setError(submitError.message || 'Support message could not be sent. Please email support directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <PublicBetaLayout>
      <div className="space-y-8">
        <div className="space-y-3">
          <PublicBetaBadge />
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-8 w-8 text-cyan-200" />
            <h1 className="text-4xl font-black">Contact / Support</h1>
          </div>
          <p className="text-purple-100/70">Public beta support for account access, beta feedback, privacy requests, and affiliate questions.</p>
        </div>

        <BetaDisclosurePanel />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <Mail className="mb-3 h-5 w-5 text-cyan-200" />
            <h2 className="font-bold text-white">Direct email</h2>
            <p className="mt-2 text-sm text-purple-100/70">support@thepolesplatform.com</p>
            <p className="mt-1 text-xs text-purple-100/50">Use this for beta feedback, support, or legal placeholder questions.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <MessageSquare className="mb-3 h-5 w-5 text-cyan-200" />
            <h2 className="font-bold text-white">What to include</h2>
            <p className="mt-2 text-sm text-purple-100/70">Your account email, page URL, expected behavior, and screenshots if helpful.</p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 text-green-100">
            <h2 className="text-xl font-bold">Message sent</h2>
            <p className="mt-2 text-sm text-green-100/75">Support will review your public beta message.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
            {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
            <div className="grid gap-4 md:grid-cols-2">
              <Input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <Input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <Input required placeholder="Subject" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
            <textarea
              required
              rows={6}
              placeholder="How can we help?"
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
            <Button type="submit" disabled={sending} className="bg-white text-black hover:bg-purple-100">
              {sending ? 'Sending...' : 'Send support message'}
            </Button>
          </form>
        )}
      </div>
    </PublicBetaLayout>
  );
}
