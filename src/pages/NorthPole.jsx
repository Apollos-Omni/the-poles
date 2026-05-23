import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Gift,
  ShieldCheck,
  Loader2,
  Trophy,
  Settings2,
  Users,
  Heart,
  RefreshCw,
  Plus,
  LogIn,
  Gamepad2,
  DollarSign,
  Lock,
  Search,
  ShoppingCart,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import PrizeSelector, { DEMO_PRIZES } from '@/components/northpole/PrizeSelector';
import GameLobby from '@/components/northpole/GameLobby';
import MatchResultScreen from '@/components/northpole/MatchResultScreen';
import AdminDashboard from '@/components/northpole/AdminDashboard';
import { GAME_ADAPTERS, getAdapter } from '@/lib/northpole/gameAdapter';
import { ADMIN_ROLES, userHasRole } from '@/lib/rbac';
import { searchProducts } from '@/functions/searchProducts';
import { searchGames } from '@/functions/searchGames';
import {
  createNorthPoleMatch,
  listOpenNorthPoleMatches,
  joinNorthPoleMatch,
  finalizeAndVerify,
  createFulfillmentRecord,
} from '@/lib/northpole/matchEngine';

const STEPS = {
  PRIZE_SELECT: 'prize_select',
  GAME_LOBBY: 'game_lobby',
  PLAYING: 'playing',
  VERIFYING: 'verifying',
  RESULT: 'result',
};

const PLAYER_OPTIONS = [2, 4, 6, 8, 10, 12];

const NORTH_POLE_COST_MODEL = {
  donationRate: 0.1,
  platformBufferRate: 0.03,
};

const emptyPrizeForm = {
  title: '',
  category: 'Custom Prize',
  price: '',
  tax: '',
  shipping: '',
  imageUrl: '',
  gameId: 'north-pole-skill-match',
};

function toCents(value) {
  const amount = Number.parseFloat(String(value || '').replace(/[$,]/g, ''));
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

function formatMoney(cents = 0) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

function calculateNorthPoleOptions({ priceCents, taxCents, shippingCents, playerCounts = PLAYER_OPTIONS }) {
  const totalPrizeCostCents = priceCents + taxCents + shippingCents;
  const donationCents = Math.ceil(totalPrizeCostCents * NORTH_POLE_COST_MODEL.donationRate);
  const platformBufferCents = Math.ceil(totalPrizeCostCents * NORTH_POLE_COST_MODEL.platformBufferRate);
  const totalMatchCents = totalPrizeCostCents + donationCents + platformBufferCents;

  return playerCounts.map((players) => ({
    players,
    priceCents,
    taxCents,
    shippingCents,
    totalPrizeCostCents,
    donationCents,
    platformBufferCents,
    totalMatchCents,
    perPlayerCents: Math.ceil(totalMatchCents / players),
  }));
}

function statusClass(status) {
  if (status === 'open') return 'bg-blue-600/20 text-blue-300 border-blue-600/30';
  if (status === 'active') return 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30';
  if (['verified', 'fulfillment_pending', 'fulfilled'].includes(status)) return 'bg-green-600/20 text-green-300 border-green-600/30';
  if (status === 'cancelled') return 'bg-red-600/20 text-red-300 border-red-600/30';
  return 'bg-purple-600/20 text-purple-300 border-purple-600/30';
}

function NorthPoleMatchCard({ match, currentUserId, onJoin, isJoining }) {
  const playerIds = Array.isArray(match.player_ids) ? match.player_ids : [];
  const isParticipant = Boolean(currentUserId && playerIds.includes(currentUserId));
  const isFull = playerIds.length >= Number(match.max_players || 0);
  const plan = match.match_plan || match.prize_snapshot?.match_plan || {};

  return (
    <Card className="border border-purple-700/30 bg-black/35">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">{match.match_id}</span>
              <Badge className={`border text-xs ${statusClass(match.status)}`}>{match.status}</Badge>
              {match.sandbox_mode ? (
                <Badge className="border border-blue-700/30 bg-blue-900/40 text-blue-300 text-xs">Demo</Badge>
              ) : (
                <Badge className="border border-green-700/30 bg-green-900/40 text-green-300 text-xs">Persisted</Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{match.prize_snapshot?.title || match.prize_id || 'North Pole Prize'}</h3>
            <div className="grid gap-2 text-xs text-purple-200/75 sm:grid-cols-2 lg:grid-cols-4">
              <span className="rounded-lg bg-purple-950/40 px-3 py-2">
                Players: <strong className="text-white">{playerIds.length}/{match.max_players || plan.players || '-'}</strong>
              </span>
              <span className="rounded-lg bg-purple-950/40 px-3 py-2">
                Buy-in: <strong className="text-green-300">{formatMoney(match.buy_in_cents)}</strong>
              </span>
              <span className="rounded-lg bg-purple-950/40 px-3 py-2">
                Fund: <strong className="text-pink-300">{formatMoney(plan.donationCents)}</strong>
              </span>
              <span className="rounded-lg bg-purple-950/40 px-3 py-2">
                Prize total: <strong className="text-yellow-300">{formatMoney(plan.totalPrizeCostCents)}</strong>
              </span>
            </div>
            <p className="text-xs text-purple-400/75">
              Fulfillment is simulated for now. No payment, retailer purchase, or affiliate API call is made when joining.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Button
              onClick={() => onJoin(match)}
              disabled={isJoining || isParticipant || isFull || !currentUserId || !['open', 'pending'].includes(match.status)}
              className="bg-purple-700 text-white hover:bg-purple-600"
            >
              {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              {isParticipant ? 'Joined' : isFull ? 'Full' : 'Join Match'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RealNorthPoleFlow({ user }) {
  const [step, setStep] = useState('prize');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchProvider, setSearchProvider] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [gameSearchTerm, setGameSearchTerm] = useState('');
  const [gameResults, setGameResults] = useState([]);
  const [gameProvider, setGameProvider] = useState('');
  const [isGameSearching, setIsGameSearching] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [form, setForm] = useState(emptyPrizeForm);
  const [selectedPlayers, setSelectedPlayers] = useState(PLAYER_OPTIONS[2]);
  const [estimatedTax, setEstimatedTax] = useState('');
  const [estimatedShipping, setEstimatedShipping] = useState('');
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const priceCents = selectedPrize?.price_cents || toCents(form.price);
  const taxCents = toCents(estimatedTax || form.tax);
  const shippingCents = toCents(estimatedShipping || form.shipping);
  const costOptions = useMemo(
    () => calculateNorthPoleOptions({ priceCents, taxCents, shippingCents }),
    [priceCents, taxCents, shippingCents]
  );
  const selectedPlan = costOptions.find((option) => option.players === selectedPlayers) || costOptions[0];

  const samplePrizes = useMemo(() => DEMO_PRIZES.map((prize) => ({
    ...prize,
    source: 'sample_search_placeholder',
    images: [prize.image_url],
    brand: prize.category,
    offers: [{
      retailer: 'sample_catalog',
      price_cents: prize.price_cents,
      availability: 'in_stock',
    }],
  })), []);

  const playableDemoGames = useMemo(() => GAME_ADAPTERS.map((adapter) => ({
    id: adapter.id,
    title: adapter.title,
    description: adapter.description,
    category: adapter.genre,
    platform: 'web',
    store: 'The Poles playable demo',
    skillStyle: 'playable sandbox score',
    skill_verifiable: true,
    avgDurationSeconds: adapter.avgDurationSeconds,
    icon: adapter.icon,
    source: 'playable_demo_adapter',
  })), []);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const rows = await listOpenNorthPoleMatches({ sort: '-created_date', limit: 100 });
      setMatches(rows.filter((row) => !row.sandbox_mode));
    } catch (err) {
      setError(err.message || 'Could not load North Pole matches.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const bestOfferFor = (product) => {
    const offers = Array.isArray(product?.offers) ? product.offers : [];
    const inStock = offers.filter((offer) => offer.availability === 'in_stock');
    return (inStock.length ? inStock : offers).sort((a, b) => (a.price_cents || 0) - (b.price_cents || 0))[0] || null;
  };

  const normalizePrize = (product, source = 'search_placeholder') => {
    const bestOffer = bestOfferFor(product);
    const resultSource = product.source || product.provider || source;
    const sourceLabel = product.source_label || product.sourceLabel || product.provider_label || resultSource;
    return {
      id: product.id || product.product_id || product.externalId || `prize-${Date.now().toString(36)}`,
      title: product.title || 'Selected Prize',
      category: product.category || product.brand || 'Prize',
      brand: product.brand || product.category || '',
      price_cents: bestOffer?.price_cents || product.price_cents || product.price || 0,
      image_url: product.image_url || product.imageUrl || product.images?.[0] || product.image_urls?.[0] || '',
      images: product.images || product.image_urls || [product.image_url || product.imageUrl || ''].filter(Boolean),
      source: resultSource,
      source_label: sourceLabel,
      source_url: bestOffer?.product_url || product.source_url || product.product_url || null,
      offers: Array.isArray(product.offers) ? product.offers : bestOffer ? [bestOffer] : [],
      availability: bestOffer?.availability || product.availability || 'in_stock',
    };
  };

  const normalizeGame = (game, source = 'sample_game_catalog') => ({
    id: game.id || game.app_id || `game-${Date.now().toString(36)}`,
    title: game.title || 'Selected Game',
    developer: game.developer || game.publisher || 'Unknown',
    description: game.description || '',
    category: game.category || game.genre || 'Skill Challenge',
    platform: game.platform || 'unknown',
    store: game.store || game.store_id || 'Sample catalog',
    skillStyle: game.skillStyle || game.skill_style || (game.skill_verifiable ? 'skill-verifiable result' : 'manual verification'),
    skill_verifiable: Boolean(game.skill_verifiable ?? true),
    icon_url: game.icon_url || '',
    source: game.source || source,
    source_label: game.source_label || game.sourceLabel || game.provider_label || game.source || source,
    provider_ids: game.provider_ids || {},
  });

  const selectPrize = (product, source) => {
    const prize = normalizePrize(product, source);
    setSelectedPrize(prize);
    setEstimatedTax('');
    setEstimatedShipping('');
    setStep('game');
    setMessage('');
    setError('');
  };

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) {
      setError('Enter at least two characters to search prizes.');
      return;
    }
    setIsSearching(true);
    setError('');
    setMessage('');
    try {
      const { data } = await searchProducts({ q: searchTerm.trim(), limit: 12 });
      setSearchResults((data.products || []).map((product) => normalizePrize(product, data.provider || 'search_placeholder')));
      setSearchProvider(data.sourceLabel || data.provider || 'sample_catalog');
    } catch (err) {
      setError(err.message || 'Prize search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGameSearch = async (queryOverride) => {
    const query = (queryOverride ?? gameSearchTerm).trim();
    if (query.length < 2) {
      setError('Enter at least two characters to search games.');
      return;
    }
    setIsGameSearching(true);
    setError('');
    setMessage('');
    try {
      const { data } = await searchGames({ q: query, limit: 18 });
      setGameResults((data.games || []).map((game) => normalizeGame(game, data.provider || 'sample_game_catalog')));
      setGameProvider(data.sourceLabel || data.provider || 'sample_game_catalog');
    } catch (err) {
      setError(err.message || 'Game search failed.');
    } finally {
      setIsGameSearching(false);
    }
  };

  const createManualPrize = () => {
    if (!form.title.trim()) {
      setError('Enter a prize name for manual entry.');
      return;
    }
    const manualPriceCents = toCents(form.price);
    if (manualPriceCents <= 0) {
      setError('Enter a prize price for manual entry.');
      return;
    }
    setSelectedPrize({
      id: `manual-prize-${Date.now().toString(36)}`,
      title: form.title.trim(),
      category: form.category.trim() || 'Custom Prize',
      brand: form.category.trim() || 'Custom',
      price_cents: manualPriceCents,
      image_url: form.imageUrl.trim(),
      images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      source: 'user_entered',
      offers: [{
        retailer: 'manual',
        price_cents: manualPriceCents,
        availability: 'in_stock',
      }],
    });
    setEstimatedTax(form.tax);
    setEstimatedShipping(form.shipping);
    setStep('game');
    setError('');
  };

  const selectGame = (game) => {
    setSelectedGame(game);
    setStep('room');
    setMessage('');
    setError('');
  };

  const createMatch = async () => {
    setError('');
    setMessage('');

    if (!user?.id) {
      setError('Sign in before creating a North Pole match.');
      return;
    }
    if (!selectedPrize?.title) {
      setError('Select or enter a prize before creating a match.');
      setStep('prize');
      return;
    }
    if (!selectedGame?.id) {
      setError('Choose a game or challenge before creating a match.');
      setStep('game');
      return;
    }
    if (selectedPlan.totalPrizeCostCents <= 0) {
      setError('Enter prize price, tax, or shipping so the match can calculate a cost.');
      return;
    }

    setIsCreating(true);
    try {
      const prizeId = selectedPrize.id || `custom-prize-${Date.now().toString(36)}`;
      const prizeSnapshot = {
        ...selectedPrize,
        id: prizeId,
        price_cents: selectedPlan.priceCents,
        estimated_tax_cents: selectedPlan.taxCents,
        estimated_shipping_cents: selectedPlan.shippingCents,
        total_prize_cost_cents: selectedPlan.totalPrizeCostCents,
        fulfillment_mode: 'simulated',
        match_plan: selectedPlan,
      };

      const created = await createNorthPoleMatch({
        userId: user.id,
        gameId: selectedGame.id,
        prizeId,
        prizeSnapshot,
        maxPlayers: selectedPlan.players,
        buyInCents: selectedPlan.perPlayerCents,
        status: 'open',
        sandboxMode: false,
        matchPlan: selectedPlan,
        gameSnapshot: selectedGame,
      });

      setMessage(`Created match ${created.match_id}. It will remain after refresh.`);
      setStep('prize');
      setSelectedPrize(null);
      setSelectedGame(null);
      setForm(emptyPrizeForm);
      setEstimatedTax('');
      setEstimatedShipping('');
      setSelectedPlayers(PLAYER_OPTIONS[2]);
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not create the North Pole match.');
    } finally {
      setIsCreating(false);
    }
  };

  const joinMatch = async (match) => {
    if (!user?.id) {
      setError('Sign in before joining a North Pole match.');
      return;
    }

    setError('');
    setMessage('');
    setJoiningId(match.id);
    try {
      await joinNorthPoleMatch({ matchId: match.id });
      setMessage(`Joined ${match.match_id}. Payment remains simulated.`);
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not join this match.');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-green-700/40 bg-green-950/25 text-green-100">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Real North Pole Flow</AlertTitle>
        <AlertDescription>
          Create or join persisted prize matches. Payments, retailer ordering, and fulfillment remain simulated.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="bg-red-950/35">
          <AlertTitle>North Pole action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert className="border-blue-700/40 bg-blue-950/25 text-blue-100">
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-purple-700/30 bg-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Plus className="h-5 w-5 text-green-300" />
            Build a North Pole Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            {[
              ['prize', '1. Prize', selectedPrize?.title],
              ['game', '2. Game', selectedGame?.title],
              ['room', '3. Room', selectedPlan?.players ? `${selectedPlan.players} players` : ''],
            ].map(([id, label, value]) => (
              <button
                type="button"
                key={id}
                onClick={() => setStep(id)}
                className={`rounded-xl border px-3 py-2 text-left ${step === id ? 'border-cyan-400 bg-cyan-600/20 text-white' : 'border-purple-700/25 bg-black/25 text-purple-300'}`}
              >
                <div className="font-semibold">{label}</div>
                <div className="truncate text-purple-200/65">{value || 'Not selected'}</div>
              </button>
            ))}
          </div>

          {step === 'prize' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-purple-700/30 bg-black/30 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                      <ShoppingCart className="h-5 w-5 text-yellow-300" />
                      Search or Select a Prize
                    </h3>
                    <p className="text-xs text-purple-300/75">
                      Search runs through backend providers. It falls back to the sample catalog until retailer API adapters are connected.
                    </p>
                  </div>
                  {searchProvider && (
                    <Badge className="border border-blue-700/30 bg-blue-900/40 text-blue-300">
                      Provider: {searchProvider}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400/70" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      onKeyDown={(event) => { if (event.key === 'Enter') handleSearch(); }}
                      placeholder="Search Nintendo, AirPods, LEGO..."
                      className="border-purple-700/40 bg-black/30 pl-9 text-white placeholder:text-purple-400/60"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isSearching} className="bg-purple-700 text-white hover:bg-purple-600">
                    {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search
                  </Button>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-purple-100">
                    {searchResults.length ? 'Search Results' : 'Sample Prize Fallback'}
                  </h4>
                  <Badge className="border border-yellow-700/30 bg-yellow-900/40 text-yellow-300">Provider-backed fallback</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {(searchResults.length ? searchResults : samplePrizes).map((prize) => (
                    <Card key={prize.id} className="border border-purple-700/30 bg-purple-950/30 transition-all hover:border-yellow-400/60">
                      <CardContent className="p-4">
                        <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-lg bg-black/30">
                          {prize.image_url ? (
                            <img src={prize.image_url} alt={prize.title} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <Gift className="h-10 w-10 text-purple-500" />
                          )}
                        </div>
                        <h5 className="mb-2 line-clamp-2 text-sm font-semibold text-white">{prize.title}</h5>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge className="bg-purple-600/20 text-xs text-purple-300">{prize.category}</Badge>
                          <Badge className="bg-blue-600/20 text-xs text-blue-300">{prize.offers?.[0]?.retailer || prize.source_label || prize.source || 'sample catalog'}</Badge>
                          <span className="text-sm font-bold text-green-300">{formatMoney(prize.price_cents)}</span>
                        </div>
                        <p className="mb-3 text-xs text-purple-300/70">
                          Source: {prize.source_label || prize.source || 'sample catalog until retailer APIs are connected'}
                        </p>
                        <Button onClick={() => selectPrize(prize, prize.source)} className="w-full bg-yellow-700 text-white hover:bg-yellow-600">
                          Select Prize
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-purple-700/30 bg-black/30 p-4">
                <button
                  type="button"
                  onClick={() => setManualOpen((open) => !open)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2 font-bold text-white">
                    <Pencil className="h-4 w-4 text-purple-300" />
                    Manual prize entry
                  </span>
                  <span className="text-xs text-purple-300">{manualOpen ? 'Hide' : 'Alternate option'}</span>
                </button>
                {manualOpen && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Input value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="Prize name" className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60" />
                    <Input value={form.category} onChange={(event) => updateForm('category', event.target.value)} placeholder="Category" className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60" />
                    <Input inputMode="decimal" value={form.price} onChange={(event) => updateForm('price', event.target.value)} placeholder="Prize price" className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60" />
                    <Input value={form.imageUrl} onChange={(event) => updateForm('imageUrl', event.target.value)} placeholder="Image URL optional" className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60" />
                    <Input inputMode="decimal" value={form.tax} onChange={(event) => updateForm('tax', event.target.value)} placeholder="Estimated tax optional" className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60" />
                    <Input inputMode="decimal" value={form.shipping} onChange={(event) => updateForm('shipping', event.target.value)} placeholder="Shipping optional" className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60" />
                    <Button onClick={createManualPrize} className="md:col-span-2 bg-purple-700 text-white hover:bg-purple-600">Use Manual Prize</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'game' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                    <Gamepad2 className="h-5 w-5 text-cyan-300" />
                    Search and Select a Game
                  </h3>
                  <p className="text-xs text-purple-300/75">
                    Game search runs through backend providers. It falls back to the sample catalog until IGDB, RAWG, Steam, Epic, Xbox, PlayStation, and mobile store adapters are connected.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedPrize && <Badge className="bg-yellow-900/40 text-yellow-300">Prize: {selectedPrize.title}</Badge>}
                  {gameProvider && <Badge className="border border-blue-700/30 bg-blue-900/40 text-blue-300">Provider: {gameProvider}</Badge>}
                </div>
              </div>

              <div className="rounded-2xl border border-purple-700/30 bg-black/30 p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400/70" />
                    <Input
                      value={gameSearchTerm}
                      onChange={(event) => setGameSearchTerm(event.target.value)}
                      onKeyDown={(event) => { if (event.key === 'Enter') handleGameSearch(); }}
                      placeholder="Search Fortnite, chess, racing, trivia..."
                      className="border-purple-700/40 bg-black/30 pl-9 text-white placeholder:text-purple-400/60"
                    />
                  </div>
                  <Button onClick={() => handleGameSearch()} disabled={isGameSearching} className="bg-cyan-700 text-white hover:bg-cyan-600">
                    {isGameSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search Games
                  </Button>
                </div>
              </div>

              {isGameSearching && (
                <div className="rounded-xl border border-cyan-700/20 bg-cyan-950/20 p-6 text-center text-sm text-cyan-200">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                  Searching game providers...
                </div>
              )}

              {!isGameSearching && gameSearchTerm.length > 1 && gameResults.length === 0 && (
                <div className="rounded-xl border border-purple-700/20 bg-black/25 p-6 text-center text-sm text-purple-300">
                  No games found for "{gameSearchTerm}". Try another title, genre, platform, or challenge style.
                </div>
              )}

              {gameResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-purple-100">Game Search Results</h4>
                    <Badge className="border border-yellow-700/30 bg-yellow-900/40 text-yellow-300">{gameProvider || 'Game provider'}</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {gameResults.map((game) => {
                      const selected = selectedGame?.id === game.id;
                      return (
                        <Card key={game.id} className={`border transition-all ${selected ? 'border-cyan-400 bg-cyan-600/20' : 'border-purple-700/30 bg-purple-950/30 hover:border-cyan-400/60'}`}>
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/35">
                                {game.icon_url ? (
                                  <img src={game.icon_url} alt={game.title} className="h-full w-full object-cover" />
                                ) : (
                                  <Gamepad2 className="h-7 w-7 text-cyan-300" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <h4 className="text-base font-bold text-white">{game.title}</h4>
                                  {selected && <Badge className="bg-cyan-600/20 text-cyan-200">Selected</Badge>}
                                </div>
                                <p className="mb-3 line-clamp-2 text-sm text-purple-200/75">{game.description}</p>
                                <div className="mb-4 flex flex-wrap gap-2 text-xs">
                                  <Badge className="bg-purple-600/20 text-purple-300">{game.category}</Badge>
                                  <Badge className="bg-blue-600/20 text-blue-300">{game.platform}</Badge>
                                  <Badge className="bg-green-600/20 text-green-300">{game.skill_verifiable ? 'Skill-verifiable' : 'Manual verification'}</Badge>
                                </div>
                                <div className="mb-4 text-xs text-purple-300/75">
                                  <div>Source: {game.source_label || game.store}</div>
                                  <div>Store: {game.store}</div>
                                  <div>Style: {game.skillStyle}</div>
                                </div>
                                <Button onClick={() => selectGame(game)} className="w-full bg-cyan-700 text-white hover:bg-cyan-600">
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Select Game
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-purple-100">Playable Demo Games</h4>
                  <Badge className="border border-blue-700/30 bg-blue-900/40 text-blue-300">Sandbox testing</Badge>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                {playableDemoGames.map((game) => {
                  const selected = selectedGame?.id === game.id;
                  return (
                    <Card key={game.id} className={`border transition-all ${selected ? 'border-cyan-400 bg-cyan-600/20' : 'border-purple-700/30 bg-purple-950/30 hover:border-cyan-400/60'}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{game.icon || 'Game'}</div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-bold text-white">{game.title}</h4>
                              <Badge className="bg-purple-600/20 text-xs text-purple-300">{game.category}</Badge>
                              <Badge className="bg-blue-600/20 text-xs text-blue-300">Playable demo</Badge>
                              {selected && <Badge className="bg-cyan-600/20 text-cyan-200">Selected</Badge>}
                            </div>
                            <p className="mb-4 text-sm text-purple-200/75">{game.description}</p>
                            <Button onClick={() => selectGame(game)} className="w-full bg-cyan-700 text-white hover:bg-cyan-600">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Choose Game
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                </div>
              </div>
              <Button variant="outline" onClick={() => setStep('prize')} className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40">Back to Prize</Button>
            </div>
          )}

          {step === 'room' && selectedPrize && selectedGame && (
            <div className="space-y-5">
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-yellow-700/30 bg-yellow-950/20 p-4">
                  <h3 className="mb-2 font-bold text-white">Selected Prize</h3>
                  <p className="text-sm text-yellow-100">{selectedPrize.title}</p>
                  <p className="text-xs text-yellow-200/70">{formatMoney(selectedPrize.price_cents)} base price</p>
                </div>
                <div className="rounded-2xl border border-cyan-700/30 bg-cyan-950/20 p-4">
                  <h3 className="mb-2 font-bold text-white">Selected Game</h3>
                  <p className="text-sm text-cyan-100">{selectedGame.title}</p>
                  <p className="text-xs text-cyan-200/70">{selectedGame.category || selectedGame.genre || selectedGame.source}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="estimated-tax" className="text-purple-100">Estimated tax</Label>
                  <Input id="estimated-tax" inputMode="decimal" value={estimatedTax} onChange={(event) => setEstimatedTax(event.target.value)} placeholder="0.00" className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated-shipping" className="text-purple-100">Estimated shipping</Label>
                  <Input id="estimated-shipping" inputMode="decimal" value={estimatedShipping} onChange={(event) => setEstimatedShipping(event.target.value)} placeholder="0.00" className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60" />
                </div>
              </div>

              <div className="rounded-2xl border border-purple-700/30 bg-black/30 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-300" />
                  <h3 className="text-sm font-bold text-white">Room and Buy-in Options</h3>
                  <Badge className="border border-pink-500/30 bg-pink-600/15 text-pink-200">
                    {Math.round(NORTH_POLE_COST_MODEL.donationRate * 100)}% North Pole fund
                  </Badge>
                </div>
                <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
                  {costOptions.map((option) => {
                    const selected = selectedPlayers === option.players;
                    return (
                      <button
                        type="button"
                        key={option.players}
                        onClick={() => setSelectedPlayers(option.players)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          selected
                            ? 'border-cyan-400 bg-cyan-600/20 shadow-lg shadow-cyan-950/30'
                            : 'border-purple-700/25 bg-purple-950/20 hover:border-purple-400/50'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-xs font-semibold text-purple-100">
                            <Users className="h-3 w-3" /> {option.players} players
                          </span>
                          {selected && <span className="text-xs text-cyan-200">Selected</span>}
                        </div>
                        <div className="text-xl font-black text-green-300">{formatMoney(option.perPlayerCents)}</div>
                        <div className="mt-1 text-[11px] leading-relaxed text-purple-200/65">
                          Fund {formatMoney(option.donationCents)}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 grid gap-2 text-xs text-purple-200/75 sm:grid-cols-4">
                  <span>Prize price: <strong className="text-white">{formatMoney(selectedPlan.priceCents)}</strong></span>
                  <span>Tax: <strong className="text-white">{formatMoney(selectedPlan.taxCents)}</strong></span>
                  <span>Shipping: <strong className="text-white">{formatMoney(selectedPlan.shippingCents)}</strong></span>
                  <span>Prize total: <strong className="text-yellow-300">{formatMoney(selectedPlan.totalPrizeCostCents)}</strong></span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => setStep('game')} className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40">Back to Games</Button>
                <Button onClick={createMatch} disabled={isCreating} className="flex-1 bg-green-700 text-white hover:bg-green-600">
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Create Persisted Match
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-purple-700/30 bg-purple-900/20">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <Gamepad2 className="h-5 w-5 text-cyan-300" />
            Open North Pole Matches
          </CardTitle>
          <Button
            variant="outline"
            onClick={loadMatches}
            className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-xl bg-purple-900/30" />
              ))}
            </div>
          ) : matches.length ? (
            matches.map((match) => (
              <NorthPoleMatchCard
                key={match.id}
                match={match}
                currentUserId={user?.id}
                onJoin={joinMatch}
                isJoining={joiningId === match.id}
              />
            ))
          ) : (
            <div className="rounded-xl border border-purple-700/20 bg-black/25 p-8 text-center text-sm text-purple-300">
              No persisted North Pole matches yet. Create one above and refresh the page to confirm it remains.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DemoSimulation({ user }) {
  const [step, setStep] = useState(STEPS.PRIZE_SELECT);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [selectedAdapter, setSelectedAdapter] = useState(null);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [fulfillment, setFulfillment] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const handlePrizeSelect = (prize) => {
    setSelectedPrize(prize);
    setStep(STEPS.GAME_LOBBY);
  };

  const handleStartMatch = useCallback(async (adapter) => {
    if (!user || !selectedPrize) return;
    setSelectedAdapter(adapter);
    setVerifyError('');

    const matchPlan = adapter.matchPlan || {};
    const match = await createNorthPoleMatch({
      userId: user.id,
      gameId: adapter.id,
      prizeId: selectedPrize.id,
      prizeSnapshot: {
        ...selectedPrize,
        match_plan: matchPlan,
      },
      maxPlayers: matchPlan.players || selectedPrize.max_players || 10,
      buyInCents: matchPlan.perPlayerCents || selectedPrize.buy_in_cents || 0,
      status: 'active',
      sandboxMode: true,
      matchPlan,
    });
    setCurrentMatch(match);
    setStep(STEPS.PLAYING);
  }, [user, selectedPrize]);

  const handleGameResult = useCallback(async (resultPayload) => {
    if (!currentMatch) return;
    setStep(STEPS.VERIFYING);
    setVerifying(true);
    setVerifyError('');

    if (
      resultPayload?.eventType !== 'MATCH_RESULT_FINALIZED' ||
      !resultPayload?.winner?.userId ||
      !resultPayload?.scores
    ) {
      setVerifyError('Invalid result payload from game adapter.');
      setVerifying(false);
      return;
    }

    try {
      const verified = await finalizeAndVerify({
        matchDbId: currentMatch.id,
        matchId: currentMatch.match_id,
        userId: user.id,
        resultPayload,
      });
      setCurrentMatch(verified);

      const ff = await createFulfillmentRecord({
        matchId: verified.match_id,
        winnerUserId: verified.winner_user_id,
        prizeId: verified.prize_id,
        prizeSnapshot: verified.prize_snapshot,
      });
      setFulfillment(ff);

      setStep(STEPS.RESULT);
    } catch (err) {
      setVerifyError(err.message || 'Demo verification failed.');
    } finally {
      setVerifying(false);
    }
  }, [currentMatch, user]);

  const handlePlayAgain = () => {
    setStep(STEPS.PRIZE_SELECT);
    setSelectedPrize(null);
    setSelectedAdapter(null);
    setCurrentMatch(null);
    setFulfillment(null);
    setVerifyError('');
  };

  const GameComponent = selectedAdapter ? getAdapter(selectedAdapter.id)?.GameComponent : null;

  return (
    <div className="space-y-6">
      <Alert className="border-blue-700/40 bg-blue-950/25 text-blue-100">
        <Gift className="h-4 w-4" />
        <AlertTitle>Demo Simulation</AlertTitle>
        <AlertDescription>
          This section uses hardcoded demo prizes and sandbox gameplay. It is separate from the real persisted match creation flow.
        </AlertDescription>
      </Alert>

      {step !== STEPS.RESULT && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          {[
            { id: STEPS.PRIZE_SELECT, label: '1. Choose Prize' },
            { id: STEPS.GAME_LOBBY, label: '2. Cost + Game' },
            { id: STEPS.PLAYING, label: '3. Play' },
            { id: STEPS.VERIFYING, label: '4. Verify' },
            { id: STEPS.RESULT, label: '5. Result' },
          ].map((item) => {
            const order = [STEPS.PRIZE_SELECT, STEPS.GAME_LOBBY, STEPS.PLAYING, STEPS.VERIFYING, STEPS.RESULT];
            const currentIndex = order.indexOf(step);
            const itemIndex = order.indexOf(item.id);
            const isDone = itemIndex < currentIndex;
            const isActive = item.id === step;
            return (
              <div
                key={item.id}
                className={`rounded-full border px-3 py-1 ${
                  isActive
                    ? 'border-purple-400 bg-purple-600 text-white'
                    : isDone
                      ? 'border-green-700/40 bg-green-900/40 text-green-300'
                      : 'border-purple-800/30 bg-purple-900/20 text-purple-500'
                }`}
              >
                {isDone ? 'Done - ' : ''}{item.label}
              </div>
            );
          })}
        </div>
      )}

      {step === STEPS.PRIZE_SELECT && (
        <Card className="border border-purple-700/30 bg-purple-900/20">
          <CardContent className="p-6">
            <PrizeSelector onSelect={handlePrizeSelect} />
          </CardContent>
        </Card>
      )}

      {step === STEPS.GAME_LOBBY && selectedPrize && (
        <Card className="border border-purple-700/30 bg-purple-900/20">
          <CardContent className="p-6">
            <div className="mb-4">
              <Button
                variant="ghost"
                onClick={() => setStep(STEPS.PRIZE_SELECT)}
                className="p-0 text-sm text-purple-400 hover:text-purple-200"
              >
                Back to Prize Selection
              </Button>
            </div>
            <GameLobby selectedPrize={selectedPrize} onStartMatch={handleStartMatch} />
          </CardContent>
        </Card>
      )}

      {step === STEPS.PLAYING && GameComponent && currentMatch && (
        <Card className="border border-purple-700/30 bg-purple-900/20">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-400">Match</span>
                <span className="font-mono text-sm font-bold text-white">{currentMatch.match_id}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-yellow-300">Prize: {selectedPrize?.title}</span>
                <Badge className="border border-blue-700/30 bg-blue-900/40 text-blue-300 text-xs">Prize Locked</Badge>
                {selectedAdapter?.matchPlan && (
                  <Badge className="border border-green-700/30 bg-green-900/40 text-green-300 text-xs">
                    {formatMoney(selectedAdapter.matchPlan.perPlayerCents)} each / {selectedAdapter.matchPlan.players} players
                  </Badge>
                )}
              </div>
            </div>
            <GameComponent
              matchId={currentMatch.match_id}
              userId={user?.id || 'demo-user'}
              onResult={handleGameResult}
            />
          </CardContent>
        </Card>
      )}

      {step === STEPS.VERIFYING && (
        <Card className="border border-purple-700/30 bg-purple-900/20">
          <CardContent className="p-12 text-center">
            {verifying ? (
              <>
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-400" />
                <h3 className="mb-2 text-xl font-bold text-white">Verifying Match Result...</h3>
                <p className="text-sm text-purple-300">Scores are being saved and the winner is being locked.</p>
              </>
            ) : verifyError ? (
              <>
                <h3 className="mb-2 text-xl font-bold text-red-400">Verification Failed</h3>
                <p className="mb-4 text-sm text-red-300">{verifyError}</p>
                <Button onClick={handlePlayAgain} className="bg-purple-600 hover:bg-purple-700">Try Again</Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      {step === STEPS.RESULT && currentMatch && (
        <MatchResultScreen
          match={currentMatch}
          fulfillment={fulfillment}
          currentUserId={user?.id}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default function NorthPole() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('real');
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then((loadedUser) => {
        if (mounted) setUser(loadedUser);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoadingUser(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isAdmin = userHasRole(user, ADMIN_ROLES);

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
              <Gift className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-4xl font-bold text-transparent">
                The North Pole
              </h1>
              <p className="text-sm text-purple-300">Create or join skill-based prize matches.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge className="border border-green-700/30 bg-green-900/40 text-green-300">
              <ShieldCheck className="mr-1 h-3 w-3" />Persisted matches
            </Badge>
            <Badge className="border border-pink-700/30 bg-pink-900/40 text-pink-300">
              <Heart className="mr-1 h-3 w-3" />North Pole fund included
            </Badge>
            {user && (
              <Badge className="border border-purple-700/30 bg-purple-900/40 text-purple-300">
                {user.full_name || user.email}
              </Badge>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full border border-purple-700/30 bg-purple-900/40">
            <TabsTrigger value="real" className="flex-1 text-purple-200 data-[state=active]:bg-purple-700">
              <Gift className="mr-2 h-4 w-4" />The North Pole
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex-1 text-purple-200 data-[state=active]:bg-purple-700">
              <Gamepad2 className="mr-2 h-4 w-4" />Demo Simulation
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex-1 text-purple-200 data-[state=active]:bg-purple-700">
                <Settings2 className="mr-2 h-4 w-4" />Admin Fulfillment
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="real">
            <RealNorthPoleFlow user={user} />
          </TabsContent>

          <TabsContent value="demo">
            <DemoSimulation user={user} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <Card className="border border-purple-700/30 bg-purple-900/20">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Admin Fulfillment</h2>
                    <Badge className="border border-yellow-700/30 bg-yellow-900/40 text-yellow-300">Owner/Admin only</Badge>
                  </div>
                  <AdminDashboard currentUser={user} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="mt-8 space-y-1 rounded-xl border border-purple-800/20 bg-black/20 p-4 text-center text-xs text-purple-500">
          <p><strong>No live payments yet.</strong> Creating or joining a match records intent only.</p>
          <p>Retailer ordering, affiliate APIs, and fulfillment remain simulated until explicitly implemented.</p>
        </div>
      </div>
    </div>
  );
}
