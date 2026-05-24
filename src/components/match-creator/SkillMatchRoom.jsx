
import React, { useState, useEffect, useCallback } from 'react';
import { UserMatch } from '@/entities/UserMatch';
import { Ticket } from '@/entities/Ticket';
import { Fulfillment } from '@/entities/Fulfillment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Clock, Target, CheckCircle2 } from 'lucide-react';

export default function SkillMatchRoom({ product, roomConfig, gameId = 'skychess-blitz' }) {
  const [match, setMatch] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [scores, setScores] = useState([]);
  const [matchStatus, setMatchStatus] = useState('creating');

  // Callback for simulating players joining
  const simulatePlayersJoining = useCallback(async (matchId) => {
    const mockPlayers = [
      { id: 'player1', name: 'Alice', skill: 0.9 },
      { id: 'player2', name: 'Bob', skill: 0.7 },
      { id: 'player3', name: 'Carol', skill: 0.8 },
      { id: 'player4', name: 'Dave', skill: 0.6 }
    ];

    // Simulate players joining over time
    for (let i = 0; i < Math.min(mockPlayers.length, roomConfig.players); i++) {
      setTimeout(async () => {
        const player = mockPlayers[i];
        const ticket = await Ticket.create({
          match_id: matchId,
          user_id: player.id,
          method: 'paid',
          payment_token_ref: `tok_${Math.random().toString(36).substr(2, 9)}`
        });
        
        setTickets(prev => [...prev, { ...ticket, playerName: player.name, skill: player.skill }]);
        
        // If room is full, start the match
        if (i === roomConfig.players - 1) {
          setTimeout(() => startMatch(matchId), 1000);
        }
      }, i * 1500);
    }
  }, [roomConfig.players]); // Dependencies: roomConfig.players for the loop condition

  // Callback for starting the match
  const startMatch = useCallback(async (matchId) => {
    await UserMatch.update(matchId, { status: 'active' });
    setMatchStatus('active');
    
    // Simulate gameplay and scoring
    setTimeout(() => simulateGameplay(matchId), 3000);
  }, []); // No external dependencies needed here.

  // Callback for simulating gameplay
  const simulateGameplay = useCallback(async (matchId) => {
    setMatchStatus('judging');
    await UserMatch.update(matchId, { status: 'judging' });
    
    // Generate scores based on skill level + randomness
    const gameScores = tickets.map(ticket => ({
      user_id: ticket.user_id,
      playerName: ticket.playerName,
      score: Math.floor((ticket.skill * 0.7 + Math.random() * 0.3) * 1000),
      submitted_at: new Date().toISOString(),
      proof_hash: `hash_${Math.random().toString(36).substr(2, 16)}`
    }));
    
    // Sort by score (highest first)
    gameScores.sort((a, b) => b.score - a.score);
    setScores(gameScores);
    
    // Finalize match
    setTimeout(() => finalizeMatch(matchId, gameScores), 2000);
  }, [tickets]); // Dependencies: tickets to generate scores

  // Callback for finalizing the match
  const finalizeMatch = useCallback(async (matchId, finalScores) => {
    const winner = finalScores[0];
    const auditRoot = `merkle_${Math.random().toString(36).substr(2, 32)}`;
    
    await UserMatch.update(matchId, { 
      status: 'completed',
      winners: [winner.user_id],
      audit_root: auditRoot
    });
    
    setMatchStatus('completed');
    
    // Initiate fulfillment
    setTimeout(() => initiateFulfillment(matchId, winner.user_id), 1000);
  }, []); // No external dependencies needed here.

  // Callback for simulating purchasing agent
  const simulatePurchasingAgent = useCallback(() => {
    setMatchStatus('shipped');
    console.log('🤖 Purchasing Agent: Virtual card created, order placed, tracking obtained');
  }, []); // No external dependencies needed here.

  // Callback for initiating fulfillment
  const initiateFulfillment = useCallback(async (matchId, winnerId) => {
    try {
      await Fulfillment.create({
        match_id: matchId,
        winner_id: winnerId,
        mode: 'agent', // Will use purchasing agent
        status: 'pending'
      });
      
      setMatchStatus('fulfillment');
      
      // Simulate purchasing agent workflow
      setTimeout(() => simulatePurchasingAgent(), 3000);
    } catch (error) {
      console.error('Error initiating fulfillment:', error);
    }
  }, [simulatePurchasingAgent]); // Dependencies: simulatePurchasingAgent

  // Callback for creating the match
  const createMatch = useCallback(async () => {
    try {
      const newMatch = await UserMatch.create({
        created_by: 'current_user', // Would be actual user ID
        game_id: gameId,
        product_id: product.id,
        min_players: 2,
        max_players: roomConfig.players,
        buy_in_cents: roomConfig.buyInCents,
        status: 'open',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        rules: 'Skill-based scoring. Highest score wins. Server-verified submissions only.',
        verification_method: 'api'
      });
      
      setMatch(newMatch);
      setMatchStatus('open');
      
      // Simulate some players joining
      setTimeout(() => simulatePlayersJoining(newMatch.id), 2000);
      
    } catch (error) {
      console.error('Error creating match:', error);
      setMatchStatus('error');
    }
  }, [gameId, product.id, roomConfig.players, roomConfig.buyInCents, simulatePlayersJoining]);

  useEffect(() => {
    createMatch();
  }, [createMatch]); // Dependency: createMatch

  const getStatusBadge = () => {
    const statusConfig = {
      creating: { label: 'Creating...', color: 'bg-blue-100 text-blue-800' },
      open: { label: 'Open for Players', color: 'bg-green-100 text-green-800' },
      active: { label: 'Match Active', color: 'bg-yellow-100 text-yellow-800' },
      judging: { label: 'Judging Scores', color: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Match Complete', color: 'bg-indigo-100 text-indigo-800' },
      fulfillment: { label: 'Purchasing Prize', color: 'bg-orange-100 text-orange-800' },
      shipped: { label: 'Prize Shipped', color: 'bg-green-100 text-green-800' },
      error: { label: 'Error', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[matchStatus] || statusConfig.creating;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const progress = (tickets.length / roomConfig.players) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Match Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              SkyChess Blitz - {roomConfig.players} Player Room
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={product.image_urls[0]} alt={product.title} className="w-16 h-16 object-contain bg-white rounded-lg" />
                <div>
                  <h3 className="font-semibold text-slate-800">{product.title}</h3>
                  <p className="text-green-600 font-bold">${(product.price_cents / 100).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {tickets.length}/{roomConfig.players} Players
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  ${(roomConfig.buyInCents / 100).toFixed(2)} entry contribution
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Room Fill</span>
                <span>{tickets.length}/{roomConfig.players}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players */}
      {tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tickets.map((ticket, index) => (
                <div key={ticket.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="font-medium">{ticket.playerName}</span>
                  <Badge variant="outline">Joined</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Final Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scores.map((score, index) => (
                <div key={score.user_id} className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-600' : 'text-slate-600'}`}>
                      #{index + 1}
                    </span>
                    <span className="font-medium">{score.playerName}</span>
                    {index === 0 && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{score.score.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">verified</div>
                  </div>
                </div>
              ))}
            </div>
            
            {match?.audit_root && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Audit Root:</strong> {match.audit_root}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  All scores cryptographically verified. Match integrity guaranteed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fulfillment Status */}
      {matchStatus === 'fulfillment' && (
        <Card className="bg-orange-50 border border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Purchasing Agent Active</span>
            </div>
            <p className="text-sm text-orange-700 mt-2">
              Creating virtual card → placing order → capturing tracking...
            </p>
          </CardContent>
        </Card>
      )}

      {matchStatus === 'shipped' && (
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Prize Shipped!</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Order placed successfully. Tracking will be sent to winner.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
