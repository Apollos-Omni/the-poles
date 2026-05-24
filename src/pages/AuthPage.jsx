import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SupabaseLogin from '@/components/auth/SupabaseLogin';
import { useAuth } from '@/lib/AuthContext';

export default function AuthPage({ mode = 'signin' }) {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();

  const handleSuccess = async () => {
    await checkAppState();
    navigate('/Dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute left-4 top-4 z-10">
        <Link to="/" className="text-sm text-purple-200 hover:text-white">Back to The Poles</Link>
      </div>
      <SupabaseLogin initialMode={mode} onSuccess={handleSuccess} />
    </div>
  );
}
