import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight } from 'lucide-react';
import ShopTab from './ShopTab';
import EbayPrizeBrowser from '../match-creator/EbayPrizeBrowser';

export default function EbayShopTab({ onCreateMatch, buyInForPlayers }) {
  const [mode, setMode] = useState('shop'); // 'shop' or 'ebay'

  if (mode === 'ebay') {
    return (
      <EbayPrizeBrowser
        onPrizeSelect={(product) => {
          if (!product?.id) {
            alert('Please select a valid prize before creating a match.');
            return;
          }
          const bestOffer = product.offers?.[0] || {};
          const productForMatch = {
            id: product.id,
            title: product.title,
            brand: product.brand || product.category || 'eBay',
            price_cents: product.price_cents,
            images: product.images || [],
            image_url: product.image_url || product.images?.[0] || '',
            category: product.category || 'Prize',
            offers: product.offers || [{ retailer: 'eBay', price_cents: product.price_cents, availability: 'in_stock' }],
          };
          localStorage.setItem('northPoleSelectedPrize', JSON.stringify(productForMatch));
          onCreateMatch(productForMatch);
        }}
        onBack={() => setMode('shop')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* eBay CTA Card */}
      <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-orange-700/30 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">🔍 Search eBay Live</h3>
            <p className="text-orange-200/70 text-sm">Browse millions of real eBay items as potential prizes. Sync with live pricing.</p>
          </div>
          <Button
            className="bg-orange-700 hover:bg-orange-600 text-white whitespace-nowrap"
            onClick={() => setMode('ebay')}
          >
            Browse eBay <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Original demo shop */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Or choose from featured prizes</h3>
        <ShopTab
          onCreateMatch={onCreateMatch}
          buyInForPlayers={buyInForPlayers}
        />
      </div>
    </div>
  );
}