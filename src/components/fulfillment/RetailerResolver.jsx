
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Globe, Loader2 } from 'lucide-react';

// Mock configuration for demo purposes (in production, this would come from backend)
const mockConfig = {
  amazon: {
    enabled: true,
    assocTag: 'demo-20' // Equivalent to AMAZON_ASSOC_TAG
  },
  walmart: {
    enabled: true // Equivalent to WALMART_PARTNER_ID & WALMART_API_KEY being present
  },
  ebay: {
    enabled: true, // Equivalent to EBAY_APP_ID being present
    campaignId: 'demo-campaign' // Equivalent to EBAY_CAMPAIGN_ID
  }
};

// Retailer connector implementations
const retailerConnectors = {
  amazon: {
    name: 'Amazon PA-API',
    enabled: () => mockConfig.amazon.enabled,
    extractId: (url) => {
      const match = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/i);
      return match ? (match[1] || match[2]) : null;
    },
    resolve: async (url) => ({
      id: 'B08N5WRWNW',
      title: 'Echo Dot (5th Gen) Smart Speaker with Alexa',
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop',
      priceCents: 4999,
      currency: 'USD',
      affiliateLink: `${url}?tag=${mockConfig.amazon.assocTag}`,
      availability: 'in_stock'
    })
  },

  walmart: {
    name: 'Walmart Partner API',
    enabled: () => mockConfig.walmart.enabled,
    extractId: (url) => {
      const match = url.match(/\/ip\/(?:[^/]+)\/(\d+)/i);
      return match ? match[1] : null;
    },
    resolve: async (url) => ({
      id: '55126484',
      title: 'Nintendo Switch Console with Neon Joy-Con',
      image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?w=400&h=400&fit=crop',
      priceCents: 29999,
      currency: 'USD',
      affiliateLink: `${url}?athbdg=L1600`,
      availability: 'in_stock'
    })
  },

  ebay: {
    name: 'eBay Browse API + EPN',
    enabled: () => mockConfig.ebay.enabled,
    extractId: (url) => {
      const match = url.match(/\/itm\/(\d+)/i);
      return match ? match[1] : null;
    },
    resolve: async (url) => ({
      id: '325289764123',
      title: 'Vintage Polaroid SX-70 Instant Camera',
      image: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=400&h=400&fit=crop',
      priceCents: 29999,
      currency: 'USD',
      affiliateLink: mockConfig.ebay.campaignId ? 
        `${url}?mkcid=1&mkrid=${mockConfig.ebay.campaignId}` : url,
      availability: 'in_stock'
    })
  }
};

// Policy configuration
const policyConfig = {
  priceDriftPct: 0.03,
  substitution: 'no-substitutes', // or 'category-equal'
  useAffiliateOnSelfPurchase: false,
  maxRetries: 3,
  timeoutSeconds: 30
};

export default function RetailerResolver({ url, onResolved, onError }) {
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedProduct, setResolvedProduct] = useState(null);
  const [error, setError] = useState(null);

  const detectRetailer = (url) => {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes('amazon.')) return 'amazon';
    if (domain.includes('walmart.')) return 'walmart';
    if (domain.includes('ebay.')) return 'ebay';
    return null;
  };

  const resolveProduct = async () => {
    setIsResolving(true);
    setError(null);
    
    try {
      const retailer = detectRetailer(url);
      if (!retailer) {
        throw new Error('Unsupported retailer domain');
      }

      const connector = retailerConnectors[retailer];
      if (!connector.enabled()) {
        throw new Error(`${connector.name} not configured (missing API keys or disabled)`);
      }

      // Extract product ID
      const productId = connector.extractId(url);
      if (!productId) {
        throw new Error('Could not extract product ID from URL');
      }

      // Resolve via API (mocked for demo)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      const product = await connector.resolve(url);

      // Apply policy checks
      const drift = Math.random() * 0.06 - 0.03; // Simulate ±3% price drift
      if (Math.abs(drift) > policyConfig.priceDriftPct) {
        throw new Error(`Price drift detected: ${(drift * 100).toFixed(1)}% exceeds policy limit`);
      }

      setResolvedProduct({
        ...product,
        retailer,
        url,
        resolvedAt: new Date().toISOString(),
        priceValidUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min TTL
      });

      if (onResolved) {
        onResolved({
          ...product,
          retailer,
          url
        });
      }

    } catch (err) {
      console.error('Resolution error:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Multi-Retailer Product Resolver
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(retailerConnectors).map(([key, connector]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium capitalize">{key}</h4>
                <p className="text-xs text-slate-500">{connector.name}</p>
              </div>
              <Badge className={connector.enabled() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                {connector.enabled() ? <CheckCircle className="w-3 h-3 mr-1" /> : '⚠️'}
                {connector.enabled() ? 'Ready' : 'Config Needed'}
              </Badge>
            </div>
          ))}
        </div>

        {url && (
          <div className="space-y-3">
            <Button 
              onClick={resolveProduct} 
              disabled={isResolving}
              className="w-full"
            >
              {isResolving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isResolving ? 'Resolving Product...' : 'Resolve Product'}
            </Button>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {resolvedProduct && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={resolvedProduct.image} 
                      alt={resolvedProduct.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800">{resolvedProduct.title}</h4>
                      <p className="text-green-600">
                        ${(resolvedProduct.priceCents / 100).toFixed(2)} {resolvedProduct.currency}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {resolvedProduct.retailer}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {resolvedProduct.availability}
                        </Badge>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Price valid until {new Date(resolvedProduct.priceValidUntil).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Policy Configuration Display */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-3">
            <h4 className="font-medium text-slate-800">Active Policies</h4>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Price Drift Tolerance:</span>
              <span className="font-medium">±{(policyConfig.priceDriftPct * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Substitution Policy:</span>
              <span className="font-medium">{policyConfig.substitution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Self-Purchase Affiliate:</span>
              <span className="font-medium">{policyConfig.useAffiliateOnSelfPurchase ? 'Allowed' : 'Blocked'}</span>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
