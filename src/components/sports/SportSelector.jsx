import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { ADMIN_ROLES, userHasRole } from '@/lib/rbac';
import { BUILT_IN_SPORTS, groupedSports } from '@/lib/sports/sportCatalog';
import { Plus, Search } from 'lucide-react';

export default function SportSelector({ value, onChange, label = 'Sport / game type', allowCustom = true }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [customSports, setCustomSports] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.CustomSportSubmission.list('-created_date', 100).catch(() => []),
      base44.entities.Sport.list('-created_date', 100).catch(() => []),
    ]).then(([user, rows, sportRows]) => {
      if (!mounted) return;
      setCurrentUser(user);
      setCustomSports([...(rows || []), ...(sportRows || []).filter((row) => row.isBuiltIn !== true && row.is_built_in !== true)]);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const sports = useMemo(() => {
    const userIds = [currentUser?.id, currentUser?.email, currentUser?.auth_user_id].filter(Boolean).map(String);
    const isAdmin = userHasRole(currentUser, ADMIN_ROLES);
    const visibleCustom = customSports.filter((item) => {
      const status = item.approvalStatus || item.approval_status;
      const isApprovedPublic = status === 'approved' && item.privateToCreator !== true && item.private_to_creator !== true;
      const creatorId = item.submittedByUserId || item.submitted_by_user_id || item.createdByUserId || item.created_by_user_id;
      const leagueMemberIds = item.leagueMemberIds || item.league_member_ids || [];

      // Privacy rule: public approved custom sports can be shown to everyone.
      // Draft/private custom sports are only visible to their creator, connected league members, or platform admins.
      // Without a known user identity, only built-in sports and approved public custom sports are shown.
      if (isApprovedPublic) return true;
      if (!userIds.length) return false;
      if (isAdmin) return true;
      if (creatorId && userIds.includes(String(creatorId))) return true;
      return leagueMemberIds.some((id) => userIds.includes(String(id)));
    });

    const dedupedCustom = [];
    const seenCustomKeys = new Set();
    visibleCustom.forEach((item) => {
      const key = String(item.slug || item.id || item.name || '').toLowerCase();
      if (!key || seenCustomKeys.has(key)) return;
      seenCustomKeys.add(key);
      dedupedCustom.push(item);
    });

    const approvedCustom = dedupedCustom.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug || item.id,
      category: item.category || 'Custom / Other',
      description: item.description || 'Custom sport/game type.',
      isBuiltIn: false,
      isActive: true,
      approvalStatus: item.approvalStatus || item.approval_status,
      privateToCreator: item.privateToCreator || item.private_to_creator,
      defaultFormats: item.proposedFormats || item.proposed_formats || [],
      proposedRules: item.proposedRules || item.proposed_rules,
      proposedStatFields: item.proposedStatFields || item.proposed_stat_fields,
    }));
    const all = [...BUILT_IN_SPORTS, ...approvedCustom];
    const q = query.trim().toLowerCase();
    return q
      ? all.filter((sport) => `${sport.name} ${sport.category} ${sport.description}`.toLowerCase().includes(q))
      : all;
  }, [currentUser, customSports, query]);

  const selected = sports.find((sport) => sport.id === value || sport.slug === value) || null;

  return (
    <div className="space-y-3 rounded-xl border border-purple-700/25 bg-black/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-xs text-purple-300/60">Choose a built-in sport/game or create a custom skill-based format.</p>
        </div>
        {selected && (
          <Badge className="border border-cyan-500/30 bg-cyan-500/15 text-cyan-100">{selected.name}</Badge>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300/50" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sports, games, esports, or challenges..."
          className="border-purple-700/40 bg-black/40 pl-9 text-white"
        />
      </div>

      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {groupedSports(sports).map((group) => (
          <div key={group.category}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-300/60">{group.category}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.sports.map((sport) => (
                <button
                  key={`${sport.isBuiltIn ? 'built-in' : 'custom'}-${sport.id}`}
                  type="button"
                  onClick={() => onChange?.(sport)}
                  className={`rounded-lg border p-3 text-left text-sm transition ${
                    selected?.id === sport.id
                      ? 'border-cyan-400 bg-cyan-500/15 text-white'
                      : 'border-purple-700/25 bg-black/25 text-purple-100 hover:border-purple-400/60'
                  }`}
                >
                  <span className="font-semibold">{sport.name}</span>
                  <span className="mt-1 block text-xs text-purple-200/55">{sport.description}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allowCustom && (
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/CreateCustomSport')}
          className="w-full border-purple-700/40 text-purple-200 hover:bg-purple-900/40"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Custom Sport/Game
        </Button>
      )}
    </div>
  );
}
