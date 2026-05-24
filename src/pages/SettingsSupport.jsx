import React, { useState } from 'react';
import { Mail, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SettingsLayout from '@/components/settings/SettingsLayout';
import SettingsSection from '@/components/settings/SettingsSection';
import { SUPPORT_EMAIL, supportMailto } from '@/config/contact';

export default function SettingsSupport() {
  const [draftOpened, setDraftOpened] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    category: 'other',
    body: '',
    email: '',
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = () => {
    const subject = `[${form.category || 'support'}] ${form.subject || 'Support request'}`;
    const body = [
      `Category: ${form.category || 'other'}`,
      `Reply email: ${form.email || ''}`,
      '',
      form.body || '',
    ].join('\n');
    window.location.href = supportMailto({ subject, body });
    setDraftOpened(true);
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-black/25 to-purple-700/10 p-5 shadow-2xl shadow-cyan-950/25 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/70">Support</p>
              <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Polar Support Desk</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-purple-100/70">
                Get help with account access, skill match setup, prize path questions, fulfillment, or platform safety.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10">
              <Mail className="h-6 w-6 text-cyan-200" />
            </div>
          </div>
        </div>

        {draftOpened ? (
          <SettingsSection
            title="Email Draft Opened"
            description={`Your email client should now have a draft addressed to ${SUPPORT_EMAIL}.`}
          >
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              Send the draft from your email client to complete the support request. The app has not submitted a saved ticket yet.
            </div>
          </SettingsSection>
        ) : (
          <SettingsSection
            title="Contact Support"
            description="Use a clear subject and include any match, league, or fulfillment details that help us investigate."
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="support-subject" className="text-purple-100">Subject</Label>
                <Input
                  id="support-subject"
                  value={form.subject}
                  onChange={(event) => updateForm('subject', event.target.value)}
                  className="min-h-11 border-purple-400/30 bg-black/35 text-white placeholder:text-purple-200/40"
                  placeholder="What do you need help with?"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="support-category" className="text-purple-100">Category</Label>
                <select
                  id="support-category"
                  value={form.category}
                  onChange={(event) => updateForm('category', event.target.value)}
                  className="min-h-11 rounded-md border border-purple-400/30 bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
                >
                  <option value="account">Account</option>
                  <option value="skill_match">Skill match</option>
                  <option value="prize_path">Prize path</option>
                  <option value="fulfillment">Fulfillment</option>
                  <option value="safety">Safety report</option>
                  <option value="bug">Bug</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="support-email" className="text-purple-100">Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm('email', event.target.value)}
                  className="min-h-11 border-purple-400/30 bg-black/35 text-white placeholder:text-purple-200/40"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="support-message" className="text-purple-100">Message</Label>
                <Textarea
                  id="support-message"
                  value={form.body}
                  onChange={(event) => updateForm('body', event.target.value)}
                  className="min-h-32 border-purple-400/30 bg-black/35 text-white placeholder:text-purple-200/40"
                  placeholder="Include relevant match IDs, screenshots, fulfillment details, or profile information."
                />
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-cyan-100/75 sm:flex-row sm:items-center">
                <ShieldCheck className="h-5 w-5 shrink-0 text-cyan-200" />
                Support requests go to <a href={supportMailto({ subject: 'Support request for The Poles' })} className="font-semibold text-white hover:underline">{SUPPORT_EMAIL}</a>. Include the exact prize path, league, skill match, or fulfillment context when relevant.
              </div>

              <Button
                onClick={submit}
                className="min-h-11 w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-950/25 hover:from-cyan-400 hover:to-purple-500 sm:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </Button>
            </div>
          </SettingsSection>
        )}
      </div>
    </SettingsLayout>
  );
}
