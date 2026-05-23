import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, AtSign, Lock, CreditCard, MapPin,
  Bell, Shield, CheckCircle, ChevronRight, Edit3
} from "lucide-react";

function SettingsRow({ icon: Icon, label, value, action, valueColor = "text-purple-300/70", onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
    >
      <div className="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        {value && <p className={`text-xs mt-0.5 ${valueColor} truncate`}>{value}</p>}
      </div>
      {action && (
        <span className="text-xs text-purple-500 group-hover:text-purple-300 transition-colors flex-shrink-0">{action}</span>
      )}
      <ChevronRight className="w-4 h-4 text-purple-700 group-hover:text-purple-400 transition-colors flex-shrink-0" />
    </button>
  );
}

export default function AccountInfoTab({ user, profile, onUpdateProfile }) {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (field, currentValue) => {
    setEditing(field);
    setEditValue(currentValue || '');
  };

  const saveEdit = () => {
    if (editing && onUpdateProfile) {
      onUpdateProfile({ [editing]: editValue });
    }
    setEditing(null);
    setEditValue('');
  };

  const email = user?.email || 'Not set';
  const displayName = profile?.displayName || user?.full_name || 'Not set';
  const username = profile?.username ? `@${profile.username}` : 'Not set';

  return (
    <div className="space-y-5">
      {/* Verification status */}
      <div className="bg-green-900/20 border border-green-700/30 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
        <div>
          <p className="text-white font-semibold text-sm">Account Active</p>
          <p className="text-green-300/70 text-xs">Your account is set up and in good standing.</p>
        </div>
        <Badge className="bg-green-900/40 text-green-300 border-green-700/30 text-xs ml-auto">Verified</Badge>
      </div>

      {/* Inline edit panel */}
      {editing && (
        <div className="bg-black/40 border border-purple-500/40 rounded-2xl p-4 space-y-3">
          <p className="text-purple-300 text-sm font-semibold capitalize">Edit {editing}</p>
          <Input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="bg-black/30 border-purple-700/30 focus:border-purple-500 text-white"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" className="bg-purple-700 hover:bg-purple-600 text-white flex-1" onClick={saveEdit}>Save</Button>
            <Button size="sm" variant="outline" className="border-purple-700/40 text-purple-300 flex-1" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Identity */}
      <div className="bg-black/30 border border-purple-700/20 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-purple-700/10">
          <p className="text-purple-400/60 text-xs font-semibold uppercase tracking-wide">Identity</p>
        </div>
        <div className="divide-y divide-purple-700/10">
          <SettingsRow icon={User} label="Display Name" value={displayName} action="Edit" onClick={() => startEdit('displayName', profile?.displayName)} />
          <SettingsRow icon={AtSign} label="Username" value={username} action="Edit" onClick={() => startEdit('username', profile?.username)} />
          <SettingsRow icon={Mail} label="Email" value={email} action="Edit" onClick={() => startEdit('email', user?.email)} />
          <SettingsRow icon={Phone} label="Phone Number" value="Not added" action="Add" onClick={() => startEdit('phone', '')} />
          <SettingsRow icon={MapPin} label="Location" value={profile?.location || "Not set"} action="Edit" onClick={() => startEdit('location', profile?.location)} />
        </div>
      </div>

      {/* Security */}
      <div className="bg-black/30 border border-purple-700/20 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-purple-700/10">
          <p className="text-purple-400/60 text-xs font-semibold uppercase tracking-wide">Security</p>
        </div>
        <div className="divide-y divide-purple-700/10">
          <SettingsRow icon={Lock} label="Password" value="Last changed: never" action="Change" onClick={() => {}} />
          <SettingsRow icon={Shield} label="Two-Factor Auth" value="Not enabled" action="Enable" valueColor="text-yellow-400/70" onClick={() => {}} />
        </div>
      </div>

      {/* Payments & Shipping */}
      <div className="bg-black/30 border border-purple-700/20 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-purple-700/10">
          <p className="text-purple-400/60 text-xs font-semibold uppercase tracking-wide">Payments & Delivery</p>
        </div>
        <div className="divide-y divide-purple-700/10">
          <SettingsRow icon={CreditCard} label="Payment Method" value="Not set up · Required to enter paid matches" action="Setup" valueColor="text-yellow-400/70" onClick={() => {}} />
          <SettingsRow icon={MapPin} label="Shipping Address" value="Not set · Required to receive physical prizes" action="Add" valueColor="text-yellow-400/70" onClick={() => {}} />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-black/30 border border-purple-700/20 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-purple-700/10">
          <p className="text-purple-400/60 text-xs font-semibold uppercase tracking-wide">Preferences</p>
        </div>
        <div className="divide-y divide-purple-700/10">
          <SettingsRow icon={Bell} label="Notifications" value="Match results, invites, prize updates" action="Manage" onClick={() => {}} />
          <SettingsRow icon={Shield} label="Privacy Settings" value="Public profile" action="Manage" onClick={() => {}} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-4">
        <p className="text-red-400/80 text-xs font-semibold uppercase mb-3">Danger Zone</p>
        <Button variant="outline" size="sm" className="border-red-700/40 text-red-400 text-xs hover:bg-red-900/20">
          Delete Account
        </Button>
      </div>
    </div>
  );
}