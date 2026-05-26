import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Gamepad2, Loader2, Monitor, Search, Smartphone, Star, Zap } from 'lucide-react';
import { debounce } from 'lodash';
import { searchGames } from '@/functions/searchGames';
import { VideoBackgroundCard, mediaImages } from '@/components/media/MediaPrimitives';

const platformOptions = ['all', 'mobile', 'desktop', 'console', 'vr', 'web'];
const storeOptions = [
  ['all', 'All Stores'],
  ['app_store', 'Apple App Store'],
  ['google_play', 'Google Play'],
  ['steam', 'Steam'],
  ['epic_games_store', 'Epic Games'],
  ['playstation_store', 'PlayStation Store'],
  ['xbox_store', 'Xbox Store'],
  ['nintendo_eshop', 'Nintendo eShop'],
  ['meta_quest_store', 'Meta Quest Store'],
  ['web_portal', 'Web Portal'],
];
const categoryOptions = ['all', 'action', 'battle royale', 'fps', 'platformer', 'puzzle', 'racing', 'rhythm', 'rpg', 'sandbox', 'simulation', 'sports', 'strategy', 'trivia'];

function getPlatformIcon(platform = '') {
  const value = String(platform).toLowerCase();
  if (value.includes('mobile')) return <Smartphone className="h-4 w-4" />;
  if (value.includes('desktop') || value.includes('pc')) return <Monitor className="h-4 w-4" />;
  if (value.includes('vr')) return <Zap className="h-4 w-4" />;
  if (value.includes('web')) return <ExternalLink className="h-4 w-4" />;
  return <Gamepad2 className="h-4 w-4" />;
}

function gameStoreUrl(game) {
  const store = game.store_id || game.store || '';
  const appId = game.app_id || game.provider_ids?.steam || game.provider_ids?.rawg_slug || '';
  if (/steam/i.test(store) && appId) return `https://store.steampowered.com/app/${appId}`;
  if (/google/i.test(store) && appId) return `https://play.google.com/store/apps/details?id=${appId}`;
  if (/apple|app store/i.test(store) && appId) return `https://apps.apple.com/app/id${appId}`;
  return game.product_url || game.store_url || '#';
}

function normalizeGame(game) {
  return {
    ...game,
    id: game.id || game.app_id || `game-${Date.now().toString(36)}`,
    title: game.title || 'Selected Game',
    developer: game.developer || game.publisher || 'Unknown',
    platform: game.platform || 'unknown',
    store: game.store || game.store_id || game.source_label || game.source || 'Game catalog',
    category: game.category || game.genre || 'Skill Challenge',
    rating: game.rating ?? 'N/A',
    price: game.price || 'Catalog listing',
    image_url: game.image_url || game.icon_url || '',
    icon_url: game.icon_url || game.image_url || '',
    verification_type: game.verification_type || (game.skill_verifiable ? 'score_evidence' : 'manual_review'),
    skill_verifiable: Boolean(game.skill_verifiable ?? true),
  };
}

export default function GameBrowser({ onGameSelect }) {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerMessage, setProviderMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(async ({ query, platform, store, category }) => {
    const cleanQuery = String(query || '').trim();
    if (cleanQuery.length < 2 && platform === 'all' && store === 'all' && category === 'all') {
      setGames([]);
      setHasSearched(false);
      setProviderMessage('');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const { data } = await searchGames({
        query: cleanQuery,
        platform: platform === 'all' ? null : platform,
        store: store === 'all' ? null : store,
        category: category === 'all' ? null : category,
        limit: 24,
      });
      setGames((data.games || []).map(normalizeGame));
      setProviderMessage(data.providerMessage || '');
    } catch (err) {
      console.error('Game search error:', err);
      setError(err.message || 'Game search failed. Please try again.');
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce(runSearch, 400), [runSearch]);

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  useEffect(() => {
    debouncedSearch({
      query: searchTerm,
      platform: selectedPlatform,
      store: selectedStore,
      category: selectedCategory,
    });
  }, [searchTerm, selectedPlatform, selectedStore, selectedCategory, debouncedSearch]);

  return (
    <div>
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <VideoBackgroundCard title="Choose the arena" description="Pick a game that feels skill-verifiable, streamable, and worth inviting people into." image={mediaImages.northArena} label="Game browser" metric="Play" />
        <VideoBackgroundCard title="Creator confidence" description="Good game selection makes the room easier to promote and easier to trust." image={mediaImages.creatorDesk} label="Promote" metric="Skill" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-purple-200/60" />
          <Input
            placeholder="Search games..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10 bg-black/40 border-purple-700/40 text-white placeholder:text-purple-200/40 focus:border-cyan-400"
          />
        </div>

        <select value={selectedPlatform} onChange={(event) => setSelectedPlatform(event.target.value)} className="rounded-md border border-purple-700/40 bg-black/40 px-4 py-2 text-white focus:border-cyan-400">
          {platformOptions.map((platform) => <option key={platform} value={platform}>{platform === 'all' ? 'All Platforms' : platform}</option>)}
        </select>

        <select value={selectedStore} onChange={(event) => setSelectedStore(event.target.value)} className="rounded-md border border-purple-700/40 bg-black/40 px-4 py-2 text-white focus:border-cyan-400">
          {storeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>

        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="rounded-md border border-purple-700/40 bg-black/40 px-4 py-2 text-white focus:border-cyan-400">
          {categoryOptions.map((category) => <option key={category} value={category}>{category === 'all' ? 'All Categories' : category}</option>)}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-purple-200">
          <Loader2 className="mr-3 h-8 w-8 animate-spin text-cyan-300" />
          Searching game catalogs...
        </div>
      )}

      {!isLoading && error && (
        <div className="mb-6 rounded-xl border border-red-700/40 bg-red-950/30 p-4 text-red-200">{error}</div>
      )}

      {!isLoading && !error && providerMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-600/40 bg-yellow-950/25 p-4 text-sm text-yellow-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{providerMessage}</span>
        </div>
      )}

      {!isLoading && !error && !hasSearched && (
        <div className="rounded-xl border border-purple-700/20 bg-black/25 p-8 text-center text-sm text-purple-300">
          Search by title, developer, platform, store, or category to choose a game.
        </div>
      )}

      {!isLoading && !error && hasSearched && games.length === 0 && (
        <div className="py-12 text-center">
          <Gamepad2 className="mx-auto mb-4 h-16 w-16 text-slate-400/50" />
          <p className="text-slate-300">No games found matching your criteria.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Card key={game.id} className="overflow-hidden border-purple-700/25 bg-black/40 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/50">
            <div className="relative h-28 overflow-hidden">
              <img src={game.image_url || mediaImages.northArena} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-70 transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
            </div>
            <CardContent className="p-5">
              <div className="mb-4 flex items-start gap-4">
                <img src={game.icon_url || game.image_url || mediaImages.northArena} alt="" loading="lazy" decoding="async" className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white">{game.title}</h3>
                  <p className="text-xs text-purple-100/55">{game.developer}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-purple-100/80">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />{game.rating}
                    </span>
                    <Badge className="flex items-center gap-1 bg-slate-100 text-xs text-slate-700">
                      {getPlatformIcon(game.platform)}{game.platform}
                    </Badge>
                    <Badge className="bg-blue-100 text-xs text-blue-800">{game.category}</Badge>
                  </div>
                </div>
              </div>

              <p className="mb-4 line-clamp-2 text-sm text-purple-100/65">{game.description}</p>

              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-green-300">{game.price}</span>
                <Badge className="bg-green-100 text-xs text-green-800">{game.verification_type}</Badge>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="flex-1 border-purple-700/40 text-purple-100 hover:bg-purple-900/40" disabled={gameStoreUrl(game) === '#'} onClick={() => window.open(gameStoreUrl(game), '_blank', 'noopener,noreferrer')}>
                  <ExternalLink className="mr-1 h-3 w-3" />Store
                </Button>
                <Button type="button" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700" onClick={() => onGameSelect(game)}>
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
