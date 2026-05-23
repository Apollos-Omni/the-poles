import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, Shield, Heart, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "contact@thepolesplatform.com",
      subject: `[Contact Form] ${form.subject}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
    });
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        <div className="space-y-2">
          <Link to="/ThePoles" className="text-purple-400 text-sm hover:underline">← Back to The Poles</Link>
          <h1 className="text-4xl font-black text-white">Contact Us</h1>
          <p className="text-purple-300/60 text-sm">We're real people. We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Mail, title: "General Inquiries", desc: "Questions about the platform, features, or partnerships", email: "hello@thepolesplatform.com" },
            { icon: Shield, title: "Privacy & Legal", desc: "Data requests, privacy concerns, affiliate compliance", email: "privacy@thepolesplatform.com" },
            { icon: Heart, title: "North Pole Fund", desc: "Charity inquiries, donation records, fund allocation", email: "fund@thepolesplatform.com" },
          ].map(({ icon: Icon, title, desc, email }) => (
            <div key={title} className="bg-black/40 border border-purple-700/20 rounded-2xl p-4 space-y-2">
              <Icon className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white text-sm">{title}</h3>
              <p className="text-purple-300/60 text-xs">{desc}</p>
              <a href={`mailto:${email}`} className="text-purple-300 text-xs hover:underline flex items-center gap-1">
                {email} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>

        {sent ? (
          <div className="bg-green-900/20 border border-green-700/30 rounded-2xl p-8 text-center space-y-3">
            <p className="text-3xl">✅</p>
            <h2 className="text-xl font-bold text-white">Message Sent!</h2>
            <p className="text-green-200/70 text-sm">We'll get back to you within 1-2 business days.</p>
            <Button variant="outline" className="border-purple-700/40 text-purple-300" onClick={() => setSent(false)}>
              Send Another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-black/40 border border-purple-700/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Send a Message</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-purple-300">Your Name</label>
                <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Smith"
                  className="bg-black/30 border-purple-700/30 text-white placeholder:text-purple-400/40" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-purple-300">Email Address</label>
                <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                  className="bg-black/30 border-purple-700/30 text-white placeholder:text-purple-400/40" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-purple-300">Subject</label>
              <Input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Affiliate partnership inquiry, privacy request, general question..."
                className="bg-black/30 border-purple-700/30 text-white placeholder:text-purple-400/40" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-purple-300">Message</label>
              <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what's on your mind..."
                rows={5}
                className="w-full px-3 py-2 bg-black/30 border border-purple-700/30 rounded-lg text-white placeholder:text-purple-400/40 text-sm resize-none focus:outline-none focus:border-purple-500" />
            </div>
            <Button type="submit" disabled={sending} className="bg-purple-700 hover:bg-purple-600 text-white w-full">
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}

        {/* Legal links footer */}
        <div className="pt-4 border-t border-purple-700/20 flex flex-wrap gap-4 text-xs text-purple-400/60">
          <Link to="/PrivacyPolicy" className="hover:text-purple-300">Privacy Policy</Link>
          <Link to="/TermsOfUse" className="hover:text-purple-300">Terms of Use</Link>
          <Link to="/AffiliateDisclosure" className="hover:text-purple-300">Affiliate Disclosure</Link>
          <Link to="/About" className="hover:text-purple-300">About</Link>
        </div>

      </div>
    </div>
  );
}