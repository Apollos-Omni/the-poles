import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserMatch } from '@/entities/UserMatch';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, ShoppingCart, Trophy, Calculator, Heart, AlertTriangle } from 'lucide-react';

import GameBrowser from '../components/match-creator/GameBrowser';
import MatchPreview from '../components/match-creator/MatchPreview';

export default function CreateMatch() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [step, setStep] = useState(1); // 1: Game, 2: Settings, 3: Review
    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedPrize, setSelectedPrize] = useState(null); // from localStorage / shop
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [matchSettings, setMatchSettings] = useState({
        matchType: 'skill',
        minPlayers: 4,
        maxPlayers: 10,
        deadline: '',
        rules: '',
        verificationMethod: 'screenshot',
        charityPercentage: 10
    });
    const [calculatedBuyIn, setCalculatedBuyIn] = useState(0);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
            } catch (error) {
                console.error('Error loading user:', error);
            }
        };
        loadUser();

        // Load prize from localStorage (set by Shop)
        const stored = localStorage.getItem('northPoleSelectedPrize');
        if (stored) {
            try {
                const prize = JSON.parse(stored);
                setSelectedPrize(prize);
                // Map to selectedProduct shape for downstream compatibility
                setSelectedProduct({
                    id: prize.id,
                    title: prize.title,
                    price_cents: prize.price,
                    image_urls: [prize.image],
                    offers: [{ retailer: prize.retailer, price_cents: prize.price, availability: 'in_stock' }],
                    brand: prize.category,
                });
            } catch (e) {
                console.error('Failed to parse stored prize', e);
            }
        }
    }, []);

    const calculateBuyIn = useCallback(() => {
        if (!selectedProduct) return;
        
        const P = selectedProduct.price_cents; // Product price
        const M = Math.round(P * 0.10); // 10% margin
        const F = Math.round(P * 0.03); // 3% fees
        const B = Math.round(P * 0.02); // 2% buffer
        const C = Math.round((M * matchSettings.charityPercentage) / 100); // Charity portion
        
        const totalPot = P + M + F + B;
        const buyInPerPlayer = Math.ceil(totalPot / matchSettings.maxPlayers);
        
        setCalculatedBuyIn(buyInPerPlayer);
    }, [selectedProduct, matchSettings.maxPlayers, matchSettings.charityPercentage]);

    useEffect(() => {
        if (selectedProduct && matchSettings.maxPlayers) {
            calculateBuyIn();
        }
    }, [selectedProduct, matchSettings.maxPlayers, matchSettings.charityPercentage, calculateBuyIn]);

    const createMatch = async () => {
        if (!selectedPrize?.id) {
            alert('Please select a prize from the North Pole Shop before creating a match.');
            return;
        }
        try {
            const matchData = {
                created_by: user?.id,
                mobile_game_id: selectedGame?.id,
                match_type: matchSettings.matchType,
                min_players: matchSettings.minPlayers,
                max_players: matchSettings.maxPlayers,
                buy_in_cents: calculatedBuyIn,
                deadline: matchSettings.deadline,
                rules: matchSettings.rules,
                verification_method: matchSettings.verificationMethod,
                charity_percentage: matchSettings.charityPercentage,
                selected_prize_id: selectedPrize.id,
                selected_prize_title: selectedPrize.title,
                selected_prize_image: selectedPrize.image,
                selected_prize_price: selectedPrize.price,
                selected_prize_retailer: selectedPrize.retailer,
                selected_prize_url: selectedPrize.url,
                selected_prize_category: selectedPrize.category,
                prize_locked: false,
                status: 'pending_players',
            };

            await UserMatch.create(matchData);
            localStorage.removeItem('northPoleSelectedPrize');
            alert('Match created successfully!');
            navigate('/SantaClause');
        } catch (error) {
            console.error('Error creating match:', error);
            alert('Failed to create match');
        }
    };

    const StepIndicator = ({ currentStep, totalSteps }) => (
        <div className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
                <React.Fragment key={stepNum}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        stepNum <= currentStep 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'border-purple-300 text-purple-300'
                    }`}>
                        {stepNum}
                    </div>
                    {stepNum < totalSteps && (
                        <div className={`w-20 h-0.5 ${
                            stepNum < currentStep ? 'bg-purple-600' : 'bg-purple-300'
                        }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    const PrizeBanner = () => {
        if (!selectedPrize) {
            return (
                <div className="mb-8 p-5 bg-yellow-900/30 border border-yellow-700/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-yellow-300 font-semibold">No prize selected yet</p>
                        <p className="text-yellow-200/70 text-sm mt-1">You must select a prize from the North Pole Shop before creating a match.</p>
                    </div>
                    <Button onClick={() => navigate('/SantaClause')} className="bg-purple-700 hover:bg-purple-600 text-white flex-shrink-0">
                        🎁 Go to Prize Shop
                    </Button>
                </div>
            );
        }

        const players = matchSettings.maxPlayers;
        const uplift = { marginPct: 0.05, feesPct: 0.03, bufferPct: 0.02 };
        const total = selectedPrize.price * (1 + uplift.marginPct + uplift.feesPct + uplift.bufferPct);
        const entryPerPlayer = (Math.ceil(total / players) / 100).toFixed(2);
        const donation = (selectedPrize.price / 100 * 0.10).toFixed(2);

        return (
            <div className="mb-8 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/40 rounded-2xl p-5">
                <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-3">🏆 Selected Prize</p>
                <div className="flex gap-4 items-start">
                    {selectedPrize.image && (
                        <img src={selectedPrize.image} alt={selectedPrize.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg leading-tight">{selectedPrize.title}</h3>
                        <p className="text-purple-300 text-sm">Estimated Value: ${(selectedPrize.price / 100).toFixed(2)} · via {selectedPrize.retailer}</p>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                            <div className="bg-black/30 rounded-lg p-2 text-center">
                                <p className="text-purple-400 text-xs">Players Needed</p>
                                <p className="text-white font-bold">{players}</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 text-center">
                                <p className="text-purple-400 text-xs">Entry / Player</p>
                                <p className="text-green-300 font-bold">${entryPerPlayer}</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 text-center">
                                <p className="text-pink-400 text-xs flex items-center justify-center gap-1"><Heart className="w-3 h-3" /> Children's Fund</p>
                                <p className="text-pink-300 font-bold">${donation}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => { setSelectedPrize(null); setSelectedProduct(null); localStorage.removeItem('northPoleSelectedPrize'); }} className="text-purple-400/60 hover:text-purple-300 text-xs flex-shrink-0">Change</button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-indigo-300 bg-clip-text text-transparent mb-4">
                        Create Skill-Based Match
                    </h1>
                    <p className="text-purple-200/80">Select a game and set your rules — the winner is determined by verified skill.</p>
                </div>

                {/* Prize Banner — always visible */}
                <PrizeBanner />

                <StepIndicator currentStep={step} totalSteps={3} />

                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-bold text-purple-200 mb-6 flex items-center gap-2">
                            <Gamepad2 className="w-6 h-6" />
                            Step 1: Choose a Game
                        </h2>
                        <GameBrowser 
                            onGameSelect={(game) => {
                                setSelectedGame(game);
                                setStep(2);
                            }}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold text-purple-200 mb-6 flex items-center gap-2">
                            <Trophy className="w-6 h-6" />
                            Step 2: Match Settings
                        </h2>

                        {selectedGame && (
                            <div className="mb-6 p-4 bg-black/40 rounded-xl border border-purple-700/30 flex items-center gap-3">
                                <Gamepad2 className="w-5 h-5 text-purple-400" />
                                <div>
                                    <p className="text-xs text-purple-400">Selected Game</p>
                                    <p className="text-white font-semibold">{selectedGame.title}</p>
                                </div>
                                <button onClick={() => { setSelectedGame(null); setStep(1); }} className="ml-auto text-xs text-purple-400/60 hover:text-purple-300">Change</button>
                            </div>
                        )}

                        <Card className="bg-black/40 border-purple-700/30">
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-purple-300">Max Players</Label>
                                        <Select 
                                            value={matchSettings.maxPlayers.toString()} 
                                            onValueChange={(value) => setMatchSettings(prev => ({...prev, maxPlayers: parseInt(value)}))}
                                        >
                                            <SelectTrigger className="bg-purple-900/30 border-purple-700/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[4, 6, 8, 10, 16, 20, 25, 50].map(num => (
                                                    <SelectItem key={num} value={num.toString()}>{num} Players</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-purple-300">Verification Method</Label>
                                        <Select 
                                            value={matchSettings.verificationMethod} 
                                            onValueChange={(value) => setMatchSettings(prev => ({...prev, verificationMethod: value}))}
                                        >
                                            <SelectTrigger className="bg-purple-900/30 border-purple-700/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="screenshot">Screenshot Proof</SelectItem>
                                                <SelectItem value="video">Video Proof</SelectItem>
                                                <SelectItem value="api">API Integration</SelectItem>
                                                <SelectItem value="honor_system">Honor System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-purple-300">Match Deadline</Label>
                                        <Input 
                                            type="datetime-local"
                                            value={matchSettings.deadline}
                                            onChange={(e) => setMatchSettings(prev => ({...prev, deadline: e.target.value}))}
                                            className="bg-purple-900/30 border-purple-700/50 text-white"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label className="text-purple-300">Custom Rules</Label>
                                        <Textarea 
                                            value={matchSettings.rules}
                                            onChange={(e) => setMatchSettings(prev => ({...prev, rules: e.target.value}))}
                                            placeholder="Additional rules or instructions for players..."
                                            className="bg-purple-900/30 border-purple-700/50 text-white"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {calculatedBuyIn > 0 && (
                                    <div className="mt-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calculator className="w-5 h-5 text-green-400" />
                                            <h3 className="font-semibold text-green-300">Entry Cost Breakdown</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-green-400">Prize Value</p>
                                                <p className="text-white font-semibold">${(selectedProduct?.price_cents / 100).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-green-400">Platform Fee</p>
                                                <p className="text-white font-semibold">${((selectedProduct?.price_cents || 0) * 0.10 / 100).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-green-400">To Children's Fund</p>
                                                <p className="text-white font-semibold">${((selectedProduct?.price_cents || 0) * 0.10 * matchSettings.charityPercentage / 10000).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-green-400">Entry Per Player</p>
                                                <p className="text-white font-bold text-lg">${(calculatedBuyIn / 100).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between mt-8">
                            <Button variant="outline" onClick={() => setStep(1)} className="border-purple-700/50 text-purple-300">
                                Back
                            </Button>
                            <Button 
                                onClick={() => setStep(3)} 
                                disabled={!selectedPrize?.id}
                                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Review & Create
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="text-2xl font-bold text-purple-200 mb-6">Step 3: Review & Create</h2>
                        
                        <MatchPreview 
                            game={selectedGame}
                            product={selectedProduct}
                            settings={matchSettings}
                            buyIn={calculatedBuyIn}
                            onConfirm={createMatch}
                            onBack={() => setStep(2)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}