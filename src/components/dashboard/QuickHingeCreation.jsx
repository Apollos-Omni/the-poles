import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, Sparkles, DoorOpen } from "lucide-react";
import { Hinge } from "@/entities/Hinge";
import { UploadFile } from "@/integrations/Core";

const glyphTypes = [
  { value: "sacred_geometry", label: "Sacred Geometry", icon: "🔷" },
  { value: "celestial", label: "Celestial", icon: "✨" },
  { value: "nature", label: "Nature", icon: "🌿" },
  { value: "tech", label: "Technology", icon: "⚡" },
  { value: "spiritual", label: "Spiritual", icon: "🕉️" }
];

const auraColors = [
  { value: "purple", label: "Divine Purple", color: "bg-purple-500" },
  { value: "gold", label: "Golden Light", color: "bg-yellow-500" },
  { value: "blue", label: "Celestial Blue", color: "bg-blue-500" },
  { value: "green", label: "Nature Green", color: "bg-green-500" },
  { value: "white", label: "Pure White", color: "bg-white" },
  { value: "silver", label: "Mystic Silver", color: "bg-gray-400" }
];

export default function QuickHingeCreation({ user, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    device_id: '',
    name: '',
    location: '',
    door_glyph: 'sacred_geometry',
    access_level: 'private',
    karma_reward: 1,
    aura_color: 'purple',
    door_image_url: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        door_image_url: result.file_url
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      await Hinge.create({
        ...formData,
        owner_id: user.id,
        status: 'offline',
        total_uses: 0,
        coordinates_x: Math.random() * 100,
        coordinates_y: Math.random() * 100,
        coordinates_z: 0
      });
      onCreated();
    } catch (error) {
      console.error('Error creating hinge:', error);
    }
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gradient-to-br from-purple-900 to-black border border-purple-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-purple-200">
              <DoorOpen className="w-6 h-6" />
              Manifest Sacred Gateway
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-purple-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Device Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Gateway Configuration
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-purple-200">Device ID</Label>
                  <Input
                    value={formData.device_id}
                    onChange={(e) => setFormData(prev => ({...prev, device_id: e.target.value}))}
                    placeholder="DH-001-ABC123"
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-purple-200">Gateway Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Portal to the Divine Studio"
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200">Threshold Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                  placeholder="Sacred space coordinates..."
                  className="bg-purple-900/30 border-purple-700/50 text-white"
                  required
                />
              </div>
            </div>

            {/* Aesthetic Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300">Aesthetic Configuration</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-purple-200">Door Glyph</Label>
                  <Select value={formData.door_glyph} onValueChange={(value) => setFormData(prev => ({...prev, door_glyph: value}))}>
                    <SelectTrigger className="bg-purple-900/30 border-purple-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-700">
                      {glyphTypes.map((glyph) => (
                        <SelectItem key={glyph.value} value={glyph.value} className="text-white hover:bg-purple-800">
                          {glyph.icon} {glyph.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-200">Aura Color</Label>
                  <Select value={formData.aura_color} onValueChange={(value) => setFormData(prev => ({...prev, aura_color: value}))}>
                    <SelectTrigger className="bg-purple-900/30 border-purple-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-700">
                      {auraColors.map((color) => (
                        <SelectItem key={color.value} value={color.value} className="text-white hover:bg-purple-800">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${color.color}`}></div>
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Door Image Upload */}
              <div className="space-y-2">
                <Label className="text-purple-200">Door Image (Optional)</Label>
                <div className="border-2 border-dashed border-purple-700/50 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="door-image-upload"
                  />
                  <label htmlFor="door-image-upload" className="cursor-pointer">
                    {isUploading ? (
                      <div className="text-purple-300">Uploading...</div>
                    ) : formData.door_image_url ? (
                      <div className="space-y-2">
                        <img src={formData.door_image_url} alt="Door preview" className="w-20 h-20 mx-auto rounded-lg object-cover" />
                        <div className="text-green-400 text-sm">Image uploaded successfully</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-purple-400" />
                        <div className="text-purple-300">Click to upload door image</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Gateway Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300">Gateway Settings</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-purple-200">Access Level</Label>
                  <Select value={formData.access_level} onValueChange={(value) => setFormData(prev => ({...prev, access_level: value}))}>
                    <SelectTrigger className="bg-purple-900/30 border-purple-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-700">
                      <SelectItem value="private" className="text-white hover:bg-purple-800">Private (Owner only)</SelectItem>
                      <SelectItem value="community" className="text-white hover:bg-purple-800">Community (Verified)</SelectItem>
                      <SelectItem value="public" className="text-white hover:bg-purple-800">Public (All users)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-200">Karma Reward per Use</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.karma_reward}
                    onChange={(e) => setFormData(prev => ({...prev, karma_reward: parseInt(e.target.value)}))}
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-purple-700/30">
              <Button type="button" variant="outline" onClick={onClose} className="border-purple-700/50 text-purple-300 hover:bg-purple-900/50">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
              >
                {isCreating ? 'Manifesting...' : 'Manifest Gateway'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}