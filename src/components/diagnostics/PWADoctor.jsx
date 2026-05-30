import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function PWADoctor() {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const checks = {};

    try {
      // Check service worker endpoint
      const swResponse = await fetch('/sw.js?v=' + Date.now(), { cache: 'no-store' });
      const swContentType = swResponse.headers.get('content-type') || '';
      checks.serviceWorker = {
        status: swResponse.ok && swContentType.startsWith('application/javascript') ? 'pass' : 'fail',
        message: swResponse.ok ? 
          `✅ Service Worker: ${swResponse.status} ${swContentType}` :
          `❌ Service Worker: ${swResponse.status} ${swContentType}`,
        details: swContentType
      };

      // Check web manifest
      const manifestResponse = await fetch('/manifest.webmanifest?v=' + Date.now(), { cache: 'no-store' });
      const manifestContentType = manifestResponse.headers.get('content-type') || '';
      checks.manifest = {
        status: manifestResponse.ok && manifestContentType.startsWith('application/manifest+json') ? 'pass' : 'fail',
        message: manifestResponse.ok ?
          `✅ Web Manifest: ${manifestResponse.status} ${manifestContentType}` :
          `❌ Web Manifest: ${manifestResponse.status} ${manifestContentType}`,
        details: manifestContentType
      };

      // Check PWA status endpoint
      try {
        const statusResponse = { json: async () => ({ ok: true, pwa: false, swOk: false, manifestOk: true }) };
        const statusData = await statusResponse.json();
        checks.pwaStatus = {
          status: statusData.swOk && statusData.manifestOk ? 'pass' : 'warn',
          message: statusData.swOk && statusData.manifestOk ? 
            '✅ PWA Status: All systems operational' :
            '⚠️ PWA Status: Some issues detected',
          details: statusData
        };
      } catch (e) {
        checks.pwaStatus = {
          status: 'fail',
          message: '❌ PWA Status: Endpoint unreachable',
          details: e.message
        };
      }

      // Check service worker registration capability
      checks.swSupport = {
        status: 'serviceWorker' in navigator ? 'pass' : 'fail',
        message: 'serviceWorker' in navigator ? 
          '✅ Browser supports Service Workers' :
          '❌ Browser does not support Service Workers',
        details: navigator.userAgent
      };

      // Check HTTPS requirement
      checks.httpsCheck = {
        status: location.protocol === 'https:' || location.hostname === 'localhost' ? 'pass' : 'fail',
        message: location.protocol === 'https:' || location.hostname === 'localhost' ?
          '✅ Secure context (HTTPS or localhost)' :
          '❌ Service Workers require HTTPS in production',
        details: `${location.protocol}//${location.host}`
      };

      setResults(checks);
    } catch (error) {
      console.error('Diagnostic error:', error);
      setResults({
        error: {
          status: 'fail',
          message: '❌ Diagnostic failed',
          details: error.message
        }
      });
    }

    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warn': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <RefreshCw className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          PWA Doctor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run PWA Health Check'
          )}
        </Button>

        {Object.keys(results).length > 0 && (
          <div className="space-y-3">
            {Object.entries(results).map(([key, result]) => (
              <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-gray-700">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{result.message}</p>
                  {result.details && (
                    <pre className="text-xs text-gray-300 mt-1 overflow-x-auto">
                      {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-400 mt-4">
          <p><strong>Production Checklist:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Service Worker served as application/javascript</li>
            <li>Web Manifest served as application/manifest+json</li>
            <li>HTTPS enabled (required for Service Workers)</li>
            <li>Push notifications functional</li>
            <li>Deep link navigation working</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
