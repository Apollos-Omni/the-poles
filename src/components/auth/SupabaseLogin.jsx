import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isSupabaseAuthConfigured, signInWithGoogle, signInWithPassword, signUp } from '@/api/supabaseAuthClient';

export default function SupabaseLogin({ onSuccess, error, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState(error?.message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const handleGoogle = async () => {
    setMessage('');
    setIsSubmitting(true);
    try {
      const result = await signInWithGoogle();
      if (result?.error) throw result.error;
    } catch (submitError) {
      setMessage(submitError?.message || 'Google sign in failed.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const result = isSignup
        ? await signUp(email, password, { full_name: fullName || undefined, name: fullName || undefined })
        : await signInWithPassword(email, password);

      if (result?.error) throw result.error;
      if (isSignup && !result?.data?.session) {
        setMessage('Check your email to confirm your account, then sign in.');
        return;
      }

      await onSuccess?.();
    } catch (submitError) {
      setMessage(submitError?.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-purple-950 to-slate-950 px-4 py-10 text-white">
      <section className="w-full max-w-sm rounded-2xl border border-cyan-300/20 bg-white/[0.07] text-white shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
        <div className="space-y-2 border-b border-white/10 px-6 py-5">
          <h1 className="text-xl font-semibold">{isSignup ? 'Create account' : 'Sign in'}</h1>
          <p className="text-sm text-cyan-100/65">The Poles secure access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {!isSupabaseAuthConfigured && (
            <div className="rounded-md border border-red-400/40 bg-red-950/30 px-3 py-2 text-sm text-red-100">
              Supabase auth is not configured for this environment.
            </div>
          )}

          {message && (
            <div className="rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-purple-100/80">
              {message}
            </div>
          )}

          <Button type="button" className="w-full bg-white text-black hover:bg-cyan-100" disabled={!isSupabaseAuthConfigured || isSubmitting} onClick={handleGoogle}>
            <LogIn className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-purple-200/45">
            <span className="h-px flex-1 bg-white/10" />
            Email
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="auth-full-name">Name</Label>
              <Input
                id="auth-full-name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="border-purple-400/30 bg-black/30 text-white"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="border-purple-400/30 bg-black/30 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="border-purple-400/30 bg-black/30 text-white"
            />
          </div>

          <Button type="submit" className="w-full bg-purple-700 text-white hover:bg-purple-600" disabled={!isSupabaseAuthConfigured || isSubmitting}>
            {isSignup ? <UserPlus /> : <LogIn />}
            {isSubmitting ? 'Please wait' : isSignup ? 'Sign up' : 'Sign in'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-purple-100 hover:bg-white/10 hover:text-white"
            onClick={() => {
              setMode(isSignup ? 'signin' : 'signup');
              setMessage('');
            }}
          >
            {isSignup ? 'Use an existing account' : 'Create a new account'}
          </Button>

          <p className="text-xs leading-relaxed text-purple-100/55">
            MFA is not required at first login. Admin, payment, fulfillment, shipping address, and prize actions can later require Supabase MFA challenges.
          </p>
        </form>
      </section>
    </main>
  );
}
