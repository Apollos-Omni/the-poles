import React, { useEffect, useState } from 'react';
import { CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { invokeBackendFunction } from '@/api/apiClient';

const fallbackChecks = [
  { key: 'supabaseConnected', label: 'Supabase connected', status: 'unknown' },
  { key: 'renderBackendHealth', label: 'Render backend health', status: 'unknown' },
  { key: 'vercelFrontendLive', label: 'Vercel frontend live', status: 'unknown' },
  { key: 'ebayKeyConfigured', label: 'eBay key configured', status: 'unknown' },
  { key: 'rawgKeyConfigured', label: 'RAWG key configured', status: 'unknown' },
  { key: 'paymentProviderNotEnabled', label: 'Payment provider not enabled', status: 'unknown' },
  { key: 'legalReviewPending', label: 'Legal review pending', status: 'pending' },
];

function statusMeta(status) {
  if (status === true || status === 'ready') return { label: 'Ready', Icon: CheckCircle2, className: 'bg-green-500/15 text-green-100 border-green-400/30' };
  if (status === false || status === 'blocked') return { label: 'Needs attention', Icon: XCircle, className: 'bg-red-500/15 text-red-100 border-red-400/30' };
  if (status === 'pending') return { label: 'Pending', Icon: CircleDashed, className: 'bg-yellow-500/15 text-yellow-100 border-yellow-400/30' };
  return { label: 'Unknown', Icon: CircleDashed, className: 'bg-slate-500/15 text-slate-100 border-slate-400/30' };
}

export default function PublicBetaReadiness() {
  const [checks, setChecks] = useState(fallbackChecks);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    invokeBackendFunction('publicBetaReadiness')
      .then((response) => {
        if (!mounted) return;
        setChecks(response.data?.checks || fallbackChecks);
        setSummary(response.data?.summary || '');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Could not load readiness status.');
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-4 text-white md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Badge className="mb-3 border border-yellow-400/30 bg-yellow-500/15 text-yellow-100">Owner/Admin only</Badge>
          <h1 className="text-3xl font-black">Public Beta Readiness</h1>
          <p className="mt-2 text-sm text-purple-100/65">
            Operational checklist for public beta. This does not claim final legal, payment, or fulfillment approval.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
        )}

        <Card className="border-white/10 bg-black/35 text-white">
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            {summary && <p className="text-sm text-purple-100/60">{summary}</p>}
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map((check) => {
              const meta = statusMeta(check.status);
              return (
                <div key={check.key} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{check.label}</p>
                    {check.note && <p className="mt-1 text-xs text-purple-100/55">{check.note}</p>}
                  </div>
                  <Badge className={`w-fit border ${meta.className}`}>
                    <meta.Icon className="mr-1.5 h-3.5 w-3.5" />
                    {meta.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
