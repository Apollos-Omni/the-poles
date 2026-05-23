import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Plus, 
  Edit, 
  Play, 
  Pause, 
  Archive,
  CheckCircle
} from "lucide-react";
import VisionCard from './VisionCard';

const statusConfig = {
  draft: { color: 'bg-gray-600/20 text-gray-300', icon: Edit },
  active: { color: 'bg-green-600/20 text-green-300', icon: Play },
  paused: { color: 'bg-yellow-600/20 text-yellow-300', icon: Pause },
  completed: { color: 'bg-blue-600/20 text-blue-300', icon: CheckCircle },
  archived: { color: 'bg-purple-600/20 text-purple-300', icon: Archive }
};

export default function MyVisions({ visions = [], user, onRefresh }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredVisions = visions.filter(vision => {
    if (activeFilter === 'all') return true;
    return vision.status === activeFilter;
  });

  const visionCounts = {
    all: visions.length,
    draft: visions.filter(v => v.status === 'draft').length,
    active: visions.filter(v => v.status === 'active').length,
    paused: visions.filter(v => v.status === 'paused').length,
    completed: visions.filter(v => v.status === 'completed').length,
    archived: visions.filter(v => v.status === 'archived').length
  };

  const FilterTab = ({ status, label, count }) => {
    const config = statusConfig[status] || { color: 'bg-gray-600/20 text-gray-300', icon: Target };
    const Icon = config.icon;
    
    return (
      <button
        onClick={() => setActiveFilter(status)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          activeFilter === status
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
            : 'bg-black/40 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
        {count > 0 && (
          <Badge className="bg-purple-400/20 text-purple-200 text-xs">
            {count}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-purple-100">My Visions</h2>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        <FilterTab status="all" label="All" count={visionCounts.all} />
        <FilterTab status="draft" label="Drafts" count={visionCounts.draft} />
        <FilterTab status="active" label="Active" count={visionCounts.active} />
        <FilterTab status="paused" label="Paused" count={visionCounts.paused} />
        <FilterTab status="completed" label="Completed" count={visionCounts.completed} />
        <FilterTab status="archived" label="Archived" count={visionCounts.archived} />
      </div>

      {/* Vision Progress Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-600/20 to-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">{visionCounts.active}</div>
          <div className="text-green-300 text-sm">Active Visions</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-black/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400">{visionCounts.completed}</div>
          <div className="text-blue-300 text-sm">Completed</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400">
            {Math.round(visions.reduce((sum, v) => sum + v.progress, 0) / Math.max(visions.length, 1))}%
          </div>
          <div className="text-purple-300 text-sm">Avg Progress</div>
        </div>
      </div>

      {/* Vision Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVisions.map((vision) => (
          <VisionCard
            key={vision.id}
            vision={vision}
            user={user}
            viewMode="grid"
          />
        ))}
      </div>

      {filteredVisions.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-xl font-semibold text-purple-200 mb-2">
            {activeFilter === 'all' ? 'No visions yet' : `No ${activeFilter} visions`}
          </h3>
          <p className="text-purple-300/70 mb-6">
            {activeFilter === 'all' ? 
              'Start your journey by creating your first vision' :
              `You don't have any ${activeFilter} visions at the moment`
            }
          </p>
        </div>
      )}
    </div>
  );
}