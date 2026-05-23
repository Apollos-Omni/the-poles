import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Package, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  sandbox_created: { label: 'Sandbox Order Created', color: 'bg-blue-600/20 text-blue-300', icon: Package },
  pending_review: { label: 'Pending Admin Review', color: 'bg-yellow-600/20 text-yellow-300', icon: Clock },
  approved: { label: 'Admin Approved', color: 'bg-green-600/20 text-green-300', icon: CheckCircle2 },
  processing: { label: 'Processing Order', color: 'bg-purple-600/20 text-purple-300', icon: RefreshCw },
  ordered: { label: 'Order Placed', color: 'bg-blue-600/20 text-blue-300', icon: Package },
  shipped: { label: 'Shipped!', color: 'bg-green-600/20 text-green-300', icon: CheckCircle2 },
  delivered: { label: 'Delivered!', color: 'bg-green-600/20 text-green-300', icon: CheckCircle2 },
};

export default function MatchResultScreen({ match, fulfillment, currentUserId, onPlayAgain }) {
  const isWinner = match?.winner_user_id === currentUserId;
  const myScore = match?.scores?.[currentUserId] ?? 0;
  const prize = match?.prize_snapshot;

  const orderStatus = fulfillment?.order_status || 'sandbox_created';
  const adminStatus = fulfillment?.admin_status || 'pending_review';
  const statusCfg = STATUS_CONFIG[orderStatus] || STATUS_CONFIG.sandbox_created;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Result Banner */}
      <div className={`rounded-2xl p-8 mb-6 ${isWinner
        ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border border-yellow-600/50'
        : 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-700/50'
      }`}>
        <div className="text-6xl mb-4">{isWinner ? '🏆' : '⭐'}</div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {isWinner ? 'You Won!' : 'Great Game!'}
        </h2>
        <p className="text-purple-200 mb-4">
          {isWinner
            ? 'Congratulations — you are the verified winner!'
            : `Your score: ${myScore}. Better luck next time!`}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-300 font-bold text-xl">{myScore} pts</span>
        </div>
      </div>

      {/* Prize & Fulfillment (winner only) */}
      {isWinner && prize && (
        <Card className="bg-purple-900/40 border border-purple-700/30 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={prize.image_url}
                alt={prize.title}
                className="w-16 h-16 object-contain rounded-lg bg-black/30"
              />
              <div className="text-left">
                <h3 className="text-white font-bold">{prize.title}</h3>
                <p className="text-purple-300 text-sm">${(prize.price_cents / 100).toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-300 text-sm">Fulfillment Status</span>
                <Badge className={statusCfg.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusCfg.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-300 text-sm">Admin Review</span>
                <Badge className={adminStatus === 'approved' ? 'bg-green-600/20 text-green-300' : 'bg-yellow-600/20 text-yellow-300'}>
                  {adminStatus === 'approved' ? '✓ Approved' : '⏳ Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-300 text-sm">Mode</span>
                <Badge className="bg-blue-600/20 text-blue-300">🧪 Sandbox</Badge>
              </div>
              {fulfillment?.tracking_number && (
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 text-sm">Tracking</span>
                  <span className="text-white font-mono text-sm">{fulfillment.tracking_number}</span>
                </div>
              )}
            </div>

            {adminStatus === 'pending_review' && (
              <p className="text-yellow-300/80 text-xs mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                ⏳ An admin will review and approve your prize order. You'll see the status update here.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Match details */}
      <Card className="bg-black/30 border border-purple-800/30 mb-6">
        <CardContent className="p-4 text-left space-y-2">
          <h4 className="text-purple-300 font-semibold text-sm mb-3">Match Details</h4>
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">Match ID</span>
            <span className="text-white font-mono">{match?.match_id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">Status</span>
            <Badge className="bg-green-600/20 text-green-300 text-xs">{match?.status}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">Winner Locked</span>
            <span className="text-green-400 text-xs">{match?.winner_locked_at ? '✓ Yes' : '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">Sandbox Mode</span>
            <span className="text-blue-400 text-xs">🧪 Active</span>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onPlayAgain}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
      >
        Play Another Match
      </Button>
    </div>
  );
}