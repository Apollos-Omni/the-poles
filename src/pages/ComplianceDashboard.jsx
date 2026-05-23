import React, { useState, useEffect } from 'react';
import { ComplianceCheck } from '@/entities/ComplianceCheck';
import { PSPTransaction } from '@/entities/PSPTransaction';
import { RetailerConnector } from '@/entities/RetailerConnector';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  CreditCard,
  Store,
  FileText,
  RefreshCw
} from 'lucide-react';

export default function ComplianceDashboard() {
  const [complianceChecks, setComplianceChecks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setIsLoading(true);
    try {
      // Load sample compliance checks
      const sampleChecks = [
        // PSP Requirements
        { id: '1', component: 'psp', requirement: 'Tokenization only - no PAN storage', status: 'compliant', severity: 'critical', last_verified: new Date().toISOString() },
        { id: '2', component: 'psp', requirement: 'Written approval for pay-to-play contests', status: 'compliant', severity: 'critical', evidence_url: 'https://docs.example.com/legal-approval.pdf' },
        { id: '3', component: 'psp', requirement: 'Idempotency keys on create/confirm', status: 'compliant', severity: 'high' },
        { id: '4', component: 'psp', requirement: 'Clear dispute workflow and evidence upload', status: 'pending', severity: 'high', remediation_plan: 'Implement dispute management UI by Q2' },
        { id: '5', component: 'psp', requirement: 'Region gating - block restricted geos', status: 'compliant', severity: 'critical' },
        
        // Issuer Requirements  
        { id: '6', component: 'issuer', requirement: 'One-time cards with amount caps', status: 'compliant', severity: 'critical' },
        { id: '7', component: 'issuer', requirement: 'MCC restrictions enforced', status: 'compliant', severity: 'high' },
        { id: '8', component: 'issuer', requirement: 'BIN diversity and rotation plan', status: 'pending', severity: 'medium', remediation_plan: 'Implement quarterly BIN rotation' },
        { id: '9', component: 'issuer', requirement: '3DS where required; SCA exemptions documented', status: 'compliant', severity: 'critical' },
        { id: '10', component: 'issuer', requirement: 'Webhooks for auth/capture/void/refund', status: 'compliant', severity: 'high' },
        { id: '11', component: 'issuer', requirement: 'Reconciliation report → match ledger', status: 'pending', severity: 'high', remediation_plan: 'Daily reconciliation automation' },
        
        // Connector Requirements
        { id: '12', component: 'connector', requirement: 'Official APIs only - no scraping', status: 'compliant', severity: 'critical' },
        { id: '13', component: 'connector', requirement: 'Cache TTLs per policy', status: 'compliant', severity: 'high' },
        { id: '14', component: 'connector', requirement: 'Re-price at join and purchase', status: 'compliant', severity: 'high' },
        { id: '15', component: 'connector', requirement: 'Correct locale/currency handling', status: 'compliant', severity: 'medium' },
        { id: '16', component: 'connector', requirement: 'No incentivized affiliate clicks', status: 'compliant', severity: 'critical' },
        { id: '17', component: 'connector', requirement: 'FTC disclosure strings in UI', status: 'pending', severity: 'high', remediation_plan: 'Add disclosure components to all product displays' }
      ];
      
      setComplianceChecks(sampleChecks);

      // Sample transactions
      const sampleTransactions = [
        { id: '1', match_id: 'match_123', amount_cents: 2999, status: 'captured', region: 'US', created_at: new Date().toISOString() },
        { id: '2', match_id: 'match_124', amount_cents: 1499, status: 'disputed', region: 'CA', created_at: new Date().toISOString() },
        { id: '3', match_id: 'match_125', amount_cents: 4999, status: 'authorized', region: 'US', created_at: new Date().toISOString() }
      ];
      setTransactions(sampleTransactions);

      // Sample connectors
      const sampleConnectors = [
        { id: '1', retailer_id: 'amazon', api_type: 'amazon_paapi', health_status: 'healthy', cache_ttl_minutes: 30, last_health_check: new Date().toISOString() },
        { id: '2', retailer_id: 'walmart', api_type: 'walmart_affiliate', health_status: 'degraded', cache_ttl_minutes: 45, last_health_check: new Date(Date.now() - 300000).toISOString() },
        { id: '3', retailer_id: 'ebay', api_type: 'ebay_browse', health_status: 'healthy', cache_ttl_minutes: 60, last_health_check: new Date().toISOString() }
      ];
      setConnectors(sampleConnectors);

    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthBadge = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const complianceScore = complianceChecks.length > 0 
    ? Math.round((complianceChecks.filter(c => c.status === 'compliant').length / complianceChecks.length) * 100)
    : 0;

  const criticalIssues = complianceChecks.filter(c => c.status !== 'compliant' && c.severity === 'critical').length;
  const pendingIssues = complianceChecks.filter(c => c.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">PSP + Issuer + Connectors Compliance</h1>
          <p className="text-slate-600">Monitor payment processing, virtual card issuing, and retailer connector compliance</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Compliance Score</p>
                  <p className="text-3xl font-bold text-slate-800">{complianceScore}%</p>
                </div>
                <Shield className={`w-8 h-8 ${complianceScore >= 90 ? 'text-green-500' : complianceScore >= 70 ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
              <Progress value={complianceScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Critical Issues</p>
                  <p className="text-3xl font-bold text-red-600">{criticalIssues}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Items</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingIssues}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Connectors</p>
                  <p className="text-3xl font-bold text-green-600">{connectors.filter(c => c.health_status === 'healthy').length}</p>
                </div>
                <Store className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Checks by Component */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {['psp', 'issuer', 'connector'].map(component => {
            const componentChecks = complianceChecks.filter(c => c.component === component);
            const componentScore = componentChecks.length > 0 
              ? Math.round((componentChecks.filter(c => c.status === 'compliant').length / componentChecks.length) * 100)
              : 0;

            return (
              <Card key={component}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{component}</span>
                    <Badge className={componentScore >= 90 ? 'bg-green-100 text-green-800' : componentScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {componentScore}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {componentChecks.map(check => (
                    <div key={check.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{check.requirement}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusBadge(check.status)} size="sm">
                            {check.status}
                          </Badge>
                          <Badge className={getSeverityBadge(check.severity)} size="sm">
                            {check.severity}
                          </Badge>
                        </div>
                        {check.remediation_plan && (
                          <p className="text-xs text-slate-600 mt-1">{check.remediation_plan}</p>
                        )}
                      </div>
                      {check.status === 'compliant' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Recent PSP Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Match {tx.match_id}</p>
                    <p className="text-xs text-slate-600">${(tx.amount_cents / 100).toFixed(2)} • {tx.region}</p>
                  </div>
                  <Badge className={tx.status === 'captured' ? 'bg-green-100 text-green-800' : tx.status === 'disputed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                    {tx.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connector Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Retailer Connector Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {connectors.map(connector => (
                <div key={connector.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{connector.retailer_id}</h4>
                    <Badge className={getHealthBadge(connector.health_status)}>
                      {connector.health_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Cache TTL: {connector.cache_ttl_minutes}m
                  </p>
                  <p className="text-xs text-slate-500">
                    Last check: {new Date(connector.last_health_check).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}