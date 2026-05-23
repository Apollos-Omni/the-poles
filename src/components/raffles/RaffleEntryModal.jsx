import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, CreditCard, Shield, Zap, Calculator, Clock, Users } from "lucide-react";
import { RaffleEntry } from "@/entities/RaffleEntry";

export default function RaffleEntryModal({ raffle, product, merchant, user, onClose, onSuccess }) {
  const [qty, setQty] = useState(1);
  const [clientSeed, setClientSeed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const entryPrice = raffle.entry_price_cents / 100;
  const totalCost = entryPrice * qty;
  const newOdds = raffle.current_entries + qty;
  const remainingSlots = raffle.max_entries - raffle.current_entries;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await RaffleEntry.create({
        raffle_id: raffle.id,
        user_id: user.id,
        client_seed: clientSeed || `${Date.now()}-${Math.random()}`,
        qty: qty,
        amount_cents: Math.round(totalCost * 100),
        status: 'paid'
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating raffle entry:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gradient-to-br from-purple-900 to-black border border-purple-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-400" />
              <CardTitle className="text-purple-200">Enter Raffle</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-purple-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Product Summary */}
          <div className="flex gap-4 mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/30">
            <img 
              src={product?.image_url} 
              alt={product?.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">{product?.title}</h3>
              <p className="text-purple-300 text-sm">by {merchant?.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-500/20 text-green-300">
                  ${(product?.price_snapshot_cents / 100).toLocaleString()} value
                </Badge>
                <Badge variant="outline" className="text-purple-300 border-purple-600">
                  {raffle.current_entries} / {raffle.max_entries} entries
                </Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entry Quantity */}
            <div className="space-y-3">
              <Label className="text-purple-200 font-semibold">Number of Entries</Label>
              <div className="flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="border-purple-600 text-purple-300 hover:bg-purple-800/40"
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={remainingSlots}
                  value={qty}
                  onChange={(e) => setQty(Math.min(remainingSlots, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-24 text-center bg-purple-900/30 border-purple-700/50 text-white"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQty(Math.min(remainingSlots, qty + 1))}
                  className="border-purple-600 text-purple-300 hover:bg-purple-800/40"
                >
                  +
                </Button>
                <div className="flex-1 text-right">
                  <div className="text-purple-300 text-sm">
                    {remainingSlots} slots remaining
                  </div>
                </div>
              </div>
            </div>

            {/* Client Seed (Optional) */}
            <div className="space-y-3">
              <Label className="text-purple-200 font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Lucky Number (Optional)
              </Label>
              <Input
                placeholder="Enter your lucky string for extra randomness"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="bg-purple-900/30 border-purple-700/50 text-white placeholder-purple-400"
              />
              <p className="text-xs text-purple-400">
                This adds your personal randomness to the draw for provable fairness
              </p>
            </div>

            {/* Cost Summary */}
            <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-700/30">
              <h4 className="font-semibold text-purple-200 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Entry Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-300">Price per entry:</span>
                  <span className="text-white">${entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Quantity:</span>
                  <span className="text-white">{qty}</span>
                </div>
                <div className="flex justify-between border-t border-purple-700/30 pt-2">
                  <span className="text-purple-200 font-semibold">Total Cost:</span>
                  <span className="text-green-400 font-bold">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Your new odds:</span>
                  <span className="text-yellow-400 font-semibold">1 in {newOdds}</span>
                </div>
              </div>
            </div>

            {/* Fairness Guarantee */}
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
              <h4 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Provably Fair Guarantee
              </h4>
              <ul className="text-xs text-green-200/80 space-y-1">
                <li>• Draw uses cryptographic randomness that cannot be manipulated</li>
                <li>• All entries are timestamped and immutable</li>
                <li>• Winner verification is public and auditable</li>
                <li>• Funds are escrowed until purchase completion</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="border-purple-700/50 text-purple-300">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Enter Now
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}