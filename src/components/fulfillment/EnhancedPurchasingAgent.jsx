import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bot, 
  CreditCard, 
  ShoppingCart, 
  Truck, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Globe,
  Shield
} from 'lucide-react';
import RetailerResolver from './RetailerResolver';
import IssuerInterface from './IssuerInterface';

export default function EnhancedPurchasingAgent({ match, product, winner, onComplete }) {
  const [stage, setStage] = useState('init'); // init -> resolve -> card -> purchase -> tracking -> complete
  const [progress, setProgress] = useState(0);
  const [agentLogs, setAgentLogs] = useState([]);
  const [resolvedProduct, setResolvedProduct] = useState(null);
  const [virtualCard, setVirtualCard] = useState(null);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const addLog = (stage, message, type = 'info', metadata = {}) => {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      stage,
      message,
      type, // info | success | warning | error
      metadata
    };
    setAgentLogs(prev => [...prev, logEntry]);
    return logEntry;
  };

  // Simulate the enhanced agent workflow
  useEffect(() => {
    const runAgent = async () => {
      try {
        // Stage 1: Product Resolution
        setStage('resolve');
        setProgress(10);
        addLog('RESOLVE', 'Initializing product resolution...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1000));

        addLog('RESOLVE', `Detecting retailer from URL: ${product.url}`, 'info');
        const retailer = detectRetailer(product.url);
        addLog('RESOLVE', `Retailer detected: ${retailer}`, 'success', { retailer });

        // Price validation
        setProgress(25);
        addLog('PRICE_CHECK', 'Validating current price...', 'info');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const priceDrift = (Math.random() - 0.5) * 0.04; // ±2% drift
        if (Math.abs(priceDrift) > 0.03) {
          throw new Error(`Price drift ${(priceDrift * 100).toFixed(1)}% exceeds 3% policy limit`);
        }
        
        addLog('PRICE_CHECK', `Price validated. Drift: ${(priceDrift * 100).toFixed(1)}%`, 'success');

        // Stage 2: Virtual Card Creation
        setStage('card');
        setProgress(40);
        addLog('CARD_CREATE', 'Creating one-time virtual card...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1200));

        const mockCard = {
          token: `tok_${Math.random().toString(36).slice(2)}`,
          last4: '4242',
          expiry: '12/29',
          amountCents: product.price_cents + Math.floor(product.price_cents * 0.1)
        };
        setVirtualCard(mockCard);
        addLog('CARD_CREATE', `Virtual card created: ****${mockCard.last4}`, 'success', mockCard);

        // Stage 3: Purchase Execution
        setStage('purchase');
        setProgress(60);
        addLog('ORDER', `Initiating purchase on ${retailer}...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockOrder = {
          orderId: `${retailer.toUpperCase()}-${Math.random().toString(36).slice(2, 8)}`,
          retailer,
          status: 'confirmed',
          total: product.price_cents,
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        };
        setOrder(mockOrder);
        addLog('ORDER', `Order placed successfully: ${mockOrder.orderId}`, 'success', mockOrder);

        // Stage 4: Tracking Setup
        setStage('tracking');
        setProgress(80);
        addLog('TRACKING', 'Setting up delivery tracking...', 'info');
        await new Promise(resolve => setTimeout(resolve, 800));

        const trackingNumber = `1Z${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
        addLog('TRACKING', `Tracking number: ${trackingNumber}`, 'success', { trackingNumber });

        // Stage 5: Complete
        setStage('complete');
        setProgress(100);
        addLog('COMPLETE', 'Fulfillment completed successfully', 'success');
        
        if (onComplete) {
          onComplete({
            ...mockOrder,
            trackingNumber,
            virtualCard: mockCard
          });
        }

      } catch (err) {
        console.error('Agent error:', err);
        setError(err.message);
        addLog('EXCEPTION', `Agent error: ${err.message}`, 'error');
        setStage('error');
      }
    };

    runAgent();
  }, [match, product, winner, onComplete]);

  const detectRetailer = (url) => {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes('amazon.')) return 'amazon';
    if (domain.includes('walmart.')) return 'walmart';
    if (domain.includes('ebay.')) return 'ebay';
    return 'unknown';
  };

  const getStageIcon = (stageName) => {
    switch (stageName) {
      case 'resolve': return Globe;
      case 'card': return CreditCard;
      case 'purchase': return ShoppingCart;
      case 'tracking': return Truck;
      case 'complete': return CheckCircle;
      default: return Bot;
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Bot;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Main Progress Card */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-blue-600" />
            Enhanced Purchasing Agent
            <Badge className={stage === 'complete' ? 'bg-green-100 text-green-800' : stage === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
              {stage === 'complete' ? 'Complete' : stage === 'error' ? 'Failed' : 'Running'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stage Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'resolve', label: 'Resolve', icon: Globe },
              { key: 'card', label: 'Virtual Card', icon: CreditCard },
              { key: 'purchase', label: 'Purchase', icon: ShoppingCart },
              { key: 'tracking', label: 'Tracking', icon: Truck },
              { key: 'complete', label: 'Complete', icon: CheckCircle }
            ].map((stageInfo, index) => (
              <div key={stageInfo.key} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  stage === stageInfo.key ? 'bg-blue-100 text-blue-600' :
                  progress > index * 20 ? 'bg-green-100 text-green-600' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {stage === stageInfo.key && progress < 100 ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <stageInfo.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs text-slate-600">{stageInfo.label}</span>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Agent failed: {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Summary */}
          {stage === 'complete' && order && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Order Placed</h4>
                  <p className="text-green-700 text-sm">#{order.orderId}</p>
                  <p className="text-green-600 text-xs">
                    ${(order.total / 100).toFixed(2)} charged
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Virtual Card</h4>
                  <p className="text-blue-700 text-sm">****{virtualCard?.last4}</p>
                  <p className="text-blue-600 text-xs">Single-use card consumed</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Delivery</h4>
                  <p className="text-purple-700 text-sm">
                    Est: {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                  <p className="text-purple-600 text-xs">Tracking active</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Logs */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Agent Execution Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {agentLogs.map((log) => {
              const IconComponent = getLogIcon(log.type);
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <IconComponent className={`w-4 h-4 mt-0.5 ${getLogColor(log.type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {log.stage}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{log.message}</p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <pre className="text-xs text-slate-500 mt-1 bg-slate-100 p-2 rounded">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}