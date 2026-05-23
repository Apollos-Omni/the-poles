import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-yellow-400 mx-auto" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-purple-300/70 text-sm">
          Your current role does not have access to this area.
        </p>
        <Link to="/Dashboard">
          <Button className="bg-purple-700 hover:bg-purple-600 text-white">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
