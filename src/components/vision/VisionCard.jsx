import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  MessageCircle,
  MapPin
} from "lucide-react";
import ProgressRing from './ProgressRing';
import IntegrityChip from './IntegrityChip';

const categoryColors = {
  personal: "from-purple-500 to-purple-600",
  community: "from-green-500 to-green-600",
  spiritual: "from-yellow-500 to-yellow-600",
  professional: "from-blue-500 to-blue-600",
  health: "from-red-500 to-red-600",
  relationships: "from-pink-500 to-pink-600",
  environment: "from-teal-500 to-teal-600",
  education: "from-indigo-500 to-indigo-600"
};

export default function VisionCard({ vision, user, viewMode = 'grid' }) {
  const categoryColor = categoryColors[vision.category] || categoryColors.personal;

  if (viewMode === 'list') {
    return (
      <Card className="bg-gradient-to-r from-[rgb(var(--grey-1))] to-[rgb(var(--dark-base))] border border-[rgb(var(--grey-2))] hover:border-[rgb(var(--primary))] transition-all duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <ProgressRing progress={vision.progress} size={50} strokeWidth={4} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white font-semibold truncate">{vision.title}</CardTitle>
              <Badge className={`text-xs bg-gradient-to-r ${categoryColor} text-white border-0`}>{vision.category}</Badge>
            </div>
            <p className="text-sm text-[rgb(var(--grey-3))] mt-1 truncate">{vision.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <IntegrityChip score={vision.integrity_score} />
              <div className="flex items-center gap-1 text-sm text-[rgb(var(--grey-3))]">
                <Heart className="w-4 h-4" /> {vision.likes_count}
              </div>
              <div className="flex items-center gap-1 text-sm text-[rgb(var(--grey-3))]">
                <Users className="w-4 h-4" /> {vision.supporters_count}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[rgb(var(--grey-1))] to-[rgb(var(--dark-base))] border border-[rgb(var(--grey-2))] hover:border-[rgb(var(--primary))] transition-all duration-300 flex flex-col h-full">
      {vision.cover_image_url && (
        <div className="h-40 overflow-hidden rounded-t-xl">
          <img src={vision.cover_image_url} alt={vision.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className={`text-xs bg-gradient-to-r ${categoryColor} text-white border-0`}>{vision.category}</Badge>
          <IntegrityChip score={vision.integrity_score} />
        </div>
        <CardTitle className="text-lg text-white font-semibold">{vision.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-[rgb(var(--grey-3))] line-clamp-3">{vision.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t border-[rgb(var(--grey-2))] pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-[rgb(var(--grey-3))]">
            <Heart className="w-4 h-4" /> {vision.likes_count}
          </div>
          <div className="flex items-center gap-1 text-sm text-[rgb(var(--grey-3))]">
            <Users className="w-4 h-4" /> {vision.supporters_count}
          </div>
        </div>
        <ProgressRing progress={vision.progress} size={40} strokeWidth={4} />
      </CardFooter>
    </Card>
  );
}