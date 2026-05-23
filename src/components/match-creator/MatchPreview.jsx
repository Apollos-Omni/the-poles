import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, DollarSign, Heart, Loader2 } from 'lucide-react';

export default function MatchPreview({ game, product, settings, onConfirm, onBack }) {
    const [isCreating, setIsCreating] = useState(false);

    // Get the best offer (cheapest, in-stock)
    const getBestOffer = (offers) => {
        if (!offers || offers.length === 0) return null;
        const inStock = offers.filter(o => o.availability === 'in_stock');
        if (inStock.length > 0) {
            return inStock.sort((a, b) => a.price_cents - b.price_cents)[0];
        }
        // Fallback to any offer if none are in stock
        return offers.sort((a, b) => a.price_cents - b.price_cents)[0];
    };

    const bestOffer = getBestOffer(product?.offers || []);
    const productPriceCents = bestOffer?.price_cents ?? product?.price_cents ?? 0;
    const productPrice = (productPriceCents / 100).toFixed(2);
    
    const uplift = { marginPct: 0.05, feesPct: 0.03, bufferPct: 0.02 };
    const totalNeeded = productPriceCents * (1 + uplift.marginPct + uplift.feesPct + uplift.bufferPct);
    const buyInCents = Math.ceil(totalNeeded / settings.maxPlayers);
    const buyInPrice = (buyInCents / 100).toFixed(2);
    const totalPot = (buyInCents * settings.maxPlayers / 100).toFixed(2);
    
    const margin = productPriceCents * uplift.marginPct;
    const fees = productPriceCents * uplift.feesPct;
    const buffer = productPriceCents * uplift.bufferPct;
    const charityAmount = margin * (settings.charityPercentage / 100);

    const handleCreateMatch = async () => {
        setIsCreating(true);
        try {
            const matchDetails = {
                gameId: game.id,
                productId: product.id, // Use our internal product ID
                productOffer: bestOffer, // Pass the selected offer for fulfillment
                minPlayers: settings.minPlayers,
                maxPlayers: settings.maxPlayers,
                buyInCents: buyInCents,
                rules: settings.rules,
                verificationMethod: settings.verificationMethod,
                startsAt: new Date().toISOString(),
                endsAt: settings.deadline ? new Date(settings.deadline).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };
            await onConfirm(matchDetails);
        } catch (error) {
            console.error("Error creating match:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="bg-white/80 border-slate-200 backdrop-blur-sm mb-8">
                <CardHeader>
                    <CardTitle className="text-slate-800 text-center text-2xl">Match Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Game Info */}
                        <div className="space-y-6">
                             <div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-4">🎮 Game Details</h3>
                                <div className="bg-slate-50 p-4 rounded-lg border">
                                    <div className="flex items-center gap-4 mb-3">
                                        <img src={game.icon_url} alt={game.title} className="w-16 h-16 rounded-xl" />
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{game.title}</h4>
                                            <p className="text-slate-500 text-sm">{game.developer}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-4">🏆 Prize Details</h3>
                                <div className="bg-slate-50 p-4 rounded-lg border">
                                    <div className="flex items-center gap-4 mb-3">
                                        <img src={product?.images?.[0] || product?.image_url || ''} alt={product?.title} className="w-16 h-16 rounded-xl object-cover" />
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{product.title}</h4>
                                            <p className="text-slate-500 text-sm">{product.brand}</p>
                                            <p className="text-2xl font-bold text-green-600 mt-1">${productPrice}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <Badge variant="outline">From: {bestOffer.retailer}</Badge>
                                        <Badge className="bg-green-100 text-green-800">{bestOffer.availability}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Match Settings & Financials */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-4">⚙️ Match Settings</h3>
                                <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                                    {/* ... settings details ... */}
                                    <div className="flex items-center justify-between"><span className="text-slate-500">Players</span><span className="font-medium text-slate-800">{settings.minPlayers} - {settings.maxPlayers}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-slate-500">Verification</span><span className="font-medium text-slate-800 capitalize">{settings.verificationMethod.replace('_', ' ')}</span></div>
                                </div>
                            </div>

                             <div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-4">💰 Financial Breakdown</h3>
                                <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                                    <div className="flex items-center justify-between"><span className="text-slate-500">Buy-in per Player</span><span className="text-slate-800 font-bold text-xl">${buyInPrice}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-slate-500">Total Pot ({settings.maxPlayers}p)</span><span className="text-slate-800 font-semibold">${totalPot}</span></div>
                                    <div className="border-t my-2"></div>
                                    <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Prize Cost</span><span>${productPrice}</span></div>
                                    <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Fees & Buffer</span><span>~${((fees + buffer)/100).toFixed(2)}</span></div>
                                    <div className="flex items-center justify-between text-sm"><span className="text-red-500 flex items-center gap-1"><Heart className="w-3 h-3"/>Charity</span><span>${(charityAmount / 100).toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack} disabled={isCreating}>Back</Button>
                <Button onClick={handleCreateMatch} className="bg-blue-600 hover:bg-blue-700 px-8" disabled={isCreating}>
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : '🚀'}
                    {isCreating ? 'Creating Match...' : 'Confirm & Create'}
                </Button>
            </div>
        </div>
    );
}