import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Users, Tag, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function GroupBuyCard({ groupBuy, product }) {
  const fillPercentage = (groupBuy.current_participants / groupBuy.target_participants) * 100;
  const priceSaved = (groupBuy.unit_price_cents - groupBuy.discounted_price_cents) / 100;

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-black/60 to-emerald-900/40 backdrop-blur-md border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                Group Buy
            </Badge>
        </div>
        <CardContent className="p-0">
            <div className="relative h-48 overflow-hidden">
                <img src={product?.image_url} alt={product?.title} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            <div className="p-6 space-y-4">
                <div>
                     <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {product?.title}
                    </h3>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-emerald-200">Participants</span>
                        <span className="text-emerald-200">{groupBuy.current_participants} / {groupBuy.target_participants}</span>
                    </div>
                    <Progress value={fillPercentage} className="h-2 bg-emerald-900/50 [&>*]:bg-emerald-500" />
                    <div className="text-xs text-emerald-300 text-center">
                        {fillPercentage.toFixed(0)}% to goal
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-t border-emerald-700/30">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white line-through text-gray-400">
                            ${(groupBuy.unit_price_cents / 100).toFixed(2)}
                        </div>
                        <div className="text-2xl font-bold text-emerald-400">
                            ${(groupBuy.discounted_price_cents / 100).toFixed(2)}
                        </div>
                        <div className="text-xs text-emerald-300">Group Price</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                           ${priceSaved.toFixed(2)}
                        </div>
                        <div className="text-xs text-green-300">You Save</div>
                    </div>
                </div>

                {groupBuy.deadline && (
                    <div className="flex items-center justify-center gap-2 text-sm text-emerald-300 bg-emerald-900/30 rounded-lg py-2">
                        <Clock className="w-4 h-4" />
                        <span>Ends {formatDistanceToNow(new Date(groupBuy.deadline), { addSuffix: true })}</span>
                    </div>
                )}
                
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold">
                    <Users className="w-4 h-4 mr-2" />
                    Join Group Buy
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}