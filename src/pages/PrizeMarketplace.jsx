import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Star, Loader2, Gamepad2, Users, ArrowLeft, ExternalLink, Plus, DoorOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiUrl } from '@/api/apiClient';
import { base44 } from '@/api/base44Client';
import { searchGames } from '@/functions/searchGames';
import {
  createPrizeRoom,
  getMarketplaceProduct,
  joinPrizeRoom,
  listMarketplaceProducts,
  listPrizeRooms,
} from '@/lib/northpole/matchEngine';

const DEFAULT_GAMES = ['Mario Kart', 'Madden NFL', 'NBA 2K', 'Rocket League', 'Chess'];

function formatMoney(cents = 0, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(cents || 0) / 100);
}

function productImage(product = {}) {
  const image = product.image_url || product.images?.[0] || '';
  if (/^https:\/\/(i\.ebayimg\.com|media\.rawg\.io)\//i.test(image) && product.id) {
    return apiUrl(`/api/prize-products/${encodeURIComponent(product.id)}/image`);
  }
  return image;
}

function productKey(product = {}) {
  return String(
    product.id
      || product.item_id
      || product.ebay_item_id
      || product.legacyItemId
      || product.marketplace_key
      || product.product_url
      || product.url
      || `${product.title || product.name || ''}-${product.price || product.price_cents || ''}-${product.image || product.image_url || product.images?.[0] || ''}`
  ).trim().toLowerCase();
}

function uniqueByProduct(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = productKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function roomPlayerCount(room = {}) {
  return Array.isArray(room.player_ids) ? room.player_ids.length : Number(room.paid_contribution_count || 0);
}

function roomEntryAmount(room = {}) {
  return Number(room.cost_breakdown?.per_player_contribution_cents || room.entry_amount_cents || 0);
}

function productMatchesRoom(product = {}, room = {}) {
  const productUrl = product.product_url || '';
  const title = String(product.title || '').toLowerCase();
  return room.prize_id === product.id
    || room.prize_snapshot?.product_id === product.id
    || (productUrl && (room.prize_url === productUrl || room.prize_snapshot?.product_url === productUrl))
    || (title && String(room.prize_title || '').toLowerCase() === title);
}

function normalizeGame(game = {}) {
  const image = game.background_image || game.background_image_additional || game.short_screenshots?.[0]?.image || game.image || game.image_url || game.icon_url || '';
  return {
    ...game,
    id: game.id || game.slug || game.title || game.name,
    title: game.title || game.name || 'Skill Match',
    image,
    image_url: image,
    background_image: image,
    platform: game.platform || game.platforms?.[0]?.platform?.name || 'Skill Match',
  };
}

function ProductCard({ product, onView }) {
  return (
    <Card className="h-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.055] text-white shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur">
      <button type="button" onClick={onView} className="block w-full bg-white p-2.5">
        {productImage(product) ? (
          <img src={productImage(product)} alt={product.title} className="h-40 w-full object-contain" />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-950">Prize Image</div>
        )}
      </button>
      <CardContent className="space-y-2.5 p-3">
        <div>
          <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-tight">{product.title}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-white/55">{product.source_label || product.source || 'Provider'}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <strong className="text-lg text-green-200">{formatMoney(product.price_cents, product.currency)}</strong>
          {product.rating ? (
            <span className="inline-flex items-center gap-1 text-xs text-yellow-100"><Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />{product.rating}</span>
          ) : <span className="text-xs text-white/35">No rating</span>}
        </div>
        <Button onClick={onView} className="h-9 w-full rounded-lg bg-yellow-500 text-xs font-black text-black hover:bg-yellow-400">
          View Prize
        </Button>
      </CardContent>
    </Card>
  );
}

function GameRoomCard({ room, onJoin, joining }) {
  const players = roomPlayerCount(room);
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-black">{room.title}</h4>
          <p className="mt-1 text-sm text-purple-100">{room.game_title}</p>
        </div>
        <Badge className="capitalize bg-purple-600/25 text-purple-100">{String(room.status || 'open').replace(/_/g, ' ')}</Badge>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-xl bg-white/[0.06] p-3">
          <span className="block text-white/45">Players</span>
          <strong>{players} / {room.max_players}</strong>
        </div>
        <div className="rounded-xl bg-white/[0.06] p-3">
          <span className="block text-white/45">Entry</span>
          <strong>{formatMoney(roomEntryAmount(room))}</strong>
        </div>
        <div className="rounded-xl bg-white/[0.06] p-3">
          <span className="block text-white/45">Prize</span>
          <strong className="line-clamp-1">{room.prize_title}</strong>
        </div>
      </div>
      <Button onClick={onJoin} disabled={joining || !['open', 'awaiting_contributions'].includes(room.status)} className="mt-3 w-full rounded-xl bg-green-600 text-white hover:bg-green-500">
        {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DoorOpen className="mr-2 h-4 w-4" />}
        Join Game Room
      </Button>
    </div>
  );
}

function ProductDetail({ product, rooms, user, onBack, onRoomCreated, onMessage, onError }) {
  const [gameQuery, setGameQuery] = useState('');
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState('');
  const productRooms = useMemo(() => rooms.filter((room) => productMatchesRoom(product, room)), [product, rooms]);

  const loadGames = async (query = gameQuery || 'family game') => {
    const response = await searchGames({ q: query, limit: 8 });
    const found = response.data?.games || response.data?.data || response.data?.results || response.data || [];
    setGames((Array.isArray(found) ? found : []).map(normalizeGame));
  };

  useEffect(() => {
    loadGames(DEFAULT_GAMES[0]).catch(() => setGames(DEFAULT_GAMES.map((title) => normalizeGame({ title }))));
  }, [product.id]);

  const createRoomForProduct = async () => {
    if (!user?.id) return onError('Sign in before creating a game room.');
    if (!selectedGame) return onError('Choose a skill-based game first.');
    setCreating(true);
    try {
      const room = await createPrizeRoom({
        title: `${selectedGame.title} Prize Room: ${product.title}`,
        description: `Skill-based game room for ${product.title}. Choose Game Room replaces checkout; no automatic purchase is made.`,
        roomType: 'user_created',
        gameId: selectedGame.id,
        gameTitle: selectedGame.title,
        gameImage: selectedGame.image || selectedGame.image_url || '',
        gamePlatform: selectedGame.platform || 'Skill Match',
        gameSnapshot: selectedGame,
        prizeId: product.id,
        prizeTitle: product.title,
        prizeImage: product.image_url || product.images?.[0] || '',
        prizeSource: product.source || product.source_label || 'provider',
        prizeUrl: product.product_url || '',
        prizeSnapshot: {
          ...product,
          product_id: product.id,
          image: product.image_url || product.images?.[0] || '',
          image_url: product.image_url || product.images?.[0] || '',
          price_cents: product.price_cents,
          currency: product.currency || 'USD',
        },
        maxPlayers,
        minPlayers: Math.min(2, maxPlayers),
        winningRule: 'Highest verified score wins',
        verificationMethod: 'Manual score with proof URL',
        paymentMode: 'pilot_manual',
      });
      onRoomCreated(room);
      onMessage('Game room created. Players can join in pilot/manual mode.');
    } catch (error) {
      onError(error.message || 'Could not create game room.');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async (room) => {
    if (!user?.id) return onError('Sign in before joining a game room.');
    setJoiningId(room.id);
    try {
      await joinPrizeRoom({
        roomId: room.id,
        displayName: user.full_name || user.name || user.email || 'Player',
        userEmail: user.email || '',
        paymentMode: 'pilot_manual',
      });
      onMessage('Joined game room. Pilot contribution marked; no real charge made.');
    } catch (error) {
      onError(error.message || 'Could not join game room.');
    } finally {
      setJoiningId('');
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>
      <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-2xl bg-white p-5">
          <img src={productImage(product)} alt={product.title} className="h-[360px] w-full object-contain" />
        </div>
        <div className="space-y-4 text-white">
          <Badge className="bg-yellow-500/20 text-yellow-100">Choose Game Room</Badge>
          <h1 className="text-3xl font-black md:text-4xl">{product.title}</h1>
          <p className="text-3xl font-black text-green-200">{formatMoney(product.price_cents, product.currency)}</p>
          <p className="text-sm text-white/65">{product.description || 'Provider product listing. Use this as a prize connected to a skill-based game room.'}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-black/35 p-3"><span className="block text-white/45">Seller/source</span><strong>{product.seller || product.source_label || product.source}</strong></div>
            <div className="rounded-xl bg-black/35 p-3"><span className="block text-white/45">Category</span><strong>{product.category || 'Prize'}</strong></div>
            <div className="rounded-xl bg-black/35 p-3"><span className="block text-white/45">Rating</span><strong>{product.rating || 'Not available'}</strong></div>
          </div>
          {product.product_url ? (
            <Button asChild variant="outline" className="rounded-xl border-yellow-300/25 bg-yellow-500/10 text-yellow-50 hover:bg-yellow-500/20">
              <a href={product.product_url} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> View Source Listing</a>
            </Button>
          ) : (
            <Button disabled variant="outline" className="rounded-xl">Source listing unavailable</Button>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-black text-white"><Users className="h-5 w-5 text-green-200" /> Existing Game Rooms</h2>
          <div className="space-y-3">
            {productRooms.length ? productRooms.map((room) => (
              <GameRoomCard key={room.id} room={room} joining={joiningId === room.id} onJoin={() => joinRoom(room)} />
            )) : (
              <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/65">No active game rooms for this prize yet. Create one below.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-purple-300/20 bg-purple-950/25 p-4 text-white">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-black"><Gamepad2 className="h-5 w-5 text-purple-100" /> Create New Game Room</h2>
          <div className="flex gap-2">
            <Input value={gameQuery} onChange={(event) => setGameQuery(event.target.value)} placeholder="Search games..." className="rounded-xl border-white/10 bg-black/45 text-white" />
            <Button onClick={() => loadGames()} variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10">Search</Button>
          </div>
          <div className="mt-3 grid gap-2">
            {games.slice(0, 6).map((game) => (
              <button
                key={game.id || game.title}
                type="button"
                onClick={() => setSelectedGame(game)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left ${selectedGame?.id === game.id ? 'border-yellow-300 bg-yellow-500/15' : 'border-white/10 bg-black/25'}`}
              >
                {game.image ? <img src={game.image} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="h-12 w-12 rounded-xl bg-purple-700" />}
                <div>
                  <div className="font-bold">{game.title}</div>
                  <div className="text-xs text-white/55">{game.platform || 'Skill Match'}</div>
                </div>
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm font-semibold text-white/70">Players needed</label>
          <select value={maxPlayers} onChange={(event) => setMaxPlayers(Number(event.target.value))} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black/45 px-3 text-white">
            {[2, 4, 6, 8].map((count) => <option key={count} value={count}>{count} players</option>)}
          </select>
          <Button onClick={createRoomForProduct} disabled={creating || !selectedGame} className="mt-4 w-full rounded-xl bg-green-600 font-black text-white hover:bg-green-500">
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            {selectedGame ? 'Create Game Room' : 'Choose a game first'}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function PrizeMarketplace() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState('gaming prizes');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const sentinelRef = useRef(null);

  const selectedProduct = useMemo(() => products.find((product) => product.id === selectedProductId), [products, selectedProductId]);

  const loadProducts = useCallback(async ({ reset = false } = {}) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const nextOffset = reset ? 0 : offset;
      const result = await listMarketplaceProducts({ q: query, limit: 24, offset: nextOffset, endpoint: '/api/prize-products' });
      setProducts((prev) => uniqueByProduct(reset ? result.products : [...prev, ...result.products]));
      setOffset(result.pagination?.next_offset ?? nextOffset + result.products.length);
      setHasMore(result.pagination?.has_more ?? result.products.length >= 24);
    } catch (err) {
      setError(err.message || 'Could not load products.');
    } finally {
      setLoading(false);
    }
  }, [loading, offset, query]);

  const loadRooms = useCallback(async () => {
    setRooms(await listPrizeRooms().catch(() => []));
  }, []);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    loadProducts({ reset: true });
    loadRooms();
  }, []);

  useEffect(() => {
    if (!sentinelRef.current || selectedProduct) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasMore && !loading) loadProducts();
    }, { rootMargin: '500px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadProducts, selectedProduct]);

  useEffect(() => {
    const productId = new URLSearchParams(window.location.search).get('product') || '';
    if (productId) setSelectedProductId(productId);
  }, []);

  useEffect(() => {
    if (!selectedProductId || selectedProduct) return;
    getMarketplaceProduct({ productId: selectedProductId })
      .then((product) => {
        if (product) setProducts((prev) => uniqueByProduct([product, ...prev]));
      })
      .catch(() => setError('That product link is no longer available.'));
  }, [selectedProductId, selectedProduct]);

  const openProduct = (product) => {
    setSelectedProductId(product.id);
    const url = new URL(window.location.href);
    url.searchParams.set('product', product.id);
    window.history.pushState({}, '', `${url.pathname}${url.search}`);
  };

  const backToProducts = () => {
    setSelectedProductId('');
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.pushState({}, '', `${url.pathname}${url.search}`);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setOffset(0);
    setHasMore(true);
    loadProducts({ reset: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.24),transparent_32%),linear-gradient(135deg,#05010d,#10061f_48%,#050505)] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-100">Marketplace Prize Browser</Badge>
            <Badge className="bg-white/10 text-white/75">{uniqueByProduct(products).length} unique prizes</Badge>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_460px] lg:items-end">
            <div>
              <h1 className="text-3xl font-black md:text-4xl">Browse prizes, then choose a game room.</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/65">Products become prizes for skill-based game rooms. No normal checkout here: choose an existing room or create a new one.</p>
              <div className="mt-3 grid gap-2 text-xs font-semibold text-white/80 sm:grid-cols-4">
                <span className="rounded-lg bg-black/25 px-3 py-2">1. Browse prizes</span>
                <span className="rounded-lg bg-black/25 px-3 py-2">2. Pick a room</span>
                <span className="rounded-lg bg-black/25 px-3 py-2">3. Play the game</span>
                <span className="rounded-lg bg-black/25 px-3 py-2">4. Winner gets prize</span>
              </div>
            </div>
            <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." className="h-12 rounded-2xl border-white/10 bg-black/45 text-white" />
              <Button type="submit" className="h-12 rounded-2xl bg-yellow-500 font-black text-black hover:bg-yellow-400"><Search className="mr-2 h-4 w-4" />Search</Button>
            </form>
          </div>
        </header>

        {(message || error) && (
          <Alert className={`${error ? 'border-orange-500/40 bg-orange-950/30 text-orange-50' : 'border-green-500/35 bg-green-950/25 text-green-50'}`}>
            <AlertTitle>{error ? 'Marketplace notice' : 'Marketplace update'}</AlertTitle>
            <AlertDescription>{error || message}</AlertDescription>
          </Alert>
        )}

        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            rooms={rooms}
            user={user}
            onBack={backToProducts}
            onRoomCreated={(room) => {
              setRooms((prev) => [room, ...prev]);
              loadRooms();
            }}
            onMessage={setMessage}
            onError={setError}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {uniqueByProduct(products).map((product) => <ProductCard key={productKey(product)} product={product} onView={() => openProduct(product)} />)}
            </div>
            <div ref={sentinelRef} className="flex min-h-20 items-center justify-center">
              {loading ? <Loader2 className="h-7 w-7 animate-spin text-yellow-200" /> : hasMore ? <span className="text-sm text-white/45">Scroll for more prizes</span> : <span className="text-sm text-white/45">End of results</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
