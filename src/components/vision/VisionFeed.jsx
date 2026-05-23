import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Users, 
  Target
} from "lucide-react";
import VisionCard from './VisionCard';

export default function VisionFeed({ 
  visions = [], 
  user, 
  viewMode = 'grid', 
  filters = {}, 
  onFilterChange,
  title = "Vision Feed" 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('trending');

  const filteredVisions = visions.filter(vision => {
    // Search filter
    if (searchQuery && !vision.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !vision.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.category && filters.category !== 'all' && vision.category !== filters.category) {
      return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all' && vision.status !== filters.status) {
      return false;
    }
    
    // Region filter
    if (filters.region && filters.region !== 'all' && vision.region !== filters.region) {
      return false;
    }
    
    return true;
  });

  const sortedVisions = [...filteredVisions].sort((a, b) => {
    // time-decay × integrity × supporter growth × verification velocity
    const decay = 0.9;
    const timeDiffA = (new Date() - new Date(a.created_date)) / (1000 * 3600 * 24); // days
    const timeDiffB = (new Date() - new Date(b.created_date)) / (1000 * 3600 * 24); // days

    const scoreA = (a.integrity_score * (a.supporters_count + 1) * a.progress) * Math.pow(decay, timeDiffA);
    const scoreB = (b.integrity_score * (b.supporters_count + 1) * b.progress) * Math.pow(decay, timeDiffB);

    switch (sortBy) {
      case 'trending':
        return scoreB - scoreA;
      case 'recent':
        return new Date(b.updated_date) - new Date(a.updated_date);
      case 'progress':
        return b.progress - a.progress;
      case 'integrity':
        return b.integrity_score - a.integrity_score;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-purple-100">{title}</h2>
          <Badge className="bg-purple-600/20 text-purple-300">
            {sortedVisions.length} visions
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
          <Input
            placeholder="Search visions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white placeholder-purple-400/60"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="integrity">Integrity</SelectItem>
            </SelectContent>
          </Select>

          {onFilterChange && (
            <Select value={filters.category || 'all'} onValueChange={(value) => onFilterChange({...filters, category: value})}>
              <SelectTrigger className="w-40 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="spiritual">Spiritual</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Vision Grid/List */}
      <div className={viewMode === 'grid' ? 
        "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : 
        "space-y-4"
      }>
        {sortedVisions.map((vision) => (
          <Link key={vision.id} to={createPageUrl(`VisionDetail?id=${vision.id}`)}>
            <VisionCard
              vision={vision}
              user={user}
              viewMode={viewMode}
            />
          </Link>
        ))}
      </div>

      {sortedVisions.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-xl font-semibold text-purple-200 mb-2">
            {searchQuery ? 'No visions found' : 'No visions yet'}
          </h3>
          <p className="text-purple-300/70">
            {searchQuery ? 
              'Try adjusting your search or filters' : 
              'Be the first to declare a vision and start your journey'
            }
          </p>
        </div>
      )}
    </div>
  );
}