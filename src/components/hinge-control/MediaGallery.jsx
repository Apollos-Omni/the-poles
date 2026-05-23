
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Camera, 
  Video, 
  Download, 
  Eye, 
  Clock,
  FileImage,
  Play
} from "lucide-react";
import { format } from "date-fns";

export default function MediaGallery({ assets }) {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'snapshot': return Camera;
      case 'video_clip': return Video;
      case 'timelapse': return Video;
      default: return FileImage;
    }
  };

  const getAssetColor = (type) => {
    switch (type) {
      case 'snapshot': return 'text-blue-400';
      case 'video_clip': return 'text-purple-400';
      case 'timelapse': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (!assets || assets.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-100">
            <Camera className="w-5 h-5" />
            Media Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-blue-300/60">
            <Camera className="w-12 h-12 mx-auto mb-3 text-blue-400/30" />
            <p className="text-sm">No media assets</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-100">
          <Camera className="w-5 h-5" />
          Media Gallery
          <Badge className="bg-blue-600/20 text-blue-300 ml-auto">
            {assets.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6">
          <div className="grid grid-cols-2 gap-3 pb-6">
            {assets.map((asset) => {
              const AssetIcon = getAssetIcon(asset.asset_type);
              const iconColor = getAssetColor(asset.asset_type);
              
              return (
                <div 
                  key={asset.id}
                  className="bg-black/20 rounded-lg p-3 hover:bg-black/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedAsset(asset)}
                >
                  {asset.thumbnail_url ? (
                    <div className="relative aspect-video bg-gray-800 rounded mb-2 overflow-hidden">
                      <img 
                        src={asset.thumbnail_url} 
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                        {asset.asset_type === 'snapshot' ? (
                          <Eye className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-800 rounded mb-2 flex items-center justify-center">
                      <AssetIcon className={`w-8 h-8 ${iconColor}`} />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${asset.asset_type === 'video_clip' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                        {asset.asset_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-blue-300/60 text-xs">
                        {formatFileSize(asset.file_size)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-blue-300/80 text-xs">
                      <Clock className="w-3 h-3" />
                      {format(new Date(asset.captured_at), 'MMM d, HH:mm')}
                    </div>
                    
                    {asset.trigger_event && (
                      <p className="text-blue-200 text-xs truncate">
                        Triggered by: {asset.trigger_event}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
