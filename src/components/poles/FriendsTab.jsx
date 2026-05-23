import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, MessageCircle, Users, Bell } from "lucide-react";
import { DEMO_FRIENDS, DEMO_PENDING_INVITES, DEMO_MATCHES, DEMO_EVENTS } from './demo-data';

const statusColors = {
  online: "bg-green-500",
  in_game: "bg-yellow-500",
  offline: "bg-gray-600",
};
const statusLabels = {
  online: "Online",
  in_game: "In Game",
  offline: "Offline",
};

function FriendCard({ friend }) {
  const allEvents = [...DEMO_MATCHES, ...DEMO_EVENTS];
  const shared = allEvents.filter(e => friend.sharedEvents?.includes(e.id));

  return (
    <div className="bg-black/40 border border-purple-700/20 hover:border-purple-500/40 rounded-2xl p-4 space-y-3 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {friend.avatar}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColors[friend.status]} rounded-full border-2 border-black`} />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{friend.name}</p>
            <p className="text-xs text-purple-400/60">{statusLabels[friend.status]} · {friend.wins} wins</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="border-purple-700/40 text-purple-300 text-xs px-2">
            <MessageCircle className="w-3 h-3" />
          </Button>
          <Button size="sm" className="bg-purple-700 hover:bg-purple-600 text-white text-xs px-2">
            <UserPlus className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {shared.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-purple-400/60">Shared events:</p>
          {shared.map(e => (
            <div key={e.id} className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
              <img src={e.prizeSnapshot?.image} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=30'; }} />
              <p className="text-xs text-purple-200/70 truncate">{e.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InviteCard({ invite, onAccept, onDecline }) {
  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700/30 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-yellow-400" />
        <p className="text-white text-sm font-semibold">{invite.from} invited you</p>
        <Badge className={invite.type === 'north' ? 'bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs' : 'bg-cyan-900/40 text-cyan-300 border-cyan-700/30 text-xs'}>
          {invite.type === 'north' ? '🎅 North Pole' : '🧊 South Pole'}
        </Badge>
      </div>
      <p className="text-purple-200/70 text-sm">{invite.event}</p>
      <p className="text-purple-400/50 text-xs">{invite.date}</p>
      <div className="flex gap-2">
        <Button size="sm" className="bg-green-700 hover:bg-green-600 text-white text-xs flex-1" onClick={() => onAccept?.(invite)}>Accept</Button>
        <Button size="sm" variant="outline" className="border-red-700/40 text-red-400 text-xs flex-1" onClick={() => onDecline?.(invite)}>Decline</Button>
      </div>
    </div>
  );
}

export default function FriendsTab() {
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const filtered = DEMO_FRIENDS.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  const handleSendInvite = () => {
    if (inviteEmail.trim()) {
      setInviteSent(true);
      setTimeout(() => { setInviteSent(false); setInviteEmail(''); }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite a friend */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white text-sm">Invite a Friend</h3>
        </div>
        <p className="text-purple-300/70 text-xs">Invite friends to join matches and events together.</p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter email address..."
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/60 text-sm"
          />
          <Button
            className={`${inviteSent ? 'bg-green-700' : 'bg-purple-700 hover:bg-purple-600'} text-white text-sm flex-shrink-0`}
            onClick={handleSendInvite}
          >
            {inviteSent ? '✓ Sent!' : 'Invite'}
          </Button>
        </div>
      </div>

      {/* Pending invites */}
      {DEMO_PENDING_INVITES.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-400" />
            Pending Invites
            <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-700/30 text-xs">{DEMO_PENDING_INVITES.length}</Badge>
          </h3>
          {DEMO_PENDING_INVITES.map(inv => <InviteCard key={inv.id} invite={inv} />)}
        </div>
      )}

      {/* Friend list */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-sm">Friends ({DEMO_FRIENDS.length})</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
          <Input
            placeholder="Search friends..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/60"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(f => <FriendCard key={f.id} friend={f} />)}
        </div>
      </div>
    </div>
  );
}