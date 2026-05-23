import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, AtSign, MapPin, FileText, Camera } from "lucide-react";

export default function AccountSetupModal({ user, onComplete }) {
  const [step, setStep] = useState(1); // 1=basics, 2=profile
  const [form, setForm] = useState({
    displayName: user?.full_name || '',
    username: '',
    location: '',
    bio: '',
    avatarUrl: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validateStep1 = () => {
    const errs = {};
    if (!form.displayName.trim()) errs.displayName = 'Display name is required.';
    if (!form.username.trim()) errs.username = 'Username is required.';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) errs.username = '3–20 chars, letters/numbers/underscore only.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleFinish = () => {
    const profile = {
      displayName: form.displayName.trim(),
      username: form.username.trim().toLowerCase(),
      location: form.location.trim(),
      bio: form.bio.trim(),
      avatarUrl: form.avatarUrl.trim(),
      wins: 0,
      losses: 0,
      prizesWon: [],
      prizesInterested: [],
      hostRating: 0,
      setupComplete: true,
    };
    // Persist locally
    localStorage.setItem('poles_profile', JSON.stringify(profile));
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-950/60 to-black border border-purple-700/40 rounded-3xl p-7 w-full max-w-md space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl">🎅</div>
          <h2 className="text-2xl font-black text-white">Create Your Poles Profile</h2>
          <p className="text-purple-300/70 text-sm">Set up your identity to compete, host, and connect.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-purple-500' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm">Step 1: Your Identity</h3>

            <div>
              <label className="text-xs text-purple-300 mb-1 block"><User className="inline w-3 h-3 mr-1" />Display Name *</label>
              <Input
                placeholder="e.g. Jordan B."
                value={form.displayName}
                onChange={e => set('displayName', e.target.value)}
                className="bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/40"
              />
              {errors.displayName && <p className="text-red-400 text-xs mt-1">{errors.displayName}</p>}
            </div>

            <div>
              <label className="text-xs text-purple-300 mb-1 block"><AtSign className="inline w-3 h-3 mr-1" />Username *</label>
              <Input
                placeholder="e.g. jordan_b (no spaces)"
                value={form.username}
                onChange={e => set('username', e.target.value.replace(/\s/g, ''))}
                className="bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/40"
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
              {!errors.username && form.username && (
                <p className="text-purple-400/60 text-xs mt-1">Your profile will be @{form.username.toLowerCase()}</p>
              )}
            </div>

            <Button className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold" onClick={handleNext}>
              Continue →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm">Step 2: Profile Details <span className="text-purple-400/60 font-normal">(optional)</span></h3>

            <div>
              <label className="text-xs text-purple-300 mb-1 block"><MapPin className="inline w-3 h-3 mr-1" />Location</label>
              <Input
                placeholder="e.g. Los Angeles, CA"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className="bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/40"
              />
            </div>

            <div>
              <label className="text-xs text-purple-300 mb-1 block"><FileText className="inline w-3 h-3 mr-1" />Bio</label>
              <textarea
                placeholder="A little about yourself..."
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                rows={3}
                className="w-full bg-black/30 border border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/40 rounded-md p-3 text-sm resize-none focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-purple-300 mb-1 block"><Camera className="inline w-3 h-3 mr-1" />Profile Picture URL</label>
              <Input
                placeholder="https://..."
                value={form.avatarUrl}
                onChange={e => set('avatarUrl', e.target.value)}
                className="bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/40"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-purple-700/40 text-purple-300"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
              <Button
                className="flex-1 bg-purple-700 hover:bg-purple-600 text-white font-bold"
                onClick={handleFinish}
              >
                🚀 Create Profile
              </Button>
            </div>

            <button
              className="w-full text-center text-purple-400/50 text-xs hover:text-purple-300"
              onClick={handleFinish}
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}