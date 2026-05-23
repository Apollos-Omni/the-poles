
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Shield, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

// Mock configuration for demo purposes
const mockConfig = {
  production: {
    enabled: false, // Set to true when production issuer is configured
    apiKey: null,
    baseUrl: null
  }
};

// Issuer interface and implementations
const IssuerProviders = {
  mock: {
    name: 'Mock Issuer (Demo)',
    enabled: true,
    createOneTimeCard: async (request) => {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      return {
        token: `tok_${Math.random().toString(36).slice(2)}`,
        last4: '4242',
        expiry: '12/29',
        status: 'active',
        amountCents: request.amountCents,
        mcc: request.mcc,
        merchant: request.merchant
      };
    },
    voidCard: async (token) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { status: 'voided' };
    }
  },

  production: {
    name: 'Production Issuer',
    enabled: () => mockConfig.production.enabled,
    createOneTimeCard: async (request) => {
      // Would call real issuer API here
      throw new Error('Production issuer not yet configured');
    },
    voidCard: async (token) => {
      throw new Error('Production issuer not yet configured');
    }
  }
};

export default function IssuerInterface({ matchId, productData, onCardCreated, onError }) {
  const [currentProvider, setCurrentProvider] = useState('mock');
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [createdCard, setCreatedCard] = useState(null);
  const [error, setError] = useState(null);

  const issuer = IssuerProviders[currentProvider];

  const createVirtualCard = async () => {
    setIsCreatingCard(true);
    setError(null);

    try {
      const cardRequest = {
        amountCents: productData.priceCents + Math.floor(productData.priceCents * 0.1), // 10% buffer
        memo: `Match: ${matchId}`,
        mcc: '5399', // Misc General Merchandise
        merchant: productData.retailer,
        singleUse: true,
        expiresInHours: 24
      };

      const card = await issuer.createOneTimeCard(cardRequest);
      
      setCreatedCard({
        ...card,
        matchId,
        createdAt: new Date().toISOString()
      });

      if (onCardCreated) {
        onCardCreated(card);
      }

    } catch (err) {
      console.error('Card creation error:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setIsCreatingCard(false);
    }
  };

  const voidCard = async () => {
    if (!createdCard) return;

    try {
      await issuer.voidCard(createdCard.token);
      setCreatedCard(null);
    } catch (err) {
      console.error('Card void error:', err);
      setError(err.message);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Virtual Card Issuer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Issuer Provider
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(IssuerProviders).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => setCurrentProvider(key)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  currentProvider === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{provider.name}</span>
                  <Badge className={
                    (typeof provider.enabled === 'function' ? provider.enabled() : provider.enabled)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }>
                    {(typeof provider.enabled === 'function' ? provider.enabled() : provider.enabled) ? 'Ready' : 'Config Needed'}
                  </Badge>
                </div>
                {currentProvider === key && (
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Card Creation */}
        {productData && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Card Request Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Product Price:</span>
                  <span className="font-medium">${(productData.priceCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Buffer (10%):</span>
                  <span className="font-medium">
                    ${(Math.floor(productData.priceCents * 0.1) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-slate-600">Card Limit:</span>
                  <span className="font-bold">
                    ${((productData.priceCents + Math.floor(productData.priceCents * 0.1)) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Merchant:</span>
                  <span className="font-medium capitalize">{productData.retailer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">MCC Code:</span>
                  <span className="font-medium">5399 (General Merchandise)</span>
                </div>
              </div>
            </div>

            {!createdCard ? (
              <Button 
                onClick={createVirtualCard} 
                disabled={isCreatingCard || !issuer.enabled()}
                className="w-full"
              >
                {isCreatingCard ? 'Creating Virtual Card...' : 'Create One-Time Card'}
              </Button>
            ) : (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-green-800">Virtual Card Created</h4>
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Card Token:</span>
                      <span className="font-mono font-medium">
                        {createdCard.token.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Last 4 Digits:</span>
                      <span className="font-medium">****{createdCard.last4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Expiry:</span>
                      <span className="font-medium">{createdCard.expiry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Limit:</span>
                      <span className="font-medium">
                        ${(createdCard.amountCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={voidCard}
                    className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Void Card
                  </Button>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Security Features */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-3">
            <h4 className="font-medium text-slate-800">Security Features</h4>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Single-use virtual cards</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Amount-capped spending limits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>MCC restrictions enforced</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>24-hour automatic expiry</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>3DS authentication required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Tokenized storage (no PAN retention)</span>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
