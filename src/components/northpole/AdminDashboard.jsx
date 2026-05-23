import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Package, CheckCircle2, XCircle, Truck, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { logEvent } from '@/lib/northpole/matchEngine';
import MatchEventLog from './MatchEventLog';

const STATUS_COLORS = {
  pending_review: 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30',
  approved: 'bg-green-600/20 text-green-300 border-green-600/30',
  rejected: 'bg-red-600/20 text-red-300 border-red-600/30',
};

const ORDER_COLORS = {
  sandbox_created: 'bg-blue-600/20 text-blue-300',
  processing: 'bg-purple-600/20 text-purple-300',
  ordered: 'bg-blue-600/20 text-blue-300',
  shipped: 'bg-green-600/20 text-green-300',
  delivered: 'bg-green-600/20 text-green-300',
  failed: 'bg-red-600/20 text-red-300',
};

export default function AdminDashboard({ currentUser }) {
  const [matches, setMatches] = useState([]);
  const [fulfillments, setFulfillments] = useState([]);
  const [events, setEvents] = useState({});
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const load = async () => {
    setIsLoading(true);
    const [matchList, fulfillList] = await Promise.all([
      base44.entities.NorthPoleMatch.list('-created_date', 50),
      base44.entities.NorthPoleFulfillment.list('-created_date', 50),
    ]);
    setMatches(matchList);
    setFulfillments(fulfillList);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadEvents = async (matchId) => {
    const evts = await base44.entities.MatchEvent.filter({ match_id: matchId }, 'created_date', 100);
    setEvents(prev => ({ ...prev, [matchId]: evts }));
  };

  const toggleExpand = (matchId) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchId);
      loadEvents(matchId);
    }
  };

  const getFulfillment = (matchId) => fulfillments.find(f => f.match_id === matchId);

  const handleApprove = async (fulfillment) => {
    const key = fulfillment.id;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await base44.entities.NorthPoleFulfillment.update(fulfillment.id, {
      admin_status: 'approved',
      order_status: 'processing',
      reviewed_by: currentUser?.email,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes[fulfillment.id] || '',
    });
    await logEvent(fulfillment.match_id, 'admin_approved', currentUser?.id || 'admin',
      { fulfillment_id: fulfillment.id }, 'Admin approved fulfillment');
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleReject = async (fulfillment) => {
    const key = fulfillment.id;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await base44.entities.NorthPoleFulfillment.update(fulfillment.id, {
      admin_status: 'rejected',
      reviewed_by: currentUser?.email,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes[fulfillment.id] || '',
    });
    await logEvent(fulfillment.match_id, 'admin_rejected', currentUser?.id || 'admin',
      { fulfillment_id: fulfillment.id }, 'Admin rejected fulfillment');
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleMarkShipped = async (fulfillment) => {
    const key = fulfillment.id + '_ship';
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await base44.entities.NorthPoleFulfillment.update(fulfillment.id, {
      order_status: 'shipped',
      tracking_number: 'SANDBOX-TRACK-' + Date.now().toString(36).toUpperCase(),
    });
    await logEvent(fulfillment.match_id, 'prize_sent', currentUser?.id || 'admin',
      { fulfillment_id: fulfillment.id }, 'Prize marked as shipped');
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const verifiedMatches = matches.filter(m => ['verified', 'fulfillment_pending', 'fulfilled'].includes(m.status));
  const pendingFulfillments = fulfillments.filter(f => f.admin_status === 'pending_review');

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-purple-900/30 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Matches', value: matches.length, icon: '🎮', color: 'text-purple-300' },
          { label: 'Verified Winners', value: verifiedMatches.length, icon: '✅', color: 'text-green-300' },
          { label: 'Pending Review', value: pendingFulfillments.length, icon: '⏳', color: 'text-yellow-300' },
          { label: 'Total Fulfillments', value: fulfillments.length, icon: '📦', color: 'text-blue-300' },
        ].map(stat => (
          <Card key={stat.label} className="bg-purple-900/30 border-purple-700/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-purple-400 text-xs">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={load} className="border-purple-700/50 text-purple-300 hover:bg-purple-900/40 gap-2">
          <RefreshCw className="w-4 h-4" />Refresh
        </Button>
      </div>

      {/* Match list */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">All Matches</h3>
        {matches.length === 0 && (
          <p className="text-purple-400 text-sm text-center py-8">No matches yet. Play a game to see results here.</p>
        )}
        <div className="space-y-3">
          {matches.map(match => {
            const fulfillment = getFulfillment(match.match_id);
            const isExpanded = expandedMatch === match.match_id;
            return (
              <Card key={match.id} className="bg-black/30 border border-purple-800/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-white font-bold text-sm">{match.match_id}</span>
                        <Badge className={`text-xs ${
                          match.status === 'verified' ? 'bg-green-600/20 text-green-300' :
                          match.status === 'active' ? 'bg-blue-600/20 text-blue-300' :
                          match.status === 'completed' ? 'bg-orange-600/20 text-orange-300' :
                          'bg-purple-600/20 text-purple-300'
                        }`}>{match.status}</Badge>
                        {match.sandbox_mode && <Badge className="bg-blue-900/40 text-blue-300 text-xs border border-blue-700/30">🧪 Sandbox</Badge>}
                      </div>
                      <div className="text-purple-400 text-xs">
                        Game: <span className="text-purple-200">{match.game_id}</span>
                        {' · '}
                        Prize: <span className="text-purple-200">{match.prize_snapshot?.title || match.prize_id}</span>
                      </div>
                      {match.winner_user_id && (
                        <div className="flex items-center gap-1 text-xs">
                          <Trophy className="w-3 h-3 text-yellow-400" />
                          <span className="text-yellow-300">Winner locked: {match.winner_user_id}</span>
                        </div>
                      )}
                      <div className="text-purple-500 text-xs">
                        {match.created_date ? format(new Date(match.created_date), 'MMM d, yyyy HH:mm') : '—'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {fulfillment && (
                        <Badge className={`text-xs border ${STATUS_COLORS[fulfillment.admin_status] || ''}`}>
                          {fulfillment.admin_status}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(match.match_id)}
                        className="text-purple-300 hover:bg-purple-900/40"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded: fulfillment controls + event log */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t border-purple-800/30 pt-4">
                      {/* Fulfillment controls */}
                      {fulfillment && (
                        <div className="bg-purple-900/20 rounded-lg p-4 space-y-3">
                          <h4 className="text-purple-200 font-semibold text-sm flex items-center gap-2">
                            <Package className="w-4 h-4" />Fulfillment Record
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-purple-400">Winner</span>
                              <p className="text-white truncate">{fulfillment.winner_user_id}</p>
                            </div>
                            <div>
                              <span className="text-purple-400">Order Status</span>
                              <Badge className={`${ORDER_COLORS[fulfillment.order_status]} text-xs mt-1`}>
                                {fulfillment.order_status}
                              </Badge>
                            </div>
                          </div>

                          {fulfillment.admin_status === 'pending_review' && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Admin notes (optional)…"
                                value={adminNotes[fulfillment.id] || ''}
                                onChange={e => setAdminNotes(prev => ({ ...prev, [fulfillment.id]: e.target.value }))}
                                className="bg-black/30 border-purple-700/40 text-white text-xs h-16 resize-none"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(fulfillment)}
                                  disabled={actionLoading[fulfillment.id]}
                                  className="bg-green-700 hover:bg-green-600 text-white gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  {actionLoading[fulfillment.id] ? 'Approving…' : 'Approve'}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleReject(fulfillment)}
                                  disabled={actionLoading[fulfillment.id]}
                                  variant="destructive"
                                  className="gap-1"
                                >
                                  <XCircle className="w-3 h-3" />Reject
                                </Button>
                              </div>
                            </div>
                          )}

                          {fulfillment.admin_status === 'approved' && fulfillment.order_status === 'processing' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkShipped(fulfillment)}
                              disabled={actionLoading[fulfillment.id + '_ship']}
                              className="bg-blue-700 hover:bg-blue-600 text-white gap-1"
                            >
                              <Truck className="w-3 h-3" />
                              {actionLoading[fulfillment.id + '_ship'] ? 'Marking…' : 'Mark as Shipped (Sandbox)'}
                            </Button>
                          )}

                          {fulfillment.tracking_number && (
                            <p className="text-green-300 text-xs">
                              📬 Tracking: <span className="font-mono">{fulfillment.tracking_number}</span>
                            </p>
                          )}
                          {fulfillment.admin_notes && (
                            <p className="text-purple-300 text-xs">Notes: {fulfillment.admin_notes}</p>
                          )}
                        </div>
                      )}

                      {/* Event log */}
                      <div>
                        <h4 className="text-purple-200 font-semibold text-sm mb-2">Event Log</h4>
                        <MatchEventLog events={events[match.match_id]} isLoading={!events[match.match_id]} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}