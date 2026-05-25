import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Lock } from 'lucide-react';
import { VideoBackgroundCard, mediaImages } from '@/components/media/MediaPrimitives';

const DEMO_PRIZES = [
  {
    id: 'np-prize-switch',
    title: 'Nintendo Switch OLED',
    category: 'Gaming',
    price_cents: 34999,
    image_url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?q=80&w=400',
    buy_in_cents: 3850,
    max_players: 10,
  },
  {
    id: 'np-prize-airpods',
    title: 'Apple AirPods Pro',
    category: 'Audio',
    price_cents: 24900,
    image_url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=400',
    buy_in_cents: 3120,
    max_players: 8,
  },
  {
    id: 'np-prize-lego',
    title: 'LEGO Starship Set',
    category: 'Toys',
    price_cents: 12999,
    image_url: 'https://images.unsplash.com/photo-1585366119957-e25a4b6c7128?q=80&w=400',
    buy_in_cents: 1625,
    max_players: 8,
  },
  {
    id: 'np-prize-instapot',
    title: 'Instant Pot Duo',
    category: 'Home',
    price_cents: 9900,
    image_url: 'https://images.unsplash.com/photo-1588708215982-f54817a0210f?q=80&w=400',
    buy_in_cents: 1238,
    max_players: 8,
  },
];

export { DEMO_PRIZES };

export default function PrizeSelector({ onSelect }) {
  return (
    <div>
      <div className="mb-6">
        <VideoBackgroundCard
          title="Choose the prize worth playing for"
          description="The prize card is the emotional hook for the room. Make it clear, visual, and locked before gameplay."
          image={mediaImages.northPrize}
          label="Prize vault"
          metric="Lock"
        />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Choose Your Prize</h2>
        <Badge className="bg-yellow-600/20 text-yellow-300 border border-yellow-600/30">
          <Lock className="w-3 h-3 mr-1" />Prize locks when game starts
        </Badge>
      </div>
      <p className="text-purple-300 text-sm mb-6">
        Select a prize before playing. The prize will be locked to your match — you cannot change it once the game begins.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_PRIZES.map((prize) => (
          <Card
            key={prize.id}
            className="bg-purple-900/40 border border-purple-700/30 hover:border-yellow-400/60 transition-all cursor-pointer group"
            onClick={() => onSelect(prize)}
          >
            <CardContent className="p-4">
              <div className="h-36 bg-black/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <img
                  src={prize.image_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{prize.title}</h3>
              <Badge className="bg-purple-600/20 text-purple-300 text-xs mb-3">{prize.category}</Badge>
              <div className="space-y-1 text-xs text-purple-300">
                <div className="flex justify-between">
                  <span>Prize Value</span>
                  <span className="text-white font-semibold">${(prize.price_cents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry contribution (demo)</span>
                  <span className="text-green-400 font-semibold">${(prize.buy_in_cents / 100).toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full mt-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white text-sm">
                Select Prize
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
