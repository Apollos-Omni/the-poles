import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { Game } from '@/entities/Game';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Plus,
  Swords,
  Gamepad2,
  Trophy,
  Users,
  Clock,
  DollarSign,
  Heart,
  Sparkles,
  Upload,
  BarChart,
  Shield,
  Info,
  Link,
  Loader2
} from "lucide-react";

// Correctly import each function from its own file
import { createMatch } from '@/functions/createMatch';
import { joinMatch } from '@/functions/joinMatch';
import { submitScore } from '@/functions/submitScore';
import { finalizeMatch } from '@/functions/finalizeMatch';


import GameBrowser from '../components/match-creator/GameBrowser';
import ProductBrowser from '../components/match-creator/ProductBrowser';
import MatchPreview from '../components/match-creator/MatchPreview';
import NorthPoleAffiliateDirectory from '../components/northpole/NorthPoleAffiliateDirectory';
import ShopTab from '../components/northpole/ShopTab';
import EbayShopTab from '../components/northpole/EbayShopTab';

const santaClauseConfig = {
  "disclosure": {
    "affiliate": "We may earn from qualifying purchases via retailer links.",
    "charity": "10% of every prize value is donated to The North Pole Fund for children's gifts.",
    "fairness": "All competitions are skill-based. Winners are determined by verified performance, score, completion time, or confirmed match result — never by random selection."
  },
  "featuredGames": [
    { "id": "skychess-blitz", "title": "SkyChess Blitz", "genre": "Board/Strategy", "mode": "skill", "playerCounts": [2,4,8], "avgMatchMinutes": 6, "description": "Fast chess puzzles, accuracy+time scoring. Server-verified result." },
    { "id": "dash-drift-time-trial", "title": "Dash & Drift", "genre": "Racing / Time Trial", "mode": "skill", "playerCounts": [4,6,10], "avgMatchMinutes": 4, "description": "One track, three laps — fastest verified time wins." },
    { "id": "neon-arena-duel", "title": "Neon Arena", "genre": "Action / Arena", "mode": "skill", "playerCounts": [2,6,10], "avgMatchMinutes": 5, "description": "Hits, streaks, and survival time. Deterministic scoreboard." },
    { "id": "trivia-champion", "title": "Trivia Champion", "genre": "Trivia / Knowledge", "mode": "skill", "playerCounts": [2,4,8], "avgMatchMinutes": 5, "description": "Score-based trivia — most correct answers in the shortest time wins." }
  ],
  "featuredPrizes": [
    {
      "id": "nintendo-switch-oled", "title": "Nintendo Switch OLED", "category": "Gaming Console", "image_url": "https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?q=80&w=400", "P": 34999,
      "uplift": { "marginPct": 0.05, "feesPct": 0.03, "bufferPct": 0.02 },
      "rooms": [ { "N": 10 }, { "N": 8 }, { "N": 6 }, { "N": 4 }, { "N": 2 } ]
    },
    {
      "id": "apple-airpods-pro", "title": "Apple AirPods Pro", "category": "Audio", "image_url": "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=400", "P": 24900,
      "uplift": { "marginPct": 0.05, "feesPct": 0.03, "bufferPct": 0.02 },
      "rooms": [ { "N": 8 }, { "N": 6 }, { "N": 4 }, { "N": 2 } ]
    },
    {
      "id": "instant-pot", "title": "Instant Pot Duo", "category": "Home & Kitchen", "image_url": "https://images.unsplash.com/photo-1588708215982-f54817a0210f?q=80&w=400", "P": 9900,
      "uplift": { "marginPct": 0.05, "feesPct": 0.03, "bufferPct": 0.02 },
      "rooms": [ { "N": 10 }, { "N": 8 }, { "N": 6 }, { "N": 4 } ]
    },
     {
      "id": "lego-starship", "title": "LEGO Starship Set", "category": "Toys", "image_url": "https://images.unsplash.com/photo-1585366119957-e25a4b6c7128?q=80&w=400", "P": 12999,
      "uplift": { "marginPct": 0.05, "feesPct": 0.03, "bufferPct": 0.02 },
      "rooms": [ { "N": 10 }, { "N": 8 }, { "N": 6 }, { "N": 4 } ]
    }
  ],
  "ui": {
    "retailerPicker": {
      "quickLinks": ["Amazon","Walmart","Target","Best Buy","eBay","Apple","Microsoft","Home Depot","Nike","Wayfair"]
    }
  },
  "math": { "margin": 0.05, "feesPct": 0.03, "bufferPct": 0.02 }
};

const ceilToCents = (x) => Math.ceil(x);
const totalNeeded = (P_cents, u) => P_cents * (1 + u.marginPct + u.feesPct + u.bufferPct);
const buyInForPlayers = (P_cents, u, N) => ceilToCents(totalNeeded(P_cents, u) / N) / 100;



export default function SantaClause() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('arcade');
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState([]);

  const [step, setStep] = useState(1);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [matchSettings, setMatchSettings] = useState({
    matchType: 'skill', minPlayers: 4, maxPlayers: 10, deadline: '', rules: '',
    verificationMethod: 'screenshot', charityPercentage: 10
  });
  const [calculatedBuyIn, setCalculatedBuyIn] = useState(0);
  


  const loadSantaClauseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      const creatorGames = [
        { id: 'game-1', title: 'SkyChess Blitz', status: 'approved', owner_id: userData.id },
        { id: 'game-2', title: 'Rhythm Master', status: 'pending_review', owner_id: userData.id }
      ];
      setGames(creatorGames);
    } catch (error) {
      console.error('Error loading Santa Clause data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSantaClauseData();
  }, [loadSantaClauseData]);

  const calculateBuyIn = useCallback(() => {
    if (!selectedProduct) {
        setCalculatedBuyIn(0);
        return;
    }
    const P_cents = selectedProduct.price_cents;
    const { margin, feesPct, bufferPct } = santaClauseConfig.math;
    const uplift = { marginPct: margin, feesPct, bufferPct };

    const T_cents = totalNeeded(P_cents, uplift);
    const buyInPerPlayer_cents = ceilToCents(T_cents / matchSettings.maxPlayers);
    setCalculatedBuyIn(buyInPerPlayer_cents); // Keep in cents
  }, [selectedProduct, matchSettings.maxPlayers]);

  useEffect(() => {
    calculateBuyIn();
  }, [calculateBuyIn]);
  
  useEffect(() => {
    if (activeTab === 'create') {
      if (!selectedProduct) {
        setStep(1);
        setSelectedGame(null);
      } else {
        if (!selectedGame) {
          setStep(1);
        } else {
          setStep(3);
        }
      }
    }
  }, [activeTab, selectedGame, selectedProduct]);

  const TabButton = ({ id, label, icon: Icon, count = 0 }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
        activeTab === id
          ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg'
          : 'bg-purple-900/40 text-purple-300 hover:bg-purple-900/60 border border-purple-700/30'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && <Badge className="bg-purple-600/20 text-purple-300 text-xs">{count}</Badge>}
    </button>
  );



  const FeaturedGameCard = ({ game }) => (
    <Card className="bg-purple-900/40 backdrop-blur-sm border border-purple-700/30 hover:border-purple-500 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white text-lg">{game.title}</CardTitle>
        <Badge className="w-fit bg-purple-600/20 text-purple-300">{game.genre}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-purple-300 text-sm mb-4">{game.description}</p>
        <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white">
          Play Now
        </Button>
      </CardContent>
    </Card>
  );

  const FeaturedPrizeCard = ({ prize }) => (
     <Card className="bg-purple-900/40 backdrop-blur-sm border border-purple-700/30 hover:border-purple-500 transition-all duration-300 flex flex-col">
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="h-40 bg-black/30 rounded-lg mb-4 flex items-center justify-center">
            <img src={prize.image_url} alt={prize.title} className="max-h-full max-w-full object-contain rounded-lg"/>
        </div>
        <h3 className="font-semibold text-white truncate flex-grow">{prize.title}</h3>
        <p className="text-sm text-purple-300">{prize.category}</p>

        <div className="mt-4 pt-4 border-t border-purple-700/30">
            <h4 className="text-sm font-semibold text-purple-300 mb-2 text-center">Entry per Player</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
                {prize.rooms.map(room => {
                    const buyIn = buyInForPlayers(prize.P, prize.uplift, room.N);
                    return (
                        <div key={room.N} className="bg-black/30 p-2 rounded-md">
                            <span className="text-xs text-purple-400">{room.N} Players</span>
                            <p className="font-bold text-white">${buyIn.toFixed(2)}</p>
                        </div>
                    );
                })}
            </div>
        </div>

        <Button
            onClick={() => {
                const mockProduct = {
                  id: prize.id,
                  title: prize.title,
                  price_cents: prize.P,
                  offers: [{
                    retailer: 'featured',
                    price_cents: prize.P,
                    availability: 'in_stock'
                  }],
                  images: [prize.image_url],
                  brand: prize.category
                };
                setSelectedProduct(mockProduct);
                setActiveTab('create');
                setStep(selectedGame ? 3 : 1);
            }}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white"
        >
            🏆 Select This Prize
        </Button>
      </CardContent>
    </Card>
  );

  const Disclosures = () => (
    <div className="bg-purple-900/40 backdrop-blur-sm border border-purple-700/30 rounded-xl p-4 mb-8 space-y-3">
        <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
                <h3 className="text-purple-200 font-semibold text-sm">Skill-Based Competition Only</h3>
                <p className="text-purple-300 text-xs">{santaClauseConfig.disclosure.fairness}</p>
            </div>
        </div>
        <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
                <h3 className="text-purple-200 font-semibold text-sm">Charity Commitment</h3>
                <p className="text-purple-300 text-xs">{santaClauseConfig.disclosure.charity}</p>
            </div>
        </div>
        <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
                <h3 className="text-purple-200 font-semibold text-sm">Affiliate Disclosure</h3>
                <p className="text-purple-300 text-xs">{santaClauseConfig.disclosure.affiliate}</p>
            </div>
        </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-purple-900/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-purple-700/30">
                <div className="h-32 bg-purple-800/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                🎅 The North Pole
              </h1>
              <p className="text-purple-300 text-lg">Skill-Based Competitions • Verified Challenges • Prize Matches</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <TabButton id="arcade" label="Prize Arcade" icon={Swords} />
          <TabButton id="shop" label="Prize Shop" icon={DollarSign} />
          <TabButton id="create" label="Create Match" icon={Plus} />
          <TabButton id="creator" label="Creator Portal" icon={Upload} count={games.length} />
        </div>

        {activeTab === 'arcade' && (
          <div>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 text-center">Featured Games</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {santaClauseConfig.featuredGames.map(game => <FeaturedGameCard key={game.id} game={game} />)}
              </div>
            </div>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 text-center">Trending Prizes</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {santaClauseConfig.featuredPrizes.map(prize => <FeaturedPrizeCard key={prize.id} prize={prize} />)}
              </div>
            </div>
             <Disclosures />
          </div>
        )}

        {activeTab === 'shop' && (
          <EbayShopTab
            buyInForPlayers={buyInForPlayers}
            onCreateMatch={(prize) => {
              if (!prize?.id) {
                alert("Please select a valid prize before creating a match.");
                return;
              }
              setSelectedProduct(prize);
              setActiveTab('create');
              setStep(selectedGame ? 3 : 1);
            }}
          />
        )}

        {activeTab === 'create' && (
          <div className="bg-purple-900/40 backdrop-blur-md border border-purple-700/30 p-8 rounded-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">🎮 Create Skill-Based Match</h2>
              <p className="text-purple-300">Select a game and confirm your prize. The winner is determined exclusively by verified skill — score, time, or confirmed match result.</p>
            </div>
            {!selectedProduct && (
              <div className="mb-6 bg-yellow-900/30 border border-yellow-700/40 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-yellow-300 font-semibold text-sm">No prize selected yet</p>
                  <p className="text-yellow-200/70 text-xs">Go to <button className="underline hover:text-yellow-200" onClick={() => setActiveTab('shop')}>Prize Shop</button> and select a prize before creating a match.</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Step 1: Choose a Mobile Game</h3>
                <GameBrowser onGameSelect={(game) => { setSelectedGame(game); setStep(2); }} />
              </div>
            )}

            {step === 2 && (
              <div>
                <Button variant="link" onClick={() => { setSelectedGame(null); setStep(1); }} className="text-purple-300">&larr; Back to Game Selection</Button>
                <h3 className="text-2xl font-bold text-white my-6">Step 2: Find Your Prize</h3>
                <ProductBrowser onProductSelect={(product) => { setSelectedProduct(product); setStep(3); }} />
              </div>
            )}

            {step === 3 && selectedGame && selectedProduct && (
              <MatchPreview
                game={selectedGame}
                product={selectedProduct}
                settings={matchSettings}
                buyIn={calculatedBuyIn}
                onConfirm={async (matchDetails) => {
                  try {
                      const { data } = await createMatch({
                        ...matchDetails,
                        productOffer: matchDetails.productOffer
                      });
                      if(data.success) {
                          alert("Match created successfully!");
                          setActiveTab('arcade'); 
                          setStep(1); 
                          setSelectedGame(null); 
                          setSelectedProduct(null); 
                      } else {
                          throw new Error(data.error || "Failed to create match");
                      }
                  } catch (err) {
                      console.error("Error creating match:", err);
                      alert(`Error: ${err.message}`);
                  }
                }}
                onBack={() => { setSelectedProduct(null); setStep(2); }}
              />
            )}
          </div>
        )}



        {activeTab === 'creator' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">👨‍💻 Creator Portal</h2>
              <p className="text-purple-300">Submit your games and create prize matches for the community!</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              {games.map(game => (
                <Card key={game.id} className="bg-purple-900/40 border-purple-700/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{game.title}</CardTitle>
                      <Badge className={game.status === 'approved' ? 'bg-green-600/20 text-green-300' : 'bg-yellow-600/20 text-yellow-300'}>
                        {game.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-300">Game status and management controls would go here.</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}