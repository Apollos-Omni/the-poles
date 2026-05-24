import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { exchangeCodeForSession } from '@/api/supabaseAuthClient';
import { useAuth } from '@/lib/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function finishAuth() {
      const result = await exchangeCodeForSession();
      if (result?.error) {
        if (mounted) setError(result.error.message || 'Could not complete sign in.');
        return;
      }

      await checkAppState();
      navigate('/Dashboard', { replace: true });
    }

    finishAuth();
    return () => {
      mounted = false;
    };
  }, [checkAppState, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-purple-950 to-slate-950 px-4 text-white">
      <section className="w-full max-w-sm rounded-2xl border border-cyan-300/20 bg-white/[0.07] p-6 text-center shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
        {error ? (
          <>
            <h1 className="text-xl font-bold">Sign in could not finish</h1>
            <p className="mt-3 text-sm text-purple-100/70">{error}</p>
            <Link to="/SignIn" className="mt-5 inline-block text-sm font-semibold text-cyan-200 hover:text-white">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-200" />
            <h1 className="mt-4 text-xl font-bold">Completing sign in</h1>
            <p className="mt-2 text-sm text-purple-100/65">Securing your session...</p>
          </>
        )}
      </section>
    </main>
  );
}
