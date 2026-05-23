import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Game } from '@/entities/Game';
import { Manifest } from '@/entities/Manifest';
import { Match } from '@/entities/Match';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Gamepad2, Settings, BarChart } from 'lucide-react';
import GameForm from '../components/creator-portal/GameForm';
import ManifestBuilder from '../components/creator-portal/ManifestBuilder';
import MatchDashboard from '../components/creator-portal/MatchDashboard';

export default function CreatorPortal() {
    const [user, setUser] = useState(null);
    const [games, setGames] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedGame, setSelectedGame] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadCreatorData = useCallback(async () => {
        setIsLoading(true);
        try {
            const userData = await User.me();
            setUser(userData);
            const creatorGames = await Game.filter({ owner_id: userData.id });
            setGames(creatorGames);
        } catch (error) {
            console.error("Error loading creator data:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadCreatorData();
    }, [loadCreatorData]);
    
    const TabButton = ({ id, label, icon: Icon }) => (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
          activeTab === id
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
            : 'bg-black/40 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );

    if (isLoading) {
        return <div className="text-white">Loading Creator Portal...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Gamepad2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-indigo-300 bg-clip-text text-transparent">
                            Creator Portal
                        </h1>
                        <p className="text-purple-200/80">Submit your games, create prize matches, and track your impact.</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                    <TabButton id="dashboard" label="Dashboard" icon={BarChart} />
                    <TabButton id="my-games" label="My Games" icon={Gamepad2} />
                    <TabButton id="new-game" label="Submit New Game" icon={Upload} />
                </div>
                
                {activeTab === 'dashboard' && <MatchDashboard games={games} />}
                
                {activeTab === 'my-games' && (
                    <div>
                        {games.map(game => (
                            <Card key={game.id} className="bg-black/40 border-purple-700/30 mb-4">
                                <CardHeader>
                                    <CardTitle className="text-purple-200">{game.title}</CardTitle>
                                    <Badge>{game.status}</Badge>
                                </CardHeader>
                                <CardContent>
                                    <ManifestBuilder game={game} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'new-game' && <GameForm user={user} onGameCreated={loadCreatorData} />}
            </div>
        </div>
    );
}