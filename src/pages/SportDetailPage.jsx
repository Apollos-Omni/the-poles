import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { ADMIN_ROLES, userHasRole } from '@/lib/rbac';
import { BUILT_IN_GAME_FORMATS, DEFAULT_RULE_SETS, BUILT_IN_SPORTS, findSportBySlug } from '@/lib/sports/sportCatalog';
import { getSportTemplate } from '@/lib/south-pole/statTemplates';
import { ArrowLeft, BarChart3, ClipboardList, Layers, Trophy } from 'lucide-react';

const EmptyState = ({ children }) => (
  <div className="rounded-xl border border-purple-700/25 bg-black/30 p-8 text-center text-purple-100/60">
    <Trophy className="mx-auto mb-2 h-8 w-8 text-purple-300/50" />
    {children}
  </div>
);

function canViewCustomSport(row, user) {
  const status = row?.approvalStatus || row?.approval_status;
  const isPrivate = row?.privateToCreator === true || row?.private_to_creator === true || status === 'draft';
  if (status === 'approved' && !isPrivate) return true;
  const ids = [user?.id, user?.email, user?.auth_user_id].filter(Boolean).map(String);
  if (!ids.length) return false;
  if (userHasRole(user, ADMIN_ROLES)) return true;
  const creatorId = row?.submittedByUserId || row?.submitted_by_user_id || row?.createdByUserId || row?.created_by_user_id;
  if (creatorId && ids.includes(String(creatorId))) return true;
  const leagueMemberIds = row?.leagueMemberIds || row?.league_member_ids || [];
  return leagueMemberIds.some((id) => ids.includes(String(id)));
}

export default function SportDetailPage() {
  const { slug } = useParams();
  const builtInSport = useMemo(() => findSportBySlug(slug, BUILT_IN_SPORTS), [slug]);
  const [user, setUser] = useState(null);
  const [customSport, setCustomSport] = useState(null);
  const [isLoading, setIsLoading] = useState(!builtInSport);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      base44.auth.me().catch(() => null),
      builtInSport ? Promise.resolve([]) : base44.entities.CustomSportSubmission.list('-created_date', 100).catch(() => []),
      builtInSport ? Promise.resolve([]) : base44.entities.Sport.list('-created_date', 100).catch(() => []),
    ]).then(([loadedUser, rows, sportRows]) => {
      if (!mounted) return;
      setUser(loadedUser);
      const customRows = [...(rows || []), ...(sportRows || [])];
      const found = customRows.find((row) => row.id === slug || row.slug === slug || String(row.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === slug);
      setCustomSport(found && canViewCustomSport(found, loadedUser) ? found : null);
      setIsLoading(false);
    });
    return () => { mounted = false; };
  }, [builtInSport, slug]);

  const sport = builtInSport || (customSport ? {
    id: customSport.id,
    slug: customSport.slug || customSport.id,
    name: customSport.name,
    category: customSport.category || 'Custom / Other',
    description: customSport.description || 'Custom sport/game type.',
    isBuiltIn: false,
  } : null);

  const statTemplate = getSportTemplate(sport?.slug);
  const formats = builtInSport
    ? BUILT_IN_GAME_FORMATS.filter((format) => format.sportId === sport?.slug)
    : (customSport?.proposedFormats || customSport?.proposed_formats || []);
  const rules = builtInSport
    ? DEFAULT_RULE_SETS.filter((rule) => rule.sportId === sport?.slug)
    : [customSport?.proposedRules || customSport?.proposed_rules].filter(Boolean);
  const statTemplates = builtInSport
    ? (statTemplate?.formats || [])
    : (customSport?.proposedStatFields || customSport?.proposed_stat_fields || []);

  if (isLoading) {
    return <div className="min-h-screen bg-black p-8 text-purple-100">Loading sport/game type...</div>;
  }

  if (!sport) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">
        <Link to="/SouthPole" className="text-purple-300">Back to South Pole</Link>
        <p className="mt-6 text-purple-100/70">Sport/game type not found or not available to this account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black px-3 py-4 text-white sm:px-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to="/SouthPole" className="inline-flex items-center text-sm text-purple-300 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to South Pole
        </Link>
        <div>
          <Badge className="mb-3 border border-cyan-500/30 bg-cyan-500/15 text-cyan-100">{sport.category}</Badge>
          {!sport.isBuiltIn && <Badge className="mb-3 ml-2 border border-purple-500/30 bg-purple-500/15 text-purple-100">Custom</Badge>}
          <h1 className="text-3xl font-black md:text-4xl">{sport.name}</h1>
          <p className="mt-2 max-w-3xl text-purple-100/70">{sport.description}</p>
        </div>

        <Tabs defaultValue="overview">
          <div className="-mx-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex h-auto min-w-max border border-purple-700/30 bg-black/40 p-1">
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="overview">Overview</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="formats">Formats</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="rules">Rules</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="stats">Stat Templates</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="leagues">Leagues</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="challenges">Challenges</TabsTrigger>
              <TabsTrigger className="shrink-0 whitespace-nowrap" value="leaderboards">Leaderboards</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="mt-4 rounded-xl border border-purple-700/25 bg-black/30 p-5">
            <p className="text-sm text-purple-100/75">
              {sport.isBuiltIn
                ? 'Built-in sports are available to everyone.'
                : 'Custom sports can be private to a league until approved by an admin.'}
            </p>
            {customSport?.skillFactors && <p className="mt-3 text-sm text-purple-100/65">Skill factors: {customSport.skillFactors}</p>}
            {customSport?.winnerDeterminationMethod && <p className="mt-2 text-sm text-purple-100/65">Winner determination: {customSport.winnerDeterminationMethod}</p>}
          </TabsContent>
          <TabsContent value="formats" className="mt-4 grid gap-3 md:grid-cols-2">
            {formats.length ? formats.map((format, index) => (
              <div key={format.id || format.name || index} className="rounded-xl border border-purple-700/25 bg-black/30 p-4">
                <Layers className="mb-2 h-5 w-5 text-purple-300" />
                <h2 className="font-bold">{format.name || format.label || 'Custom Format'}</h2>
                <p className="mt-1 text-sm text-purple-100/65">{format.rulesSummary || format.description || format.winnerDeterminationMethod || 'Skill/performance-based format.'}</p>
              </div>
            )) : <EmptyState>No formats yet.</EmptyState>}
          </TabsContent>
          <TabsContent value="rules" className="mt-4 space-y-3">
            {rules.length ? rules.map((rule, index) => (
              <div key={rule.id || index} className="rounded-xl border border-purple-700/25 bg-black/30 p-4">
                <ClipboardList className="mb-2 h-5 w-5 text-purple-300" />
                <h2 className="font-bold">{rule.title || 'Custom Rules'}</h2>
                <p className="mt-1 whitespace-pre-wrap text-sm text-purple-100/65">{rule.rulesText || rule.rules || 'No rule text supplied.'}</p>
              </div>
            )) : <EmptyState>No rules yet.</EmptyState>}
          </TabsContent>
          <TabsContent value="stats" className="mt-4 space-y-3">
            {statTemplates.length ? statTemplates.map((template, index) => (
              <div key={template.id || template.key || index} className="rounded-xl border border-purple-700/25 bg-black/30 p-4">
                <BarChart3 className="mb-2 h-5 w-5 text-purple-300" />
                <h2 className="font-bold">{template.label || template.name || 'Custom Stat Field'}</h2>
                <p className="mt-2 text-sm text-purple-100/65">
                  {template.fields ? template.fields.map((field) => field.label).join(', ') : template.description || template.formula || 'Custom stat field.'}
                </p>
              </div>
            )) : <EmptyState>No stat templates yet.</EmptyState>}
          </TabsContent>
          <TabsContent value="leagues" className="mt-4"><EmptyState>No leagues yet.</EmptyState></TabsContent>
          <TabsContent value="challenges" className="mt-4"><EmptyState>No challenges yet.</EmptyState></TabsContent>
          <TabsContent value="leaderboards" className="mt-4"><EmptyState>No leaderboards yet.</EmptyState></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
