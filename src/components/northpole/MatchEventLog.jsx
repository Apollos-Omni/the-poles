import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';
import { format } from 'date-fns';

const EVENT_CONFIG = {
  prize_selected: { icon: '🎁', color: 'text-yellow-400', label: 'Prize Selected' },
  match_created: { icon: '🆕', color: 'text-blue-400', label: 'Match Created' },
  match_started: { icon: '▶️', color: 'text-green-400', label: 'Match Started' },
  score_submitted: { icon: '📊', color: 'text-purple-400', label: 'Score Submitted' },
  match_completed: { icon: '🏁', color: 'text-orange-400', label: 'Match Completed' },
  winner_verified: { icon: '✅', color: 'text-green-400', label: 'Winner Verified' },
  fulfillment_created: { icon: '📦', color: 'text-blue-400', label: 'Fulfillment Created' },
  admin_approved: { icon: '👍', color: 'text-green-400', label: 'Admin Approved' },
  admin_rejected: { icon: '❌', color: 'text-red-400', label: 'Admin Rejected' },
  prize_sent: { icon: '🚚', color: 'text-purple-400', label: 'Prize Sent' },
  prize_delivered: { icon: '🎉', color: 'text-green-400', label: 'Prize Delivered' },
};

export default function MatchEventLog({ events, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1,2,3].map(i => (
          <div key={i} className="h-12 bg-purple-900/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-purple-400">
        <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, idx) => {
        const cfg = EVENT_CONFIG[event.event_type] || { icon: '•', color: 'text-purple-400', label: event.event_type };
        return (
          <div key={event.id || idx} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-purple-800/20">
            <span className="text-lg flex-shrink-0">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
                {event.note && <span className="text-purple-400 text-xs truncate">{event.note}</span>}
              </div>
              {event.data && Object.keys(event.data).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(event.data).map(([k, v]) => (
                    <Badge key={k} className="bg-purple-900/40 text-purple-300 text-xs border border-purple-700/30">
                      {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-purple-500 flex-shrink-0">
              {event.created_date ? format(new Date(event.created_date), 'HH:mm:ss') : '—'}
            </div>
          </div>
        );
      })}
    </div>
  );
}