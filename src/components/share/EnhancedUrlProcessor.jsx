import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Link, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  Clock,
  Globe
} from 'lucide-react';

// Enhanced canonicalization with safety checks
const canonicalizeUrl = (inputUrl) => {
  try {
    const url = new URL(inputUrl);
    const hostname = url.hostname.toLowerCase();
    
    // Allowlist check
    const allowedDomains = [
      'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.ca', 'amazon.co.jp',
      'walmart.com', 'walmart.ca',
      'bestbuy.com', 'bestbuy.ca', 
      'target.com',
      'ebay.com', 'ebay.co.uk', 'ebay.de',
      'homedepot.com',
      'costco.com',
      'newegg.com'
    ];
    
    const isAllowed = allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    if (!isAllowed) {
      throw new Error(`Domain not supported: ${hostname}`);
    }
    
    // Extract product identifiers
    let productId = null;
    let retailer = null;
    
    if (hostname.includes('amazon.')) {
      retailer = 'amazon';
      const asinMatch = url.pathname.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/);
      productId = asinMatch ? (asinMatch[1] || asinMatch[2]) : null;
    } else if (hostname.includes('walmart.')) {
      retailer = 'walmart';
      const itemMatch = url.pathname.match(/\/ip\/[^/]+\/(\d+)/);
      productId = itemMatch ? itemMatch[1] : null;
    } else if (hostname.includes('bestbuy.')) {
      retailer = 'bestbuy';
      const skuMatch = url.pathname.match(/\/(\d{7,8})\./);
      productId = skuMatch ? skuMatch[1] : null;
    } else if (hostname.includes('target.')) {
      retailer = 'target';
      const tcidMatch = url.pathname.match(/\/p\/[^/]+\/A-(\d+)/);
      productId = tcidMatch ? tcidMatch[1] : null;
    } else if (hostname.includes('ebay.')) {
      retailer = 'ebay';
      const itemMatch = url.pathname.match(/\/itm\/(\d+)/);
      productId = itemMatch ? itemMatch[1] : null;
    }
    
    if (!productId) {
      throw new Error('Could not extract product identifier from URL');
    }
    
    // Remove tracking parameters
    const trackingParams = [
      // Universal
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'ref', 'tag', 'source', 'campaign', 
      // Amazon specific
      'psc', 'th', 'pf_rd_p', 'pf_rd_r', 'pd_rd_wg', 'pd_rd_r', 'pd_rd_w', 
      'keywords', 'qid', 'sr', 'ie',
      // Walmart specific  
      'athbdg', 'athena_cmpid', 'athena_ag',
      // Best Buy specific
      'skuId', 'loc', 'acampID',
      // eBay specific
      'hash', 'item', 'rt', 'nc'
    ];
    
    trackingParams.forEach(param => {
      url.searchParams.delete(param);
    });
    
    // Normalize locale/currency detection
    let locale = 'US';
    let currency = 'USD';
    
    if (hostname.includes('.co.uk')) { locale = 'UK'; currency = 'GBP'; }
    else if (hostname.includes('.de')) { locale = 'DE'; currency = 'EUR'; }
    else if (hostname.includes('.fr')) { locale = 'FR'; currency = 'EUR'; }
    else if (hostname.includes('.ca')) { locale = 'CA'; currency = 'CAD'; }
    else if (hostname.includes('.co.jp')) { locale = 'JP'; currency = 'JPY'; }
    
    return {
      canonicalUrl: url.toString(),
      originalUrl: inputUrl,
      retailer,
      productId, 
      locale,
      currency,
      urlHash: btoa(url.toString()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16),
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    throw new Error(`URL processing failed: ${error.message}`);
  }
};

// Mock price freshness and drift detection
const simulatePriceCheck = (basePriceCents, lastCheckedMinutes = 0) => {
  const drift = Math.random() * 0.06 - 0.03; // ±3% random drift
  const currentPrice = Math.round(basePriceCents * (1 + drift));
  const driftPct = Math.abs(currentPrice - basePriceCents) / basePriceCents;
  
  return {
    storedPrice: basePriceCents,
    currentPrice: currentPrice,
    driftAmount: currentPrice - basePriceCents,
    driftPercent: driftPct * 100,
    isStale: lastCheckedMinutes > 60, // Consider stale after 1 hour
    lastChecked: new Date(Date.now() - lastCheckedMinutes * 60 * 1000).toISOString(),
    needsRefresh: driftPct > 0.03 || lastCheckedMinutes > 30
  };
};

export default function EnhancedUrlProcessor({ onProductResolved }) {
  const [url, setUrl] = useState('');
  const [canonResult, setCanonResult] = useState(null);
  const [priceCheck, setPriceCheck] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processUrl = async () => {
    if (!url) return;
    
    setIsProcessing(true);
    setError('');
    setCanonResult(null);
    setPriceCheck(null);
    
    try {
      // Step 1: Canonicalize and validate
      const canonData = canonicalizeUrl(url);
      setCanonResult(canonData);
      
      // Step 2: Simulate price check
      await new Promise(resolve => setTimeout(resolve, 800)); // API delay
      
      const mockBasePrice = Math.floor(Math.random() * 50000) + 1000; // $10-$510
      const priceData = simulatePriceCheck(mockBasePrice, Math.floor(Math.random() * 120));
      setPriceCheck(priceData);
      
      // Step 3: Create resolved product
      if (onProductResolved) {
        const resolvedProduct = {
          id: `prod_${Math.random().toString(36).substr(2, 9)}`,
          retailer_id: canonData.retailer,
          product_id: canonData.productId,
          source_url: canonData.canonicalUrl,
          title: `${canonData.retailer.charAt(0).toUpperCase() + canonData.retailer.slice(1)} Product`,
          price_cents: priceData.currentPrice,
          currency: canonData.currency,
          locale: canonData.locale,
          price_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
          canonical_data: canonData,
          price_history: priceData
        };
        
        onProductResolved(resolvedProduct);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshPrice = async () => {
    if (!priceCheck) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedPrice = simulatePriceCheck(priceCheck.storedPrice, 0);
    setPriceCheck(updatedPrice);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Enhanced URL Processor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://www.amazon.com/dp/ASIN or supported retailer URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isProcessing}
                className="flex-grow"
              />
              <Button 
                onClick={processUrl} 
                disabled={isProcessing || !url}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Process'}
              </Button>
            </div>

            {/* Sample URLs for testing */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl('https://www.amazon.com/dp/B08N5WRWNW?ref=sr_1_3&keywords=echo+dot')}
              >
                Amazon Sample
              </Button>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => setUrl('https://www.walmart.com/ip/Nintendo-Switch-Console-Neon/55126484?athbdg=L1600')}
              >
                Walmart Sample
              </Button>
              <Button
                variant="outline"
                size="sm" 
                onClick={() => setUrl('https://www.bestbuy.com/site/apple-airpods-pro-2nd-generation/6418599.p?skuId=6418599')}
              >
                Best Buy Sample
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Canonicalization Result */}
      {canonResult && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Shield className="w-5 h-5" />
              URL Canonicalization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Retailer:</span>
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {canonResult.retailer}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">Product ID:</span>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                  {canonResult.productId}
                </code>
              </div>
              <div>
                <span className="font-semibold">Locale:</span>
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {canonResult.locale} ({canonResult.currency})
                </Badge>
              </div>
              <div>
                <span className="font-semibold">URL Hash:</span>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                  {canonResult.urlHash}
                </code>
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Canonical URL:</span>
                <p className="text-blue-600 break-all mt-1 text-xs">
                  {canonResult.canonicalUrl}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Check Result */}
      {priceCheck && (
        <Card className={`${
          priceCheck.needsRefresh 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Price Verification
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPrice}
                disabled={isProcessing}
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Current Price:</span>
                <span className="ml-2 text-lg font-bold text-green-600">
                  ${(priceCheck.currentPrice / 100).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-semibold">Price Drift:</span>
                <Badge className={`ml-2 ${
                  Math.abs(priceCheck.driftAmount) < 100 ? 'bg-green-100 text-green-800' :
                  Math.abs(priceCheck.driftPercent) > 3 ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {priceCheck.driftAmount > 0 ? '+' : ''}${(priceCheck.driftAmount / 100).toFixed(2)} 
                  ({priceCheck.driftPercent.toFixed(1)}%)
                </Badge>
              </div>
              <div>
                <span className="font-semibold">Last Checked:</span>
                <span className="ml-2">
                  {new Date(priceCheck.lastChecked).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <Badge className={`ml-2 ${
                  priceCheck.isStale ? 'bg-red-100 text-red-800' :
                  priceCheck.needsRefresh ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {priceCheck.isStale ? 'Stale' : 
                   priceCheck.needsRefresh ? 'Needs Refresh' : 'Fresh'}
                </Badge>
              </div>
            </div>

            {priceCheck.needsRefresh && (
              <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Price data may be stale or has significant drift. Consider refreshing before creating matches.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {canonResult && priceCheck && !priceCheck.needsRefresh && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Product Ready for Match Creation</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              URL canonicalized, product verified, price fresh. Ready to create prize rooms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}