import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Loader2 } from 'lucide-react';
import { VideoBackgroundCard, mediaImages } from '@/components/media/MediaPrimitives';

export default function MatchPreview({ game, product, settings, onConfirm, onBack }) {
  const [isCreating, setIsCreating] = useState(false);

  const getBestOffer = (offers) => {
    if (!offers || offers.length === 0) return null;
    const inStock = offers.filter((offer) => offer.availability === 'in_stock');
    return (inStock.length ? inStock : offers).sort((a, b) => a.price_cents - b.price_cents)[0];
  };

  const bestOffer = getBestOffer(product?.offers || []) || {};
  const productPriceCents = bestOffer?.price_cents ?? product?.price_cents ?? 0;
  const productPrice = (productPriceCents / 100).toFixed(2);
  const uplift = { marginPct: 0.05, feesPct: 0.03, bufferPct: 0.02 };
  const totalNeeded = productPriceCents * (1 + uplift.marginPct + uplift.feesPct + uplift.bufferPct);
  const buyInCents = Math.ceil(totalNeeded / settings.maxPlayers);
  const entryContribution = (buyInCents / 100).toFixed(2);
  const fundingGoal = ((buyInCents * settings.maxPlayers) / 100).toFixed(2);
  const margin = productPriceCents * uplift.marginPct;
  const fees = productPriceCents * uplift.feesPct;
  const buffer = productPriceCents * uplift.bufferPct;
  const northPoleFundAmount = margin * (settings.charityPercentage / 100);

  const handleCreateMatch = async () => {
    setIsCreating(true);
    try {
      await onConfirm({
        gameId: game.id,
        productId: product.id,
        productOffer: bestOffer,
        minPlayers: settings.minPlayers,
        maxPlayers: settings.maxPlayers,
        buyInCents,
        rules: settings.rules,
        verificationMethod: settings.verificationMethod,
        startsAt: new Date().toISOString(),
        endsAt: settings.deadline
          ? new Date(settings.deadline).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error('Error creating match:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <VideoBackgroundCard
          title="Ready to open the room"
          description="This preview is the invitation players see: the game, the prize path, the player slots, and the rules."
          image={product?.images?.[0] || product?.image_url || mediaImages.northPrize}
          label="Match poster"
          metric="Review"
        />
      </div>
      <Card className="mb-8 border-purple-400/25 bg-white/[0.07] text-white shadow-2xl shadow-purple-950/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-white">Verified Challenge Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-xl font-semibold text-cyan-100">Game Details</h3>
                <div className="rounded-lg border border-cyan-300/15 bg-black/30 p-4">
                  <div className="mb-3 flex items-center gap-4">
                    {game?.icon_url && <img src={game.icon_url} alt="" loading="lazy" decoding="async" className="h-16 w-16 rounded-xl object-cover" />}
                    <div>
                      <h4 className="font-semibold text-white">{game?.title}</h4>
                      <p className="text-sm text-purple-100/60">{game?.developer}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-xl font-semibold text-cyan-100">Prize Path</h3>
                <div className="rounded-lg border border-purple-300/15 bg-black/30 p-4">
                  <div className="mb-3 flex items-center gap-4">
                    <img src={product?.images?.[0] || product?.image_url || mediaImages.northPrize} alt="" loading="lazy" decoding="async" className="h-16 w-16 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-semibold text-white">{product?.title}</h4>
                      <p className="text-sm text-purple-100/60">{product?.brand}</p>
                      <p className="mt-1 text-2xl font-bold text-green-300">${productPrice}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline" className="border-white/15 text-purple-100">From: {bestOffer.retailer || 'selected source'}</Badge>
                    <Badge className="bg-green-900/50 text-green-200">{bestOffer.availability || 'available'}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-xl font-semibold text-cyan-100">Skill Match Settings</h3>
                <div className="space-y-3 rounded-lg border border-cyan-300/15 bg-black/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-100/60">Players</span>
                    <span className="font-medium text-white">{settings.minPlayers} - {settings.maxPlayers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-100/60">Verification</span>
                    <span className="font-medium capitalize text-white">{settings.verificationMethod.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-xl font-semibold text-cyan-100">Entry Contribution</h3>
                <div className="space-y-3 rounded-lg border border-purple-300/15 bg-black/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-100/60">Contribution per player</span>
                    <span className="text-xl font-bold text-green-300">${entryContribution}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-100/60">Funding goal ({settings.maxPlayers}p)</span>
                    <span className="font-semibold text-white">${fundingGoal}</span>
                  </div>
                  <div className="my-2 border-t border-white/10" />
                  <div className="flex items-center justify-between text-sm"><span className="text-purple-100/60">Prize cost</span><span>${productPrice}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-purple-100/60">Fees & buffer</span><span>~${((fees + buffer) / 100).toFixed(2)}</span></div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-pink-300"><Heart className="h-3 w-3" />The Poles Fund</span>
                    <span>${(northPoleFundAmount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={isCreating}>Back</Button>
        <Button onClick={handleCreateMatch} className="bg-blue-600 px-8 hover:bg-blue-700" disabled={isCreating}>
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCreating ? 'Creating Match...' : 'Confirm Skill Match'}
        </Button>
      </div>
    </div>
  );
}
