import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react';
import PublicBetaLayout, { BetaDisclosurePanel, PublicBetaBadge } from '@/components/public/PublicBetaLayout';
import { SUPPORT_EMAIL, supportMailto } from '@/config/contact';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [draftOpened, setDraftOpened] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = `[Public Support] ${form.subject || 'Support request'}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`;
    window.location.href = supportMailto({ subject, body });
    setDraftOpened(true);
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
            <a href={supportMailto({ subject: 'Support request for The Poles' })} className="mt-2 block break-all text-sm text-cyan-100 hover:underline">{SUPPORT_EMAIL}</a>
            <p className="mt-1 text-xs text-purple-100/50">Use this for beta feedback, support, or legal placeholder questions.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <MessageSquare className="mb-3 h-5 w-5 text-cyan-200" />
            <h2 className="font-bold text-white">What to include</h2>
            <p className="mt-2 text-sm text-purple-100/70">Your account email, page URL, expected behavior, and screenshots if helpful.</p>
          </div>
        </div>

        {draftOpened ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 text-green-100">
            <h2 className="text-xl font-bold">Email draft opened</h2>
            <p className="mt-2 text-sm text-green-100/75">Send the draft from your email client to complete the support request. The app has not submitted a saved ticket yet.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
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
            <Button type="submit" className="bg-white text-black hover:bg-purple-100">
              Open support email
            </Button>
          </form>
        )}
      </div>
    </PublicBetaLayout>
  );
}
