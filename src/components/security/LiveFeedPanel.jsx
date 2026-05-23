import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Play, Pause, Download, Maximize, Volume2, VolumeX } from 'lucide-react';

export default function LiveFeedPanel({ hinge, camera }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  if (!camera) {
    return (
      <Card className="bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md border border-red-700/30">
        <CardContent className="p-8 text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-red-400/50" />
          <h3 className="text-lg font-semibold text-red-200 mb-2">No Camera Configured</h3>
          <p className="text-red-300/70">This gateway needs a camera to enable live monitoring.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md border border-red-700/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-100">
            <Camera className="w-5 h-5" />
            Live Feed: {hinge.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-600/20 text-red-300 border border-red-500/30">
              {camera.resolution}
            </Badge>
            {camera.is_recording && (
              <Badge className="bg-green-600/20 text-green-300 border border-green-500/30 animate-pulse">
                ● REC
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Video Feed Area */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
          {/* Simulated Live Feed */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-red-400/50" />
              <p className="text-red-300">Live Stream</p>
              <p className="text-xs text-red-400/70 mt-1">{camera.stream_url}</p>
            </div>
          </div>

          {/* Live Indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600/80 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">LIVE</span>
          </div>

          {/* Timestamp */}
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 rounded text-white text-xs font-mono">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsMuted(!isMuted)}
              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/10">
              <Download className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/10">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Camera Info */}
        <div className="mt-4 p-3 bg-black/40 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-red-400">Model</span>
              <p className="text-red-200 font-medium">{camera.camera_model.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div>
              <span className="text-red-400">Storage</span>
              <p className="text-red-200 font-medium capitalize">{camera.storage_location}</p>
            </div>
            <div>
              <span className="text-red-400">Motion</span>
              <p className="text-red-200 font-medium">{camera.motion_detection ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div>
              <span className="text-red-400">Night Vision</span>
              <p className="text-red-200 font-medium">{camera.night_vision ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}