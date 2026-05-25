import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import {
  canManageLeague,
  canVerifyResults,
  getCurrentLeagueRole,
  mergeDemoAndSavedLeagues,
  normalizeLeagueOrganization,
} from '@/lib/league-hub/leagueHubData';
import {
  LeagueAdminTab,
  LeagueDiscussionTab,
  LeagueGamePrepTab,
  LeagueMediaTab,
  LeagueMembersTab,
  LeagueOverviewTab,
  LeaguePlayerProfilesTab,
  LeaguePrizeRewardsTab,
  LeagueScheduleTab,
  LeagueStandingsTab,
  LeagueTeamsTab,
} from '@/components/league-hub/LeagueTabs';
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck, Trophy, Users } from 'lucide-react';
import { VideoBackgroundCard, mediaImages } from '@/components/media/MediaPrimitives';

export default function LeagueOrganizationDetailPage() {
  const { slug } = useParams();
  const [leagues, setLeagues] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      base44.entities.LeagueOrganization.list('-created_date', 100).catch(() => []),
      base44.auth.me().catch(() => null),
    ]).then(([rows, user]) => {
      if (!mounted) return;
      setLeagues(mergeDemoAndSavedLeagues(rows || []));
      setCurrentUser(user);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const league = useMemo(() => {
    const found = leagues.find((item) => item.slug === slug || item.id === slug);
    if (!found) return null;
    return { ...found, currentRole: getCurrentLeagueRole(found, currentUser) };
  }, [currentUser, leagues, slug]);

  const showAdmin = league && (canManageLeague(league, currentUser) || canVerifyResults(league, currentUser));

  const updateLeague = async (patch) => {
    if (!league) return;
    const nextLeague = normalizeLeagueOrganization({ ...league, ...patch, updatedAt: new Date().toISOString() });
    setLeagues((current) => {
      const exists = current.some((item) => item.id === league.id || item.slug === league.slug);
      return exists
        ? current.map((item) => (item.id === league.id || item.slug === league.slug ? nextLeague : item))
        : [nextLeague, ...current];
    });
    const updated = await base44.entities.LeagueOrganization.update(league.id, nextLeague).catch(() => null);
    if (!updated) {
      await base44.entities.LeagueOrganization.create(nextLeague).catch(() => null);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black p-8 text-purple-100">Loading league organization...</div>;
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">
        <Link to="/Leagues" className="text-purple-300">Back to League Hub</Link>
        <p className="mt-6 text-purple-100/70">League organization not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/80 to-black px-3 py-4 text-white sm:px-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link to="/Leagues" className="inline-flex items-center text-sm text-purple-300 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to League Hub
        </Link>

        <div className="overflow-hidden rounded-2xl border border-purple-700/25 bg-black/35">
          <div
            className="min-h-56 bg-cover bg-center"
            style={{
              backgroundImage: league.coverImageUrl
                ? `linear-gradient(90deg, rgba(0,0,0,0.78), rgba(22,8,45,0.35)), url(${league.coverImageUrl})`
                : `linear-gradient(90deg, rgba(0,0,0,0.78), rgba(22,8,45,0.35)), url(${mediaImages.leagueField})`,
            }}
          >
            <div className="flex min-h-56 flex-col justify-end p-5 md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-black shadow-lg sm:h-20 sm:w-20">
                    {league.logoUrl ? <img src={league.logoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <Trophy className="h-10 w-10 text-cyan-100" />}
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge className="border border-cyan-500/25 bg-cyan-500/15 text-cyan-100">{league.sportName}</Badge>
                      <Badge className="border border-green-500/25 bg-green-500/15 text-green-100">
                        <ShieldCheck className="mr-1 h-3 w-3" /> {league.verificationStatus}
                      </Badge>
                      <Badge className="border border-purple-500/25 bg-purple-500/15 text-purple-100">{league.currentRole}</Badge>
                    </div>
                    <h1 className="text-2xl font-black sm:text-3xl md:text-5xl">{league.name}</h1>
                    <p className="mt-2 max-w-3xl text-sm text-purple-100/75">{league.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-purple-100/75">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1"><MapPin className="h-3 w-3" /> {league.location || 'Online'}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1"><CalendarDays className="h-3 w-3" /> {league.seasonStart || 'TBD'} to {league.seasonEnd || 'TBD'}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1"><Users className="h-3 w-3" /> {league.members?.length || 0} members</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1">Visibility: {league.visibility || 'public'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <VideoBackgroundCard title="Season media" description="Highlights, game-day posts, and team clips make the league feel active." image={mediaImages.southTeam} label="Media" metric="Reel" />
          <VideoBackgroundCard title="Training path" description="Prep, rules, and verified stats give competitors confidence before they join." image={mediaImages.southCourt} label="Prep" metric="Ready" />
          <VideoBackgroundCard title="Rewards room" description="Prize and sponsor cards make the season easier to promote." image={mediaImages.catalogShelf} label="Rewards" metric="Prize" />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <div className="-mx-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex h-auto min-w-max border border-purple-700/30 bg-black/40 p-1">
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="overview">Overview</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="members">Members</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="teams">Teams</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="schedule">Schedule</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="standings">Standings</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="players">Player Profiles</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="media">Media</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="discussion">Discussion</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="prep">Game Prep</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="rewards">Prizes / Rewards</TabsTrigger>
              {showAdmin && <TabsTrigger className="shrink-0 whitespace-nowrap" value="admin">Admin</TabsTrigger>}
            </TabsList>
          </div>
          <TabsContent value="overview"><LeagueOverviewTab league={league} /></TabsContent>
          <TabsContent value="members"><LeagueMembersTab league={league} /></TabsContent>
          <TabsContent value="teams"><LeagueTeamsTab league={league} /></TabsContent>
          <TabsContent value="schedule"><LeagueScheduleTab league={league} currentUser={currentUser} onUpdateLeague={updateLeague} /></TabsContent>
          <TabsContent value="standings"><LeagueStandingsTab league={league} /></TabsContent>
          <TabsContent value="players"><LeaguePlayerProfilesTab league={league} /></TabsContent>
          <TabsContent value="media"><LeagueMediaTab league={league} currentUser={currentUser} onUpdateLeague={updateLeague} /></TabsContent>
          <TabsContent value="discussion"><LeagueDiscussionTab league={league} currentUser={currentUser} onUpdateLeague={updateLeague} /></TabsContent>
          <TabsContent value="prep"><LeagueGamePrepTab league={league} currentUser={currentUser} onUpdateLeague={updateLeague} /></TabsContent>
          <TabsContent value="rewards"><LeaguePrizeRewardsTab league={league} currentUser={currentUser} onUpdateLeague={updateLeague} /></TabsContent>
          {showAdmin && <TabsContent value="admin"><LeagueAdminTab league={league} currentUser={currentUser} onUpdateLeague={updateLeague} /></TabsContent>}
        </Tabs>
      </div>
    </div>
  );
}
