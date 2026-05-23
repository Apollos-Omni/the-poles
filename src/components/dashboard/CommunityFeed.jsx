import React, { useState, useEffect } from 'react';
import { Match } from '@/entities/Match';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { BarChart, Users, Trophy, DollarSign } from 'lucide-react';

export default function MatchDashboard({ games }) {
    const [matches, setMatches] = useState([]);
    const [stats, setStats] = useState({ totalMatches: 0, activePlayers: 0, totalPrizes: 0 });

    useEffect(() => {
        // Mock data
        const mockMatches = [
            { id: 'match-1', game_id: games[0]?.id, status: 'active', current_players: 8, prize_value: 350 },
            { id: 'match-2', game_id: games[0]?.id, status: 'completed', current_players: 10, prize_value: 500 },
        ];
        setMatches(mockMatches);

        const totalMatches = mockMatches.length;
        const activePlayers = mockMatches.filter(m => m.status === 'active').reduce((sum, m) => sum + m.current_players, 0);
        const totalPrizes = mockMatches.reduce((sum, m) => sum + m.prize_value, 0);
        setStats({ totalMatches, activePlayers, totalPrizes });

    }, [games]);

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
                 <Card className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 backdrop-blur-sm border border-purple-500/30">
                    <CardContent className="p-6 text-center">
                        <BarChart className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                        <div className="text-2xl font-bold text-purple-100">{stats.totalMatches}</div>
                        <div className="text-purple-300 text-sm">Total Matches</div>
                    </CardContent>
                </Card>
                 <Card className="bg-gradient-to-br from-green-600/20 to-green-700/20 backdrop-blur-sm border border-green-500/30">
                    <CardContent className="p-6 text-center">
                        <Users className="w-8 h-8 mx-auto mb-3 text-green-400" />
                        <div className="text-2xl font-bold text-green-100">{stats.activePlayers}</div>
                        <div className="text-green-300 text-sm">Active Players</div>
                    </CardContent>
                </Card>
                 <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-700/20 backdrop-blur-sm border border-yellow-500/30">
                    <CardContent className="p-6 text-center">
                        <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                        <div className="text-2xl font-bold text-yellow-100">${stats.totalPrizes.toLocaleString()}</div>
                        <div className="text-yellow-300 text-sm">Total Prize Value</div>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="bg-black/40 border-purple-700/30">
                <CardHeader><CardTitle className="text-purple-200">Recent Matches</CardTitle></CardHeader>
                <CardContent>
                    {matches.map(match => (
                        <div key={match.id} className="flex justify-between items-center p-3 hover:bg-purple-900/20 rounded-lg">
                            <span className="font-medium text-purple-100">{games.find(g => g.id === match.game_id)?.title || 'Unknown Game'}</span>
                            <Badge className={match.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>{match.status}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </div>
    );
}