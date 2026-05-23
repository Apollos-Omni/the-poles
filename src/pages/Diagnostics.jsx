import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductionMonitor from '@/components/admin/ProductionMonitor';
import PWADoctor from '@/components/diagnostics/PWADoctor';
import CanaryWidget from '@/components/diagnostics/CanaryWidget';

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            System Diagnostics
          </h1>
          <p className="text-gray-400 mt-2">
            Real-time status of production systems and PWA features.
          </p>
        </header>

        <CanaryWidget />
        <ProductionMonitor />
        <PWADoctor />
        
      </div>
    </div>
  );
}