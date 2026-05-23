import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isSupabaseAuthConfigured, signInWithPassword, signUp } from '@/api/supabaseAuthClient';

export default function SupabaseLogin({ onSuccess, error }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState(error?.message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

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
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="space-y-2 border-b px-6 py-5">
          <h1 className="text-xl font-semibold">{isSignup ? 'Create account' : 'Sign in'}</h1>
          <p className="text-sm text-muted-foreground">The Poles</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {!isSupabaseAuthConfigured && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Supabase auth is not configured for this environment.
            </div>
          )}

          {message && (
            <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
              {message}
            </div>
          )}

          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="auth-full-name">Name</Label>
              <Input
                id="auth-full-name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
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
            />
          </div>

          <Button type="submit" className="w-full" disabled={!isSupabaseAuthConfigured || isSubmitting}>
            {isSignup ? <UserPlus /> : <LogIn />}
            {isSubmitting ? 'Please wait' : isSignup ? 'Sign up' : 'Sign in'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setMode(isSignup ? 'signin' : 'signup');
              setMessage('');
            }}
          >
            {isSignup ? 'Use an existing account' : 'Create a new account'}
          </Button>
        </form>
      </section>
    </main>
  );
}
