import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import SportSelector from '@/components/sports/SportSelector';
import SPSportStatTemplateSelector from '@/components/south-pole/SPSportStatTemplateSelector';
import { getFormatTemplate } from '@/lib/south-pole/statTemplates';
import { slugifyLeagueName } from '@/lib/league-hub/leagueHubData';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MediaHero, VideoBackgroundCard, mediaImages } from '@/components/media/MediaPrimitives';

export default function CreateLeagueOrganizationPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    logoUrl: '',
    coverImageUrl: '',
    location: '',
    sportId: 'basketball',
    sportName: 'Basketball',
    sportCategory: 'Team Sports',
    sportType: 'basketball',
    game_format_id: 'basketball_5v5',
    stat_template_id: 'basketball_5v5_player',
    stats_mode: 'basic',
    seasonStart: '',
    seasonEnd: '',
    rules: '',
    organizerName: '',
    contactInfo: '',
    description: '',
    visibility: 'public',
    verificationStatus: 'self-reported',
    customRules: null,
    customStatFields: [],
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSportSelect = (sport) => {
    const sportType = sport.slug || sport.id;
    const formatTemplate = getFormatTemplate(sportType);
    setForm((current) => ({
      ...current,
      sportId: sport.id,
      sportName: sport.name,
      sportCategory: sport.category,
      sportType,
      game_format_id: formatTemplate?.id || 'basic_custom_format',
      stat_template_id: formatTemplate?.templateId || 'basic_custom_stats',
      customRules: sport.proposedRules || null,
      customStatFields: sport.proposedStatFields || [],
      rules: sport.proposedRules?.rules || current.rules,
    }));
  };

  const setStatTemplate = (patch) => {
    setForm((current) => ({ ...current, ...patch, sportType: patch.sport_type || current.sportType }));
  };

  const save = async () => {
    setError('');
    if (!form.name.trim()) return setError('League organization name is required.');
    if (!form.description.trim()) return setError('Description is required.');
    if (!form.rules.trim()) return setError('Rules are required.');
    setSaving(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const slug = slugifyLeagueName(form.name);
      const created = await base44.entities.LeagueOrganization.create({
        ...form,
        slug,
        ownerUserId: user?.id || user?.email || 'anonymous',
        organizerEmail: user?.email || '',
        members: [
          {
            id: `${slug}-owner`,
            userId: user?.id || user?.email || 'anonymous',
            email: user?.email || '',
            name: user?.full_name || user?.name || form.organizerName || 'League Owner',
            role: 'owner',
            team: 'League Admin',
            verificationLevel: 'organizer verified',
          },
        ],
        teams: [],
        schedule: [],
        standings: [],
        playerProfiles: [],
        media: [],
        discussion: [
          {
            id: `${slug}-welcome`,
            type: 'Announcement',
            author: form.organizerName || user?.name || 'League organizer',
            body: 'League organization created. Add teams, schedule events, and verified performance records as the season gets started.',
            createdAt: new Date().toISOString().slice(0, 10),
          },
        ],
        prizeRewards: [],
      });
      navigate(`/Leagues/${created.slug || slug}`);
    } catch (err) {
      setError(err.message || 'Could not create league organization.');
    } finally {
      setSaving(false);
    }
  };

  const isBasketball = form.sportType === 'basketball';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/80 to-black px-3 py-4 text-white sm:px-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to="/Leagues" className="inline-flex items-center text-sm text-purple-300 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to League Hub
        </Link>
        <div className="overflow-hidden rounded-3xl border border-purple-700/20">
          <MediaHero
            eyebrow="Create league"
            title="Give your community a home court."
            description="Set the sport, rules, season, media, and verification path so players feel like they are joining something real."
            image={mediaImages.southCourt}
            tone="cyan"
            badges={["League profile", "Season media", "Verified stats", "Reward tracking"]}
          >
            <VideoBackgroundCard title="Organizer invitation" description="A strong cover image turns a form into a season announcement." image={mediaImages.leagueField} label="Create" metric="Host" />
          </MediaHero>
        </div>
        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}

        <div className="grid gap-4 rounded-xl border border-purple-700/20 bg-black/20 p-4 sm:grid-cols-2">
          <label className="space-y-1">
            <Label>Name</Label>
            <Input value={form.name} onChange={(event) => set('name', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Location</Label>
            <Input value={form.location} onChange={(event) => set('location', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Logo URL</Label>
            <Input value={form.logoUrl} onChange={(event) => set('logoUrl', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Cover image URL</Label>
            <Input value={form.coverImageUrl} onChange={(event) => set('coverImageUrl', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Season start</Label>
            <Input type="date" value={form.seasonStart} onChange={(event) => set('seasonStart', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Season end</Label>
            <Input type="date" value={form.seasonEnd} onChange={(event) => set('seasonEnd', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Organizer</Label>
            <Input value={form.organizerName} onChange={(event) => set('organizerName', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Contact info</Label>
            <Input value={form.contactInfo} onChange={(event) => set('contactInfo', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Visibility</Label>
            <select value={form.visibility} onChange={(event) => set('visibility', event.target.value)} className="h-9 w-full rounded-md border border-purple-700/40 bg-black/40 px-3 text-sm text-white">
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="invite-only">Invite-only</option>
            </select>
          </label>
          <label className="space-y-1">
            <Label>Verification status</Label>
            <select value={form.verificationStatus} onChange={(event) => set('verificationStatus', event.target.value)} className="h-9 w-full rounded-md border border-purple-700/40 bg-black/40 px-3 text-sm text-white">
              <option value="self-reported">Self-reported</option>
              <option value="opponent confirmed">Opponent confirmed</option>
              <option value="scorekeeper verified">Scorekeeper verified</option>
              <option value="organizer verified">Organizer verified</option>
              <option value="video reviewed">Video reviewed</option>
              <option value="admin verified">Admin verified</option>
              <option value="system verified">System verified</option>
            </select>
          </label>
          <label className="space-y-1 sm:col-span-2">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(event) => set('description', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
        </div>

        <SportSelector value={form.sportId || form.sportType} onChange={handleSportSelect} />
        {isBasketball ? (
          <SPSportStatTemplateSelector value={{ sport_type: form.sportType, game_format_id: form.game_format_id, stat_template_id: form.stat_template_id, stats_mode: form.stats_mode }} onChange={setStatTemplate} />
        ) : form.customRules || form.customStatFields?.length ? (
          <div className="rounded-xl border border-cyan-700/25 bg-cyan-950/15 p-4 text-sm text-cyan-100/80">
            Custom rules and stat fields are loaded for {form.sportName}.
          </div>
        ) : (
          <div className="rounded-xl border border-purple-700/25 bg-purple-950/20 p-4 text-sm text-purple-100/75">
            Basic stat template available. Advanced template coming soon.
          </div>
        )}

        <label className="block space-y-1">
          <Label>League rules</Label>
          <Textarea rows={5} value={form.rules} onChange={(event) => set('rules', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
        </label>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="w-full bg-purple-700 text-white hover:bg-purple-600 sm:w-auto">
            <Save className="mr-2 h-4 w-4" /> {saving ? 'Creating...' : 'Create League Organization'}
          </Button>
        </div>
      </div>
    </div>
  );
}
