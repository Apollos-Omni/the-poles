
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  X, 
  Plus, 
  Link as LinkIcon, 
  MapPin,
  Crown
} from "lucide-react";
import { UploadFile } from "@/integrations/Core";
import { User } from '@/entities/User';
import { SocialAccount } from '@/entities/SocialAccount'; // New Import
import SocialAccountManager from './SocialAccountManager'; // New Import

const regionOptions = [
  'Unknown Realm',
  'North America',
  'United States',
  'California, USA',
  'Texas, USA',
  'New York, USA',
  'Europe',
  'Asia',
  'Remote/Digital Nomad'
];

// linkTypes array is no longer used in the UI for this component
// but keeping it in case it's used elsewhere or was an oversight in the prompt to remove.
// Given the UI for links is removed, it effectively becomes unused here.
const linkTypes = [
  { value: 'website', label: 'Website', placeholder: 'https://yoursite.com' },
  { value: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/username' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { value: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@username' }
];

export default function EditProfileModal({ user, profile, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    bio: profile.bio || '',
    region: profile.region || '',
    links: profile.links || [], // This field is still part of formData but no UI to edit it in this modal
    avatar_url: user.avatar_url || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // New State

  // newLink state and addLink/removeLink functions are removed as per outline
  // const [newLink, setNewLink] = useState({ type: '', url: '', label: '' });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarSelect = (file) => {
    setAvatarFile(file);
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, avatar_url: previewUrl }));
  };

  // addLink and removeLink functions are removed as per outline
  // const addLink = () => {
  //   if (newLink.url.trim()) {
  //     const linkType = linkTypes.find(t => t.value === newLink.type);
  //     setFormData(prev => ({
  //       ...prev,
  //       links: [...prev.links, {
  //         type: newLink.type,
  //         label: newLink.label || linkType?.label || 'Link',
  //         url: newLink.url.trim()
  //       }]
  //     }));
  //     setNewLink({ type: '', url: '', label: '' });
  //   }
  // };

  // const removeLink = (index) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     links: prev.links.filter((_, i) => i !== index)
  //   }));
  // };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = formData.avatar_url;
      
      // Upload avatar if changed
      if (avatarFile) {
        setIsUploading(true);
        const uploadResult = await UploadFile({ file: avatarFile });
        avatarUrl = uploadResult.file_url;
      }

      // Update user data
      await User.updateMyUserData({
        full_name: formData.full_name,
        bio: formData.bio,
        region: formData.region,
        links: formData.links, // links are still passed but not modifiable via UI here
        avatar_url: avatarUrl
      });

      onUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-400" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'basic' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[rgb(var(--grey-2))] text-purple-300 hover:bg-purple-800/30'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'social' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[rgb(var(--grey-2))] text-purple-300 hover:bg-purple-800/30'
            }`}
          >
            Social Accounts
          </button>
        </div>

        <div className="py-4">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 p-1">
                    <div className="w-full h-full rounded-full bg-[rgb(var(--dark-base))] overflow-hidden flex items-center justify-center">
                      {formData.avatar_url ? (
                        <img 
                          src={formData.avatar_url} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Crown className="w-8 h-8 text-purple-400" />
                      )}
                    </div>
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                    <Upload className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && handleAvatarSelect(e.target.files[0])}
                    />
                  </label>
                </div>
                {isUploading && (
                  <p className="text-xs text-purple-300 mt-2">Uploading avatar...</p>
                )}
              </div>

              {/* Display Name */}
              <div>
                <Label className="text-purple-200">Display Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Your display name"
                  className="mt-2 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white"
                />
              </div>

              {/* Bio */}
              <div>
                <Label className="text-purple-200">Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell others about yourself..."
                  rows={3}
                  className="mt-2 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white"
                />
              </div>

              {/* Region */}
              <div>
                <Label className="text-purple-200">Region</Label>
                <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                  <SelectTrigger className="mt-2 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white max-h-60">
                    {regionOptions.map((region) => (
                      <SelectItem key={region} value={region}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {region}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Links section removed as per outline */}
            </div>
          )}

          {activeTab === 'social' && (
            <SocialAccountManager 
              user={user} 
              onAccountsChange={() => {
                // Refresh parent component if needed
                if (onUpdated) onUpdated();
              }}
            />
          )}
        </div>

        {activeTab === 'basic' && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSaving || isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
