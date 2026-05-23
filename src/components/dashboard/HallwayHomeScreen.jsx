
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, Lock, Unlock, Wifi, WifiOff, Sparkles, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LazyImage } from '@/components/ui/lazy-image'; // New import

const statusColors = {
  "online": "from-green-400 to-green-600",
  "offline": "from-red-400 to-red-600",
  "locked": "from-yellow-400 to-yellow-600",
  "unlocked": "from-blue-400 to-blue-600",
  "maintenance": "from-purple-400 to-purple-600"
};

const auraColors = {
  "purple": "shadow-purple-500/50 border-purple-500/30",
  "gold": "shadow-yellow-500/50 border-yellow-500/30",
  "silver": "shadow-gray-300/50 border-gray-300/30",
  "blue": "shadow-blue-500/50 border-blue-500/30",
  "green": "shadow-green-500/50 border-green-500/30",
  "white": "shadow-white/50 border-white/30"
};

export default function HallwayHomeScreen({ hinges, user, onHingeSelect }) {
  // const [selectedHinge, setSelectedHinge] = useState(null); // No longer needed as doors are now links

  const getStatusIcon = (status) => {
    switch(status) {
      case 'online': return Wifi;
      case 'offline': return WifiOff;
      case 'locked': return Lock;
      case 'unlocked': return Unlock;
      default: return DoorOpen;
    }
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Eye className="w-7 h-7 text-purple-400" />
        Sacred Hallway
        <span className="text-sm font-normal text-purple-300">({hinges.length} gateways)</span>
      </h2>

      {hinges.length === 0 ? (
        <Card className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm border border-purple-700/30 p-12 text-center">
          <DoorOpen className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-xl font-semibold mb-2 text-purple-200">No Gateways Manifested</h3>
          <p className="text-purple-300/70">Your sacred hallway awaits its first threshold. Manifest a gateway to begin your journey.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Hallway 3D Perspective View */}
          <div className="relative bg-gradient-to-b from-purple-900/30 to-black/50 backdrop-blur-sm rounded-2xl border border-purple-700/30 p-8 min-h-[400px] overflow-hidden">
            {/* 3D Hallway Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-black/30"></div>
            
            {/* Door Grid in Perspective */}
            <div className="relative grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hinges.map((hinge, index) => {
                const StatusIcon = getStatusIcon(hinge.status);
                
                return (
                  <Link 
                    key={hinge.id}
                    to={createPageUrl(`HingeControl?id=${hinge.id}`)}
                    className="group relative cursor-pointer transition-all duration-500 transform hover:scale-105 hover:z-10"
                    style={{
                      transform: `perspective(800px) rotateY(${index % 2 === 0 ? -5 : 5}deg) rotateX(5deg)`
                    }}
                  >
                    {/* Door Frame */}
                    <div className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-4 ${auraColors[hinge.aura_color || 'purple']} shadow-2xl overflow-hidden aspect-[3/4]`}>
                      {/* Aura Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${statusColors[hinge.status]} opacity-20 animate-pulse`}></div>
                      
                      {/* Door Image or Placeholder - Now with lazy loading */}
                      <div className="relative h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                        {hinge.door_image_url ? (
                          <LazyImage 
                            src={hinge.door_image_url} 
                            alt={hinge.name}
                            className="w-full h-full"
                            loadingClassName="bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse"
                          />
                        ) : (
                          <div className="text-center">
                            <DoorOpen className="w-12 h-12 mx-auto mb-2 text-purple-300" />
                            <div className="text-xs text-purple-200">Sacred Portal</div>
                          </div>
                        )}
                        
                        {/* Status Overlay */}
                        <div className="absolute top-3 right-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${statusColors[hinge.status]} flex items-center justify-center shadow-lg`}>
                            <StatusIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        {/* Glyph Overlay */}
                        <div className="absolute bottom-3 left-3">
                          <Sparkles className="w-6 h-6 text-purple-300 opacity-70" />
                        </div>
                      </div>
                      
                      {/* Door Label */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h4 className="font-semibold text-white truncate">{hinge.name}</h4>
                        <p className="text-xs text-purple-200 truncate">{hinge.location}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={`text-xs bg-gradient-to-r ${statusColors[hinge.status]} text-white border-0`}>
                            {hinge.status}
                          </Badge>
                          <span className="text-xs text-yellow-400">+{hinge.karma_reward} karma</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Selected Door Details - This section is removed as doors are now direct links */}
        </div>
      )}
    </div>
  );
}
