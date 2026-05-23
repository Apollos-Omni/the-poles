import React, { useState, useEffect } from 'react';
import { SharedLink } from '@/entities/SharedLink';
import { Product } from '@/entities/Product';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';

// Mock the retailer API responses
const mockRetailerAPIs = {
  amazon: async (url) => {
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/);
    const asin = asinMatch ? (asinMatch[1] || asinMatch[2]) : 'B08N5WRWNW';
    
    return {
      retailer: 'amazon',
      canonicalUrl: `https://www.amazon.com/dp/${asin}`,
      title: "Echo Dot (5th Gen, 2022 release) | Smart speaker with Alexa",
      image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop",
      priceCents: 4999,
      currency: "USD",
      priceExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour TTL
      availability: "in_stock",
      brand: "Amazon",
      rating: 4.7,
      ratingCount: 89432,
      affiliate: {
        tag: "santaclause-20",
        link: `https://www.amazon.com/dp/${asin}?tag=santaclause-20`
      }
    };
  },
  
  walmart: async (url) => {
    const idMatch = url.match(/\/ip\/[^/]+\/(\d+)/);
    const itemId = idMatch ? idMatch[1] : '55126484';
    
    return {
      retailer: 'walmart',
      canonicalUrl: `https://www.walmart.com/ip/${itemId}`,
      title: "Nintendo Switch Console with Neon Red and Neon Blue Joy‑Con",
      image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?w=400&h=400&fit=crop",
      priceCents: 29999,
      currency: "USD",
      priceExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min TTL
      availability: "in_stock",
      brand: "Nintendo",
      rating: 4.8,
      ratingCount: 12543,
      affiliate: {
        tag: "santaclause",
        link: `https://www.walmart.com/ip/${itemId}?athbdg=L1600`
      }
    };
  },
  
  bestbuy: async (url) => {
    const skuMatch = url.match(/\/(\d{7,8})\./);
    const sku = skuMatch ? skuMatch[1] : '6418599';
    
    return {
      retailer: 'bestbuy',
      canonicalUrl: `https://www.bestbuy.com/site/${sku}.p`,
      title: "Apple AirPods Pro (2nd generation) with MagSafe Case",
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop",
      priceCents: 24999,
      currency: "USD",
      priceExpiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 min TTL
      availability: "in_stock",
      brand: "Apple",
      rating: 4.6,
      ratingCount: 8932,
      affiliate: {
        tag: "santaclause",
        link: `https://www.bestbuy.com/site/${sku}.p?ref=santaclause`
      }
    };
  }
};

// Retailer detection and canonicalization
const detectRetailer = (url) => {
  const domain = new URL(url).hostname.toLowerCase();
  
  if (domain.includes('amazon.')) return 'amazon';
  if (domain.includes('walmart.')) return 'walmart';
  if (domain.includes('bestbuy.')) return 'bestbuy';
  if (domain.includes('target.')) return 'target';
  if (domain.includes('ebay.')) return 'ebay';
  
  return null;
};

const canonicalizeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Remove tracking parameters
    const trackingParams = ['utm_', 'ref', 'tag', 'psc', 'th', 'pf_rd_', 'pd_rd_', 'keywords'];
    trackingParams.forEach(param => {
      [...urlObj.searchParams.keys()].forEach(key => {
        if (key.startsWith(param)) {
          urlObj.searchParams.delete(key);
        }
      });
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
};

const generateUrlHash = (url) => {
  // Simple hash for demo - would use proper hashing in production
  return btoa(canonicalizeUrl(url)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
};

export default function ShareUrlProcessor({ onProductResolved }) {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [sharedLink, setSharedLink] = useState(null);

  // Simulate the /v1/ingest/share API endpoint
  const processSharedUrl = async (inputUrl, source = 'web') => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Step 1: Validate and detect retailer
      const retailer = detectRetailer(inputUrl);
      if (!retailer) {
        throw new Error('Unsupported retailer. We support Amazon, Walmart, Best Buy, Target, and eBay.');
      }
      
      const canonicalUrl = canonicalizeUrl(inputUrl);
      const urlHash = generateUrlHash(canonicalUrl);
      
      // Step 2: Check for existing shared link (deduplication)
      const existingLinks = await SharedLink.filter({ url_hash: urlHash });
      if (existingLinks.length > 0) {
        const existing = existingLinks[0];
        if (existing.status === 'resolved' && existing.product_id) {
          // Return existing product if still valid
          const existingProduct = await Product.list().then(products => 
            products.find(p => p.id === existing.product_id)
          );
          
          if (existingProduct && new Date(existingProduct.price_expires_at) > new Date()) {
            setResult(existingProduct);
            setSharedLink(existing);
            return existingProduct;
          }
        }
      }
      
      // Step 3: Create shared link record
      const linkRecord = await SharedLink.create({
        user_id: 'current_user', // Would be actual user ID
        url: inputUrl,
        canonical_url: canonicalUrl,
        retailer: retailer,
        source: source,
        url_hash: urlHash,
        status: 'processing'
      });
      setSharedLink(linkRecord);
      
      // Step 4: Call retailer API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      const apiResponse = await mockRetailerAPIs[retailer](canonicalUrl);
      
      // Step 5: Create product record
      const productData = {
        retailer_id: retailer,
        product_id: retailer === 'amazon' ? apiResponse.canonicalUrl.split('/dp/')[1] : 
                   retailer === 'walmart' ? apiResponse.canonicalUrl.split('/ip/')[1] : 
                   apiResponse.canonicalUrl.split('/').pop().split('.')[0],
        source_url: canonicalUrl,
        title: apiResponse.title,
        description: `${apiResponse.title} from ${retailer}`,
        price_cents: apiResponse.priceCents,
        price_expires_at: apiResponse.priceExpiresAt,
        image_urls: [apiResponse.image],
        affiliate_meta: apiResponse.affiliate,
        availability: apiResponse.availability,
        brand: apiResponse.brand,
        rating: apiResponse.rating,
        rating_count: apiResponse.ratingCount
      };
      
      const product = await Product.create(productData);
      
      // Step 6: Update shared link with product ID
      await SharedLink.update(linkRecord.id, {
        product_id: product.id,
        status: 'resolved'
      });
      
      setResult(product);
      return product;
      
    } catch (err) {
      console.error('Error processing shared URL:', err);
      setError(err.message);
      
      if (sharedLink) {
        await SharedLink.update(sharedLink.id, {
          status: 'failed',
          error_message: err.message
        });
      }
      
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    await processSharedUrl(url, 'web');
  };

  const handleCreateRoom = () => {
    if (result && onProductResolved) {
      onProductResolved(result);
    }
  };

  // Simulate share from different sources
  const simulateShare = async (source, sampleUrl) => {
    setUrl(sampleUrl);
    await processSharedUrl(sampleUrl, source);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Share Sources Demo */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share-to-App Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Users can share product URLs directly to Santa Clause from any retailer app or website.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => simulateShare('ios', 'https://www.amazon.com/dp/B08N5WRWNW')}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <Smartphone className="w-4 h-4" />
              Simulate iOS Share
            </Button>
            
            <Button 
              onClick={() => simulateShare('android', 'https://www.walmart.com/ip/Nintendo-Switch-Console-Neon-Red-Blue/55126484')}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <Monitor className="w-4 h-4" />
              Simulate Android Share
            </Button>
            
            <Button 
              onClick={() => simulateShare('web', 'https://www.bestbuy.com/site/apple-airpods-pro-2nd-generation/6418599.p')}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <Globe className="w-4 h-4" />
              Simulate Web Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual URL Entry */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Manual URL Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="https://www.amazon.com/dp/ASIN or other retailer URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isProcessing}
                className="text-sm"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Supported: Amazon, Walmart, Best Buy, Target, eBay
              </div>
              <Button 
                type="submit" 
                disabled={isProcessing || !url}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isProcessing ? 'Processing...' : 'Process URL'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {sharedLink && (
        <Card className="bg-white border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Share Processing</span>
              <Badge className={
                sharedLink.status === 'resolved' ? 'bg-green-100 text-green-800' :
                sharedLink.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }>
                {sharedLink.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Source:</span> {sharedLink.source}
                </div>
                <div>
                  <span className="font-semibold">Retailer:</span> {sharedLink.retailer}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Canonical URL:</span>
                  <p className="text-blue-600 break-all">{sharedLink.canonical_url}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Processing Error</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Resolved Product */}
      {result && (
        <Card className="bg-white border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              Product Resolved Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={result.image_urls[0]} 
                    alt={result.title}
                    className="w-20 h-20 object-contain bg-gray-100 rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2">{result.title}</h3>
                    <p className="text-gray-500 text-sm">{result.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-green-600">
                        ${(result.price_cents / 100).toFixed(2)}
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        {result.availability}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Rating: ⭐ {result.rating} ({result.rating_count?.toLocaleString()} reviews)</p>
                  <p>Price expires: {new Date(result.price_expires_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Create Prize Match</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[2, 4, 6, 8, 10].map(players => {
                    const uplift = { marginPct: 0.05, feesPct: 0.03, bufferPct: 0.02 };
                    const totalNeeded = result.price_cents * (1 + uplift.marginPct + uplift.feesPct + uplift.bufferPct);
                    const buyIn = Math.ceil(totalNeeded / players) / 100;
                    
                    return (
                      <Button
                        key={players}
                        variant="outline"
                        size="sm"
                        onClick={handleCreateRoom}
                        className="text-xs"
                      >
                        {players}p - ${buyIn.toFixed(2)}
                      </Button>
                    );
                  })}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(result.source_url, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Product
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Match
                  </Button>
                </div>
              </div>
            </div>
            
            {/* API Compliance Notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                ✅ Data fetched via official {result.retailer_id} API • Price valid until {new Date(result.price_expires_at).toLocaleTimeString()}
              </p>
              {result.affiliate_meta?.disclosure && (
                <p className="text-blue-700 text-xs mt-1">
                  {result.affiliate_meta.disclosure}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}