
import React, { useState, useEffect, useCallback } from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsSection from '@/components/settings/SettingsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { User } from '@/entities/User';
import { UserPrefs } from '@/entities/UserPrefs';
import { Monitor, Moon, Sun, Palette, Type } from 'lucide-react';

export default function SettingsAppearance() {
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({
    theme: 'dark',
    font_scale: 'system',
    reduce_motion: false,
    high_contrast: false
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Try to get existing preferences
      const existingPrefs = await UserPrefs.filter({ user_id: userData.id });
      
      if (existingPrefs.length > 0) {
        setPrefs(prevPrefs => ({ ...prevPrefs, ...existingPrefs[0] }));
      } else {
        // Create default preferences. Use the current state of `prefs` for defaults,
        // but ensure user_id is included.
        const defaultPrefs = { user_id: userData.id, ...prefs }; 
        await UserPrefs.create(defaultPrefs);
        // After creation, update the local state with the newly created defaults
        setPrefs(prevPrefs => ({ ...prevPrefs, ...defaultPrefs }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [prefs]); // `prefs` is a dependency here because `defaultPrefs` uses it to initialize new preferences if none exist.

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updatePref = async (key, value) => {
    try {
      const newPrefs = { ...prefs, [key]: value };
      setPrefs(newPrefs);
      
      // Update in database
      // Ensure user is loaded before attempting to update preferences
      if (user && user.id) {
        const existingPrefs = await UserPrefs.filter({ user_id: user.id });
        if (existingPrefs.length > 0) {
          await UserPrefs.update(existingPrefs[0].id, { [key]: value });
        } else {
            // This case should ideally not happen if loadPreferences correctly creates a default,
            // but for robustness, if no prefs exist, create them with the new value.
            const newDefaultPrefs = { user_id: user.id, ...newPrefs };
            await UserPrefs.create(newDefaultPrefs);
        }
      } else {
          console.warn("User data not available, cannot update preferences in DB.");
      }
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const themeOptions = [
    { id: 'dark', label: 'Dark', description: 'Dark theme (default)', icon: Moon },
    { id: 'light', label: 'Light', description: 'Light theme', icon: Sun },
    { id: 'system', label: 'System', description: 'Follow device preference', icon: Monitor }
  ];

  const fontScaleOptions = [
    { id: 'system', label: 'System Default' },
    { id: 's', label: 'Small' },
    { id: 'm', label: 'Medium' },
    { id: 'l', label: 'Large' },
    { id: 'xl', label: 'Extra Large' }
  ];

  if (isLoading) {
    return (
      <SettingsLayout currentPage="SettingsAppearance">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[rgb(var(--grey-2))] rounded"></div>
          <div className="h-32 bg-[rgb(var(--grey-2))] rounded"></div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout currentPage="SettingsAppearance">
      <SettingsHeader
        title="Appearance"
        description="Customize the look and feel of your HeavenOS experience."
      />

      <div className="space-y-6">
        {/* Theme Selection */}
        <SettingsSection 
          title="Theme" 
          description="Choose your preferred color scheme"
        >
          <div className="grid gap-3">
            {themeOptions.map((theme) => {
              const Icon = theme.icon;
              return (
                <Card 
                  key={theme.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    prefs.theme === theme.id 
                      ? 'bg-purple-600/20 border-purple-500/50' 
                      : 'bg-[rgb(var(--grey-2))]/30 border-[rgb(var(--grey-2))] hover:bg-[rgb(var(--grey-2))]/50'
                  }`}
                  onClick={() => updatePref('theme', theme.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        prefs.theme === theme.id ? 'bg-purple-500/20' : 'bg-[rgb(var(--grey-2))]'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          prefs.theme === theme.id ? 'text-purple-400' : 'text-[rgb(var(--grey-3))]'
                        }`} />
                      </div>
                      <div>
                        <div className={`font-medium ${
                          prefs.theme === theme.id 
                            ? 'text-[rgb(var(--accent-soft-white))]' 
                            : 'text-[rgb(var(--grey-3))]'
                        }`}>
                          {theme.label}
                        </div>
                        <div className="text-sm text-[rgb(var(--grey-3))]">
                          {theme.description}
                        </div>
                      </div>
                      {prefs.theme === theme.id && (
                        <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </SettingsSection>

        {/* Font Scale */}
        <SettingsSection 
          title="Text Size" 
          description="Adjust text size throughout the interface"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-4 h-4 text-[rgb(var(--grey-3))]" />
              <span className="text-sm text-[rgb(var(--grey-3))]">Current: {
                fontScaleOptions.find(f => f.id === prefs.font_scale)?.label || 'System Default'
              }</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {fontScaleOptions.map((scale) => (
                <Button
                  key={scale.id}
                  variant={prefs.font_scale === scale.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePref('font_scale', scale.id)}
                  className={prefs.font_scale === scale.id 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'border-[rgb(var(--grey-2))] text-[rgb(var(--accent-soft-white))] hover:bg-[rgb(var(--grey-2))]/30'
                  }
                >
                  {scale.label}
                </Button>
              ))}
            </div>

            {/* Preview text */}
            <div className="mt-4 p-4 bg-[rgb(var(--grey-2))]/20 rounded-lg">
              <div className="text-sm text-[rgb(var(--grey-3))] mb-2">Preview:</div>
              <div className={`text-[rgb(var(--accent-soft-white))] ${
                prefs.font_scale === 's' ? 'text-sm' :
                prefs.font_scale === 'm' ? 'text-base' :
                prefs.font_scale === 'l' ? 'text-lg' :
                prefs.font_scale === 'xl' ? 'text-xl' :
                'text-base'
              }`}>
                This is how text will appear in the interface.
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Accessibility Options */}
        <SettingsSection 
          title="Accessibility" 
          description="Options to improve accessibility"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[rgb(var(--accent-soft-white))]">Reduce Motion</div>
                <div className="text-sm text-[rgb(var(--grey-3))]">
                  Minimize animations and transitions
                </div>
              </div>
              <Button
                variant={prefs.reduce_motion ? 'default' : 'outline'}
                size="sm"
                onClick={() => updatePref('reduce_motion', !prefs.reduce_motion)}
                className={prefs.reduce_motion 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'border-[rgb(var(--grey-2))] text-[rgb(var(--accent-soft-white))]'
                }
              >
                {prefs.reduce_motion ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[rgb(var(--accent-soft-white))]">High Contrast</div>
                <div className="text-sm text-[rgb(var(--grey-3))]">
                  Increase contrast for better visibility
                </div>
              </div>
              <Button
                variant={prefs.high_contrast ? 'default' : 'outline'}
                size="sm"
                onClick={() => updatePref('high_contrast', !prefs.high_contrast)}
                className={prefs.high_contrast 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'border-[rgb(var(--grey-2))] text-[rgb(var(--accent-soft-white))]'
                }
              >
                {prefs.high_contrast ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </SettingsSection>

        {/* Color Palette Preview */}
        <SettingsSection 
          title="Color Palette" 
          description="Current HeavenOS color scheme"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-12 bg-[rgb(var(--dark-base))] rounded-lg mb-2"></div>
              <div className="text-xs text-[rgb(var(--grey-3))]">Background</div>
            </div>
            <div className="text-center">
              <div className="w-full h-12 bg-[rgb(var(--grey-1))] rounded-lg mb-2"></div>
              <div className="text-xs text-[rgb(var(--grey-3))]">Surface</div>
            </div>
            <div className="text-center">
              <div className="w-full h-12 bg-[rgb(var(--primary))] rounded-lg mb-2"></div>
              <div className="text-xs text-[rgb(var(--grey-3))]">Primary</div>
            </div>
            <div className="text-center">
              <div className="w-full h-12 bg-[rgb(var(--accent-soft-white))] rounded-lg mb-2"></div>
              <div className="text-xs text-[rgb(var(--grey-3))]">Text</div>
            </div>
          </div>
        </SettingsSection>
      </div>
    </SettingsLayout>
  );
}
