import React, { useState } from 'react';
import { Product } from '@/entities/Product';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// Amazon PA-API simulation - would be real API call in production
const simulateAmazonPAAPI = async (url) => {
  // Extract ASIN from URL
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/);
  const asin = asinMatch ? (asinMatch[1] || asinMatch[2]) : 'B08N5WRWNW'; // fallback

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Mock PA-API response structure
  return {
    asin: asin,
    title: "Echo Dot (5th Gen, 2022 release) | Smart speaker with bigger vibrant sound and Alexa | Charcoal",
    images: [
      "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop&crop=left"
    ],
    price_and_currency: {
      amount: 4999, // cents
      currency: "USD"
    },
    availability: {
      message: "In Stock",
      type: "InStock"
    },
    item_info: {
      by_line_info: {
        brand: { display_value: "Amazon", label: "Brand" }
      },
      features: [
        "Bigger vibrant sound - Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound in any room.",
        "Your favorite music and content - Play music, audiobooks, and podcasts from Amazon Music, Apple Music, Spotify, SiriusXM, and others."
      ]
    },
    customer_reviews: {
      star_rating: { value: 4.7 },
      count: 89432
    },
    detail_page_url: url,
    // TTL enforcement - Amazon requires fresh data
    cache_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    affiliate_url: `${url}?tag=santaclause-20` // compliant affiliate link
  };
};

// Pricing logic functions
const totalNeeded = (P_cents, uplift) => P_cents * (1 + uplift.marginPct + uplift.feesPct + uplift.bufferPct);
const buyInForPlayers = (P_cents, uplift, N) => Math.ceil(totalNeeded(P_cents, uplift) / N);
const roomGrid = (P_cents, uplift, playerCounts = [2, 4, 6, 8, 10]) => {
  return playerCounts.map(N => ({
    players: N,
    buyInCents: buyInForPlayers(P_cents, uplift, N)
  }));
};

const defaultUplift = { marginPct: 0.05, feesPct: 0.03, bufferPct: 0.02 }; // 10% total

export default function ProductResolver({ onProductResolved }) {
  const [url, setUrl] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedProduct, setResolvedProduct] = useState(null);
  const [error, setError] = useState('');

  const handleResolve = async () => {
    if (!url) return;
    
    // Basic URL validation
    if (!url.includes('amazon.com') || !url.includes('/dp/')) {
      setError('Please enter a valid Amazon product URL (must contain /dp/)');
      return;
    }

    setIsResolving(true);
    setError('');
    
    try {
      // Call simulated PA-API
      const apiResponse = await simulateAmazonPAAPI(url);
      
      // Create Product entity
      const productData = {
        retailer_id: 'amazon',
        product_id: apiResponse.asin,
        source_url: url,
        title: apiResponse.title,
        description: apiResponse.item_info.features.join(' '),
        price_cents: apiResponse.price_and_currency.amount,
        price_expires_at: apiResponse.cache_until,
        image_urls: apiResponse.images,
        affiliate_meta: { 
          tag: 'santaclause-20',
          affiliate_url: apiResponse.affiliate_url,
          disclosure: 'As an Amazon Associate, we earn from qualifying purchases.'
        },
        availability: apiResponse.availability.type.toLowerCase().replace('instock', 'in_stock'),
        brand: apiResponse.item_info.by_line_info.brand.display_value,
        rating: apiResponse.customer_reviews.star_rating.value,
        rating_count: apiResponse.customer_reviews.count
      };

      const product = await Product.create(productData);
      setResolvedProduct(product);
      
    } catch (err) {
      console.error('Error resolving product:', err);
      setError('Failed to resolve product. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleCreateRoom = (roomConfig) => {
    if (onProductResolved) {
      onProductResolved(resolvedProduct, roomConfig);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* URL Input */}
      <Card className="bg-white/90 backdrop-blur-md border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Link className="w-5 h-5" />
            Amazon Product Resolver
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="https://www.amazon.com/dp/B08N5WRWNW"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={isResolving}
            />
            <Button 
              onClick={handleResolve} 
              disabled={isResolving || !url}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resolve'}
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Product */}
      {resolvedProduct && (
        <Card className="bg-white border border-green-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Product Verified</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Info */}
              <div className="space-y-4">
                <img 
                  src={resolvedProduct.image_urls[0]} 
                  alt={resolvedProduct.title}
                  className="w-full h-48 object-contain bg-slate-100 rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">{resolvedProduct.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-orange-100 text-orange-800">{resolvedProduct.brand}</Badge>
                    <span className="text-sm text-slate-600">★ {resolvedProduct.rating} ({resolvedProduct.rating_count?.toLocaleString()})</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${(resolvedProduct.price_cents / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Price expires: {new Date(resolvedProduct.price_expires_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Room Grid */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800">Available Rooms</h4>
                <div className="space-y-3">
                  {roomGrid(resolvedProduct.price_cents, defaultUplift).map(room => (
                    <div key={room.players} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                      <div>
                        <span className="font-medium">{room.players} Players</span>
                        <div className="text-sm text-slate-600">
                          Buy-in: ${(room.buyInCents / 100).toFixed(2)}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleCreateRoom(room)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Create Room
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Cost Breakdown */}
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <h5 className="font-semibold text-blue-800 mb-2">Cost Breakdown</h5>
                  <div className="space-y-1 text-blue-700">
                    <div>Product: ${(resolvedProduct.price_cents / 100).toFixed(2)}</div>
                    <div>Platform (5%): ${(resolvedProduct.price_cents * 0.05 / 100).toFixed(2)}</div>
                    <div>Fees (3%): ${(resolvedProduct.price_cents * 0.03 / 100).toFixed(2)}</div>
                    <div>Buffer (2%): ${(resolvedProduct.price_cents * 0.02 / 100).toFixed(2)}</div>
                    <div className="border-t pt-1 font-semibold">
                      Total: ${(totalNeeded(resolvedProduct.price_cents, defaultUplift) / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Affiliate Disclosure */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ {resolvedProduct.affiliate_meta.disclosure}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}