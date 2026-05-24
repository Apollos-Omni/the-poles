import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SportSelector from '@/components/sports/SportSelector';
import {
  canManageGamePrep,
  canManageLeague,
  canPostLeagueContent,
  canVerifyResults,
  getCurrentLeagueRole,
} from '@/lib/league-hub/leagueHubData';
import {
  CalendarDays,
  Camera,
  ClipboardList,
  Crown,
  Dumbbell,
  FileCheck2,
  MessageSquare,
  ShieldCheck,
  Shirt,
  Trophy,
  UserRound,
} from 'lucide-react';

const ROLE_OPTIONS = ['owner', 'organizer', 'coach', 'player', 'referee', 'scorekeeper', 'sponsor', 'viewer'];
const VERIFICATION_OPTIONS = ['self-reported', 'opponent confirmed', 'scorekeeper verified', 'organizer verified', 'video reviewed', 'admin verified', 'system verified'];
const EVENT_TYPES = ['game', 'practice', 'tournament', 'playoff', 'championship', 'meeting'];
const EVENT_STATUSES = ['scheduled', 'live', 'under_review', 'completed', 'cancelled'];
const POST_CATEGORIES = ['Announcement', 'Motivation', 'Respectful trash talk', 'Strategy', 'Game prep', 'Congratulations', 'General'];
const MEDIA_TYPES = ['Image URL', 'Video URL', 'Clip URL', 'Screenshot URL', 'Event flyer URL'];
const PREP_VISIBILITY = ['team-only', 'league members', 'public'];
const EVIDENCE_TYPES = ['image', 'video', 'clip', 'screenshot', 'scorecard', 'referee note', 'scorekeeper note', 'organizer note'];
const EVIDENCE_STATUSES = ['submitted', 'under_review', 'approved', 'rejected', 'needs_more_info'];

const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const toNumber = (value) => Number(value || 0);

const Panel = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-purple-700/25 bg-black/30 p-4 ${className}`}>{children}</div>
);

const EmptyState = ({ children }) => (
  <Panel className="text-center text-sm text-purple-100/60">
    <Trophy className="mx-auto mb-2 h-7 w-7 text-purple-300/45" />
    {children}
  </Panel>
);

const RoleBadge = ({ children }) => (
  <Badge className="border border-cyan-500/25 bg-cyan-500/15 text-cyan-100">{children}</Badge>
);

const VerificationBadge = ({ children }) => (
  <Badge className="border border-green-500/25 bg-green-500/15 text-green-100">
    <ShieldCheck className="mr-1 h-3 w-3" /> {children || 'self-reported'}
  </Badge>
);

const FormGrid = ({ children }) => <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
const ActionRow = ({ children }) => <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap [&>button]:w-full sm:[&>button]:w-auto">{children}</div>;

const Field = ({ label, children, wide = false }) => (
  <label className={`space-y-1 ${wide ? 'md:col-span-2' : ''}`}>
    <Label className="text-purple-200">{label}</Label>
    {children}
  </label>
);

const TextInput = (props) => <Input {...props} className="min-w-0 border-purple-700/40 bg-black/40 text-white" />;
const TextBox = (props) => <Textarea {...props} className="min-w-0 border-purple-700/40 bg-black/40 text-white" />;
const SelectInput = ({ value, onChange, options }) => (
  <select value={value || ''} onChange={(event) => onChange(event.target.value)} className="h-10 w-full min-w-0 rounded-md border border-purple-700/40 bg-black/40 px-3 text-sm text-white">
    {options.map((option) => <option key={option} value={option}>{option}</option>)}
  </select>
);

const upsertById = (items = [], nextItem) => {
  const key = nextItem.id || id('item');
  const normalized = { ...nextItem, id: key };
  return items.some((item) => item.id === key) ? items.map((item) => item.id === key ? normalized : item) : [...items, normalized];
};

const displayName = (user = {}) => user?.name || user?.full_name || user?.email || 'League member';
const userId = (user = {}) => user?.id || user?.auth_user_id || user?.email || 'unknown-user';
const isTrustedScoreSubmitter = (role) => ['owner', 'organizer', 'scorekeeper', 'platform_admin', 'super_admin'].includes(role);

const StatusBadge = ({ children }) => (
  <Badge className="border border-yellow-500/30 bg-yellow-500/15 text-yellow-100">{children}</Badge>
);

function evidenceCountForEvent(league, eventId) {
  return (league.evidenceRecords || []).filter((record) => record.scheduleEventId === eventId).length;
}

function makeDisputeRecord({ league, targetType, targetId, reason, currentUser }) {
  return {
    id: id('dispute'),
    leagueId: league.id,
    targetType,
    targetId,
    disputed: true,
    disputeReason: reason,
    disputedByUserId: userId(currentUser),
    disputedByName: displayName(currentUser),
    disputeStatus: 'open',
    disputeResolutionNotes: '',
    createdAt: new Date().toISOString(),
  };
}

function inferMatchTeams(event = {}) {
  if (event.homeTeam || event.awayTeam) return { home: event.homeTeam, away: event.awayTeam };
  const parts = String(event.title || '').split(/\s+vs\.?\s+/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return { home: parts[0], away: parts[1] };
  return { home: '', away: '' };
}

function updateStandingsFromScore(standings = [], event, patch) {
  const inferred = inferMatchTeams(event);
  const home = patch.homeTeam || event.homeTeam || inferred.home;
  const away = patch.awayTeam || event.awayTeam || inferred.away;
  const score = patch.score || patch.finalScore || '';
  const [homeScoreRaw, awayScoreRaw] = String(score).split(/[-:]/).map((part) => Number(part.trim()));
  if (!home || !away || Number.isNaN(homeScoreRaw) || Number.isNaN(awayScoreRaw)) return standings;
  const winner = patch.winner || (homeScoreRaw > awayScoreRaw ? home : awayScoreRaw > homeScoreRaw ? away : '');
  const ensure = (team) => standings.find((row) => row.team === team) || { id: id('standing'), rank: standings.length + 1, team, wins: 0, losses: 0, ties: 0, points: 0, scoreDifferential: 0, streak: '', gamesPlayed: 0 };
  const rows = standings.filter((row) => row.team !== home && row.team !== away);
  const homeRow = { ...ensure(home) };
  const awayRow = { ...ensure(away) };
  homeRow.gamesPlayed = toNumber(homeRow.gamesPlayed) + 1;
  awayRow.gamesPlayed = toNumber(awayRow.gamesPlayed) + 1;
  homeRow.scoreDifferential = toNumber(homeRow.scoreDifferential) + homeScoreRaw - awayScoreRaw;
  awayRow.scoreDifferential = toNumber(awayRow.scoreDifferential) + awayScoreRaw - homeScoreRaw;
  if (homeScoreRaw === awayScoreRaw) {
    homeRow.ties = toNumber(homeRow.ties) + 1;
    awayRow.ties = toNumber(awayRow.ties) + 1;
    homeRow.points = toNumber(homeRow.points) + 1;
    awayRow.points = toNumber(awayRow.points) + 1;
    homeRow.streak = 'T1';
    awayRow.streak = 'T1';
  } else {
    const homeWon = winner === home;
    const winRow = homeWon ? homeRow : awayRow;
    const lossRow = homeWon ? awayRow : homeRow;
    winRow.wins = toNumber(winRow.wins) + 1;
    winRow.points = toNumber(winRow.points) + 2;
    winRow.streak = 'W1';
    lossRow.losses = toNumber(lossRow.losses) + 1;
    lossRow.streak = 'L1';
  }
  return [...rows, homeRow, awayRow]
    .sort((a, b) => toNumber(b.points) - toNumber(a.points) || toNumber(b.wins) - toNumber(a.wins))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function shouldApplyScoreToStandings(event, patch = {}) {
  const score = patch.score || patch.finalScore || event?.score || event?.finalScore;
  return Boolean(score && !event?.scoreApplied);
}

export function LeagueOverviewTab({ league }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel className="lg:col-span-2">
        <div className="flex items-center gap-2 text-purple-200">
          <ClipboardList className="h-5 w-5" />
          <h2 className="font-bold text-white">League Profile</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-purple-100/70">{league.description}</p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><span className="text-purple-300/55">Sport/game</span><p className="font-semibold text-white">{league.sportName}</p></div>
          <div><span className="text-purple-300/55">Location</span><p className="font-semibold text-white">{league.location || 'Online'}</p></div>
          <div><span className="text-purple-300/55">Season dates</span><p className="font-semibold text-white">{league.seasonStart || 'TBD'} to {league.seasonEnd || 'TBD'}</p></div>
          <div><span className="text-purple-300/55">Visibility</span><p className="font-semibold capitalize text-white">{league.visibility || 'public'}</p></div>
          <div><span className="text-purple-300/55">Organizer</span><p className="font-semibold text-white">{league.organizerName || 'League organizer'}</p></div>
          <div><span className="text-purple-300/55">Contact</span><p className="font-semibold text-white">{league.contactInfo || league.organizerEmail || 'TBD'}</p></div>
        </div>
      </Panel>
      <div className="space-y-4">
        <Panel><p className="text-xs uppercase tracking-wide text-purple-300/55">Verification</p><div className="mt-2"><VerificationBadge>{league.verificationStatus}</VerificationBadge></div></Panel>
        <Panel><p className="text-xs uppercase tracking-wide text-purple-300/55">Rules</p><p className="mt-2 text-sm text-purple-100/70">{league.rules || 'Rules will be posted by the organizer.'}</p></Panel>
      </div>
    </div>
  );
}

export function LeagueMembersTab({ league }) {
  if (!league.members?.length) return <EmptyState>No members yet.</EmptyState>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {league.members.map((member) => (
        <Panel key={member.id || member.name}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700/35"><UserRound className="h-5 w-5 text-purple-100" /></div>
              <div>
                <h3 className="font-bold text-white">{member.name}</h3>
                <p className="text-xs text-purple-300/60">{member.team || 'League member'}{member.jerseyNumber ? ` • #${member.jerseyNumber}` : ''}{member.position ? ` • ${member.position}` : ''}</p>
              </div>
            </div>
            <RoleBadge>{member.role}</RoleBadge>
          </div>
          <div className="mt-3"><VerificationBadge>{member.verificationLevel}</VerificationBadge></div>
        </Panel>
      ))}
    </div>
  );
}

export function LeagueTeamsTab({ league }) {
  if (!league.teams?.length) return <EmptyState>No teams yet.</EmptyState>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {league.teams.map((team) => (
        <Panel key={team.id || team.name}>
          <div className="flex items-center gap-2"><Shirt className="h-5 w-5 text-cyan-300" /><h3 className="font-bold text-white">{team.name}</h3></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-purple-100/70">
            <span>Coach: {team.coach || 'TBD'}</span>
            <span>Captain: {team.captain || 'TBD'}</span>
            <span>Players: {team.players || 0}</span>
            <span>Record: {team.record || `${team.wins || 0}-${team.losses || 0}-${team.ties || 0}`}</span>
            <span>PF: {team.pointsFor || 0}</span>
            <span>PA: {team.pointsAgainst || 0}</span>
            <span>Rank: {team.rank || 'TBD'}</span>
            <span>Streak: {team.streak || 'TBD'}</span>
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function LeagueScheduleTab({ league, currentUser, onUpdateLeague }) {
  const [scoringEvent, setScoringEvent] = useState(null);
  const [scoreForm, setScoreForm] = useState({});
  const [evidenceEvent, setEvidenceEvent] = useState(null);
  const [evidenceForm, setEvidenceForm] = useState({ evidenceType: 'screenshot', title: '', description: '', mediaUrl: '', thumbnailUrl: '', verificationLevel: 'self-reported' });
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [evidenceDisputeTarget, setEvidenceDisputeTarget] = useState(null);
  const [evidenceDisputeReason, setEvidenceDisputeReason] = useState('');
  const canScore = canPostLeagueContent(league, currentUser);
  const canAddEvidence = canPostLeagueContent(league, currentUser);
  const role = getCurrentLeagueRole(league, currentUser);

  const openScore = (event) => {
    const official = isTrustedScoreSubmitter(role);
    setScoringEvent(event);
    setScoreForm({
      score: event.score || event.finalScore || '',
      winner: event.winner || '',
      verificationLevel: event.verificationLevel || (official ? 'scorekeeper verified' : 'self-reported'),
      notes: event.notes || '',
    });
  };

  const submitScore = async () => {
    const official = isTrustedScoreSubmitter(role);
    const scoreStatus = official ? 'approved' : 'under_review';
    const verificationLevel = official ? scoreForm.verificationLevel : 'self-reported';
    const applyStandings = official && shouldApplyScoreToStandings(scoringEvent, scoreForm);
    const nextSchedule = (league.schedule || []).map((event) => event.id === scoringEvent.id ? {
      ...event,
      score: scoreForm.score,
      finalScore: scoreForm.score,
      winner: scoreForm.winner,
      verificationLevel,
      scoreStatus,
      notes: scoreForm.notes,
      submittedByUserId: userId(currentUser),
      submittedByName: displayName(currentUser),
      submittedAt: new Date().toISOString(),
      scoreApplied: event.scoreApplied || applyStandings,
      status: official ? 'completed' : 'under_review',
    } : event);
    await onUpdateLeague({
      schedule: nextSchedule,
      standings: applyStandings ? updateStandingsFromScore(league.standings || [], scoringEvent, scoreForm) : league.standings || [],
    });
    setScoringEvent(null);
  };

  const addEvidence = async () => {
    if (!evidenceEvent || !evidenceForm.title || !evidenceForm.mediaUrl) return;
    const record = {
      ...evidenceForm,
      id: id('evidence'),
      leagueId: league.id,
      scheduleEventId: evidenceEvent.id,
      submittedByUserId: userId(currentUser),
      submittedByName: displayName(currentUser),
      status: 'submitted',
      reviewedByUserId: '',
      reviewedByName: '',
      reviewNotes: '',
      createdAt: new Date().toISOString(),
      reviewedAt: '',
    };
    await onUpdateLeague({ evidenceRecords: [record, ...(league.evidenceRecords || [])] });
    setEvidenceEvent(null);
    setEvidenceForm({ evidenceType: 'screenshot', title: '', description: '', mediaUrl: '', thumbnailUrl: '', verificationLevel: 'self-reported' });
  };

  const flagDispute = async () => {
    if (!disputeTarget || !disputeReason.trim()) return;
    const dispute = makeDisputeRecord({ league, targetType: 'score', targetId: disputeTarget.id, reason: disputeReason, currentUser });
    await onUpdateLeague({
      schedule: (league.schedule || []).map((event) => event.id === disputeTarget.id ? { ...event, disputed: true, disputeReason, disputedByUserId: userId(currentUser), disputeStatus: 'open', disputeResolutionNotes: '' } : event),
      disputeRecords: [dispute, ...(league.disputeRecords || [])],
    });
    setDisputeTarget(null);
    setDisputeReason('');
  };

  const flagEvidenceDispute = async () => {
    if (!evidenceDisputeTarget || !evidenceDisputeReason.trim()) return;
    const dispute = makeDisputeRecord({ league, targetType: 'evidence', targetId: evidenceDisputeTarget.id, reason: evidenceDisputeReason, currentUser });
    await onUpdateLeague({
      evidenceRecords: (league.evidenceRecords || []).map((record) => record.id === evidenceDisputeTarget.id ? { ...record, disputed: true, disputeReason: evidenceDisputeReason, disputedByUserId: userId(currentUser), disputeStatus: 'open', disputeResolutionNotes: '' } : record),
      disputeRecords: [dispute, ...(league.disputeRecords || [])],
    });
    setEvidenceDisputeTarget(null);
    setEvidenceDisputeReason('');
  };

  if (!league.schedule?.length) return <EmptyState>No schedule events yet.</EmptyState>;
  return (
    <div className="space-y-3">
      {league.schedule.map((event) => (
        <Panel key={event.id || event.title}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-purple-300" /><h3 className="font-bold text-white">{event.title}</h3></div>
              <p className="mt-1 text-sm text-purple-100/60">{event.type} • {event.date} • {event.time || 'Time TBD'}{event.location ? ` • ${event.location}` : ''}</p>
              {(event.homeTeam || event.awayTeam) && <p className="mt-1 text-xs text-purple-300/50">{event.homeTeam || 'Home'} vs {event.awayTeam || 'Away'}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(event.score || event.finalScore) && <Badge className="bg-cyan-600 text-white">{event.score || event.finalScore}</Badge>}
              <RoleBadge>{event.status || 'scheduled'}</RoleBadge>
              {(event.scoreStatus || event.verificationLevel) && <VerificationBadge>{event.verificationLevel || 'self-reported'}</VerificationBadge>}
              {event.scoreStatus && <StatusBadge>{event.scoreStatus}</StatusBadge>}
              {event.disputed && <Badge className="border border-red-500/30 bg-red-500/15 text-red-100">Disputed</Badge>}
              {evidenceCountForEvent(league, event.id) > 0 && <Badge className="border border-cyan-500/25 bg-cyan-500/15 text-cyan-100">{evidenceCountForEvent(league, event.id)} evidence</Badge>}
              {canScore && <Button size="sm" variant="outline" onClick={() => openScore(event)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Submit score</Button>}
              {canAddEvidence && <Button size="sm" variant="outline" onClick={() => setEvidenceEvent(event)} className="border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/30">Add evidence</Button>}
              {canAddEvidence && (event.score || event.finalScore) && <Button size="sm" variant="outline" onClick={() => setDisputeTarget(event)} className="border-red-700/40 text-red-100 hover:bg-red-900/30">Dispute score</Button>}
            </div>
          </div>
        </Panel>
      ))}
      {scoringEvent && (
        <Panel>
          <h3 className="font-bold text-white">Submit score for {scoringEvent.title}</h3>
          <FormGrid>
            <Field label="Final score"><TextInput value={scoreForm.score} onChange={(event) => setScoreForm({ ...scoreForm, score: event.target.value })} placeholder="82-76" /></Field>
            <Field label="Verified winner"><TextInput value={scoreForm.winner} onChange={(event) => setScoreForm({ ...scoreForm, winner: event.target.value })} /></Field>
            <Field label="Verification level"><SelectInput value={scoreForm.verificationLevel} onChange={(value) => setScoreForm({ ...scoreForm, verificationLevel: value })} options={VERIFICATION_OPTIONS} /></Field>
            <Field label="Notes" wide><TextBox rows={2} value={scoreForm.notes} onChange={(event) => setScoreForm({ ...scoreForm, notes: event.target.value })} /></Field>
          </FormGrid>
          {!isTrustedScoreSubmitter(role) && <p className="mt-2 text-xs text-yellow-100/75">Player-submitted scores stay under review until confirmed by an opponent, scorekeeper, organizer, media evidence, or admin review.</p>}
          <ActionRow>
            <Button onClick={submitScore} className="bg-purple-700 text-white hover:bg-purple-600">Save score</Button>
            <Button variant="outline" onClick={() => setScoringEvent(null)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Cancel</Button>
          </ActionRow>
        </Panel>
      )}
      {evidenceEvent && (
        <Panel>
          <h3 className="font-bold text-white">Add evidence for {evidenceEvent.title}</h3>
          <FormGrid>
            <Field label="Evidence type"><SelectInput value={evidenceForm.evidenceType} onChange={(value) => setEvidenceForm({ ...evidenceForm, evidenceType: value })} options={EVIDENCE_TYPES} /></Field>
            <Field label="Requested verification level"><SelectInput value={evidenceForm.verificationLevel} onChange={(value) => setEvidenceForm({ ...evidenceForm, verificationLevel: value })} options={VERIFICATION_OPTIONS} /></Field>
            <Field label="Title"><TextInput value={evidenceForm.title} onChange={(event) => setEvidenceForm({ ...evidenceForm, title: event.target.value })} /></Field>
            <Field label="Media URL"><TextInput value={evidenceForm.mediaUrl} onChange={(event) => setEvidenceForm({ ...evidenceForm, mediaUrl: event.target.value })} /></Field>
            <Field label="Thumbnail URL"><TextInput value={evidenceForm.thumbnailUrl} onChange={(event) => setEvidenceForm({ ...evidenceForm, thumbnailUrl: event.target.value })} /></Field>
            <Field label="Description" wide><TextBox rows={2} value={evidenceForm.description} onChange={(event) => setEvidenceForm({ ...evidenceForm, description: event.target.value })} /></Field>
          </FormGrid>
          <ActionRow>
            <Button onClick={addEvidence} className="bg-purple-700 text-white hover:bg-purple-600">Submit evidence</Button>
            <Button variant="outline" onClick={() => setEvidenceEvent(null)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Cancel</Button>
          </ActionRow>
        </Panel>
      )}
      {disputeTarget && (
        <Panel>
          <h3 className="font-bold text-white">Dispute score for {disputeTarget.title}</h3>
          <Field label="Dispute reason" wide><TextBox rows={2} value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} /></Field>
          <ActionRow>
            <Button onClick={flagDispute} className="bg-red-700 text-white hover:bg-red-600">Flag disputed</Button>
            <Button variant="outline" onClick={() => setDisputeTarget(null)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Cancel</Button>
          </ActionRow>
        </Panel>
      )}
      {!!(league.evidenceRecords || []).length && (
        <Panel>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-cyan-300" />
            <h3 className="font-bold text-white">Match evidence records</h3>
          </div>
          <div className="mt-3 grid gap-2">
            {(league.evidenceRecords || []).map((record) => (
              <div key={record.id} className="rounded-lg border border-purple-700/15 bg-black/20 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{record.title}</span>
                  <RoleBadge>{record.evidenceType}</RoleBadge>
                  <StatusBadge>{record.status || 'submitted'}</StatusBadge>
                  <VerificationBadge>{record.verificationLevel}</VerificationBadge>
                  {record.disputed && <Badge className="border border-red-500/30 bg-red-500/15 text-red-100">Disputed</Badge>}
                  {canAddEvidence && <Button size="sm" variant="outline" onClick={() => setEvidenceDisputeTarget(record)} className="border-red-700/40 text-red-100 hover:bg-red-900/30">Dispute evidence</Button>}
                </div>
                <p className="mt-1 text-xs text-purple-300/55">{(league.schedule || []).find((event) => event.id === record.scheduleEventId)?.title || 'League evidence'} by {record.submittedByName || 'League member'}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {evidenceDisputeTarget && (
        <Panel>
          <h3 className="font-bold text-white">Dispute evidence record</h3>
          <Field label="Dispute reason" wide><TextBox rows={2} value={evidenceDisputeReason} onChange={(event) => setEvidenceDisputeReason(event.target.value)} /></Field>
          <ActionRow>
            <Button onClick={flagEvidenceDispute} className="bg-red-700 text-white hover:bg-red-600">Flag disputed</Button>
            <Button variant="outline" onClick={() => setEvidenceDisputeTarget(null)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Cancel</Button>
          </ActionRow>
        </Panel>
      )}
    </div>
  );
}

export function LeagueStandingsTab({ league }) {
  if (!league.standings?.length) return <EmptyState>No standings yet.</EmptyState>;
  return (
    <Panel className="overflow-x-auto p-0">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-purple-700/25 text-purple-300/70"><tr>{['Rank', 'Team', 'W', 'L', 'T', 'Pts', 'Diff', 'Streak', 'GP'].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr></thead>
        <tbody>
          {league.standings.map((row) => (
            <tr key={row.id || row.team} className="border-b border-purple-700/10 text-purple-100/80">
              <td className="px-4 py-3 font-bold text-white">{row.rank}</td><td className="px-4 py-3">{row.team}</td><td className="px-4 py-3">{row.wins}</td><td className="px-4 py-3">{row.losses}</td><td className="px-4 py-3">{row.ties}</td><td className="px-4 py-3">{row.points}</td><td className="px-4 py-3">{row.scoreDifferential}</td><td className="px-4 py-3">{row.streak}</td><td className="px-4 py-3">{row.gamesPlayed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

export function LeaguePlayerProfilesTab({ league }) {
  if (!league.playerProfiles?.length) return <EmptyState>No player profiles yet.</EmptyState>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {league.playerProfiles.map((profile) => (
        <Panel key={profile.id || profile.name}>
          <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-white">{profile.name}</h3><p className="text-xs text-purple-300/60">{profile.team}</p></div><Badge className="bg-purple-700 text-white">Skill {profile.skillRating}</Badge></div>
          <div className="mt-3 grid gap-2 text-sm text-purple-100/70"><span>Stats: {profile.stats}</span><span>Practice time: {profile.practiceTime}</span><span>Match history: {profile.matchHistory}</span><span>Uploaded clips: {profile.highlights}</span></div>
          <div className="mt-3"><VerificationBadge>{profile.verificationLevel}</VerificationBadge></div>
        </Panel>
      ))}
    </div>
  );
}

export function LeagueMediaTab({ league, currentUser, onUpdateLeague }) {
  const [form, setForm] = useState({ title: '', caption: '', mediaType: 'Image URL', mediaUrl: '', thumbnailUrl: '', attachedToType: 'league', scheduleEventId: '', markAsEvidence: false, evidenceType: 'clip', verificationLevel: 'self-reported' });
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const canPost = canPostLeagueContent(league, currentUser);
  const addMedia = async () => {
    if (!form.title || !form.mediaUrl) return;
    const mediaId = id('media');
    const mediaRecord = { ...form, id: mediaId, author: displayName(currentUser), createdAt: new Date().toISOString().slice(0, 10), status: form.markAsEvidence ? 'submitted' : form.status };
    const evidenceRecord = form.markAsEvidence ? {
      id: id('evidence'),
      leagueId: league.id,
      scheduleEventId: form.scheduleEventId,
      mediaPostId: mediaId,
      submittedByUserId: userId(currentUser),
      submittedByName: displayName(currentUser),
      evidenceType: form.evidenceType,
      title: form.title,
      description: form.caption,
      mediaUrl: form.mediaUrl,
      thumbnailUrl: form.thumbnailUrl,
      verificationLevel: form.verificationLevel,
      status: 'submitted',
      reviewedByUserId: '',
      reviewedByName: '',
      reviewNotes: '',
      createdAt: new Date().toISOString(),
      reviewedAt: '',
    } : null;
    await onUpdateLeague({
      media: [mediaRecord, ...(league.media || [])],
      evidenceRecords: evidenceRecord ? [evidenceRecord, ...(league.evidenceRecords || [])] : league.evidenceRecords || [],
    });
    setForm({ title: '', caption: '', mediaType: 'Image URL', mediaUrl: '', thumbnailUrl: '', attachedToType: 'league', scheduleEventId: '', markAsEvidence: false, evidenceType: 'clip', verificationLevel: 'self-reported' });
  };
  const flagMediaDispute = async () => {
    if (!disputeTarget || !disputeReason.trim()) return;
    const dispute = makeDisputeRecord({ league, targetType: 'media', targetId: disputeTarget.id, reason: disputeReason, currentUser });
    await onUpdateLeague({
      media: (league.media || []).map((item) => item.id === disputeTarget.id ? { ...item, disputed: true, disputeReason, disputedByUserId: userId(currentUser), disputeStatus: 'open', disputeResolutionNotes: '' } : item),
      disputeRecords: [dispute, ...(league.disputeRecords || [])],
    });
    setDisputeTarget(null);
    setDisputeReason('');
  };
  return (
    <div className="space-y-4">
      {canPost && (
        <Panel>
          <h3 className="font-bold text-white">Add media URL record</h3>
          <FormGrid>
            <Field label="Title"><TextInput value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
            <Field label="Media type"><SelectInput value={form.mediaType} onChange={(value) => setForm({ ...form, mediaType: value })} options={MEDIA_TYPES} /></Field>
            <Field label="Media URL"><TextInput value={form.mediaUrl} onChange={(event) => setForm({ ...form, mediaUrl: event.target.value })} /></Field>
            <Field label="Thumbnail URL"><TextInput value={form.thumbnailUrl} onChange={(event) => setForm({ ...form, thumbnailUrl: event.target.value })} /></Field>
            <Field label="Attached to"><TextInput value={form.attachedToType} onChange={(event) => setForm({ ...form, attachedToType: event.target.value })} /></Field>
            <Field label="Schedule event"><SelectInput value={form.scheduleEventId} onChange={(value) => setForm({ ...form, scheduleEventId: value })} options={['', ...(league.schedule || []).map((event) => event.id)]} /></Field>
            <Field label="Evidence type"><SelectInput value={form.evidenceType} onChange={(value) => setForm({ ...form, evidenceType: value })} options={EVIDENCE_TYPES} /></Field>
            <Field label="Verification level"><SelectInput value={form.verificationLevel} onChange={(value) => setForm({ ...form, verificationLevel: value })} options={VERIFICATION_OPTIONS} /></Field>
            <Field label="Mark as evidence"><SelectInput value={form.markAsEvidence ? 'yes' : 'no'} onChange={(value) => setForm({ ...form, markAsEvidence: value === 'yes' })} options={['no', 'yes']} /></Field>
            <Field label="Caption" wide><TextBox rows={2} value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} /></Field>
          </FormGrid>
          <Button onClick={addMedia} className="mt-3 bg-purple-700 text-white hover:bg-purple-600">Add media</Button>
        </Panel>
      )}
      {!league.media?.length ? <EmptyState>No media yet.</EmptyState> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {league.media.map((item) => (
            <Panel key={item.id || item.title}>
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-purple-700/20 bg-gradient-to-br from-purple-900/45 to-black">
                {item.thumbnailUrl || item.mediaUrl ? <img src={item.thumbnailUrl || item.mediaUrl} alt="" className="h-full w-full object-cover" /> : <Camera className="h-8 w-8 text-purple-200/60" />}
              </div>
              <h3 className="mt-3 font-bold text-white">{item.title}</h3>
              <p className="text-sm text-purple-100/60">{item.mediaType || item.type} by {item.author || 'League member'}</p>
              {item.caption && <p className="mt-2 text-sm text-purple-100/65">{item.caption}</p>}
              <div className="mt-2 flex flex-wrap gap-2"><VerificationBadge>{item.verificationLevel}</VerificationBadge>{item.markAsEvidence && <StatusBadge>Evidence</StatusBadge>}{item.disputed && <Badge className="border border-red-500/30 bg-red-500/15 text-red-100">Disputed</Badge>}</div>
              {item.scheduleEventId && <p className="mt-2 text-xs text-purple-300/55">Event: {(league.schedule || []).find((event) => event.id === item.scheduleEventId)?.title || item.scheduleEventId}</p>}
              {canPost && <Button size="sm" variant="outline" onClick={() => setDisputeTarget(item)} className="mt-3 border-red-700/40 text-red-100 hover:bg-red-900/30">Dispute media</Button>}
            </Panel>
          ))}
        </div>
      )}
      {disputeTarget && (
        <Panel>
          <h3 className="font-bold text-white">Dispute media evidence</h3>
          <Field label="Dispute reason" wide><TextBox rows={2} value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} /></Field>
          <ActionRow>
            <Button onClick={flagMediaDispute} className="bg-red-700 text-white hover:bg-red-600">Flag disputed</Button>
            <Button variant="outline" onClick={() => setDisputeTarget(null)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Cancel</Button>
          </ActionRow>
        </Panel>
      )}
    </div>
  );
}

export function LeagueDiscussionTab({ league, currentUser, onUpdateLeague }) {
  const [form, setForm] = useState({ category: 'General', title: '', body: '', mediaUrl: '' });
  const canPost = canPostLeagueContent(league, currentUser);
  const canModerate = canManageLeague(league, currentUser);
  const posts = (league.discussion || []).filter((post) => !post.hidden || canModerate);
  const addPost = async () => {
    if (!form.body) return;
    await onUpdateLeague({ discussion: [{ ...form, id: id('post'), type: form.category, author: currentUser?.name || currentUser?.full_name || currentUser?.email || 'League member', moderationStatus: 'visible', createdAt: new Date().toISOString().slice(0, 10) }, ...(league.discussion || [])] });
    setForm({ category: 'General', title: '', body: '', mediaUrl: '' });
  };
  const hidePost = (post) => onUpdateLeague({ discussion: (league.discussion || []).map((item) => item.id === post.id ? { ...item, hidden: true, moderationStatus: 'hidden by moderator' } : item) });
  const removePost = (post) => onUpdateLeague({ discussion: (league.discussion || []).filter((item) => item.id !== post.id) });
  return (
    <div className="space-y-3">
      {canPost && (
        <Panel>
          <h3 className="font-bold text-white">Create discussion post</h3>
          <FormGrid>
            <Field label="Category"><SelectInput value={form.category} onChange={(value) => setForm({ ...form, category: value })} options={POST_CATEGORIES} /></Field>
            <Field label="Title"><TextInput value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
            <Field label="Attached media URL" wide><TextInput value={form.mediaUrl} onChange={(event) => setForm({ ...form, mediaUrl: event.target.value })} /></Field>
            <Field label="Body" wide><TextBox rows={3} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></Field>
          </FormGrid>
          <Button onClick={addPost} className="mt-3 bg-purple-700 text-white hover:bg-purple-600">Post</Button>
        </Panel>
      )}
      {!posts.length ? <EmptyState>No discussion posts yet.</EmptyState> : posts.map((post) => (
        <Panel key={post.id || post.body}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-700/30"><MessageSquare className="h-5 w-5 text-cyan-100" /></div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-white">{post.title || post.author}</h3><RoleBadge>{post.category || post.type}</RoleBadge><span className="text-xs text-purple-300/45">{post.createdAt}</span>{post.moderationStatus && <Badge className="border border-yellow-500/30 bg-yellow-500/15 text-yellow-100">{post.moderationStatus}</Badge>}</div>
              <p className="mt-2 text-sm text-purple-100/70">{post.body}</p>
              {post.mediaUrl && <a href={post.mediaUrl} className="mt-2 block text-xs text-cyan-200 hover:underline">Attached media</a>}
              {canModerate && <ActionRow><Button size="sm" variant="outline" onClick={() => hidePost(post)} className="border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30">Hide</Button><Button size="sm" variant="outline" onClick={() => removePost(post)} className="border-red-700/40 text-red-100 hover:bg-red-900/30">Remove</Button></ActionRow>}
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function LeagueGamePrepTab({ league, currentUser, onUpdateLeague }) {
  const prep = league.gamePrep || {};
  const canEdit = canManageGamePrep(league, currentUser);
  const [form, setForm] = useState({ ...prep, scoutingClips: (prep.scoutingClips || []).join(', '), keyPlayers: (prep.keyPlayers || []).join(', '), visibility: prep.visibility || 'league members' });
  const save = () => onUpdateLeague({ gamePrep: { ...form, scoutingClips: form.scoutingClips.split(',').map((v) => v.trim()).filter(Boolean), keyPlayers: form.keyPlayers.split(',').map((v) => v.trim()).filter(Boolean) } });
  return (
    <div className="space-y-4">
      {canEdit && (
        <Panel>
          <h3 className="font-bold text-white">Edit game prep</h3>
          <FormGrid>
            <Field label="Upcoming opponent"><TextInput value={form.upcomingOpponent || ''} onChange={(event) => setForm({ ...form, upcomingOpponent: event.target.value })} /></Field>
            <Field label="Visibility"><SelectInput value={form.visibility} onChange={(value) => setForm({ ...form, visibility: value })} options={PREP_VISIBILITY} /></Field>
            <Field label="Past performance notes" wide><TextBox rows={2} value={form.pastPerformance || ''} onChange={(event) => setForm({ ...form, pastPerformance: event.target.value })} /></Field>
            <Field label="Tendencies" wide><TextBox rows={2} value={form.tendencies || ''} onChange={(event) => setForm({ ...form, tendencies: event.target.value })} /></Field>
            <Field label="Team notes" wide><TextBox rows={2} value={form.teamNotes || ''} onChange={(event) => setForm({ ...form, teamNotes: event.target.value })} /></Field>
            <Field label="Scouting clips"><TextInput value={form.scoutingClips || ''} onChange={(event) => setForm({ ...form, scoutingClips: event.target.value })} /></Field>
            <Field label="Key players to watch"><TextInput value={form.keyPlayers || ''} onChange={(event) => setForm({ ...form, keyPlayers: event.target.value })} /></Field>
          </FormGrid>
          <Button onClick={save} className="mt-3 bg-purple-700 text-white hover:bg-purple-600">Save game prep</Button>
        </Panel>
      )}
      {!Object.keys(prep).length ? <EmptyState>No game prep notes yet.</EmptyState> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel><div className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-cyan-300" /><h3 className="font-bold text-white">Upcoming Opponent</h3></div><p className="mt-3 text-purple-100/75">{prep.upcomingOpponent || 'TBD'}</p></Panel>
          <Panel><h3 className="font-bold text-white">Past Performance</h3><p className="mt-2 text-sm text-purple-100/70">{prep.pastPerformance || 'No past performance notes yet.'}</p></Panel>
          <Panel><h3 className="font-bold text-white">Tendencies</h3><p className="mt-2 text-sm text-purple-100/70">{prep.tendencies || 'No tendencies logged yet.'}</p></Panel>
          <Panel><h3 className="font-bold text-white">Team Notes</h3><p className="mt-2 text-sm text-purple-100/70">{prep.teamNotes || 'No team notes yet.'}</p></Panel>
          <Panel><h3 className="font-bold text-white">Scouting Clips</h3><p className="mt-2 text-sm text-purple-100/70">{(prep.scoutingClips || []).join(', ') || 'No scouting clips yet.'}</p></Panel>
          <Panel><h3 className="font-bold text-white">Key Players To Watch</h3><p className="mt-2 text-sm text-purple-100/70">{(prep.keyPlayers || []).join(', ') || 'No key players listed yet.'}</p></Panel>
        </div>
      )}
    </div>
  );
}

export function LeaguePrizeRewardsTab({ league, currentUser, onUpdateLeague }) {
  const [verifyingReward, setVerifyingReward] = useState(null);
  const [form, setForm] = useState({ winnerName: '', winnerUserId: '', verificationLevel: 'organizer verified', verificationNotes: '', scheduleEventId: '', standingResultId: '', evidenceRecordId: '' });
  const canVerifyWinner = canVerifyResults(league, currentUser);
  const openVerify = (reward) => {
    setVerifyingReward(reward);
    setForm({
      winnerName: reward.winnerName || '',
      winnerUserId: reward.winnerUserId || '',
      verificationLevel: reward.verificationLevel || 'organizer verified',
      verificationNotes: reward.verificationNotes || '',
      scheduleEventId: reward.scheduleEventId || '',
      standingResultId: reward.standingResultId || '',
      evidenceRecordId: reward.evidenceRecordId || '',
    });
  };
  const verifyWinner = async () => {
    if (!verifyingReward || !form.winnerName) return;
    await onUpdateLeague({
      prizeRewards: (league.prizeRewards || []).map((reward) => reward.id === verifyingReward.id ? {
        ...reward,
        ...form,
        winnerStatus: 'Winner verified',
        fulfillmentStatus: reward.fulfillmentStatus || 'Simulated beta hold',
        verifiedByUserId: userId(currentUser),
        verifiedByName: displayName(currentUser),
        verifiedAt: new Date().toISOString(),
      } : reward),
    });
    setVerifyingReward(null);
  };
  if (!league.prizeRewards?.length) return <EmptyState>No prize/reward records yet.</EmptyState>;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {league.prizeRewards.map((reward) => (
          <Panel key={reward.id || reward.name}>
            <div className="flex items-center gap-2"><Crown className="h-5 w-5 text-yellow-300" /><h3 className="font-bold text-white">{reward.name}</h3></div>
            <div className="mt-3 grid gap-2 text-sm text-purple-100/70">
              <span>Prize/reward value: {reward.value}</span><span>Taxes estimate: {reward.taxes}</span><span>Shipping estimate: {reward.shipping}</span><span>Donation amount: {reward.donationAmount}</span><span>Winner status: {reward.winnerStatus}</span><span>Fulfillment status: {reward.fulfillmentStatus}</span><span>Fulfillment record: {reward.fulfillmentRecordId || 'Not linked'}</span>{reward.notes && <span>Notes: {reward.notes}</span>}
              {reward.winnerName && <span>Verified winner: {reward.winnerName}</span>}
              {reward.verificationNotes && <span>Winner verification notes: {reward.verificationNotes}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {reward.verificationLevel && <VerificationBadge>{reward.verificationLevel}</VerificationBadge>}
              {reward.evidenceRecordId && <StatusBadge>Evidence linked</StatusBadge>}
              {canVerifyWinner && <Button size="sm" variant="outline" onClick={() => openVerify(reward)} className="border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/30">Verify winner</Button>}
            </div>
          </Panel>
        ))}
      </div>
      {verifyingReward && (
        <Panel>
          <h3 className="font-bold text-white">Winner verification for {verifyingReward.name}</h3>
          <FormGrid>
            <Field label="Winner name"><TextInput value={form.winnerName} onChange={(event) => setForm({ ...form, winnerName: event.target.value })} /></Field>
            <Field label="Winner user ID"><TextInput value={form.winnerUserId} onChange={(event) => setForm({ ...form, winnerUserId: event.target.value })} /></Field>
            <Field label="Verification level"><SelectInput value={form.verificationLevel} onChange={(value) => setForm({ ...form, verificationLevel: value })} options={VERIFICATION_OPTIONS} /></Field>
            <Field label="Schedule event"><SelectInput value={form.scheduleEventId} onChange={(value) => setForm({ ...form, scheduleEventId: value })} options={['', ...(league.schedule || []).map((event) => event.id)]} /></Field>
            <Field label="Standing result"><SelectInput value={form.standingResultId} onChange={(value) => setForm({ ...form, standingResultId: value })} options={['', ...(league.standings || []).map((row) => row.id || row.team)]} /></Field>
            <Field label="Evidence record"><SelectInput value={form.evidenceRecordId} onChange={(value) => setForm({ ...form, evidenceRecordId: value })} options={['', ...(league.evidenceRecords || []).map((record) => record.id)]} /></Field>
            <Field label="Verification notes" wide><TextBox rows={2} value={form.verificationNotes} onChange={(event) => setForm({ ...form, verificationNotes: event.target.value })} /></Field>
          </FormGrid>
          <p className="mt-2 text-xs text-purple-100/60">Fulfillment remains simulated during beta.</p>
          <ActionRow>
            <Button onClick={verifyWinner} className="bg-purple-700 text-white hover:bg-purple-600">Save winner verification</Button>
            <Button variant="outline" onClick={() => setVerifyingReward(null)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Cancel</Button>
          </ActionRow>
        </Panel>
      )}
    </div>
  );
}

const defaultForms = {
  member: { name: '', email: '', role: 'player', team: '', jerseyNumber: '', position: '', verificationLevel: 'self-reported' },
  team: { name: '', logoUrl: '', coach: '', captain: '', players: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, streak: '', rank: '' },
  schedule: { title: '', type: 'game', date: '', time: '', location: '', homeTeam: '', awayTeam: '', status: 'scheduled', finalScore: '', winner: '', notes: '' },
  standing: { team: '', wins: 0, losses: 0, ties: 0, points: 0, scoreDifferential: 0, streak: '', gamesPlayed: 0, rank: '' },
  reward: { name: '', imageUrl: '', value: '', taxes: '', shipping: '', donationAmount: '', winnerStatus: '', fulfillmentStatus: 'Not started', fulfillmentRecordId: '', notes: '' },
};

function CollectionManager({ title, items, defaults, fields, onSave, onRemove, sortStandings }) {
  const [editing, setEditing] = useState(null);
  const form = editing || defaults;
  const setField = (key, value) => setEditing({ ...form, [key]: value });
  const reset = () => setEditing({ ...defaults, id: id(title.toLowerCase().replace(/\s+/g, '-')) });
  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-white">{title}</h3><Button size="sm" onClick={reset} className="bg-purple-700 text-white hover:bg-purple-600">Add</Button></div>
      {editing && (
        <div className="mt-3 rounded-lg border border-purple-700/20 bg-black/25 p-3">
          <FormGrid>
            {fields.map((field) => (
              <Field key={field.key} label={field.label} wide={field.wide}>
                {field.type === 'select' ? <SelectInput value={form[field.key]} onChange={(value) => setField(field.key, value)} options={field.options} /> : field.type === 'textarea' ? <TextBox rows={2} value={form[field.key] || ''} onChange={(event) => setField(field.key, event.target.value)} /> : <TextInput type={field.type === 'number' ? 'number' : field.type || 'text'} value={form[field.key] ?? ''} onChange={(event) => setField(field.key, field.type === 'number' ? toNumber(event.target.value) : event.target.value)} />}
              </Field>
            ))}
          </FormGrid>
          <ActionRow><Button onClick={() => { onSave(form); setEditing(null); }} className="bg-purple-700 text-white hover:bg-purple-600">Save</Button><Button variant="outline" onClick={() => setEditing(null)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Cancel</Button></ActionRow>
        </div>
      )}
      {sortStandings && <Button size="sm" variant="outline" onClick={sortStandings} className="mt-3 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/30">Sort by points/wins</Button>}
      <div className="mt-3 space-y-2">
        {!items.length ? <p className="text-sm text-purple-100/55">No records yet.</p> : items.map((item) => (
          <div key={item.id || item.name || item.team || item.title} className="flex flex-col gap-3 rounded-lg border border-purple-700/15 bg-black/20 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-white">{item.name || item.team || item.title}</span>
            <div className="flex flex-col gap-2 sm:flex-row"><Button size="sm" variant="outline" onClick={() => setEditing(item)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Edit</Button><Button size="sm" variant="outline" onClick={() => onRemove(item)} className="border-red-700/40 text-red-100 hover:bg-red-900/30">Remove</Button></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ProfileEditor({ league, onUpdateLeague }) {
  const [form, setForm] = useState({ ...league });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectSport = (sport) => setForm((current) => ({ ...current, sportId: sport.id, sportName: sport.name, sportCategory: sport.category, sportType: sport.slug || sport.id, customRules: sport.proposedRules || null, customStatFields: sport.proposedStatFields || [] }));
  return (
    <Panel>
      <h3 className="font-bold text-white">Edit profile</h3>
      <FormGrid>
        <Field label="League name"><TextInput value={form.name || ''} onChange={(event) => set('name', event.target.value)} /></Field>
        <Field label="Location"><TextInput value={form.location || ''} onChange={(event) => set('location', event.target.value)} /></Field>
        <Field label="Logo URL"><TextInput value={form.logoUrl || ''} onChange={(event) => set('logoUrl', event.target.value)} /></Field>
        <Field label="Cover image URL"><TextInput value={form.coverImageUrl || ''} onChange={(event) => set('coverImageUrl', event.target.value)} /></Field>
        <Field label="Season start"><TextInput type="date" value={form.seasonStart || ''} onChange={(event) => set('seasonStart', event.target.value)} /></Field>
        <Field label="Season end"><TextInput type="date" value={form.seasonEnd || ''} onChange={(event) => set('seasonEnd', event.target.value)} /></Field>
        <Field label="Organizer name"><TextInput value={form.organizerName || ''} onChange={(event) => set('organizerName', event.target.value)} /></Field>
        <Field label="Contact info"><TextInput value={form.contactInfo || ''} onChange={(event) => set('contactInfo', event.target.value)} /></Field>
        <Field label="Visibility"><SelectInput value={form.visibility || 'public'} onChange={(value) => set('visibility', value)} options={['public', 'private', 'invite-only']} /></Field>
        <Field label="Verification status"><SelectInput value={form.verificationStatus || 'self-reported'} onChange={(value) => set('verificationStatus', value)} options={VERIFICATION_OPTIONS} /></Field>
        <Field label="Description" wide><TextBox rows={3} value={form.description || ''} onChange={(event) => set('description', event.target.value)} /></Field>
        <Field label="Rules" wide><TextBox rows={4} value={form.rules || ''} onChange={(event) => set('rules', event.target.value)} /></Field>
      </FormGrid>
      <div className="mt-3"><SportSelector value={form.sportId || form.sportType} onChange={selectSport} /></div>
      <Button onClick={() => onUpdateLeague(form)} className="mt-3 bg-purple-700 text-white hover:bg-purple-600">Save profile</Button>
    </Panel>
  );
}

function EvidenceReviewPanel({ league, currentUser, onUpdateLeague }) {
  const [reviewing, setReviewing] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', verificationLevel: 'organizer verified', reviewNotes: '' });
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const canReview = canVerifyResults(league, currentUser);

  const openReview = (record, status) => {
    setReviewing(record);
    setReviewForm({ status, verificationLevel: record.verificationLevel || 'organizer verified', reviewNotes: record.reviewNotes || '' });
  };

  const saveReview = async () => {
    if (!reviewing) return;
    const reviewedRecord = {
      ...reviewing,
      status: reviewForm.status,
      verificationLevel: reviewForm.verificationLevel,
      reviewedByUserId: userId(currentUser),
      reviewedByName: displayName(currentUser),
      reviewNotes: reviewForm.reviewNotes,
      reviewedAt: new Date().toISOString(),
    };
    const nextEvidence = (league.evidenceRecords || []).map((record) => record.id === reviewing.id ? reviewedRecord : record);
    const nextMedia = (league.media || []).map((item) => item.id === reviewing.mediaPostId ? { ...item, verificationLevel: reviewForm.verificationLevel, status: reviewForm.status } : item);
    const reviewedEvent = (league.schedule || []).find((event) => event.id === reviewing.scheduleEventId);
    const applyStandings = reviewForm.status === 'approved' && reviewedEvent?.scoreStatus === 'under_review' && shouldApplyScoreToStandings(reviewedEvent);
    const nextSchedule = (league.schedule || []).map((event) => event.id === reviewing.scheduleEventId && reviewForm.status === 'approved' ? {
      ...event,
      verificationLevel: reviewForm.verificationLevel,
      scoreStatus: event.scoreStatus === 'under_review' ? 'approved' : event.scoreStatus,
      scoreApplied: event.scoreApplied || applyStandings,
      status: event.score ? 'completed' : event.status,
    } : event);
    await onUpdateLeague({
      evidenceRecords: nextEvidence,
      media: nextMedia,
      schedule: nextSchedule,
      standings: applyStandings ? updateStandingsFromScore(league.standings || [], reviewedEvent, reviewedEvent) : league.standings || [],
    });
    setReviewing(null);
  };

  const flagEvidenceDispute = async () => {
    if (!disputeTarget || !disputeReason.trim()) return;
    const dispute = makeDisputeRecord({ league, targetType: 'evidence', targetId: disputeTarget.id, reason: disputeReason, currentUser });
    await onUpdateLeague({
      evidenceRecords: (league.evidenceRecords || []).map((record) => record.id === disputeTarget.id ? { ...record, disputed: true, disputeReason, disputedByUserId: userId(currentUser), disputeStatus: 'open', disputeResolutionNotes: '' } : record),
      disputeRecords: [dispute, ...(league.disputeRecords || [])],
    });
    setDisputeTarget(null);
    setDisputeReason('');
  };

  return (
    <Panel>
      <div className="flex items-center gap-2">
        <FileCheck2 className="h-5 w-5 text-cyan-300" />
        <h3 className="font-bold text-white">Review Evidence</h3>
      </div>
      <p className="mt-2 text-sm text-purple-100/65">Submitted media, scorecards, clips, screenshots, and official notes can be reviewed and assigned a verification level.</p>
      <div className="mt-4 space-y-3">
        {!(league.evidenceRecords || []).length ? <p className="text-sm text-purple-100/55">No evidence records yet.</p> : (league.evidenceRecords || []).map((record) => (
          <div key={record.id} className="rounded-lg border border-purple-700/20 bg-black/25 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-white">{record.title}</h4>
                  <RoleBadge>{record.evidenceType}</RoleBadge>
                  <StatusBadge>{record.status || 'submitted'}</StatusBadge>
                  <VerificationBadge>{record.verificationLevel}</VerificationBadge>
                  {record.disputed && <Badge className="border border-red-500/30 bg-red-500/15 text-red-100">Disputed</Badge>}
                </div>
                <p className="mt-1 text-xs text-purple-300/55">Submitted by {record.submittedByName || 'League member'}{record.scheduleEventId ? ` for ${(league.schedule || []).find((event) => event.id === record.scheduleEventId)?.title || record.scheduleEventId}` : ''}</p>
                {record.description && <p className="mt-2 text-sm text-purple-100/70">{record.description}</p>}
                {record.mediaUrl && <a href={record.mediaUrl} className="mt-2 block text-xs text-cyan-200 hover:underline">Open evidence URL</a>}
                {record.reviewNotes && <p className="mt-2 text-xs text-purple-100/60">Review notes: {record.reviewNotes}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {canReview && <Button size="sm" variant="outline" onClick={() => openReview(record, 'approved')} className="border-green-700/40 text-green-100 hover:bg-green-900/30">Approve</Button>}
                {canReview && <Button size="sm" variant="outline" onClick={() => openReview(record, 'rejected')} className="border-red-700/40 text-red-100 hover:bg-red-900/30">Reject</Button>}
                {canReview && <Button size="sm" variant="outline" onClick={() => openReview(record, 'needs_more_info')} className="border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30">Request info</Button>}
                <Button size="sm" variant="outline" onClick={() => setDisputeTarget(record)} className="border-red-700/40 text-red-100 hover:bg-red-900/30">Dispute</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {reviewing && (
        <div className="mt-4 rounded-lg border border-purple-700/20 bg-black/25 p-3">
          <h4 className="font-semibold text-white">Review {reviewing.title}</h4>
          <FormGrid>
            <Field label="Review status"><SelectInput value={reviewForm.status} onChange={(value) => setReviewForm({ ...reviewForm, status: value })} options={EVIDENCE_STATUSES} /></Field>
            <Field label="Verification level"><SelectInput value={reviewForm.verificationLevel} onChange={(value) => setReviewForm({ ...reviewForm, verificationLevel: value })} options={VERIFICATION_OPTIONS} /></Field>
            <Field label="Review notes" wide><TextBox rows={2} value={reviewForm.reviewNotes} onChange={(event) => setReviewForm({ ...reviewForm, reviewNotes: event.target.value })} /></Field>
          </FormGrid>
          <ActionRow>
            <Button onClick={saveReview} className="bg-purple-700 text-white hover:bg-purple-600">Save review</Button>
            <Button variant="outline" onClick={() => setReviewing(null)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Cancel</Button>
          </ActionRow>
        </div>
      )}
      {disputeTarget && (
        <div className="mt-4 rounded-lg border border-red-700/20 bg-black/25 p-3">
          <h4 className="font-semibold text-white">Dispute evidence</h4>
          <Field label="Dispute reason" wide><TextBox rows={2} value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} /></Field>
          <ActionRow>
            <Button onClick={flagEvidenceDispute} className="bg-red-700 text-white hover:bg-red-600">Flag disputed</Button>
            <Button variant="outline" onClick={() => setDisputeTarget(null)} className="border-purple-700/40 text-purple-100 hover:bg-purple-900/40">Cancel</Button>
          </ActionRow>
        </div>
      )}
    </Panel>
  );
}

export function LeagueAdminTab({ league, currentUser, onUpdateLeague }) {
  const [section, setSection] = useState('evidence');
  const canManage = canManageLeague(league, currentUser);
  const canReview = canVerifyResults(league, currentUser);
  const role = useMemo(() => getCurrentLeagueRole(league, currentUser), [league, currentUser]);
  if (!canManage && !canReview) return null;

  const saveCollection = (key, item) => onUpdateLeague({ [key]: upsertById(league[key] || [], item) });
  const removeCollection = (key, item) => onUpdateLeague({ [key]: (league[key] || []).filter((row) => row.id !== item.id) });

  const markEvent = (item, status) => onUpdateLeague({ schedule: (league.schedule || []).map((event) => event.id === item.id ? { ...event, status } : event) });
  const sortStandings = () => onUpdateLeague({ standings: [...(league.standings || [])].sort((a, b) => toNumber(b.points) - toNumber(a.points) || toNumber(b.wins) - toNumber(a.wins)).map((row, index) => ({ ...row, rank: index + 1 })) });

  const sections = [
    ['evidence', 'Review evidence'],
    ...(canManage ? [
      ['profile', 'Edit profile'],
      ['members', 'Manage members'],
      ['teams', 'Manage teams'],
      ['schedule', 'Update schedule'],
      ['standings', 'Update standings'],
      ['rules', 'Edit rules'],
      ['rewards', 'Manage prize/reward records'],
    ] : []),
  ];

  return (
    <div className="space-y-4">
      <Panel>
        <h3 className="font-bold text-white">League Management</h3>
        <p className="mt-2 text-sm text-purple-100/65">Current role: <span className="font-semibold text-white">{role}</span>. Admin actions are only rendered for permitted league roles.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {sections.map(([key, label]) => <Button key={key} variant={section === key ? 'default' : 'outline'} onClick={() => setSection(key)} className={section === key ? 'bg-purple-700 text-white hover:bg-purple-600' : 'border-purple-700/40 text-purple-100 hover:bg-purple-900/40'}>{label}</Button>)}
        </div>
        <div className="mt-3 space-y-1 text-sm text-purple-100/65">
          <p>Score submission: {canPostLeagueContent(league, currentUser) ? 'Available' : 'Read only'}</p>
          <p>Result verification: {canVerifyResults(league, currentUser) ? 'Available' : 'Read only'}</p>
          <p>Platform beta mode: live payments and fulfillment remain disabled.</p>
        </div>
      </Panel>

      {section === 'evidence' && <EvidenceReviewPanel league={league} currentUser={currentUser} onUpdateLeague={onUpdateLeague} />}
      {section === 'profile' && <ProfileEditor league={league} onUpdateLeague={onUpdateLeague} />}
      {section === 'rules' && <ProfileEditor league={league} onUpdateLeague={onUpdateLeague} />}
      {section === 'members' && (
        <CollectionManager title="Members" items={league.members || []} defaults={defaultForms.member} fields={[
          { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS }, { key: 'team', label: 'Team' }, { key: 'jerseyNumber', label: 'Jersey number' }, { key: 'position', label: 'Position' }, { key: 'verificationLevel', label: 'Verification level', type: 'select', options: VERIFICATION_OPTIONS },
        ]} onSave={(item) => saveCollection('members', item)} onRemove={(item) => removeCollection('members', item)} />
      )}
      {section === 'teams' && (
        <CollectionManager title="Teams" items={league.teams || []} defaults={defaultForms.team} fields={[
          { key: 'name', label: 'Name' }, { key: 'logoUrl', label: 'Logo URL' }, { key: 'coach', label: 'Coach' }, { key: 'captain', label: 'Captain' }, { key: 'players', label: 'Roster/player count', type: 'number' }, { key: 'wins', label: 'Wins', type: 'number' }, { key: 'losses', label: 'Losses', type: 'number' }, { key: 'ties', label: 'Ties', type: 'number' }, { key: 'pointsFor', label: 'Points for', type: 'number' }, { key: 'pointsAgainst', label: 'Points against', type: 'number' }, { key: 'streak', label: 'Streak' }, { key: 'rank', label: 'Rank', type: 'number' },
        ]} onSave={(item) => saveCollection('teams', { ...item, record: `${item.wins || 0}-${item.losses || 0}-${item.ties || 0}` })} onRemove={(item) => removeCollection('teams', item)} />
      )}
      {section === 'schedule' && (
        <CollectionManager title="Schedule events" items={league.schedule || []} defaults={defaultForms.schedule} fields={[
          { key: 'title', label: 'Title' }, { key: 'type', label: 'Type', type: 'select', options: EVENT_TYPES }, { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Time' }, { key: 'location', label: 'Location' }, { key: 'homeTeam', label: 'Home team' }, { key: 'awayTeam', label: 'Away team' }, { key: 'status', label: 'Status', type: 'select', options: EVENT_STATUSES }, { key: 'finalScore', label: 'Final score' }, { key: 'winner', label: 'Winner' }, { key: 'notes', label: 'Notes', type: 'textarea', wide: true },
        ]} onSave={(item) => saveCollection('schedule', { ...item, score: item.finalScore || item.score })} onRemove={(item) => markEvent(item, 'cancelled')} />
      )}
      {section === 'standings' && (
        <CollectionManager title="Standings" items={league.standings || []} defaults={defaultForms.standing} fields={[
          { key: 'team', label: 'Team' }, { key: 'rank', label: 'Rank', type: 'number' }, { key: 'wins', label: 'Wins', type: 'number' }, { key: 'losses', label: 'Losses', type: 'number' }, { key: 'ties', label: 'Ties', type: 'number' }, { key: 'points', label: 'Points', type: 'number' }, { key: 'scoreDifferential', label: 'Score differential', type: 'number' }, { key: 'streak', label: 'Streak' }, { key: 'gamesPlayed', label: 'Games played', type: 'number' },
        ]} onSave={(item) => saveCollection('standings', item)} onRemove={(item) => removeCollection('standings', item)} sortStandings={sortStandings} />
      )}
      {section === 'rewards' && (
        <CollectionManager title="Prize/reward records" items={league.prizeRewards || []} defaults={defaultForms.reward} fields={[
          { key: 'name', label: 'Prize/reward name' }, { key: 'imageUrl', label: 'Prize image URL' }, { key: 'value', label: 'Prize value' }, { key: 'taxes', label: 'Taxes estimate' }, { key: 'shipping', label: 'Shipping estimate' }, { key: 'donationAmount', label: 'Donation amount' }, { key: 'winnerStatus', label: 'Winner status' }, { key: 'fulfillmentStatus', label: 'Fulfillment status' }, { key: 'fulfillmentRecordId', label: 'Fulfillment record ID' }, { key: 'notes', label: 'Notes', type: 'textarea', wide: true },
        ]} onSave={(item) => saveCollection('prizeRewards', item)} onRemove={(item) => removeCollection('prizeRewards', item)} />
      )}
    </div>
  );
}
