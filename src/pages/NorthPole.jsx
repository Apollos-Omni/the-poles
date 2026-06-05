import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  ClipboardList,
  Trash2,
  DoorOpen,
  ArrowRight,
  PlayCircle,
  Target,
  ChevronDown,
} from 'lucide-react';
import AdminDashboard from '@/components/northpole/AdminDashboard';
import SkillCompetitionAgreement from '@/components/northpole/SkillCompetitionAgreement';
import { ADMIN_ROLES, userHasRole } from '@/lib/rbac';
import { PublicBetaBadge } from '@/components/public/PublicBetaLayout';
import { searchProducts } from '@/functions/searchProducts';
import { searchGames } from '@/functions/searchGames';
import {
  listOpenNorthPoleMatches,
  joinNorthPoleMatch,
  leaveNorthPoleMatch,
  cancelNorthPoleMatch,
  submitScore as submitMatchScore,
  assignReferee,
  startRefereeSession,
  simulateRefereeReport,
  verifyWinner,
  lockWinner,
  disputeWinner,
  adminOverrideWinner,
  createFulfillmentOrder,
  listPrizeRooms,
  joinPrizeRoom,
  createPrizeRoom,
  hydratePrizeRoomProviderImages,
  SKILL_COMPETITION_AGREEMENT_VERSION,
} from '@/lib/northpole/matchEngine';

const PLAYER_OPTIONS = [2, 4, 6, 8, 10, 12];

const NORTH_POLE_COST_MODEL = {
  taxRate: 0.0825,
  defaultShippingCents: 599,
  fulfillmentReserveCents: 300,
  foundationRate: 0.1,
  processingRate: 0.03,
  processingPerPlayerCents: 30,
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

function firstImageUrl(source, fields) {
  if (!source) return '';
  for (const field of fields) {
    const value = source[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object' && typeof value.imageUrl === 'string' && value.imageUrl.trim()) {
      return value.imageUrl.trim();
    }
    if (value && typeof value === 'object' && typeof value.url === 'string' && value.url.trim()) {
      return value.url.trim();
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === 'string' && entry.trim()) return entry.trim();
        if (entry && typeof entry === 'object' && typeof entry.imageUrl === 'string' && entry.imageUrl.trim()) {
          return entry.imageUrl.trim();
        }
        if (entry && typeof entry === 'object' && typeof entry.image === 'string' && entry.image.trim()) {
          return entry.image.trim();
        }
        if (entry && typeof entry === 'object' && typeof entry.url === 'string' && entry.url.trim()) {
          return entry.url.trim();
        }
      }
    }
  }
  return '';
}

function prizeImageFromSource(source) {
  return firstImageUrl(source, [
    'image',
    'image_url',
    'thumbnailImages',
    'thumbnail',
    'thumbnail_url',
    'galleryURL',
    'pictureURLLarge',
    'pictureURLSuperSize',
    'additionalImages',
  ]);
}

function gameImageFromSource(source) {
  return firstImageUrl(source, [
    'background_image',
    'background_image_additional',
    'image',
    'image_url',
    'icon_url',
    'cover',
    'thumbnail',
    'short_screenshots',
  ]);
}

function normalizedImageKey(value = '') {
  return String(value || '').toLowerCase();
}

function defaultPrizeRoomGameImage(gameTitle = '') {
  const key = normalizedImageKey(gameTitle);
  if (key.includes('mario')) return '/images/prize-rooms/games/mario-kart.svg';
  if (key.includes('madden')) return '/images/prize-rooms/games/madden.svg';
  if (key.includes('nba') || key.includes('2k')) return '/images/prize-rooms/games/nba-2k.svg';
  if (key.includes('call of duty') || key.includes('cod')) return '/images/prize-rooms/games/call-of-duty.svg';
  if (key.includes('rocket league')) return '/images/prize-rooms/games/rocket-league.svg';
  if (key.includes('uno')) return '/images/prize-rooms/games/uno.svg';
  if (key.includes('chess')) return '/images/prize-rooms/games/chess.svg';
  if (key.includes('fortnite')) return '/images/prize-rooms/games/fortnite.svg';
  if (key.includes('mortal kombat')) return '/images/prize-rooms/games/mortal-kombat.svg';
  if (key.includes('family')) return '/images/prize-rooms/games/family-game-night.svg';
  return '/images/prize-rooms/games/family-game-night.svg';
}

function defaultPrizeRoomPrizeImage(prizeTitle = '') {
  const key = normalizedImageKey(prizeTitle);
  if (key.includes('nintendo')) return '/images/prize-rooms/prizes/nintendo-gift-card.svg';
  if (key.includes('gamestop') || key.includes('game stop')) return '/images/prize-rooms/prizes/gamestop-gift-card.svg';
  if (key.includes('playstation') || key.includes('psn')) return '/images/prize-rooms/prizes/playstation-store-gift-card.svg';
  if (key.includes('xbox')) return '/images/prize-rooms/prizes/xbox-gift-card.svg';
  if (key.includes('rocket league') || key.includes('credits')) return '/images/prize-rooms/prizes/rocket-league-credits.svg';
  if (key.includes('family game')) return '/images/prize-rooms/prizes/family-game-night-gift-card.svg';
  if (key.includes('v-bucks') || key.includes('vbucks')) return '/images/prize-rooms/prizes/vbucks-gift-card.svg';
  if (key.includes('amazon') || key.includes('bookshop')) return '/images/prize-rooms/prizes/amazon-gift-card.svg';
  if (key.includes('console store')) return '/images/prize-rooms/prizes/console-store-gift-card.svg';
  if (key.includes('mystery')) return '/images/prize-rooms/prizes/mystery-family-prize.svg';
  return '/images/prize-rooms/prizes/mystery-family-prize.svg';
}

function prizeRoomPrizeImage(room = {}) {
  return room.prize_image
    || room.prize_snapshot?.image
    || room.prize_snapshot?.image_url
    || room.prize_snapshot?.imageUrl
    || room.prize_snapshot?.thumbnailImages?.[0]?.imageUrl
    || room.prize_snapshot?.additionalImages?.[0]?.imageUrl
    || room.prize_snapshot?.galleryURL
    || room.prize_snapshot?.pictureURLLarge
    || room.prize_snapshot?.pictureURLSuperSize
    || defaultPrizeRoomPrizeImage(room.prize_title);
}

function prizeRoomGameImage(room = {}) {
  return room.game_image
    || room.game_snapshot?.background_image
    || room.game_snapshot?.background_image_additional
    || room.game_snapshot?.image
    || room.game_snapshot?.image_url
    || room.game_snapshot?.icon_url
    || room.game_snapshot?.short_screenshots?.[0]?.image
    || defaultPrizeRoomGameImage(room.game_title);
}

function isLocalPrizeRoomFallbackImage(value = '') {
  return typeof value === 'string' && value.startsWith('/images/prize-rooms/');
}

function mostlyUsesLocalPrizeRoomImages(rooms = []) {
  const imageBearingRooms = rooms.filter((room) => room?.prize_title || room?.game_title);
  if (!imageBearingRooms.length) return false;
  const fallbackCount = imageBearingRooms.filter((room) => (
    isLocalPrizeRoomFallbackImage(prizeRoomPrizeImage(room))
      || isLocalPrizeRoomFallbackImage(prizeRoomGameImage(room))
  )).length;
  return fallbackCount / imageBearingRooms.length >= 0.55;
}

function calculateNorthPoleOptions({ priceCents, taxCents, shippingCents, playerCounts = PLAYER_OPTIONS }) {
  return playerCounts.map((players) => ({
    ...calculatePrizeRoomBreakdown({ priceCents, taxCents, shippingCents, players }),
    players,
  }));
}

function calculatePrizeRoomBreakdown({ priceCents, taxCents, shippingCents, players }) {
  const itemCostCents = Number(priceCents || 0);
  const estimatedTaxCents = Number(taxCents || Math.round(itemCostCents * NORTH_POLE_COST_MODEL.taxRate));
  const estimatedShippingCents = Number(shippingCents || NORTH_POLE_COST_MODEL.defaultShippingCents);
  const fulfillmentReserveCents = NORTH_POLE_COST_MODEL.fulfillmentReserveCents;
  const prizeSubtotalCents = itemCostCents + estimatedTaxCents + estimatedShippingCents;
  const paymentProcessingReserveCents = Math.ceil((prizeSubtotalCents + fulfillmentReserveCents) * NORTH_POLE_COST_MODEL.processingRate)
    + (Number(players || 2) * NORTH_POLE_COST_MODEL.processingPerPlayerCents);
  const foundationAmountCents = Math.ceil(prizeSubtotalCents * NORTH_POLE_COST_MODEL.foundationRate);
  const totalRoomCostCents = prizeSubtotalCents + fulfillmentReserveCents + paymentProcessingReserveCents + foundationAmountCents;
  return {
    priceCents: itemCostCents,
    taxCents: estimatedTaxCents,
    shippingCents: estimatedShippingCents,
    item_cost_cents: itemCostCents,
    estimated_tax_cents: estimatedTaxCents,
    estimated_shipping_cents: estimatedShippingCents,
    fulfillment_reserve_cents: fulfillmentReserveCents,
    payment_processing_reserve_cents: paymentProcessingReserveCents,
    foundation_rate: NORTH_POLE_COST_MODEL.foundationRate,
    foundation_amount_cents: foundationAmountCents,
    totalPrizeCostCents: prizeSubtotalCents,
    donationCents: foundationAmountCents,
    platformBufferCents: paymentProcessingReserveCents,
    totalMatchCents: totalRoomCostCents,
    total_room_cost_cents: totalRoomCostCents,
    perPlayerCents: Math.ceil(totalRoomCostCents / Number(players || 2)),
    per_player_contribution_cents: Math.ceil(totalRoomCostCents / Number(players || 2)),
    currency: 'USD',
  };
}

function statusClass(status) {
  if (status === 'open') return 'bg-blue-600/20 text-blue-300 border-blue-600/30';
  if (status === 'waiting_for_players') return 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30';
  if (status === 'in_progress') return 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30';
  if (['referee_assigned', 'waiting_for_referee', 'referee_observing'].includes(status)) return 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30';
  if (status === 'pending_verification') return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30';
  if (['winner_verified', 'fulfillment_pending', 'fulfilled'].includes(status)) return 'bg-green-600/20 text-green-300 border-green-600/30';
  if (status === 'disputed') return 'bg-orange-600/20 text-orange-300 border-orange-600/30';
  if (status === 'cancelled') return 'bg-red-600/20 text-red-300 border-red-600/30';
  return 'bg-purple-600/20 text-purple-300 border-purple-600/30';
}

const MATCH_STATUS_STEPS = [
  { id: 'scores', label: 'Scores submitted', statuses: ['draft', 'open', 'waiting_for_players', 'in_progress'] },
  { id: 'review', label: 'Scores under review', statuses: ['pending_verification', 'referee_assigned', 'waiting_for_referee', 'referee_observing'] },
  { id: 'recommended', label: 'Winner recommended', statuses: ['winner_recommended'] },
  { id: 'locked', label: 'Winner locked', statuses: ['winner_verified', 'fulfillment_pending'] },
  { id: 'dispute', label: 'Dispute opened', statuses: ['disputed'] },
  { id: 'fulfilled', label: 'Fulfillment ready', statuses: ['fulfilled'] },
  { id: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
];

function stepIndexForStatus(status) {
  const index = MATCH_STATUS_STEPS.findIndex((step) => step.statuses.includes(status));
  return index >= 0 ? index : 0;
}

function MatchStatusSteps({ status }) {
  const activeIndex = stepIndexForStatus(status);
  return (
    <div className="grid gap-2 text-[11px] sm:grid-cols-4 lg:grid-cols-8">
      {MATCH_STATUS_STEPS.map((step, index) => {
        const active = index === activeIndex;
        const done = index < activeIndex;
        return (
          <div
            key={step.id}
            className={`rounded-lg border px-2 py-2 ${
              active
                ? 'border-cyan-400 bg-cyan-600/20 text-white'
                : done
                  ? 'border-green-700/35 bg-green-900/25 text-green-200'
                  : 'border-purple-800/30 bg-black/20 text-purple-400'
            }`}
          >
            {step.label}
          </div>
        );
      })}
    </div>
  );
}

function RoomCostRows({ breakdown = {}, compact = false }) {
  const rows = [
    ['Prize cost', breakdown.item_cost_cents ?? breakdown.priceCents],
    ['Estimated tax', breakdown.estimated_tax_cents ?? breakdown.taxCents],
    ['Estimated shipping', breakdown.estimated_shipping_cents ?? breakdown.shippingCents],
    ['Fulfillment reserve', breakdown.fulfillment_reserve_cents],
    ['Processing reserve', breakdown.payment_processing_reserve_cents],
    ['The Poles/Foundation 10%', breakdown.foundation_amount_cents ?? breakdown.donationCents],
  ];
  return (
    <div className={`rounded-xl border border-yellow-700/35 bg-yellow-950/10 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="mb-2 flex flex-wrap gap-2">
        <Badge className="border border-yellow-600/30 bg-yellow-600/20 text-yellow-100">Test Mode: no real charge made</Badge>
        <Badge className="border border-red-600/30 bg-red-600/20 text-red-100">Manual payment confirmation</Badge>
        <Badge className="border border-orange-600/30 bg-orange-600/20 text-orange-100">Manual purchase required</Badge>
      </div>
      <div className="grid gap-1 text-xs text-purple-100 sm:grid-cols-2">
        {rows.map(([label, cents]) => (
          <div key={label} className="flex justify-between gap-3">
            <span className="text-purple-300">{label}</span>
            <strong className="font-mono text-white">{formatMoney(cents || 0)}</strong>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between border-t border-yellow-700/30 pt-2 text-sm">
        <span className="font-bold text-yellow-100">Total room cost</span>
        <strong className="font-mono text-yellow-100">{formatMoney(breakdown.total_room_cost_cents ?? breakdown.totalMatchCents)}</strong>
      </div>
      <div className="mt-1 flex justify-between text-sm">
        <span className="font-bold text-green-200">Your contribution</span>
        <strong className="font-mono text-green-200">{formatMoney(breakdown.per_player_contribution_cents ?? breakdown.perPlayerCents)}</strong>
      </div>
    </div>
  );
}

const FRONTEND_DEMO_PRIZE_ROOMS = [
  {
    id: 'frontend-demo-mario-kart-family',
    title: 'Mario Kart Switch Controller Room',
    description: 'Test Mode Room: a family-friendly kart racing skill match with a Nintendo Switch controller prize prepared for manual purchase.',
    room_type: 'platform_supported',
    game_id: 'mario-kart-family',
    game_title: 'Mario Kart',
    game_image: defaultPrizeRoomGameImage('Mario Kart'),
    game_platform: 'Nintendo Switch',
    game_description: 'Family race night. Players run the agreed track set, then submit final placement or scoreboard proof.',
    prize_id: 'nintendo-switch-controller-demo',
    prize_title: 'Nintendo Switch Controller',
    prize_image: defaultPrizeRoomPrizeImage('Nintendo Switch Controller'),
    prize_source: 'pilot_demo',
    prize_type: 'Controller',
    prize_url: '',
    min_players: 2,
    max_players: 4,
    player_ids: ['pilot-player-1', 'pilot-player-2'],
    status: 'open',
    winning_rule: 'Best final placement after agreed races wins',
    verification_method: 'Scoreboard photo or parent/admin confirmation',
    foundation_rate: 0.1,
    is_featured: true,
    family_friendly: true,
    payment_mode: 'pilot_manual',
    is_frontend_demo: true,
    cost_breakdown: calculatePrizeRoomBreakdown({ priceCents: 2500, players: 4 }),
    contributions: [
      { id: 'demo-contribution-1', display_name: 'Pilot Player 1', status: 'marked_paid', amount_cents: 920 },
      { id: 'demo-contribution-2', display_name: 'Pilot Player 2', status: 'marked_paid', amount_cents: 920 },
    ],
  },
  {
    id: 'frontend-demo-madden-1v1',
    title: 'Madden 1v1 Headset Room',
    description: 'Test Mode Room: head-to-head skill match with a gaming headset prize and prepared fulfillment.',
    room_type: 'platform_supported',
    game_id: 'madden-1v1',
    game_title: 'Madden NFL',
    game_image: defaultPrizeRoomGameImage('Madden NFL'),
    game_platform: 'PlayStation / Xbox',
    game_description: 'One full game with default rules unless the room host chooses otherwise.',
    prize_id: 'gaming-headset-demo',
    prize_title: 'Gaming Headset',
    prize_image: defaultPrizeRoomPrizeImage('Gaming Headset'),
    prize_source: 'pilot_demo',
    prize_type: 'Gaming Accessory',
    prize_url: '',
    min_players: 2,
    max_players: 2,
    player_ids: ['pilot-player-1'],
    status: 'open',
    winning_rule: 'Highest final score wins',
    verification_method: 'Final scoreboard proof URL or admin confirmation',
    foundation_rate: 0.1,
    is_featured: true,
    family_friendly: false,
    payment_mode: 'pilot_manual',
    is_frontend_demo: true,
    cost_breakdown: calculatePrizeRoomBreakdown({ priceCents: 4000, players: 2 }),
    contributions: [
      { id: 'demo-contribution-3', display_name: 'Pilot Player 1', status: 'marked_paid', amount_cents: 2647 },
    ],
  },
  {
    id: 'frontend-demo-uno-family',
    title: 'Uno Family Game Room',
    description: 'Test Mode Room: quick family competition with simple manual score verification.',
    room_type: 'platform_supported',
    game_id: 'uno-family',
    game_title: 'Uno',
    game_image: defaultPrizeRoomGameImage('Uno'),
    game_platform: 'Tabletop / Mobile',
    game_description: 'Players compete in the agreed number of rounds. Submit a final score note or photo.',
    prize_id: 'board-game-bundle-demo',
    prize_title: 'Board Game Bundle',
    prize_image: defaultPrizeRoomPrizeImage('Board Game Bundle'),
    prize_source: 'pilot_demo',
    prize_type: 'Family Prize',
    prize_url: '',
    min_players: 2,
    max_players: 6,
    player_ids: ['pilot-player-1', 'pilot-player-2', 'pilot-player-3', 'pilot-player-4', 'pilot-player-5'],
    status: 'open',
    winning_rule: 'Lowest score after agreed rounds wins',
    verification_method: 'Manual score entry with proof note',
    foundation_rate: 0.1,
    is_featured: false,
    family_friendly: true,
    payment_mode: 'pilot_manual',
    is_frontend_demo: true,
    cost_breakdown: calculatePrizeRoomBreakdown({ priceCents: 3000, players: 6 }),
    contributions: [
      { id: 'demo-contribution-4', display_name: 'Pilot Player 1', status: 'marked_paid', amount_cents: 725 },
      { id: 'demo-contribution-5', display_name: 'Pilot Player 2', status: 'marked_paid', amount_cents: 725 },
      { id: 'demo-contribution-6', display_name: 'Pilot Player 3', status: 'marked_paid', amount_cents: 725 },
      { id: 'demo-contribution-7', display_name: 'Pilot Player 4', status: 'marked_paid', amount_cents: 725 },
      { id: 'demo-contribution-8', display_name: 'Pilot Player 5', status: 'marked_paid', amount_cents: 725 },
    ],
  },
  {
    id: 'frontend-demo-chess',
    title: 'Chess Match Prize Room',
    description: 'Test Mode Room: classic skill competition with a chess set prize and manual purchase.',
    room_type: 'platform_supported',
    game_id: 'chess-match',
    game_title: 'Chess',
    game_image: defaultPrizeRoomGameImage('Chess'),
    game_platform: 'Board / Online',
    game_description: 'One match or best-of-three, agreed before play starts.',
    prize_id: 'chess-set-demo',
    prize_title: 'Chess Set',
    prize_image: defaultPrizeRoomPrizeImage('Chess Set'),
    prize_source: 'pilot_demo',
    prize_type: 'Board Game',
    prize_url: '',
    min_players: 2,
    max_players: 2,
    player_ids: [],
    status: 'open',
    winning_rule: 'Checkmate or agreed match result wins',
    verification_method: 'Game link, screenshot, or admin confirmation',
    foundation_rate: 0.1,
    is_featured: false,
    family_friendly: true,
    payment_mode: 'pilot_manual',
    is_frontend_demo: true,
    cost_breakdown: calculatePrizeRoomBreakdown({ priceCents: 2000, players: 2 }),
    contributions: [],
  },
];

const PRIZE_ROOM_FILTERS = [
  { value: 'all', label: 'All Rooms' },
  { value: 'platform_supported', label: 'Platform Supported' },
  { value: 'community_created', label: 'Community Created' },
  { value: 'family_friendly', label: 'Family Friendly' },
  { value: 'low_cost', label: 'Low Cost Rooms' },
  { value: 'almost_full', label: 'Almost Full' },
  { value: 'open', label: 'Open Rooms' },
  { value: 'funded', label: 'Funded Rooms' },
  { value: 'by_game', label: 'By Game' },
  { value: 'by_prize_type', label: 'By Prize Type' },
];

function prizeRoomPlayerCount(room) {
  return Array.isArray(room?.player_ids) ? room.player_ids.length : Number(room?.paid_contribution_count || 0);
}

function prizeRoomJoinCost(room) {
  return Number(room?.cost_breakdown?.per_player_contribution_cents || 0);
}

function prizeRoomTotalCost(room) {
  return Number(room?.cost_breakdown?.total_room_cost_cents || 0);
}

function prizeRoomTypeLabel(room) {
  if (room?.is_frontend_demo) return 'Test Mode Room';
  if (room?.room_type === 'user_created') return 'Community Created';
  if (room?.room_type === 'community_template') return 'Community Template';
  return 'Platform Supported';
}

function PrizeRoomHeroImage({
  prizeImage,
  prizeTitle,
  gameImage,
  gameTitle,
  roomTitle,
  fallbackPrizeImage,
  fallbackGameImage,
  large = false,
}) {
  const [prizeFailed, setPrizeFailed] = useState(false);
  const [gameFailed, setGameFailed] = useState(false);
  useEffect(() => setPrizeFailed(false), [prizeImage]);
  useEffect(() => setGameFailed(false), [gameImage]);

  const effectivePrizeImage = prizeFailed && fallbackPrizeImage && fallbackPrizeImage !== prizeImage ? fallbackPrizeImage : prizeImage;
  const effectiveGameImage = gameFailed && fallbackGameImage && fallbackGameImage !== gameImage ? fallbackGameImage : gameImage;
  const hasPrizeImage = effectivePrizeImage && (!prizeFailed || effectivePrizeImage === fallbackPrizeImage);
  const hasGameImage = effectiveGameImage && (!gameFailed || effectiveGameImage === fallbackGameImage);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/15 bg-white p-4 shadow-[0_0_36px_rgba(250,204,21,0.12)] ${
      large ? 'aspect-[16/9] min-h-[260px]' : 'aspect-[4/3]'
    }`}>
      {hasPrizeImage ? (
        <img
          src={effectivePrizeImage}
          alt={prizeTitle || roomTitle || 'Prize Room prize'}
          onError={() => setPrizeFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.25),transparent_48%),linear-gradient(135deg,#fff7ed,#ffffff_48%,#f3e8ff)] px-6 text-center">
          <Gift className={`${large ? 'h-16 w-16' : 'h-12 w-12'} text-yellow-200 drop-shadow-[0_0_16px_rgba(250,204,21,0.45)]`} />
          <span className="text-xs font-black uppercase tracking-[0.18em] text-purple-900">Prize Item</span>
          <span className="line-clamp-2 text-sm font-bold text-slate-800">{prizeTitle || 'Test mode prize image'}</span>
        </div>
      )}

      <div className="absolute right-3 top-3 h-16 w-16 overflow-hidden rounded-2xl border border-white/80 bg-black shadow-[0_0_28px_rgba(124,58,237,0.45)] sm:h-20 sm:w-20">
        {hasGameImage ? (
          <img
            src={effectiveGameImage}
            alt={gameTitle || 'Prize Room game'}
            onError={() => setGameFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-purple-800 via-black to-cyan-900">
            <Gamepad2 className="h-6 w-6 text-purple-100 sm:h-8 sm:w-8" />
            <span className="mt-1 hidden max-w-[4rem] truncate px-1 text-[9px] font-bold text-white/75 sm:block">{gameTitle || 'Game'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PrizeRoomFilters({
  searchTerm,
  onSearchTermChange,
  filter,
  onFilterChange,
  secondaryValue,
  onSecondaryValueChange,
  gameOptions,
  prizeTypeOptions,
}) {
  const needsSecondary = filter === 'by_game' || filter === 'by_prize_type';
  const secondaryOptions = filter === 'by_game' ? gameOptions : prizeTypeOptions;
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_0_45px_rgba(124,58,237,0.18)]">
      <div className="grid gap-3 lg:grid-cols-[1fr_230px_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200" />
          <Input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search games, prizes, or rooms..."
            className="h-12 rounded-2xl border-white/10 bg-black/55 pl-11 text-white placeholder:text-white/45 focus:border-yellow-300"
          />
        </label>
        <label className="relative block">
          <select
            value={filter}
            onChange={(event) => {
              onFilterChange(event.target.value);
              onSecondaryValueChange('all');
            }}
            className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-black/55 px-4 pr-10 text-sm font-semibold text-white outline-none focus:border-yellow-300"
          >
            {PRIZE_ROOM_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200" />
        </label>
        <label className={`relative block ${needsSecondary ? '' : 'hidden lg:block'}`}>
          <select
            value={secondaryValue}
            onChange={(event) => onSecondaryValueChange(event.target.value)}
            disabled={!needsSecondary}
            className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-black/55 px-4 pr-10 text-sm font-semibold text-white outline-none disabled:opacity-45 focus:border-yellow-300"
          >
            <option value="all">{filter === 'by_game' ? 'All Games' : filter === 'by_prize_type' ? 'All Prize Types' : 'Choose Filter'}</option>
            {secondaryOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200" />
        </label>
      </div>
    </div>
  );
}

function PlayerListPreview({ room }) {
  const contributions = Array.isArray(room.contributions) ? room.contributions : [];
  const players = contributions.length
    ? contributions.map((contribution, index) => ({
      id: contribution.id || `${room.id}-contribution-${index}`,
      name: contribution.display_name || contribution.user_email || `Player ${index + 1}`,
      status: contribution.status || 'pending',
    }))
    : (Array.isArray(room.player_ids) ? room.player_ids : []).map((playerId, index) => ({
      id: playerId || `${room.id}-player-${index}`,
      name: `Player ${index + 1}`,
      status: 'joined',
    }));

  if (!players.length) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/65">No players have joined yet.</p>;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {players.slice(0, 8).map((player) => (
        <div key={player.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
          <span className="truncate text-white">{player.name}</span>
          <Badge className={player.status === 'marked_paid' || player.status === 'paid' ? 'bg-green-600/20 text-green-200' : 'bg-purple-600/20 text-purple-100'}>
            {player.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function PrizeRoomCostBreakdown({ breakdown = {} }) {
  return (
    <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-950/25 via-black/55 to-purple-950/35 p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className="border border-yellow-500/30 bg-yellow-500/20 text-yellow-50">Test Mode: no real charge made</Badge>
        <Badge className="border border-white/15 bg-white/10 text-white">Manual payment confirmation</Badge>
        <Badge className="border border-orange-500/30 bg-orange-500/20 text-orange-50">Manual purchase required</Badge>
      </div>
      <RoomCostRows breakdown={breakdown} compact />
    </div>
  );
}

function PrizeRoomDetailCard({ label, value, tone = 'default' }) {
  const toneClass = tone === 'green'
    ? 'border-green-400/20 bg-green-500/10'
    : tone === 'yellow'
      ? 'border-yellow-300/20 bg-yellow-500/10'
      : tone === 'purple'
        ? 'border-purple-300/20 bg-purple-500/10'
        : 'border-white/10 bg-white/[0.05]';
  return (
    <div className={`rounded-3xl border p-4 ${toneClass}`}>
      <div className="text-xs font-bold uppercase tracking-wide text-white/45">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value || 'Not set'}</div>
    </div>
  );
}

function PrizeRoomCard({ room, isOpen, onToggleDetails, onJoin, joining }) {
  const playerCount = prizeRoomPlayerCount(room);
  const canJoin = ['open', 'awaiting_contributions'].includes(room.status);
  const fallbackPrizeImage = defaultPrizeRoomPrizeImage(room.prize_title);
  const fallbackGameImage = defaultPrizeRoomGameImage(room.game_title);
  return (
    <Card className={`overflow-hidden rounded-3xl border bg-black/65 shadow-[0_0_38px_rgba(124,58,237,0.16)] transition ${
      isOpen ? 'border-yellow-300/55 ring-1 ring-yellow-300/30' : 'border-white/10 hover:border-purple-300/40'
    }`}>
      <CardContent className="p-3">
        <PrizeRoomHeroImage
          prizeImage={prizeRoomPrizeImage(room)}
          prizeTitle={room.prize_title}
          gameImage={prizeRoomGameImage(room)}
          gameTitle={room.game_title}
          roomTitle={room.title}
          fallbackPrizeImage={fallbackPrizeImage}
          fallbackGameImage={fallbackGameImage}
        />
        <div className="space-y-3 px-1 py-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={room.is_frontend_demo ? 'bg-yellow-500/20 text-yellow-100' : 'bg-purple-600/20 text-purple-100'}>{prizeRoomTypeLabel(room)}</Badge>
            <Badge className={`border ${statusClass(room.status)}`}>{String(room.status || 'open').replace(/_/g, ' ')}</Badge>
          </div>
          <div>
            <h3 className="line-clamp-2 text-xl font-black leading-tight text-white">{room.title}</h3>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-purple-100">Game: {room.game_title || 'Skill Match'}</p>
            <p className="mt-3 text-2xl font-black text-green-200">{formatMoney(prizeRoomJoinCost(room))}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Join cost</p>
          </div>
          <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-yellow-100/75">Prize</span>
              <strong className="line-clamp-1 text-right text-white">{room.prize_title}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-white/55">Players</span>
              <strong className="text-white">{playerCount} / {room.max_players}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-white/55">Status</span>
              <strong className="capitalize text-green-200">{String(room.status || 'open').replace(/_/g, ' ')}</strong>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onToggleDetails} variant="outline" className="flex-1 rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
              {isOpen ? 'Hide Details' : 'View Details'}
            </Button>
            <Button onClick={onJoin} disabled={joining || !canJoin} className="flex-1 rounded-2xl bg-green-600 text-white hover:bg-green-500 disabled:bg-slate-700">
              {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Join Room
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrizeRoomDetailsDropdown({ room, onJoin, joining }) {
  const playerCount = prizeRoomPlayerCount(room);
  const fallbackPrizeImage = defaultPrizeRoomPrizeImage(room.prize_title);
  const fallbackGameImage = defaultPrizeRoomGameImage(room.game_title);
  const fulfillmentStatus = room.fulfillment_status || (room.prize_fulfillment_id ? 'prepared fulfillment' : 'manual fulfillment pending');
  const winnerVerificationStatus = room.winner_verification_status
    || room.verification_status
    || (room.winner_user_id ? 'winner locked' : 'not started');
  return (
    <div className="md:col-span-2 xl:col-span-3">
      <div className="rounded-[2rem] border border-yellow-300/35 bg-gradient-to-br from-black via-purple-950/55 to-black p-4 shadow-[0_0_55px_rgba(250,204,21,0.14)]">
        <PrizeRoomHeroImage
          prizeImage={prizeRoomPrizeImage(room)}
          prizeTitle={room.prize_title}
          gameImage={prizeRoomGameImage(room)}
          gameTitle={room.game_title}
          roomTitle={room.title}
          fallbackPrizeImage={fallbackPrizeImage}
          fallbackGameImage={fallbackGameImage}
          large
        />
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-yellow-500/20 text-yellow-100">{prizeRoomTypeLabel(room)}</Badge>
                <Badge className={statusClass(room.status)}>{String(room.status || 'open').replace(/_/g, ' ')}</Badge>
              </div>
              <h3 className="mt-3 text-2xl font-black text-white">{room.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{room.description || 'A pilot Prize Room prepared for skill-based competition and manual fulfillment.'}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <PrizeRoomDetailCard label="Join cost" value={formatMoney(prizeRoomJoinCost(room))} tone="green" />
              <PrizeRoomDetailCard label="Players" value={`${playerCount} / ${room.max_players || 'open'}`} />
              <PrizeRoomDetailCard label="Room status" value={String(room.status || 'open').replace(/_/g, ' ')} tone="purple" />
              <PrizeRoomDetailCard label="Fulfillment status" value={String(fulfillmentStatus).replace(/_/g, ' ')} tone="yellow" />
              <PrizeRoomDetailCard label="Winner verification" value={String(winnerVerificationStatus).replace(/_/g, ' ')} />
              <PrizeRoomDetailCard label="Total room cost" value={formatMoney(prizeRoomTotalCost(room))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-yellow-300/15 bg-white/[0.05] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-yellow-100">
                  <Gift className="h-4 w-4" /> Prize
                </div>
                <p className="font-bold text-white">{room.prize_title}</p>
                <p className="mt-1 text-sm text-white/60">{room.prize_description || `Source: ${room.prize_source || 'test mode catalog'}. Prepared order only.`}</p>
                <a
                  href="https://www.ebay.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-xs font-semibold text-yellow-100 underline-offset-4 hover:text-white hover:underline"
                >
                  Prize image/product powered by eBay
                </a>
              </div>
              <div className="rounded-3xl border border-purple-300/15 bg-white/[0.05] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-purple-100">
                  <Gamepad2 className="h-4 w-4" /> Game
                </div>
                <p className="font-bold text-white">{room.game_title}</p>
                <p className="mt-1 text-sm text-white/60">{room.game_description || room.game_platform || 'Skill match rules are confirmed before play.'}</p>
                <a
                  href="https://rawg.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-xs font-semibold text-purple-200 underline-offset-4 hover:text-white hover:underline"
                >
                  Game data/images powered by RAWG
                </a>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/35 p-4">
                <div className="text-xs uppercase tracking-wide text-white/45">Winning rule</div>
                <p className="mt-1 font-semibold text-white">{room.winning_rule || 'Highest verified score wins'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/35 p-4">
                <div className="text-xs uppercase tracking-wide text-white/45">Verification method</div>
                <p className="mt-1 font-semibold text-white">{room.verification_method || 'Manual score with proof URL'}</p>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-white">
                <Users className="h-4 w-4 text-green-200" /> Players currently in room
                <span className="text-white/55">({playerCount} / {room.max_players})</span>
              </div>
              <PlayerListPreview room={room} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-4">
              <div className="text-xs uppercase tracking-wide text-green-100/70">Your pilot contribution</div>
              <div className="mt-1 text-4xl font-black text-green-100">{formatMoney(prizeRoomJoinCost(room))}</div>
              <div className="mt-1 text-sm text-white/60">Total room cost: {formatMoney(prizeRoomTotalCost(room))}</div>
            </div>
            <PrizeRoomCostBreakdown breakdown={room.cost_breakdown} />
            <Button onClick={onJoin} disabled={joining || !['open', 'awaiting_contributions'].includes(room.status)} className="h-12 w-full rounded-2xl bg-green-600 text-base font-black text-white hover:bg-green-500">
              {joining ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <DoorOpen className="mr-2 h-5 w-5" />}
              Join Room / Enter Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrizeRoomLobby({ user, onJoined, onCreated, onError, onMessage }) {
  const [rooms, setRooms] = useState([]);
  const [openRoomId, setOpenRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [secondaryFilter, setSecondaryFilter] = useState('all');
  const [localError, setLocalError] = useState('');
  const [localMessage, setLocalMessage] = useState('');
  const [usingDemoFallback, setUsingDemoFallback] = useState(false);
  const providerHydrationAttemptedRef = useRef(false);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setLocalError('');
    try {
      const apiRooms = await listPrizeRooms();
      if (Array.isArray(apiRooms) && apiRooms.length) {
        setRooms(apiRooms);
        setUsingDemoFallback(false);
        if (!providerHydrationAttemptedRef.current && mostlyUsesLocalPrizeRoomImages(apiRooms)) {
          providerHydrationAttemptedRef.current = true;
          setLocalMessage('Refreshing real product images...');
          hydratePrizeRoomProviderImages()
            .then(async (result) => {
              const refreshedRooms = await listPrizeRooms();
              if (Array.isArray(refreshedRooms) && refreshedRooms.length) setRooms(refreshedRooms);
              const ebayCount = result.ebay_image_count || 0;
              const rawgCount = result.rawg_image_count || 0;
              setLocalMessage(`Provider image refresh complete. eBay images: ${ebayCount}; RAWG images: ${rawgCount}.`);
            })
            .catch((error) => {
              setLocalMessage(error?.message?.includes('Admin')
                ? 'Real product image refresh is available from the admin dashboard.'
                : 'Provider image refresh could not run automatically.');
            });
        }
      } else {
        setRooms(FRONTEND_DEMO_PRIZE_ROOMS);
        setUsingDemoFallback(true);
        setLocalMessage('Showing Test Mode Rooms because the backend returned no Prize Rooms.');
      }
    } catch (err) {
      const message = err.message || 'Could not load Prize Rooms.';
      setLocalError(message);
      onError(message);
      setRooms(FRONTEND_DEMO_PRIZE_ROOMS);
      setUsingDemoFallback(true);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const materializeDemoRoom = async (room) => {
    const createdRoom = await createPrizeRoom({
      title: `${room.title} - Test Mode`,
      description: room.description,
      roomType: 'template_based',
      gameId: room.game_id,
      gameTitle: room.game_title,
      gameImage: room.game_image || '',
      gamePlatform: room.game_platform || 'pilot',
      prizeId: room.prize_id,
      prizeTitle: room.prize_title,
      prizeImage: room.prize_image || '',
      prizeSource: room.prize_source || 'pilot_demo',
      prizeUrl: room.prize_url || '',
      prizeSnapshot: {
        id: room.prize_id,
        title: room.prize_title,
        image: room.prize_image || '',
        price_cents: room.cost_breakdown?.item_cost_cents || 2500,
        shipping_cents: room.cost_breakdown?.estimated_shipping_cents,
        tax_cents: room.cost_breakdown?.estimated_tax_cents,
        currency: 'USD',
      },
      minPlayers: room.min_players || 2,
      maxPlayers: room.max_players || 4,
      winningRule: room.winning_rule,
      verificationMethod: room.verification_method,
      foundationRate: room.foundation_rate || NORTH_POLE_COST_MODEL.foundationRate,
      paymentMode: 'pilot_manual',
    });
    onCreated(createdRoom);
    return createdRoom;
  };

  const joinRoom = async (room) => {
    if (!user?.id) {
      onError('Sign in before joining a Prize Room.');
      return;
    }
    setJoiningId(room.id);
    setLocalError('');
    setLocalMessage('');
    try {
      const roomToJoin = room.is_frontend_demo ? await materializeDemoRoom(room) : room;
      const result = await joinPrizeRoom({
        roomId: roomToJoin.id,
        displayName: user.full_name || user.name || user.email || 'Pilot Player',
        userEmail: user.email || '',
        paymentMode: 'pilot_manual',
      });
      const updatedRoom = result.room || roomToJoin;
      setRooms((prev) => {
        const withoutDemo = prev.filter((row) => row.id !== room.id);
        const hasRoom = withoutDemo.some((row) => row.id === updatedRoom.id);
        return hasRoom
          ? withoutDemo.map((row) => (row.id === updatedRoom.id ? updatedRoom : row))
          : [updatedRoom, ...withoutDemo];
      });
      setOpenRoomId(updatedRoom.id);
      setUsingDemoFallback(false);
      onJoined(updatedRoom);
      const message = 'Joined Prize Room. Pilot contribution was marked for family testing; no real charge was made.';
      setLocalMessage(message);
      onMessage(message);
      await loadRooms();
    } catch (err) {
      const message = err.message || 'Could not join Prize Room.';
      setLocalError(message);
      onError(message);
    } finally {
      setJoiningId('');
    }
  };

  const quickCreate = async () => {
    if (!user?.id) {
      onError('Sign in before creating a Prize Room.');
      return;
    }
    try {
      const room = await createPrizeRoom({
        title: 'Family Pilot Custom Prize Room',
        description: 'Community-created pilot room with manual payment and fulfillment.',
        gameId: 'family-skill-match',
        gameTitle: 'Family Skill Match',
        gamePlatform: 'manual',
        prizeTitle: 'Family Pilot Gift Card',
        prizeSource: 'pilot_demo',
        prizeSnapshot: { title: 'Family Pilot Gift Card', price_cents: 4000, currency: 'USD' },
        minPlayers: 2,
        maxPlayers: 4,
        winningRule: 'Highest verified score wins',
        verificationMethod: 'manual_score_with_proof',
        paymentMode: 'pilot_manual',
      });
      onCreated(room);
      setOpenRoomId(room.id);
      await loadRooms();
      onMessage('Custom Prize Room created in pilot/manual mode.');
    } catch (err) {
      onError(err.message || 'Could not create Prize Room.');
    }
  };

  const gameOptions = useMemo(() => (
    [...new Set(rooms.map((room) => room.game_title).filter(Boolean))].sort()
  ), [rooms]);

  const prizeTypeOptions = useMemo(() => (
    [...new Set(rooms.map((room) => room.prize_type || room.prize_source || 'Pilot Prize').filter(Boolean))].sort()
  ), [rooms]);

  const filteredRooms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rooms.filter((room) => {
      const searchable = [
        room.title,
        room.game_title,
        room.prize_title,
        room.prize_source,
        room.room_type,
        room.status,
      ].join(' ').toLowerCase();
      if (query && !searchable.includes(query)) return false;
      const playerCount = prizeRoomPlayerCount(room);
      if (filter === 'platform_supported' && !['platform_supported', 'template_based'].includes(room.room_type)) return false;
      if (filter === 'community_created' && room.room_type !== 'user_created') return false;
      if (filter === 'family_friendly' && !(room.family_friendly || /family|uno|mario|chess/i.test(`${room.title} ${room.game_title}`))) return false;
      if (filter === 'low_cost' && prizeRoomJoinCost(room) > 1500) return false;
      if (filter === 'almost_full' && playerCount < Math.max(1, Number(room.max_players || 0) - 1)) return false;
      if (filter === 'open' && !['open', 'awaiting_contributions'].includes(room.status)) return false;
      if (filter === 'funded' && room.status !== 'funded') return false;
      if (filter === 'by_game' && secondaryFilter !== 'all' && room.game_title !== secondaryFilter) return false;
      if (filter === 'by_prize_type' && secondaryFilter !== 'all' && (room.prize_type || room.prize_source || 'Pilot Prize') !== secondaryFilter) return false;
      return true;
    });
  }, [rooms, searchTerm, filter, secondaryFilter]);

  return (
    <Card className="overflow-hidden rounded-[2rem] border border-purple-400/20 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.35),transparent_32%),linear-gradient(135deg,#05010d,#10061f_45%,#050505)] text-white shadow-[0_0_70px_rgba(124,58,237,0.18)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03]">
        <div>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-yellow-300" />
            Prize Room Lobby
          </CardTitle>
          <p className="mt-1 text-sm text-white/70">Browse visual Prize Rooms, review the game and prize, then join in Test Mode.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadRooms} className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
            <RefreshCw className="mr-2 h-4 w-4" />Refresh Rooms
          </Button>
          <Button onClick={quickCreate} className="rounded-2xl bg-purple-700 text-white hover:bg-purple-600">
            <Plus className="mr-2 h-4 w-4" />Create Pilot Room
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <PrizeRoomFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          secondaryValue={secondaryFilter}
          onSecondaryValueChange={setSecondaryFilter}
          gameOptions={gameOptions}
          prizeTypeOptions={prizeTypeOptions}
        />

        {(localError || localMessage || usingDemoFallback) && (
          <div className="space-y-2">
            {localError && (
              <Alert className="border-orange-500/40 bg-orange-950/30 text-orange-50">
                <AlertTitle>Prize Room notice</AlertTitle>
                <AlertDescription>{localError}</AlertDescription>
              </Alert>
            )}
            {(localMessage || usingDemoFallback) && (
              <Alert className="border-yellow-500/35 bg-yellow-950/25 text-yellow-50">
                <AlertTitle>{usingDemoFallback ? 'Test Mode Rooms' : 'Prize Room update'}</AlertTitle>
                <AlertDescription>{localMessage || 'Showing Test Mode Rooms so the family test screen is never empty.'}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl bg-purple-900/30" />)}
          </div>
        ) : filteredRooms.length ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-white">Prize Rooms</h3>
                <p className="text-sm text-white/55">{filteredRooms.length} room{filteredRooms.length === 1 ? '' : 's'} ready to browse.</p>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-100">Foundation 10% included</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredRooms.map((room) => {
                const isOpen = openRoomId === room.id;
                return (
                  <React.Fragment key={room.id}>
                    <PrizeRoomCard
                      room={room}
                      isOpen={isOpen}
                      joining={joiningId === room.id}
                      onToggleDetails={() => setOpenRoomId(isOpen ? '' : room.id)}
                      onJoin={() => joinRoom(room)}
                    />
                    {isOpen && (
                      <PrizeRoomDetailsDropdown
                        room={room}
                        joining={joiningId === room.id}
                        onJoin={() => joinRoom(room)}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-purple-200" />
            <h3 className="text-lg font-black text-white">No rooms match this search.</h3>
            <p className="mt-1 text-sm text-white/60">Try All Rooms or clear the search to see the pilot marketplace.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const howItWorksCards = [
  {
    icon: Gift,
    number: '1',
    title: 'Choose a prize',
    description: 'Pick something you want to play for.',
  },
  {
    icon: Gamepad2,
    number: '2',
    title: 'Pick the game',
    description: 'Choose the game players will compete in.',
  },
  {
    icon: Target,
    number: '3',
    title: 'Compete by skill',
    description: 'Players enter the room and play.',
  },
  {
    icon: Trophy,
    number: '4',
    title: 'Win the prize',
    description: 'The winner is reviewed and the prize moves forward.',
  },
];

function NorthPoleLandingHero() {
  return (
    <section className="bg-white text-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
        <div className="space-y-7">
          <div className="space-y-5">
            <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-normal text-black sm:text-5xl lg:text-6xl">
              Choose a prize.<br />
              Pick the game.<br />
              (Win the game, win the prize.)<br />
              Support <span className="text-purple-700">Santa Claus.</span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Build a prize room around a real item, compete by skill, and help support The Poles Foundation mission for children.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#north-pole-flow"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-purple-700 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition hover:bg-purple-600"
            >
              Build a Prize Room
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#north-pole-how-it-works"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-7 py-3 text-sm font-bold text-slate-950 transition hover:border-purple-300 hover:bg-purple-50"
            >
              <PlayCircle className="h-5 w-5" />
              See How It Works
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl shadow-purple-950/20">
            <img
              src="/images/north-pole-hero.png"
              alt="A live prize room showing a player competing in a game for a gaming console prize"
              loading="eager"
              decoding="async"
              className="w-full rounded-3xl object-cover"
            />
          </div>

          <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-1 text-sm text-slate-700">
            <div className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 font-semibold text-purple-700">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
              Live Prize Room
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="font-semibold">8/8 players</span>
            </div>
            <div className="flex items-end gap-1 text-purple-700">
              {[3, 5, 7, 10].map((height) => (
                <span key={height} className="w-1.5 rounded-full bg-purple-700" style={{ height }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="north-pole-how-it-works" className="border-t border-purple-100 bg-gradient-to-b from-purple-50/70 to-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-center text-3xl font-black text-black">How it works</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {howItWorksCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.number} className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-purple-950/5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-purple-100 bg-purple-50 text-purple-700">
                    <Icon className="h-9 w-9" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-700 text-sm font-black text-white">{item.number}</span>
                      <h3 className="text-base font-black text-black">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function currentUserMatchIds(user) {
  return [
    user?.id,
    user?.auth_user_id,
    user?.authUserId,
    user?.user_id,
  ].filter(Boolean).map(String);
}

function currentUserStoredMatchId(user) {
  return user?.auth_user_id || user?.authUserId || user?.id || user?.user_id || null;
}

function matchIncludesUserId(matchIds, userIds) {
  const normalizedMatchIds = new Set((matchIds || []).filter(Boolean).map(String));
  return userIds.some((id) => normalizedMatchIds.has(id));
}

function NorthPoleMatchCard({
  match,
  currentUser,
  onJoin,
  isJoining,
  pendingJoinId,
  joinAgreementAccepted,
  onPrepareJoin,
  onCancelJoin,
  onJoinAgreementChange,
  scoreDraft,
  onScoreDraftChange,
  onSubmitScore,
  onAssignGhostReferee,
  onStartRefereeSession,
  onSimulateRefereeReport,
  onVerifyWinner,
  onLockWinner,
  onDisputeWinner,
  onAdminOverrideWinner,
  onCreateFulfillment,
  onLeave,
  onCancelMatch,
  isAdmin,
  verificationRecommendation,
  refereeAction,
  disputeDraft,
  onDisputeDraftChange,
  overrideDraft,
  onOverrideDraftChange,
  actionLoading,
}) {
  const playerIds = Array.isArray(match.player_ids) ? match.player_ids : [];
  const userIds = currentUserMatchIds(currentUser);
  const isParticipant = matchIncludesUserId(playerIds, userIds);
  const isCreator = matchIncludesUserId([match.creator_user_id, match.created_by], userIds);
  const isFull = playerIds.length >= Number(match.max_players || 0);
  const canJoin = Boolean(userIds.length && !isParticipant && !isFull && ['open', 'waiting_for_players'].includes(match.status));
  const isPendingJoin = pendingJoinId === match.id && canJoin;
  const canLeave = Boolean(isParticipant && !isCreator && ['open', 'waiting_for_players'].includes(match.status));
  const canCancel = Boolean((isCreator || isAdmin) && ['draft', 'open', 'waiting_for_players'].includes(match.status));
  const plan = match.match_plan || match.prize_snapshot?.match_plan || {};
  const refereeContext = verificationRecommendation?.refereeContext || {};
  const refereeSession = refereeAction?.session || refereeContext.sessions?.[0] || null;
  const refereeAccount = refereeAction?.refereeAccount || refereeContext.accounts?.[0] || null;
  const refereeReport = refereeAction?.report || verificationRecommendation?.refereeReport || refereeContext.reports?.[0] || null;

  return (
    <Card className="border border-purple-700/30 bg-black/35">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">{match.match_id}</span>
              <Badge className={`border text-xs ${statusClass(match.status)}`}>{match.status}</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">{match.prize_snapshot?.title || match.prize_id || 'North Pole Prize'}</h3>
            <div className="grid gap-2 text-xs text-purple-200/75 sm:grid-cols-2 lg:grid-cols-4">
              <span className="rounded-lg bg-purple-950/40 px-3 py-2">
                Players: <strong className="text-white">{playerIds.length}/{match.max_players || plan.players || '-'}</strong>
              </span>
              <span className="rounded-lg bg-purple-950/40 px-3 py-2">
                Entry contribution: <strong className="text-green-300">{formatMoney(match.buy_in_cents)}</strong>
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
            {!isPendingJoin ? (
              <Button
                onClick={() => onPrepareJoin(match)}
                disabled={isJoining || !canJoin}
                className="bg-purple-700 text-white hover:bg-purple-600"
              >
                {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                {isCreator ? 'Your Room' : isParticipant ? 'Joined' : isFull ? 'Full' : 'Join Room'}
              </Button>
            ) : (
              <Button
                onClick={() => onJoin(match)}
                disabled={isJoining || !joinAgreementAccepted}
                className="bg-green-700 text-white hover:bg-green-600"
              >
                {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                Confirm Join Room
              </Button>
            )}
            {canLeave && (
              <Button
                variant="outline"
                onClick={() => onLeave(match)}
                disabled={actionLoading === `leave-${match.id}`}
                className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
              >
                <DoorOpen className="mr-2 h-4 w-4" />
                Leave Room
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                onClick={() => onCancelMatch(match)}
                disabled={actionLoading === `cancel-${match.id}`}
                className="border-red-700/50 text-red-200 hover:bg-red-950/40"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete/Cancel
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <MatchStatusSteps status={match.status} />
        </div>
        {isPendingJoin && (
          <div className="mt-4 space-y-3">
            <SkillCompetitionAgreement
              id={`join-skill-agreement-${match.id}`}
              accepted={joinAgreementAccepted}
              onAcceptedChange={onJoinAgreementChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onCancelJoin}
              className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
            >
              Cancel
            </Button>
          </div>
        )}
        {(isParticipant || isCreator) && (
          <div className="mt-4 rounded-xl border border-purple-800/30 bg-black/25 p-4">
            <div className="mb-4 rounded-lg border border-cyan-800/30 bg-cyan-950/10 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  Ghost Referee
                </h4>
                <Badge className="border border-cyan-700/30 bg-cyan-900/35 text-cyan-200">
                  AI Referee Account
                </Badge>
              </div>
              <div className="grid gap-2 text-xs text-purple-100 sm:grid-cols-2 lg:grid-cols-4">
                <span>Assigned referee: <strong className="text-white">{refereeAccount?.displayName || 'None'}</strong></span>
                <span>Session: <strong className="text-white">{refereeSession?.status || 'not assigned'}</strong></span>
                <span>Join method: <strong className="text-white">{refereeSession?.joinMethod || '-'}</strong></span>
                <span>Report: <strong className="text-white">{refereeReport?.reportStatus || 'none'}</strong></span>
                <span>Confidence: <strong className="text-white">{refereeReport?.confidence ?? '-'}</strong></span>
                <span>Recommended winner: <strong className="font-mono text-yellow-200">{refereeReport?.winnerUserId || verificationRecommendation?.recommendedWinnerUserId || '-'}</strong></span>
              </div>
              {refereeReport?.warnings?.length > 0 && (
                <div className="mt-2 text-xs text-yellow-200">Warnings: {refereeReport.warnings.join(', ')}</div>
              )}
              {refereeReport?.evidenceUrls?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {refereeReport.evidenceUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Evidence</a>
                  ))}
                </div>
              )}
              {isAdmin && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAssignGhostReferee(match)}
                    disabled={actionLoading === `referee-assign-${match.id}`}
                    className="border-cyan-700/50 text-cyan-200 hover:bg-cyan-950/40"
                  >
                    Assign Ghost Referee
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartRefereeSession(match)}
                    disabled={actionLoading === `referee-start-${match.id}` || !refereeSession?.id}
                    className="border-cyan-700/50 text-cyan-200 hover:bg-cyan-950/40"
                  >
                    Start Referee Session
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onSimulateRefereeReport(match)}
                    disabled={actionLoading === `referee-sim-${match.id}`}
                    className="bg-cyan-700 text-white hover:bg-cyan-600"
                  >
                    Create Simulated Referee Report
                  </Button>
                </div>
              )}
            </div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                <ClipboardList className="h-4 w-4 text-cyan-300" />
                Score and Verification
              </h4>
              <Badge className="border border-blue-700/30 bg-blue-900/35 text-blue-200">
                Deterministic winner rules
              </Badge>
            </div>
            <div className="grid gap-3 lg:grid-cols-[120px_150px_1fr]">
              <Input
                inputMode="decimal"
                value={scoreDraft?.score || ''}
                onChange={(event) => onScoreDraftChange(match, { score: event.target.value })}
                placeholder="Score"
                className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60"
              />
              <select
                value={scoreDraft?.scoreType || 'highest_score'}
                onChange={(event) => onScoreDraftChange(match, { scoreType: event.target.value })}
                className="rounded-md border border-purple-700/40 bg-black/30 px-3 py-2 text-sm text-white"
              >
                <option value="highest_score">Highest score</option>
                <option value="lowest_time">Lowest time</option>
                <option value="bracket_result">Bracket result</option>
                <option value="manual_review">Manual review</option>
              </select>
              <Input
                value={scoreDraft?.evidenceUrl || ''}
                onChange={(event) => onScoreDraftChange(match, { evidenceUrl: event.target.value })}
                placeholder="Evidence URL"
                className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60"
              />
            </div>
            <Input
              value={scoreDraft?.evidenceNotes || ''}
              onChange={(event) => onScoreDraftChange(match, { evidenceNotes: event.target.value })}
              placeholder="Evidence notes"
              className="mt-3 border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => onSubmitScore(match)}
                disabled={actionLoading === `score-${match.id}`}
                className="bg-cyan-700 text-white hover:bg-cyan-600"
              >
                Submit Result
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVerifyWinner(match)}
                disabled={actionLoading === `verify-${match.id}`}
                className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
              >
                Recommend Winner
              </Button>
              {verificationRecommendation?.recommendedWinner && (
                <Button
                  size="sm"
                  onClick={() => onLockWinner(match)}
                  disabled={actionLoading === `lock-${match.id}`}
                  className="bg-green-700 text-white hover:bg-green-600"
                >
                  Lock Winner
                </Button>
              )}
              {match.winner_user_id && (
                <Button
                  size="sm"
                  onClick={() => onCreateFulfillment(match)}
                  disabled={actionLoading === `fulfillment-${match.id}`}
                  className="bg-yellow-700 text-white hover:bg-yellow-600"
                >
                  Create Fulfillment
                </Button>
              )}
            </div>
            {verificationRecommendation && (
              <div className="mt-3 rounded-lg border border-purple-800/30 bg-purple-950/25 p-3 text-xs text-purple-100">
                <div>Recommended winner: <span className="font-mono text-yellow-200">{verificationRecommendation.recommendedWinnerUserId || verificationRecommendation.recommendedWinner?.userId || 'None yet'}</span></div>
                <div>Winning score: <span className="font-mono text-cyan-200">{verificationRecommendation.winningScore ?? '-'}</span></div>
                <div>Rule: {verificationRecommendation.deterministicRule}</div>
                <div>Confidence: {verificationRecommendation.confidence || 'needs_review'} / Can lock winner: {verificationRecommendation.canLockWinner ? 'yes' : 'no'}</div>
                {verificationRecommendation.warnings?.length > 0 && (
                  <div className="text-yellow-200">Warnings: {verificationRecommendation.warnings.join(', ')}</div>
                )}
                {verificationRecommendation.scoresConsidered?.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left">
                      <thead className="text-purple-300">
                        <tr>
                          <th className="py-1 pr-3">User</th>
                          <th className="py-1 pr-3">Score</th>
                          <th className="py-1 pr-3">Verification</th>
                          <th className="py-1 pr-3">AI-assisted review</th>
                          <th className="py-1">Evidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verificationRecommendation.scoresConsidered.map((score) => (
                          <tr key={score.id || `${score.userId}-${score.score}`} className="border-t border-purple-800/30">
                            <td className="py-1 pr-3 font-mono">{score.userId || score.user_id}</td>
                            <td className="py-1 pr-3">{score.score}</td>
                            <td className="py-1 pr-3">{score.verificationStatus || 'pending'}</td>
                            <td className="py-1 pr-3">{score.aiReviewStatus || 'not_reviewed'}</td>
                            <td className="py-1">
                              {score.evidenceUrl ? (
                                <a href={score.evidenceUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Open</a>
                              ) : 'None'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 grid gap-3 rounded-lg border border-orange-800/30 bg-orange-950/10 p-3 lg:grid-cols-[1fr_1fr_auto]">
              <Input
                value={disputeDraft?.reason || ''}
                onChange={(event) => onDisputeDraftChange(match, { reason: event.target.value })}
                placeholder="Dispute reason"
                className="border-orange-700/40 bg-black/30 text-white placeholder:text-orange-300/50"
              />
              <Input
                value={disputeDraft?.evidenceUrl || ''}
                onChange={(event) => onDisputeDraftChange(match, { evidenceUrl: event.target.value })}
                placeholder="Dispute evidence URL"
                className="border-orange-700/40 bg-black/30 text-white placeholder:text-orange-300/50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDisputeWinner(match)}
                disabled={actionLoading === `dispute-${match.id}` || !disputeDraft?.reason}
                className="border-orange-700/50 text-orange-200 hover:bg-orange-950/40"
              >
                Dispute
              </Button>
            </div>
            {isAdmin && (
              <div className="mt-3 grid gap-3 rounded-lg border border-red-800/30 bg-red-950/10 p-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
                <Input
                  value={overrideDraft?.newWinnerUserId || ''}
                  onChange={(event) => onOverrideDraftChange(match, { newWinnerUserId: event.target.value })}
                  placeholder="New winner user ID"
                  className="border-red-700/40 bg-black/30 text-white placeholder:text-red-300/50"
                />
                <Input
                  value={overrideDraft?.reason || ''}
                  onChange={(event) => onOverrideDraftChange(match, { reason: event.target.value })}
                  placeholder="Override reason"
                  className="border-red-700/40 bg-black/30 text-white placeholder:text-red-300/50"
                />
                <Input
                  value={overrideDraft?.evidenceUrl || ''}
                  onChange={(event) => onOverrideDraftChange(match, { evidenceUrl: event.target.value })}
                  placeholder="Override evidence URL"
                  className="border-red-700/40 bg-black/30 text-white placeholder:text-red-300/50"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onAdminOverrideWinner(match)}
                  disabled={actionLoading === `override-${match.id}` || !overrideDraft?.newWinnerUserId || !overrideDraft?.reason}
                >
                  Admin Override
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RealNorthPoleFlow({ user }) {
  const isAdmin = userHasRole(user, ADMIN_ROLES);
  const [step, setStep] = useState('prize');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchProvider, setSearchProvider] = useState('');
  const [searchProviderMessage, setSearchProviderMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [gameSearchTerm, setGameSearchTerm] = useState('');
  const [gameResults, setGameResults] = useState([]);
  const [gameProvider, setGameProvider] = useState('');
  const [gameProviderMessage, setGameProviderMessage] = useState('');
  const [isGameSearching, setIsGameSearching] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [form, setForm] = useState(emptyPrizeForm);
  const [selectedPlayers, setSelectedPlayers] = useState(PLAYER_OPTIONS[2]);
  const [estimatedTax, setEstimatedTax] = useState('');
  const [estimatedShipping, setEstimatedShipping] = useState('');
  const [matches, setMatches] = useState([]);
  const [matchView, setMatchView] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [createAgreementAccepted, setCreateAgreementAccepted] = useState(false);
  const [pendingJoinId, setPendingJoinId] = useState(null);
  const [joinAgreementAccepted, setJoinAgreementAccepted] = useState(false);
  const [scoreDrafts, setScoreDrafts] = useState({});
  const [verificationRecommendations, setVerificationRecommendations] = useState({});
  const [refereeActions, setRefereeActions] = useState({});
  const [disputeDrafts, setDisputeDrafts] = useState({});
  const [overrideDrafts, setOverrideDrafts] = useState({});
  const [flowActionLoading, setFlowActionLoading] = useState('');
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

  const upsertMatch = useCallback((nextMatch) => {
    if (!nextMatch?.id) return;
    setMatches((prev) => {
      const nextRows = prev.filter((row) => row.id !== nextMatch.id);
      return nextMatch.sandbox_mode ? nextRows : [nextMatch, ...nextRows];
    });
  }, []);

  const visibleMatches = useMemo(() => {
    const userIds = currentUserMatchIds(user);
    const activeStatuses = new Set(['draft', 'open', 'waiting_for_players', 'in_progress', 'referee_assigned', 'waiting_for_referee', 'referee_observing', 'pending_verification', 'winner_verified', 'fulfillment_pending', 'disputed']);
    return matches.filter((match) => {
      if (matchView === 'mine') {
        return matchIncludesUserId([match.creator_user_id, match.created_by, ...(Array.isArray(match.player_ids) ? match.player_ids : [])], userIds);
      }
      return activeStatuses.has(match.status);
    });
  }, [matches, matchView, user]);

  const markMatchAsJoined = useCallback((match) => {
    const userId = currentUserStoredMatchId(user);
    if (!match?.id || !userId) return;
    setMatches((prev) => prev.map((row) => {
      if (row.id !== match.id) return row;
      const existingIds = Array.isArray(row.player_ids) ? row.player_ids.map(String) : [];
      const nextPlayerIds = [...existingIds];
      if (!nextPlayerIds.includes(String(userId))) nextPlayerIds.push(String(userId));
      return { ...row, player_ids: nextPlayerIds };
    }));
  }, [user]);

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
    const image = product.image_url
      || product.imageUrl
      || product.image?.imageUrl
      || product.thumbnailImages?.[0]?.imageUrl
      || product.additionalImages?.[0]?.imageUrl
      || product.images?.[0]
      || product.image_urls?.[0]
      || '';
    return {
      ...product,
      id: product.id || product.product_id || product.externalId || `prize-${Date.now().toString(36)}`,
      title: product.title || 'Selected Prize',
      category: product.category || product.brand || 'Prize',
      brand: product.brand || product.category || '',
      price_cents: bestOffer?.price_cents || product.price_cents || product.price || 0,
      image,
      image_url: image,
      imageUrl: product.imageUrl || image,
      images: product.images || product.image_urls || [image].filter(Boolean),
      image_urls: product.image_urls || product.images || [image].filter(Boolean),
      source: resultSource,
      source_label: sourceLabel,
      source_url: bestOffer?.product_url || product.source_url || product.product_url || null,
      product_url: bestOffer?.product_url || product.product_url || product.raw_ebay?.itemWebUrl || null,
      offers: Array.isArray(product.offers) ? product.offers : bestOffer ? [bestOffer] : [],
      availability: bestOffer?.availability || product.availability || 'in_stock',
    };
  };

  const normalizeGame = (game, source = 'game_provider') => {
    const image = game.background_image
      || game.background_image_additional
      || game.short_screenshots?.[0]?.image
      || game.image
      || game.image_url
      || game.icon_url
      || game.cover
      || game.thumbnail
      || '';
    return {
      ...game,
      id: game.id || game.app_id || `game-${Date.now().toString(36)}`,
      title: game.title || game.name || 'Selected Game',
      developer: game.developer || game.publisher || 'Unknown',
      description: game.description || '',
      category: game.category || game.genre || 'Skill Challenge',
      platform: game.platform || 'unknown',
      store: game.store || game.store_id || 'Sample catalog',
      skillStyle: game.skillStyle || game.skill_style || (game.skill_verifiable ? 'skill-verifiable result' : 'manual verification'),
      skill_verifiable: Boolean(game.skill_verifiable ?? true),
      background_image: image,
      image,
      image_url: image,
      icon_url: game.icon_url || image,
      short_screenshots: game.short_screenshots || [],
      source: game.source || source,
      source_label: game.source_label || game.sourceLabel || game.provider_label || game.source || source,
      provider_ids: game.provider_ids || {},
    };
  };

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
      setSearchProvider(data.sourceLabel || data.provider || 'product_provider');
      setSearchProviderMessage(data.providerMessage || '');
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
      setGameResults((data.games || []).map((game) => normalizeGame(game, data.provider || 'game_provider')));
      setGameProvider(data.sourceLabel || data.provider || 'game_provider');
      setGameProviderMessage(data.providerMessage || '');
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
    if (!createAgreementAccepted) {
      setError('Confirm the skill-based competition agreement before creating this match.');
      return;
    }

    setIsCreating(true);
    try {
      const prizeId = selectedPrize.id || `custom-prize-${Date.now().toString(36)}`;
      const prizeImage = prizeImageFromSource(selectedPrize);
      const gameImage = gameImageFromSource(selectedGame);
      const prizeSnapshot = {
        ...selectedPrize,
        id: prizeId,
        image: prizeImage,
        image_url: prizeImage,
        price_cents: selectedPlan.priceCents,
        estimated_tax_cents: selectedPlan.taxCents,
        estimated_shipping_cents: selectedPlan.shippingCents,
        total_prize_cost_cents: selectedPlan.totalPrizeCostCents,
        fulfillment_mode: 'simulated',
        match_plan: selectedPlan,
      };

      const createdRoom = await createPrizeRoom({
        roomType: 'user_created',
        title: `${selectedGame.title} Prize Room`,
        description: 'Community-created pilot Prize Room. Manual payment and fulfillment required.',
        gameId: selectedGame.id,
        gameTitle: selectedGame.title,
        gameImage,
        gameSnapshot: {
          ...selectedGame,
          image: gameImage,
          background_image: gameImage,
        },
        gamePlatform: selectedGame.platform || selectedGame.store || 'manual',
        prizeId,
        prizeTitle: selectedPrize.title,
        prizeImage,
        prizeSource: selectedPrize.source || selectedPrize.source_label || 'manual',
        prizeUrl: selectedPrize.product_url || selectedPrize.url || '',
        prizeSnapshot,
        minPlayers: Math.min(2, selectedPlan.players),
        maxPlayers: selectedPlan.players,
        winningRule: selectedGame.score_type || selectedGame.skillStyle || 'Highest verified score wins',
        verificationMethod: 'manual_score_with_proof',
        foundationRate: NORTH_POLE_COST_MODEL.foundationRate,
        paymentMode: 'pilot_manual',
      });

      await loadMatches();
      setMessage(`Prize Room created successfully: ${createdRoom.title}. It is visible in the lobby.`);
      setStep('prize');
      setSelectedPrize(null);
      setSelectedGame(null);
      setForm(emptyPrizeForm);
      setEstimatedTax('');
      setEstimatedShipping('');
      setSelectedPlayers(PLAYER_OPTIONS[2]);
      setCreateAgreementAccepted(false);
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
    if (pendingJoinId !== match.id || !joinAgreementAccepted) {
      setError('Confirm the skill-based competition agreement before joining this match.');
      return;
    }

    setError('');
    setMessage('');
    setJoiningId(match.id);
    try {
      const updated = await joinNorthPoleMatch({
        matchId: match.id,
        skillAgreementAccepted: true,
        skillAgreementVersion: SKILL_COMPETITION_AGREEMENT_VERSION,
      });
      markMatchAsJoined(match);
      await loadMatches();
      setMessage('You joined this match successfully.');
      setPendingJoinId(null);
      setJoinAgreementAccepted(false);
    } catch (err) {
      if (/already joined this match/i.test(err.message || '')) {
        markMatchAsJoined(match);
        setMessage('You are already entered in this match.');
        setPendingJoinId(null);
        setJoinAgreementAccepted(false);
      } else {
        setError(err.message || 'Could not join this match.');
      }
    } finally {
      setJoiningId(null);
    }
  };

  const leaveMatch = async (match) => {
    setFlowActionLoading(`leave-${match.id}`);
    setError('');
    setMessage('');
    try {
      await leaveNorthPoleMatch({ matchId: match.match_id || match.id });
      setMessage('You left this prize room.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not leave this prize room.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const cancelMatch = async (match) => {
    if (!window.confirm('Are you sure you want to cancel this prize room?')) return;

    setFlowActionLoading(`cancel-${match.id}`);
    setError('');
    setMessage('');
    try {
      await cancelNorthPoleMatch({ matchId: match.match_id || match.id });
      setMessage('Prize room cancelled.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not cancel this prize room.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const prepareJoinMatch = (match) => {
    if (!user?.id) {
      setError('Sign in before joining a North Pole match.');
      return;
    }
    setPendingJoinId(match.id);
    setJoinAgreementAccepted(false);
    setError('');
    setMessage('');
  };

  const cancelJoinMatch = () => {
    setPendingJoinId(null);
    setJoinAgreementAccepted(false);
  };

  const updateScoreDraft = (match, patch) => {
    const matchKey = match.id;
    setScoreDrafts((prev) => ({
      ...prev,
      [matchKey]: {
        score: '',
        scoreType: 'highest_score',
        evidenceUrl: '',
        evidenceNotes: '',
        ...(prev[matchKey] || {}),
        ...patch,
      },
    }));
  };

  const updateDisputeDraft = (match, patch) => {
    const matchKey = match.id;
    setDisputeDrafts((prev) => ({
      ...prev,
      [matchKey]: {
        reason: '',
        evidenceUrl: '',
        ...(prev[matchKey] || {}),
        ...patch,
      },
    }));
  };

  const updateOverrideDraft = (match, patch) => {
    const matchKey = match.id;
    setOverrideDrafts((prev) => ({
      ...prev,
      [matchKey]: {
        newWinnerUserId: '',
        reason: '',
        evidenceUrl: '',
        ...(prev[matchKey] || {}),
        ...patch,
      },
    }));
  };

  const submitMatchScoreForMatch = async (match) => {
    const draft = scoreDrafts[match.id] || {};
    const numericScore = Number(draft.score);
    if (!Number.isFinite(numericScore)) {
      setError('Enter a numeric score before submitting.');
      return;
    }

    setFlowActionLoading(`score-${match.id}`);
    setError('');
    setMessage('');
    try {
      await submitMatchScore({
        matchId: match.match_id || match.id,
        score: numericScore,
        scoreType: draft.scoreType || 'highest_score',
        evidenceUrl: draft.evidenceUrl || '',
        evidenceNotes: draft.evidenceNotes || '',
      });
      setMessage('Score submitted for verification.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not submit score.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const assignGhostRefereeForMatch = async (match) => {
    setFlowActionLoading(`referee-assign-${match.id}`);
    setError('');
    setMessage('');
    try {
      const result = await assignReferee({
        matchId: match.match_id || match.id,
        joinMethod: 'spectator_mode',
      });
      setRefereeActions((prev) => ({ ...prev, [match.id]: result }));
      setMessage('Ghost Referee assigned as an observer.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not assign Ghost Referee.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const startRefereeSessionForMatch = async (match) => {
    const refereeSessionId = refereeActions[match.id]?.session?.id || verificationRecommendations[match.id]?.refereeContext?.sessions?.[0]?.id;
    if (!refereeSessionId) {
      setError('Assign a Ghost Referee before starting the referee session.');
      return;
    }

    setFlowActionLoading(`referee-start-${match.id}`);
    setError('');
    setMessage('');
    try {
      const session = await startRefereeSession({
        matchId: match.match_id || match.id,
        refereeSessionId,
      });
      setRefereeActions((prev) => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), session } }));
      setMessage('Ghost Referee session started.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not start Ghost Referee session.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const simulateRefereeReportForMatch = async (match) => {
    setFlowActionLoading(`referee-sim-${match.id}`);
    setError('');
    setMessage('');
    try {
      const result = await simulateRefereeReport({ matchId: match.match_id || match.id });
      setRefereeActions((prev) => ({ ...prev, [match.id]: result }));
      setMessage('Simulated Ghost Referee report created.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not create simulated Ghost Referee report.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const verifyWinnerForMatch = async (match) => {
    setFlowActionLoading(`verify-${match.id}`);
    setError('');
    setMessage('');
    try {
      const recommendation = await verifyWinner({ matchId: match.match_id || match.id });
      setVerificationRecommendations((prev) => ({ ...prev, [match.id]: recommendation }));
      setMessage('Recommended winner created from deterministic match rules.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not verify winner.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const lockWinnerForMatch = async (match) => {
    const recommendation = verificationRecommendations[match.id];
    const recommendedWinnerUserId = recommendation?.recommendedWinnerUserId || recommendation?.recommendedWinner?.userId;
    if (!recommendedWinnerUserId) {
      setError('Run winner verification before locking a winner.');
      return;
    }

    setFlowActionLoading(`lock-${match.id}`);
    setError('');
    setMessage('');
    try {
      await lockWinner({
        matchId: match.match_id || match.id,
        winnerUserId: recommendedWinnerUserId,
        winningScore: recommendation.winningScore ?? recommendation.recommendedWinner?.score,
        verificationMethod: recommendation.warnings?.length ? 'admin_review' : 'automatic',
        auditNotes: recommendation.deterministicRule,
        lockedBy: user?.id || user?.email || '',
      });
      setMessage('Winner locked. Fulfillment is pending.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not lock winner.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const disputeWinnerForMatch = async (match) => {
    const draft = disputeDrafts[match.id] || {};
    if (!draft.reason) {
      setError('Enter a dispute reason before opening a dispute.');
      return;
    }

    setFlowActionLoading(`dispute-${match.id}`);
    setError('');
    setMessage('');
    try {
      await disputeWinner({
        matchId: match.match_id || match.id,
        userId: user?.id,
        reason: draft.reason,
        evidenceUrl: draft.evidenceUrl || '',
      });
      setMessage('Winner dispute opened for review.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not open dispute.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const adminOverrideWinnerForMatch = async (match) => {
    const draft = overrideDrafts[match.id] || {};
    if (!draft.newWinnerUserId || !draft.reason) {
      setError('Enter the new winner user ID and override reason.');
      return;
    }

    setFlowActionLoading(`override-${match.id}`);
    setError('');
    setMessage('');
    try {
      await adminOverrideWinner({
        matchId: match.match_id || match.id,
        adminUserId: user?.id,
        newWinnerUserId: draft.newWinnerUserId,
        reason: draft.reason,
        evidenceUrl: draft.evidenceUrl || '',
      });
      setMessage('Admin override recorded and winner locked.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not override winner.');
    } finally {
      setFlowActionLoading('');
    }
  };

  const createFulfillmentForMatch = async (match) => {
    setFlowActionLoading(`fulfillment-${match.id}`);
    setError('');
    setMessage('');
    try {
      await createFulfillmentOrder({ matchId: match.match_id || match.id });
      setMessage('Fulfillment order created for admin tracking.');
      await loadMatches();
    } catch (err) {
      setError(err.message || 'Could not create fulfillment order.');
    } finally {
      setFlowActionLoading('');
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

      <PrizeRoomLobby
        user={user}
        onJoined={() => loadMatches()}
        onCreated={() => loadMatches()}
        onError={setError}
        onMessage={setMessage}
      />

      <Card className="border border-purple-700/30 bg-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Plus className="h-5 w-5 text-green-300" />
            Build a Prize Room
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
                      Search runs through backend product providers.
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
                    Search Product
                  </Button>
                </div>
              </div>

              {searchProviderMessage && (
                <div className="rounded-xl border border-yellow-700/30 bg-yellow-950/25 p-3 text-sm text-yellow-100">
                  {searchProviderMessage}
                </div>
              )}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-purple-100">
                    {searchResults.length ? 'Search Results' : 'Search for a product to select a prize'}
                  </h4>
                  {searchProvider && <Badge className="border border-yellow-700/30 bg-yellow-900/40 text-yellow-300">{searchProvider}</Badge>}
                </div>
                {searchTerm.length > 1 && !isSearching && searchResults.length === 0 && (
                  <div className="mb-4 rounded-xl border border-purple-700/20 bg-black/25 p-6 text-center text-sm text-purple-300">
                    No products found for "{searchTerm}". Try another product name or use manual prize entry.
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {searchResults.map((prize) => (
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
                          <Badge className="bg-blue-600/20 text-xs text-blue-300">{prize.offers?.[0]?.retailer || prize.source_label || prize.source || 'product provider'}</Badge>
                          <span className="text-sm font-bold text-green-300">{formatMoney(prize.price_cents)}</span>
                        </div>
                        <p className="mb-3 text-xs text-purple-300/70">
                          Source: {prize.source_label || prize.source || 'product provider'}
                        </p>
                        <Button onClick={() => selectPrize(prize, prize.source)} className="w-full bg-yellow-700 text-white hover:bg-yellow-600">
                          Select Product
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
                    Game search runs through backend game providers.
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
                    Search Game
                  </Button>
                </div>
              </div>

              {gameProviderMessage && (
                <div className="rounded-xl border border-yellow-700/30 bg-yellow-950/25 p-3 text-sm text-yellow-100">
                  {gameProviderMessage}
                </div>
              )}

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
                  <h3 className="text-sm font-bold text-white">Room and Entry Contribution Options</h3>
                  <Badge className="border border-pink-500/30 bg-pink-600/15 text-pink-200">
                    Foundation 10% added separately
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
                          Total {formatMoney(option.total_room_cost_cents)} / Foundation {formatMoney(option.foundation_amount_cents)}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <RoomCostRows breakdown={selectedPlan} compact />
                </div>
              </div>

              <SkillCompetitionAgreement
                id="create-skill-agreement"
                accepted={createAgreementAccepted}
                onAcceptedChange={setCreateAgreementAccepted}
              />

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => setStep('game')} className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40">Back to Games</Button>
                <Button onClick={createMatch} disabled={isCreating || !createAgreementAccepted} className="flex-1 bg-green-700 text-white hover:bg-green-600">
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Create Prize Room
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
            Prize Rooms
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={matchView === 'active' ? 'default' : 'outline'}
              onClick={() => setMatchView('active')}
              className={matchView === 'active' ? 'bg-cyan-700 text-white hover:bg-cyan-600' : 'border-purple-700/50 text-purple-200 hover:bg-purple-900/40'}
            >
              View Active Matches
            </Button>
            <Button
              variant={matchView === 'mine' ? 'default' : 'outline'}
              onClick={() => setMatchView('mine')}
              className={matchView === 'mine' ? 'bg-cyan-700 text-white hover:bg-cyan-600' : 'border-purple-700/50 text-purple-200 hover:bg-purple-900/40'}
            >
              View My Matches
            </Button>
            <Button
              variant="outline"
              onClick={loadMatches}
              className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-xl bg-purple-900/30" />
              ))}
            </div>
          ) : visibleMatches.length ? (
            visibleMatches.map((match) => (
              <NorthPoleMatchCard
                key={match.id}
                match={match}
                currentUser={user}
                onJoin={joinMatch}
                onPrepareJoin={prepareJoinMatch}
                onCancelJoin={cancelJoinMatch}
                onJoinAgreementChange={setJoinAgreementAccepted}
                pendingJoinId={pendingJoinId}
                joinAgreementAccepted={pendingJoinId === match.id && joinAgreementAccepted}
                isJoining={joiningId === match.id}
                scoreDraft={scoreDrafts[match.id]}
                onScoreDraftChange={updateScoreDraft}
                onSubmitScore={submitMatchScoreForMatch}
                onAssignGhostReferee={assignGhostRefereeForMatch}
                onStartRefereeSession={startRefereeSessionForMatch}
                onSimulateRefereeReport={simulateRefereeReportForMatch}
                onVerifyWinner={verifyWinnerForMatch}
                onLockWinner={lockWinnerForMatch}
                onDisputeWinner={disputeWinnerForMatch}
                onAdminOverrideWinner={adminOverrideWinnerForMatch}
                onCreateFulfillment={createFulfillmentForMatch}
                onLeave={leaveMatch}
                onCancelMatch={cancelMatch}
                isAdmin={isAdmin}
                verificationRecommendation={verificationRecommendations[match.id]}
                refereeAction={refereeActions[match.id]}
                disputeDraft={disputeDrafts[match.id]}
                onDisputeDraftChange={updateDisputeDraft}
                overrideDraft={overrideDrafts[match.id]}
                onOverrideDraftChange={updateOverrideDraft}
                actionLoading={flowActionLoading}
              />
            ))
          ) : (
            <div className="rounded-xl border border-purple-700/20 bg-black/25 p-8 text-center text-sm text-purple-300">
              {matchView === 'mine' ? 'You have not created or joined any prize rooms yet.' : 'No active prize rooms yet. Create one above and refresh the page to confirm it remains.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NorthPole() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('build');
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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-black via-purple-950 to-black text-white">
      <NorthPoleLandingHero />

      <div id="north-pole-flow" className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <PublicBetaBadge />
          <Badge className="border border-green-700/30 bg-green-900/40 text-green-300">
            <ShieldCheck className="mr-1 h-3 w-3" />Persisted matches
          </Badge>
          <Badge className="border border-pink-700/30 bg-pink-900/40 text-pink-300">
            <Heart className="mr-1 h-3 w-3" />The Poles Foundation
          </Badge>
          {user && (
            <Badge className="border border-purple-700/30 bg-purple-900/40 text-purple-300">
              {user.full_name || user.email}
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full border border-purple-700/30 bg-purple-900/40">
            <TabsTrigger value="build" className="flex-1 text-purple-200 data-[state=active]:bg-purple-700">
              <Gift className="mr-2 h-4 w-4" />Build a Prize Room
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex-1 text-purple-200 data-[state=active]:bg-purple-700">
                <Settings2 className="mr-2 h-4 w-4" />Admin Fulfillment
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="build">
            <RealNorthPoleFlow user={user} />
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
