import React, { useState, useEffect, useCallback } from 'react';
import { Match } from '@/entities/Match';
import { Game } from '@/entities/Game';
import { Prize } from '@/entities/Prize';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Users, Trophy, DollarSign, Clock } from 'lucide-react';

const MatchCard = ({ match, game, prize }) => {
    const buyIn = (match.buy_in_cents / 100).toFixed(2);
    const prizeValue = (prize.price_cents / 100).toFixed(2);

    return (
        <Card className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm border border-purple-700/30 hover:border-purple-400/50 transition-all duration-300">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-100 text-lg">{game?.title || 'Skill Challenge'}</CardTitle>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">{match.status}</Badge>
                </div>
                <p className="text-sm text-purple-300/80">Win a {prize?.title || 'mystery prize'}!</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-40 bg-black/30 rounded-lg flex items-center justify-center">
                    <img src={prize?.image_url || 'https://via.placeholder.com/300'} alt={prize?.title} className="max-h-full max-w-full object-contain rounded-lg"/>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-purple-200"><Users className="w-4 h-4 text-purple-400"/> {match.current_players || 0} / {match.max_players} Players</div>
                    <div className="flex items-center gap-2 text-purple-200"><Trophy className="w-4 h-4 text-yellow-400"/> ~${prizeValue} Value</div>
                    <div className="flex items-center gap-2 text-purple-200"><DollarSign className="w-4 h-4 text-green-400"/> ${buyIn} Buy-in</div>
                    <div className="flex items-center gap-2 text-purple-200"><Clock className="w-4 h-4 text-blue-400"/> Ends in 2d 4h</div>
                </div>
                 <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                    Join Match
                </Button>
            </CardContent>
        </Card>
    );
};

export default function Arcade() {
    const [matches, setMatches] = useState([]);
    const [games, setGames] = useState([]);
    const [prizes, setPrizes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadArcadeData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Mock data for now
            const mockPrizes = [
                {id: 'prize-1', title: 'Nintendo Switch OLED', price_cents: 34999, image_url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?q=80&w=400' },
                {id: 'prize-2', title: 'Sony WH-1000XM5 Headphones', price_cents: 39999, image_url: 'https://images.unsplash.com/photo-1628198499955-456b889396a8?q=80&w=400' }
            ];
            const mockGames = [
                {id: 'game-1', title: 'SkyChess Blitz'},
                {id: 'game-2', title: 'Rhythm Master'}
            ];
            const mockMatches = [
                {id: 'match-1', game_id: 'game-1', prize_id: 'prize-1', min_players: 2, max_players: 10, buy_in_cents: 3999, status: 'active'},
                {id: 'match-2', game_id: 'game-2', prize_id: 'prize-2', min_players: 4, max_players: 20, buy_in_cents: 2499, status: 'active'}
            ];
            setPrizes(mockPrizes);
            setGames(mockGames);
            setMatches(mockMatches);
        } catch (error) {
            console.error("Error loading arcade data:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadArcadeData();
    }, [loadArcadeData]);

    if (isLoading) {
        return <div className="text-white">Loading Arcade...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Swords className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-indigo-300 bg-clip-text text-transparent">
                            Skill Prize Arcade
                        </h1>
                        <p className="text-purple-200/80">Compete for prizes. Your skill determines the winner.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {matches.map(match => {
                        const game = games.find(g => g.id === match.game_id);
                        const prize = prizes.find(p => p.id === match.prize_id);
                        return <MatchCard key={match.id} match={match} game={game} prize={prize} />;
                    })}
                </div>
            </div>
        </div>
    );
}