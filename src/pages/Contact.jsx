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
    <PublicBetaLayout maxWidth="max-w-5xl">
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-500/10 via-black/45 to-purple-700/15 p-6 shadow-2xl shadow-purple-950/25 sm:p-8">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-fuchsia-500/12 blur-3xl" />
          <div className="relative space-y-3">
          <PublicBetaBadge />
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-8 w-8 text-cyan-200" />
            <h1 className="text-4xl font-black">Contact / Support</h1>
          </div>
          <p className="max-w-2xl text-purple-100/70">Public beta support for login help, account issues, bug reports, prize path questions, league support, parent questions, safety concerns, payment/refund questions, and fulfillment or shipping issues.</p>
          </div>
        </div>

        <BetaDisclosurePanel />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-cyan-300/15 bg-white/[0.055] p-5 shadow-xl shadow-cyan-950/15 backdrop-blur-xl">
            <Mail className="mb-3 h-5 w-5 text-cyan-200" />
            <h2 className="font-bold text-white">Direct email</h2>
            <a href={supportMailto({ subject: 'Support request for The Poles' })} className="mt-2 block break-all text-sm text-cyan-100 hover:underline">{SUPPORT_EMAIL}</a>
            <p className="mt-1 text-xs text-purple-100/50">Use this for public user support, safety, prize path, fulfillment, parent, account, and beta issues.</p>
          </div>
          <div className="rounded-2xl border border-fuchsia-300/15 bg-white/[0.055] p-5 shadow-xl shadow-purple-950/15 backdrop-blur-xl">
            <MessageSquare className="mb-3 h-5 w-5 text-cyan-200" />
            <h2 className="font-bold text-white">What to include</h2>
            <p className="mt-2 text-sm text-purple-100/70">Your account email, page URL, expected behavior, and screenshots if helpful.</p>
          </div>
        </div>

        {draftOpened ? (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-green-100 shadow-xl shadow-green-950/15">
            <h2 className="text-xl font-bold">Email draft opened</h2>
            <p className="mt-2 text-sm text-green-100/75">Send the draft from your email client to complete the support request. The app has not submitted a saved ticket yet.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur-xl">
            <div className="grid gap-4 md:grid-cols-2">
              <Input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="min-h-11 border-purple-400/30 bg-black/35 text-white placeholder:text-purple-200/40" />
              <Input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="min-h-11 border-purple-400/30 bg-black/35 text-white placeholder:text-purple-200/40" />
            </div>
            <Input required placeholder="Subject" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="min-h-11 border-purple-400/30 bg-black/35 text-white placeholder:text-purple-200/40" />
            <textarea
              required
              rows={6}
              placeholder="How can we help?"
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              className="w-full rounded-md border border-purple-400/30 bg-black/35 px-3 py-2 text-sm text-white placeholder:text-purple-200/40"
            />
            <Button type="submit" className="min-h-11 bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-950/25 hover:from-cyan-400 hover:to-purple-500">
              Open support email
            </Button>
          </form>
        )}
      </div>
    </PublicBetaLayout>
  );
}
