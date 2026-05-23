import React, { useState, useEffect } from 'react';
import { MobileGame } from '@/entities/MobileGame';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Star, ExternalLink, Smartphone, Monitor, Gamepad2, Zap } from 'lucide-react';

export default function GameBrowser({ onGameSelect }) {
    const [games, setGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState('all');
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        setIsLoading(true);
        try {
            const sampleGames = [
                // Mobile - Apple App Store
                {
                    id: 'game-1',
                    store_id: 'app_store',
                    platform: 'mobile',
                    app_id: '553834731',
                    title: 'Clash of Clans',
                    developer: 'Supercell',
                    description: 'Build your village, train your army, and battle players worldwide!',
                    category: 'Strategy',
                    rating: 4.5,
                    rating_count: 15000000,
                    icon_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop',
                    price: 'Free',
                    in_app_purchases: true,
                    age_rating: '13+',
                    skill_verifiable: true
                },
                // Mobile - Google Play
                {
                    id: 'game-2',
                    store_id: 'google_play',
                    platform: 'mobile',
                    app_id: 'com.pubg.mobile',
                    title: 'PUBG Mobile',
                    developer: 'PUBG Corporation',
                    description: 'Battle royale at its finest. 100 players, one winner.',
                    category: 'Action',
                    rating: 4.1,
                    rating_count: 25000000,
                    icon_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&h=100&fit=crop',
                    price: 'Free',
                    in_app_purchases: true,
                    age_rating: '17+',
                    skill_verifiable: true
                },
                // Mobile - Samsung Galaxy Store
                {
                    id: 'game-6',
                    store_id: 'samsung_galaxy_store',
                    platform: 'mobile',
                    app_id: 'com.ea.games.r3_row', // Example package name for Real Racing 3
                    title: 'Real Racing 3',
                    developer: 'EA Mobile',
                    description: 'The award-winning franchise that sets a new standard for mobile racing games.',
                    category: 'Racing',
                    rating: 4.3,
                    rating_count: 1000000,
                    icon_url: 'https://images.unsplash.com/photo-1629856578021-96541571d7d5?w=100&h=100&fit=crop', // Placeholder image
                    price: 'Free',
                    in_app_purchases: true,
                    age_rating: 'E',
                    skill_verifiable: true
                },
                // Mobile - Amazon Appstore
                {
                    id: 'game-7',
                    store_id: 'amazon_appstore',
                    platform: 'mobile',
                    app_id: 'B01MY04B99', // Example ASIN for Minecraft Pocket Edition
                    title: 'Minecraft',
                    developer: 'Mojang',
                    description: 'Explore infinite worlds and build everything from the simplest of homes to the grandest of castles.',
                    category: 'Sandbox',
                    rating: 4.7,
                    rating_count: 5000000,
                    icon_url: 'https://images.unsplash.com/photo-1550993510-911e359052ce?w=100&h=100&fit=crop', // Placeholder image
                    price: '$6.99',
                    in_app_purchases: true,
                    age_rating: 'E10+',
                    skill_verifiable: false
                },
                // Mobile - Huawei AppGallery
                {
                    id: 'game-8',
                    store_id: 'huawei_appgallery',
                    platform: 'mobile',
                    app_id: 'C100650991', // Example app ID for Asphalt 9
                    title: 'Asphalt 9: Legends',
                    developer: 'Gameloft',
                    description: 'Drive your dream cars across the most spectacular locations around the world.',
                    category: 'Racing',
                    rating: 4.6,
                    rating_count: 2000000,
                    icon_url: 'https://images.unsplash.com/photo-1593341646797-278c77220268?w=100&h=100&fit=crop', // Placeholder image
                    price: 'Free',
                    in_app_purchases: true,
                    age_rating: 'E',
                    skill_verifiable: true
                },
                // PC - Steam
                {
                    id: 'game-3',
                    store_id: 'steam',
                    platform: 'desktop',
                    app_id: '730',
                    title: 'Counter-Strike 2',
                    developer: 'Valve',
                    description: 'The legendary FPS returns with new graphics and mechanics.',
                    category: 'FPS',
                    rating: 4.3,
                    rating_count: 890000,
                    icon_url: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=100&h=100&fit=crop',
                    price: 'Free',
                    in_app_purchases: false,
                    age_rating: 'M',
                    skill_verifiable: true
                },
                // PC - Epic Games Store
                {
                    id: 'game-9',
                    store_id: 'epic_games_store',
                    platform: 'desktop',
                    app_id: 'fortnite',
                    title: 'Fortnite',
                    developer: 'Epic Games',
                    description: 'A massive online multiplayer battle royale game. Build, battle, and be the last one standing.',
                    category: 'Battle Royale',
                    rating: 4.0,
                    rating_count: 30000000,
                    icon_url: 'https://images.unsplash.com/photo-1612287230491-645511cf2980?w=100&h=100&fit=crop', // Placeholder image
                    price: 'Free',
                    in_app_purchases: true,
                    age_rating: 'T',
                    skill_verifiable: true
                },
                // PC - GOG
                {
                    id: 'game-10',
                    store_id: 'gog',
                    platform: 'desktop',
                    app_id: 'the_witcher_3_wild_hunt_game_of_the_year_edition',
                    title: 'The Witcher 3: Wild Hunt - GOTY Edition',
                    developer: 'CD Projekt Red',
                    description: 'An open-world action RPG set in a dark fantasy universe. Play as Geralt of Rivia.',
                    category: 'RPG',
                    rating: 4.9,
                    rating_count: 150000,
                    icon_url: 'https://images.unsplash.com/photo-1596798031206-897d27e9b068?w=100&h=100&fit=crop', // Placeholder image
                    price: '$49.99',
                    in_app_purchases: false,
                    age_rating: 'M',
                    skill_verifiable: false
                },
                // PC - Microsoft Store
                {
                    id: 'game-11',
                    store_id: 'microsoft_store',
                    platform: 'desktop',
                    app_id: '9NBLGGH4T4X7', // Example product ID for Forza Horizon 5
                    title: 'Forza Horizon 5',
                    developer: 'Playground Games',
                    description: 'Your ultimate Horizon adventure awaits! Explore the vibrant open world of Mexico.',
                    category: 'Racing',
                    rating: 4.6,
                    rating_count: 75000,
                    icon_url: 'https://images.unsplash.com/photo-1627943534575-b6d44f6f7b1e?w=100&h=100&fit=crop', // Placeholder image
                    price: '$59.99',
                    in_app_purchases: true,
                    age_rating: 'E',
                    skill_verifiable: true
                },
                // PC - itch.io
                {
                    id: 'game-12',
                    store_id: 'itch_io',
                    platform: 'desktop',
                    app_id: 'celeste', // Slug
                    developer: 'mattmakesgames', // itch.io username
                    title: 'Celeste',
                    description: 'A super-tight platformer about climbing a mountain.',
                    category: 'Platformer',
                    rating: 4.8,
                    rating_count: 25000,
                    icon_url: 'https://images.unsplash.com/photo-1585860250091-a6b10b0e5c94?w=100&h=100&fit=crop', // Placeholder image
                    price: '$19.99',
                    in_app_purchases: false,
                    age_rating: 'E',
                    skill_verifiable: true
                },
                // Console - PlayStation Store
                {
                    id: 'game-4',
                    store_id: 'playstation_store',
                    platform: 'console',
                    app_id: 'CUSA12031_00',
                    title: 'FIFA 24',
                    developer: 'EA Sports',
                    description: 'The world\'s game, featuring HyperMotion technology.',
                    category: 'Sports',
                    rating: 4.2,
                    rating_count: 45000,
                    icon_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
                    price: '$59.99',
                    in_app_purchases: true,
                    age_rating: 'E',
                    skill_verifiable: true
                },
                // Console - Xbox Store
                {
                    id: 'game-13',
                    store_id: 'xbox_store',
                    platform: 'console',
                    app_id: '9P3PM1LFNNC1', // Example product ID for Halo Infinite
                    title: 'Halo Infinite',
                    developer: '343 Industries',
                    description: 'The Master Chief returns in the most expansive Halo campaign yet.',
                    category: 'FPS',
                    rating: 4.4,
                    rating_count: 100000,
                    icon_url: 'https://images.unsplash.com/photo-1628172945281-2c070f07c2a7?w=100&h=100&fit=crop', // Placeholder image
                    price: 'Free', // Multiplayer is free
                    in_app_purchases: true,
                    age_rating: 'T',
                    skill_verifiable: true
                },
                // Console - Nintendo eShop
                {
                    id: 'game-14',
                    store_id: 'nintendo_eshop',
                    platform: 'console',
                    app_id: '70010000000025', // Example title ID for The Legend of Zelda: Tears of the Kingdom
                    title: 'The Legend of Zelda: TOTK',
                    developer: 'Nintendo',
                    description: 'A vast world awaits in this sequel to Breath of the Wild.',
                    category: 'Action-Adventure',
                    rating: 4.9,
                    rating_count: 500000,
                    icon_url: 'https://images.unsplash.com/photo-1587620139943-421711202e8d?w=100&h=100&fit=crop', // Placeholder image
                    price: '$69.99',
                    in_app_purchases: false,
                    age_rating: 'E10+',
                    skill_verifiable: false
                },
                // VR - Meta Quest Store
                {
                    id: 'game-5',
                    store_id: 'meta_quest_store',
                    platform: 'vr',
                    app_id: 'beat-saber',
                    title: 'Beat Saber',
                    developer: 'Beat Games',
                    description: 'VR rhythm game - slash beats with lightsabers!',
                    category: 'Rhythm',
                    rating: 4.8,
                    rating_count: 12000,
                    icon_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=100&h=100&fit=crop',
                    price: '$29.99',
                    in_app_purchases: true,
                    age_rating: 'E',
                    skill_verifiable: true
                },
                // VR - SteamVR
                {
                    id: 'game-15',
                    store_id: 'steamvr',
                    platform: 'vr',
                    app_id: '620980', // Steam AppID for Bonelab
                    title: 'BONELAB',
                    developer: 'Stress Level Zero',
                    description: 'Experimental physics action VR game. Explore a mysterious lab.',
                    category: 'Action',
                    rating: 4.1,
                    rating_count: 8000,
                    icon_url: 'https://images.unsplash.com/photo-1627943534575-b6d44f6f7b1e?w=100&h=100&fit=crop', // Reusing placeholder
                    price: '$39.99',
                    in_app_purchases: false,
                    age_rating: 'M',
                    skill_verifiable: true
                },
                // VR - Pico Store
                {
                    id: 'game-16',
                    store_id: 'pico_store',
                    platform: 'vr',
                    app_id: 'pico-4-sports-park', // Example slug
                    title: 'PICO 4 Sports Park',
                    developer: 'PICO Studios',
                    description: 'Experience various sports in VR with the Pico 4 headset.',
                    category: 'Sports',
                    rating: 4.0,
                    rating_count: 3000,
                    icon_url: 'https://images.unsplash.com/photo-1627943534575-b6d44f6f7b1e?w=100&h=100&fit=crop', // Reusing placeholder
                    price: '$19.99',
                    in_app_purchases: false,
                    age_rating: 'E',
                    skill_verifiable: true
                },
                // Web Platform Example (General)
                {
                    id: 'game-17',
                    store_id: 'web_portal', // Custom ID for web games
                    platform: 'web',
                    app_id: 'agar-io', // A common web game
                    title: 'Agar.io',
                    developer: 'Miniclip',
                    description: 'Grow your cell by eating smaller cells and avoid being eaten by larger ones.',
                    category: 'Massively Multiplayer',
                    rating: 3.8,
                    rating_count: 500000,
                    icon_url: 'https://images.unsplash.com/photo-1550993510-911e359052ce?w=100&h=100&fit=crop', // Placeholder image
                    price: 'Free',
                    in_app_purchases: true,
                    age_rating: 'E',
                    skill_verifiable: true
                }
            ];
            
            setGames(sampleGames);
        } catch (error) {
            console.error('Error loading games:', error);
        }
        setIsLoading(false);
    };

    const filteredGames = games.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            game.developer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStore = selectedStore === 'all' || game.store_id === selectedStore;
        const matchesPlatform = selectedPlatform === 'all' || game.platform === selectedPlatform;
        const matchesCategory = selectedCategory === 'all' || game.category.toLowerCase() === selectedCategory.toLowerCase();
        
        return matchesSearch && matchesStore && matchesPlatform && matchesCategory;
    });

    const getStoreIcon = (storeId) => {
        const icons = {
            'app_store': '🍎',
            'google_play': '🤖',
            'samsung_galaxy_store': '📱',
            'amazon_appstore': '📦',
            'huawei_appgallery': '🔶',
            'steam': '🎮',
            'epic_games_store': '⚡',
            'gog': '🏛️',
            'microsoft_store': '🪟',
            'itch_io': '🎲',
            'playstation_store': '🎮',
            'xbox_store': '🎮',
            'nintendo_eshop': '🕹️',
            'meta_quest_store': '🥽',
            'steamvr': '👓',
            'pico_store': '🥽',
            'web_portal': '🌐' // Icon for general web platform
        };
        return icons[storeId] || '🎮';
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            'mobile': <Smartphone className="w-4 h-4" />,
            'desktop': <Monitor className="w-4 h-4" />,
            'console': <Gamepad2 className="w-4 h-4" />,
            'vr': <Zap className="w-4 h-4" />,
            'web': <ExternalLink className="w-4 h-4" />
        };
        return icons[platform] || <Gamepad2 className="w-4 h-4" />;
    };

    const getStoreUrl = (game) => {
        const templates = {
            'app_store': `https://apps.apple.com/app/id${game.app_id}`,
            'google_play': `https://play.google.com/store/apps/details?id=${game.app_id}`,
            'samsung_galaxy_store': `https://apps.samsung.com/appquery/appDetail.as?appId=${game.app_id}`,
            'amazon_appstore': `https://www.amazon.com/dp/${game.app_id}`, // Assuming app_id is ASIN
            'huawei_appgallery': `https://appgallery.huawei.com/#/app/${game.app_id}`,
            'steam': `https://store.steampowered.com/app/${game.app_id}`,
            'epic_games_store': `https://store.epicgames.com/p/${game.app_id}`,
            'gog': `https://www.gog.com/game/${game.app_id}`,
            'microsoft_store': `https://www.microsoft.com/p/${game.app_id}`, // Assuming app_id is Product ID/slug
            'itch_io': `https://${game.developer}.itch.io/${game.app_id}`, // Requires developer username and game slug
            'playstation_store': `https://store.playstation.com/product/${game.app_id}`,
            'xbox_store': `https://www.xbox.com/games/store/${game.app_id}`,
            'nintendo_eshop': `https://www.nintendo.com/store/products/${game.app_id}`,
            'meta_quest_store': `https://www.oculus.com/experiences/quest/${game.app_id}`,
            'steamvr': `https://store.steampowered.com/app/${game.app_id}`, // SteamVR games are often just Steam games
            'pico_store': `https://www.picoxr.com/global/games/${game.app_id}`,
            'web_portal': `https://www.${game.app_id}.com` // Generic link for web games if no specific store
        };
        return templates[game.store_id] || '#';
    };

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-slate-100/70 rounded-lg p-6 animate-pulse border border-slate-200">
                        <div className="h-20 bg-slate-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search games..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-slate-300 text-slate-800 focus:border-blue-500"
                    />
                </div>
                
                <select 
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:border-blue-500"
                >
                    <option value="all">All Platforms</option>
                    <option value="mobile">Mobile</option>
                    <option value="desktop">PC/Desktop</option>
                    <option value="console">Console</option>
                    <option value="vr">VR/AR</option>
                    <option value="web">Web</option>
                </select>

                <select 
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:border-blue-500"
                >
                    <option value="all">All Stores</option>
                    <optgroup label="Mobile">
                        <option value="app_store">Apple App Store</option>
                        <option value="google_play">Google Play</option>
                        <option value="samsung_galaxy_store">Galaxy Store</option>
                        <option value="amazon_appstore">Amazon Appstore</option>
                        <option value="huawei_appgallery">Huawei AppGallery</option>
                    </optgroup>
                    <optgroup label="PC/Desktop">
                        <option value="steam">Steam</option>
                        <option value="epic_games_store">Epic Games</option>
                        <option value="gog">GOG</option>
                        <option value="microsoft_store">Microsoft Store</option>
                        <option value="itch_io">itch.io</option>
                    </optgroup>
                    <optgroup label="Console">
                        <option value="playstation_store">PlayStation Store</option>
                        <option value="xbox_store">Xbox Store</option>
                        <option value="nintendo_eshop">Nintendo eShop</option>
                    </optgroup>
                    <optgroup label="VR/AR">
                        <option value="meta_quest_store">Meta Quest Store</option>
                        <option value="steamvr">SteamVR</option>
                        <option value="pico_store">Pico Store</option>
                    </optgroup>
                    <optgroup label="Web">
                        <option value="web_portal">Web Portal</option>
                    </optgroup>
                </select>

                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:border-blue-500"
                >
                    <option value="all">All Categories</option>
                    <option value="action">Action</option>
                    <option value="action-adventure">Action-Adventure</option>
                    <option value="adventure">Adventure</option>
                    <option value="battle royale">Battle Royale</option>
                    <option value="fps">FPS</option>
                    <option value="massively multiplayer">Massively Multiplayer</option>
                    <option value="platformer">Platformer</option>
                    <option value="puzzle">Puzzle</option>
                    <option value="racing">Racing</option>
                    <option value="rhythm">Rhythm</option>
                    <option value="rpg">RPG</option>
                    <option value="sandbox">Sandbox</option>
                    <option value="simulation">Simulation</option>
                    <option value="sports">Sports</option>
                    <option value="strategy">Strategy</option>
                </select>
            </div>

            {/* Games Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                    <Card key={game.id} className="bg-white/80 border-slate-200 hover:border-blue-300 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <img 
                                    src={game.icon_url} 
                                    alt={game.title}
                                    className="w-16 h-16 rounded-xl object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-800 text-sm">{game.title}</h3>
                                        <span className="text-lg">{getStoreIcon(game.store_id)}</span>
                                    </div>
                                    <p className="text-slate-500 text-xs">{game.developer}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                            <span className="text-xs text-slate-700">{game.rating}</span>
                                        </div>
                                        <Badge className="bg-slate-100 text-slate-700 text-xs flex items-center gap-1">
                                            {getPlatformIcon(game.platform)}
                                            {game.platform}
                                        </Badge>
                                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                                            {game.category}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                {game.description}
                            </p>

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-green-600 font-semibold text-sm">{game.price}</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {game.skill_verifiable && (
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                            Skill ✓
                                        </Badge>
                                    )}
                                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                                        {game.age_rating}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(getStoreUrl(game), '_blank', 'noopener,noreferrer');
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Store
                                </Button>
                                <Button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onGameSelect(game);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
                                >
                                    Select
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredGames.length === 0 && (
                <div className="text-center py-12">
                    <Gamepad2 className="w-16 h-16 text-slate-400/50 mx-auto mb-4" />
                    <p className="text-slate-500">No games found matching your criteria</p>
                </div>
            )}
        </div>
    );
}