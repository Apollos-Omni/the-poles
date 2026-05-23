
import React, { useState, useEffect, useCallback } from 'react';
import { FulfillmentEvent } from '@/entities/FulfillmentEvent';
import { VirtualCard } from '@/entities/VirtualCard';
import { PurchaseOrder } from '@/entities/PurchaseOrder';
import { AuditEvent } from '@/entities/AuditEvent';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  CreditCard, 
  ShoppingCart, 
  Package, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Shield
} from 'lucide-react';

export default function PurchasingAgentSimulator({ match, product, winner, onComplete }) {
  const [agentStatus, setAgentStatus] = useState('initializing');
  const [currentStep, setCurrentStep] = useState(0);
  const [auditTrail, setAuditTrail] = useState([]); // This will now store AuditEvent entities
  const [virtualCard, setVirtualCard] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [error, setError] = useState(null);

  const steps = [
    'Price Verification',
    'Virtual Card Creation',
    'Order Placement',
    'Receipt Processing',
    'Tracking Assignment',
    'Completion'
  ];

  const logAuditEvent = useCallback(async (stage, message, meta = {}, code = null) => {
    const event = await AuditEvent.create({
        match_id: match.id,
        actor: 'agent',
        stage,
        code,
        message,
        meta
    });
    setAuditTrail(prev => [event, ...prev]); // Add new event to the beginning of the trail
  }, [match.id]);

  const simulatePriceCheck = useCallback(async () => {
    // Simulate real-time price check via Amazon PA-API
    const currentPrice = product.price_cents;
    const priceVariation = Math.random() * 0.05 - 0.025; // ±2.5% variation
    const livePrice = Math.round(currentPrice * (1 + priceVariation));
    
    const driftPct = Math.abs(livePrice - currentPrice) / currentPrice;
    
    return {
      storedPrice: currentPrice,
      livePrice: livePrice,
      driftPct: driftPct,
      maxAllowedDrift: 0.03,
      decision: driftPct <= 0.03 ? 'PROCEED' : 'PRICE_DRIFT'
    };
  }, [product.price_cents]);

  const simulateVirtualCardCreation = useCallback(async (fulfillmentEvent) => {
    const card = await VirtualCard.create({
      match_id: fulfillmentEvent.match_id,
      issuer_id: 'stripe_issuing',
      budget_cents: fulfillmentEvent.payments_data.budgetCents,
      card_token: `tok_${Math.random().toString(36).substr(2, 9)}`,
      memo: fulfillmentEvent.payments_data.memo,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      masked_pan: `4242****${Math.floor(Math.random() * 9000) + 1000}`
    });
    
    return card;
  }, []);

  const simulateOrderPlacement = useCallback(async (card, fulfillmentEvent) => {
    const basePrice = product.price_cents;
    const tax = Math.round(basePrice * 0.08); // 8% tax
    const shipping = 0; // Free shipping
    const total = basePrice + tax + shipping;

    const order = await PurchaseOrder.create({
      match_id: fulfillmentEvent.match_id,
      retailer_order_id: `AMZ-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      retailer_id: 'amazon',
      product_asin: product.product_id,
      item_cents: basePrice,
      tax_cents: tax,
      shipping_cents: shipping,
      total_cents: total,
      receipt_url: `https://receipts.example.com/masked_${Date.now()}.pdf`,
      tracking_carrier: 'UPS',
      tracking_number: `1Z999AA1${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
      order_status: 'PLACED',
      gift_order: true,
      affiliate_used: false // Policy says no affiliate on self-purchase
    });

    // Update virtual card spend
    await VirtualCard.update(card.id, {
      spend_cents: total,
      status: 'USED'
    });

    return order;
  }, [product.price_cents, product.product_id]);

  const executeAgentSteps = useCallback(async (fulfillmentEvent) => {
    try {
      // Step 1: Price Verification
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const priceCheckResult = await simulatePriceCheck();
      await logAuditEvent('PRICE_CHECK', 'Fetching live price', { url: product.source_url, result: priceCheckResult });

      if (priceCheckResult.decision === 'PRICE_DRIFT') {
        await logAuditEvent('EXCEPTION', 'Price drift beyond policy', { live: priceCheckResult.livePrice, stored: priceCheckResult.storedPrice, drift: priceCheckResult.driftPct }, 'PRICE_DRIFT');
        setError({ code: 'PRICE_DRIFT', message: `Price drifted by ${(priceCheckResult.driftPct * 100).toFixed(1)}%` });
        setAgentStatus('error');
        return;
      }
      
      // Step 2: Virtual Card Creation
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const card = await simulateVirtualCardCreation(fulfillmentEvent);
      setVirtualCard(card);
      await logAuditEvent('CARD_CREATE', 'Creating one-time virtual card', { budgetCents: card.budget_cents, memo: card.memo });

      // Step 3: Order Placement
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const order = await simulateOrderPlacement(card, fulfillmentEvent);
      setPurchaseOrder(order);
      await logAuditEvent('ORDER', 'Placing order with retailer', { retailer: order.retailer_id, orderId: order.retailer_order_id, totalCents: order.total_cents });

      // Step 4: Receipt Processing (and logging tracking info)
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await logAuditEvent('TRACKING', 'Captured tracking number', { carrier: order.tracking_carrier, tracking: order.tracking_number, eta: order.estimated_delivery });
      
      // Step 5: Tracking Assignment (brief pause)
      setCurrentStep(5);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 6: Completion
      setCurrentStep(6);
      setAgentStatus('completed');
      await logAuditEvent('COMPLETION', 'Fulfillment process completed successfully', { orderId: order.retailer_order_id });
      
      // Update fulfillment event
      await FulfillmentEvent.update(fulfillmentEvent.id, {
        status: 'SHIPPED',
        agent_output: {
          status: 'SHIPPED',
          orderId: order.retailer_order_id,
          totals: {
            itemCents: order.item_cents,
            taxCents: order.tax_cents,
            shipCents: order.shipping_cents,
            grandCents: order.total_cents
          },
          tracking: {
            carrier: order.tracking_carrier,
            code: order.tracking_number,
            eta: order.estimated_delivery
          },
          audit: { priceAtCheckout: product.price_cents, idem: fulfillmentEvent.idempotency_key }
        }
        // The audit_trail is no longer stored directly in fulfillment event but through AuditEvent entity
      });

      if (onComplete) onComplete(order);

    } catch (err) {
      console.error('Agent simulation error:', err);
      setError({ code: 'UNKNOWN', message: err.message });
      await logAuditEvent('EXCEPTION', `Unhandled agent error: ${err.message}`, { stack: err.stack }, 'UNKNOWN');
      setAgentStatus('error');
    }
  }, [product, onComplete, logAuditEvent, simulatePriceCheck, simulateVirtualCardCreation, simulateOrderPlacement]);

  const initiateFulfillment = useCallback(async () => {
    setAgentStatus('processing');
    
    // Create fulfillment event
    const fulfillmentEvent = await FulfillmentEvent.create({
      event_type: 'FULFILL_MATCH',
      match_id: match.id,
      winner_user_id: winner.id,
      product_data: {
        retailer: 'amazon',
        sourceUrl: product.source_url,
        asin: product.product_id,
        title: product.title,
        image: product.image_urls[0],
        priceCents: product.price_cents,
        affiliate: product.affiliate_meta
      },
      policy_data: {
        maxDriftPct: 0.03,
        bufferCents: 0,
        substitution: 'winner-optin',
        useAffiliateOnSelfPurchase: false
      },
      payments_data: {
        issuer: 'stripe_issuing',
        budgetCents: Math.ceil(product.price_cents * 1.1), // 10% buffer
        memo: `matchId:${match.id} / userId:${winner.id}`
      },
      status: 'PROCESSING',
      idempotency_key: `fulfill-${match.id}-${Date.now()}`
    });

    // Simulate agent steps
    await executeAgentSteps(fulfillmentEvent);
  }, [match.id, product, winner, executeAgentSteps]);

  useEffect(() => {
    if (match && product && winner) {
      initiateFulfillment();
    }
  }, [initiateFulfillment, match, product, winner]); // Added match, product, winner as explicit dependencies for clarity, though initiateFulfillment already depends on them

  const getStatusIcon = () => {
    switch (agentStatus) {
      case 'processing': return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />; // Changed from 'exception' to 'error'
      default: return <Bot className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / steps.length) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Agent Status Card */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-blue-800">Base44 Purchasing Agent</CardTitle>
                <p className="text-blue-600 text-sm">Secure autonomous fulfillment system</p>
              </div>
            </div>
            <Badge className={`${
              agentStatus === 'completed' ? 'bg-green-100 text-green-800' :
              agentStatus === 'error' ? 'bg-red-100 text-red-800' : // Changed from 'exception' to 'error'
              'bg-blue-100 text-blue-800'
            }`}>
              {agentStatus.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {currentStep}/{steps.length} steps</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-xs font-semibold">PCI Compliant</p>
                <p className="text-xs text-gray-500">No raw PANs stored</p>
              </div>
              <div className="text-center">
                <CreditCard className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-xs font-semibold">Virtual Cards</p>
                <p className="text-xs text-gray-500">One-time use only</p>
              </div>
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-xs font-semibold">Gift Orders</p>
                <p className="text-xs text-gray-500">Privacy protected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Details */}
      {agentStatus === 'processing' && (
        <Card className="bg-white border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">
              Step {currentStep}: {steps[currentStep - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-gray-600">
                {currentStep === 1 && 'Verifying product price via Amazon PA-API...'}
                {currentStep === 2 && 'Creating one-time virtual card via issuer...'}
                {currentStep === 3 && 'Placing gift order to winner address...'}
                {currentStep === 4 && 'Processing receipt and capturing tracking information...'}
                {currentStep === 5 && 'Finalizing tracking assignment...'}
                {currentStep === 6 && 'Finalizing fulfillment and audit trail...'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Virtual Card Details */}
      {virtualCard && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Virtual Card Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold">Masked PAN</p>
                <p className="text-gray-600 font-mono">{virtualCard.masked_pan}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Budget</p>
                <p className="text-gray-600">${(virtualCard.budget_cents / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Status</p>
                <Badge className="bg-green-100 text-green-800">{virtualCard.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold">Expires</p>
                <p className="text-gray-600">{new Date(virtualCard.expires_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Order Details */}
      {purchaseOrder && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Placed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold">Order ID</p>
                <p className="text-gray-600 font-mono">{purchaseOrder.retailer_order_id}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Total Charged</p>
                <p className="text-gray-600">${(purchaseOrder.total_cents / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Tracking</p>
                <p className="text-gray-600 font-mono">{purchaseOrder.tracking_number}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">ETA</p>
                <p className="text-gray-600">{new Date(purchaseOrder.estimated_delivery).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ Gift order placed successfully to protect winner privacy
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditTrail.map((audit, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" /> {/* Assuming success for most, could add logic for error */}
                <div className="flex-1">
                  <p className="font-semibold text-sm">{audit.stage.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-xs text-gray-600">{audit.message}</p>
                  <p className="text-xs text-gray-500">{new Date(audit.created_at).toLocaleString()}</p>
                </div>
                <Badge className={`${
                  audit.stage === 'EXCEPTION' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                } text-xs`}>
                  {audit.code || audit.stage}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Agent Exception ({error.code})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
