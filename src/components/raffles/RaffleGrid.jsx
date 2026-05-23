import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Users, 
  DollarSign, 
  Trophy, 
  Zap, 
  ExternalLink,
  Sparkles
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import RaffleEntryModal from './RaffleEntryModal';

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  OPEN: "bg-green-100 text-green-800",
  LOCKED: "bg-yellow-100 text-yellow-800", 
  DRAWING: "bg-blue-100 text-blue-800",
  PURCHASE: "bg-purple-100 text-purple-800",
  FULFILLMENT: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  REFUNDED: "bg-red-100 text-red-800",
  VOID: "bg-gray-100 text-gray-800"
};

const categoryColors = {
  electronics: "bg-blue-500/20 text-blue-300",
  fashion: "bg-pink-500/20 text-pink-300",
  home: "bg-green-500/20 text-green-300",
  sports: "bg-orange-500/20 text-orange-300",
  gaming: "bg-purple-500/20 text-purple-300",
  automotive: "bg-red-500/20 text-red-300",
  other: "bg-gray-500/20 text-gray-300"
};

function RaffleCard({ raffle, product, merchant, user, onEntrySuccess }) {
  const [showEntryModal, setShowEntryModal] = React.useState(false);
  
  const fillPercentage = (raffle.current_entries / raffle.max_entries) * 100;
  const isNearingEnd = raffle.deadline && new Date(raffle.deadline) - new Date() < 24 * 60 * 60 * 1000;
  const totalValue = (raffle.entry_price_cents * raffle.max_entries) / 100;
  const oddsText = raffle.current_entries > 0 ? `1 in ${raffle.current_entries}` : `1 in ${raffle.max_entries}`;

  return (
    <>
      <Card className="group relative overflow-hidden bg-gradient-to-br from-black/60 to-purple-900/40 backdrop-blur-md border border-purple-700/30 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02]">
        {/* Aura Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className={`${statusColors[raffle.status]} font-semibold`}>
            {raffle.status}
          </Badge>
        </div>

        {/* Ending Soon Badge */}
        {isNearingEnd && raffle.status === 'OPEN' && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-red-500/20 text-red-300 animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              Ending Soon
            </Badge>
          </div>
        )}

        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative h-48 overflow-hidden">
            <img 
              src={product?.image_url} 
              alt={product?.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Merchant Logo */}
            {merchant?.logo_url && (
              <div className="absolute bottom-3 left-3">
                <img 
                  src={merchant.logo_url} 
                  alt={merchant.name}
                  className="w-8 h-8 rounded-full bg-white/90 p-1"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Product Title & Category */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                {product?.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge className={categoryColors[product?.category || 'other']}>
                  {product?.category || 'other'}
                </Badge>
                <span className="text-purple-300 text-sm">by {merchant?.name}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">Progress</span>
                <span className="text-purple-200">{raffle.current_entries} / {raffle.max_entries}</span>
              </div>
              <Progress 
                value={fillPercentage} 
                className="h-2 bg-purple-900/50"
              />
              <div className="text-xs text-purple-300 text-center">
                {fillPercentage.toFixed(1)}% filled
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 py-3 border-t border-purple-700/30">
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">
                  ${(raffle.entry_price_cents / 100).toFixed(2)}
                </div>
                <div className="text-xs text-purple-300">per entry</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">{oddsText}</div>
                <div className="text-xs text-purple-300">current odds</div>
              </div>
            </div>

            {/* Deadline */}
            {raffle.deadline && (
              <div className="flex items-center justify-center gap-2 text-sm text-purple-300 bg-purple-900/30 rounded-lg py-2">
                <Clock className="w-4 h-4" />
                <span>Ends {formatDistanceToNow(new Date(raffle.deadline), { addSuffix: true })}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {raffle.status === 'OPEN' && (
                <Button 
                  onClick={() => setShowEntryModal(true)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Enter to Win
                </Button>
              )}
              <Button 
                variant="outline"
                size="icon"
                onClick={() => window.open(product?.url, '_blank')}
                className="border-purple-600/50 text-purple-300 hover:bg-purple-800/40"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entry Modal */}
      {showEntryModal && (
        <RaffleEntryModal
          raffle={raffle}
          product={product}
          merchant={merchant}
          user={user}
          onClose={() => setShowEntryModal(false)}
          onSuccess={onEntrySuccess}
        />
      )}
    </>
  );
}

export default function RaffleGrid({ raffles, products, merchants, user, onEntrySuccess }) {
  if (raffles.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm border border-purple-700/30 p-12 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
        <h3 className="text-xl font-semibold mb-2 text-purple-200">No Raffles Available</h3>
        <p className="text-purple-300/70">Be the first to create a raffle and start winning!</p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {raffles.map((raffle) => {
        const product = products.find(p => p.id === raffle.product_id);
        const merchant = merchants.find(m => m.id === product?.merchant_id);
        
        return (
          <RaffleCard
            key={raffle.id}
            raffle={raffle}
            product={product}
            merchant={merchant}
            user={user}
            onEntrySuccess={onEntrySuccess}
          />
        );
      })}
    </div>
  );
}