import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { mergeDemoAndSavedLeagues } from '@/lib/league-hub/leagueHubData';
import { CalendarDays, Loader2, MapPin, Plus, Search, ShieldCheck, Trophy, Users } from 'lucide-react';

export default function LeagueHubPage() {
  const [leagues, setLeagues] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.entities.LeagueOrganization.list('-created_date', 100).catch(() => []).then((rows) => {
      if (!mounted) return;
      setLeagues(mergeDemoAndSavedLeagues(rows || []));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leagues;
    return leagues.filter((league) => `${league.name} ${league.sportName} ${league.location} ${league.description}`.toLowerCase().includes(q));
  }, [leagues, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/80 to-black px-3 py-4 text-white sm:px-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="overflow-hidden rounded-2xl border border-purple-700/25 bg-black/35">
          <div className="bg-gradient-to-r from-purple-900/80 via-slate-900 to-cyan-900/60 p-6 md:p-8">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Badge className="mb-3 border border-cyan-400/25 bg-cyan-400/15 text-cyan-100">South Pole League Hub</Badge>
                <h1 className="text-3xl font-black md:text-5xl">League Organization Hub</h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-purple-100/70">
                  Digital homes for leagues, teams, clubs, gyms, schools, gaming groups, and sports organizations built around skill-based contests, verified performance, and league reward tracking.
                </p>
              </div>
              <Link to="/Leagues/Create">
                <Button className="w-full bg-purple-700 text-white hover:bg-purple-600 sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Create League Organization
                </Button>
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4"><p className="text-2xl font-bold">{leagues.length}</p><p className="text-xs text-purple-200/60">League homes</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4"><p className="text-2xl font-bold">{leagues.reduce((sum, league) => sum + (league.members?.length || 0), 0)}</p><p className="text-xs text-purple-200/60">Members represented</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4"><p className="text-2xl font-bold">Beta</p><p className="text-xs text-purple-200/60">Simulated payments and fulfillment</p></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300/45" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search leagues, sports, locations..." className="border-purple-700/40 bg-black/40 pl-9 text-white" />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-purple-700/20 bg-black/25 p-10 text-center text-purple-200/60">
            <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-purple-200" />
            Loading league hub...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-purple-700/20 bg-black/25 p-10 text-center text-purple-200/60">
            <Trophy className="mx-auto mb-3 h-9 w-9 text-purple-300/45" />
            <p className="font-semibold text-purple-100/80">No league organizations found.</p>
            <p className="mt-1 text-sm text-purple-200/50">Try a different search or create a league organization.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((league) => (
              <Link key={league.id || league.slug} to={`/Leagues/${league.slug}`} className="group overflow-hidden rounded-2xl border border-purple-700/25 bg-black/35 transition hover:border-cyan-400/50">
                <div className="h-28 bg-gradient-to-r from-purple-900/70 via-slate-900 to-cyan-900/50" />
                <div className="p-4">
                  <div className="-mt-12 mb-3 flex items-end justify-between gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-black text-white shadow-lg">
                      <Trophy className="h-8 w-8 text-cyan-200" />
                    </div>
                    <Badge className="border border-green-500/25 bg-green-500/15 text-green-100">
                      <ShieldCheck className="mr-1 h-3 w-3" /> {league.verificationStatus}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-cyan-100">{league.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-purple-100/65">{league.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-purple-100/70">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-900/35 px-2 py-1"><Trophy className="h-3 w-3" /> {league.sportName}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-900/35 px-2 py-1"><MapPin className="h-3 w-3" /> {league.location || 'Online'}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-900/35 px-2 py-1"><CalendarDays className="h-3 w-3" /> {league.seasonStart || 'TBD'}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-900/35 px-2 py-1"><Users className="h-3 w-3" /> {league.members?.length || 0} members</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
