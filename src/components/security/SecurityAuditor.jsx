import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SecureStorage } from './SecureStorage';

export const SecurityAuditor = ({ isVisible = false }) => {
  const [auditResults, setAuditResults] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const auditEnvironment = useCallback(() => {
    const issues = [];
    
    // Check for development mode exposure
    const nodeEnv = import.meta.env?.MODE ?? 'production';
    if (nodeEnv !== 'production' && window.location.hostname !== 'localhost') {
      issues.push({
        type: 'DEV_MODE_PROD',
        severity: 'HIGH',
        message: 'Development mode detected in production environment'
      });
    }
    
    // Check for console exposure
    if (typeof window !== 'undefined' && window.console && !window.console._audited) {
      issues.push({
        type: 'CONSOLE_EXPOSED',
        severity: 'MEDIUM',
        message: 'Console debugging tools accessible'
      });
      window.console._audited = true;
    }
    
    return issues;
  }, []);

  const auditCodePatterns = useCallback(() => {
    const issues = [];
    
    // Check global variables for secrets
    if (typeof window !== 'undefined') {
      Object.keys(window).forEach(key => {
        if (SecureStorage.isSensitiveKey(key)) {
          issues.push({
            type: 'GLOBAL_SENSITIVE',
            key,
            severity: 'HIGH',
            message: 'Potentially sensitive global variable'
          });
        }
      });
    }
    
    return issues;
  }, []);

  const runSecurityAudit = useCallback(() => {
    const results = {
      localStorage: SecureStorage.auditLocalStorage(),
      environment: auditEnvironment(),
      codebase: auditCodePatterns(),
      timestamp: new Date().toISOString()
    };
    
    setAuditResults(results);
    
    // Log critical issues
    const criticalIssues = results.localStorage.filter(i => i.severity === 'CRITICAL');
    if (criticalIssues.length > 0) {
      console.error('SECURITY AUDIT: Critical issues found', criticalIssues);
    }
  }, [auditEnvironment, auditCodePatterns]);

  useEffect(() => {
    if (isVisible) {
      runSecurityAudit();
    }
  }, [isVisible, runSecurityAudit]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getTotalIssues = () => {
    if (!auditResults) return 0;
    return auditResults.localStorage.length + 
           auditResults.environment.length + 
           auditResults.codebase.length;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-gray-900 border-gray-700 text-white w-80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Security Audit
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Total Issues:</span>
            <Badge variant={getTotalIssues() > 0 ? 'destructive' : 'default'}>
              {getTotalIssues()}
            </Badge>
          </div>
          
          {auditResults && isExpanded && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...auditResults.localStorage, ...auditResults.environment, ...auditResults.codebase]
                .map((issue, index) => (
                <div key={index} className="bg-gray-800 p-2 rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(issue.severity)}`} />
                    <span className="font-mono text-gray-300">{issue.type}</span>
                  </div>
                  <p className="text-gray-400">{issue.message}</p>
                  {issue.key && (
                    <code className="text-yellow-400 text-xs">Key: {issue.key}</code>
                  )}
                </div>
              ))}
              
              {getTotalIssues() === 0 && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  No security issues detected
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={runSecurityAudit}>
              Re-audit
            </Button>
            <Button size="sm" variant="outline" onClick={() => SecureStorage.clear()}>
              Clear Storage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};