import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Hinge } from '@/entities/Hinge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Ruler } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import HomeLayoutEditor from '../components/homeworld/HomeLayoutEditor';
import { defaultHomeLayout } from '../components/homeworld/types';

export default function HomeLayoutDesigner() {
  const [user, setUser] = useState(null);
  const [hinges, setHinges] = useState([]);
  const [layout, setLayout] = useState(defaultHomeLayout);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Load user's hinges
      const hingesData = await Hinge.filter({ owner_id: userData.id }, '-updated_date');
      setHinges(hingesData);

      // Convert hinges to doors for the layout
      const doors = hingesData.map(hinge => ({
        id: hinge.id,
        name: hinge.name,
        pos: {
          x: hinge.coordinates_x || Math.random() * 10,
          y: hinge.coordinates_y || Math.random() * 8
        },
        angleDeg: hinge.angleDeg || 0,
        state: 'closed',
        lock: 'locked'
      }));

      setLayout(prev => ({
        ...prev,
        doors: doors
      }));

    } catch (error) {
      console.error('Error loading layout data:', error);
      // Use default layout in case of error
      setLayout(defaultHomeLayout);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (newLayout) => {
    try {
      // Save door positions back to hinges
      for (const door of newLayout.doors) {
        const hinge = hinges.find(h => h.id === door.id);
        if (hinge) {
          await Hinge.update(hinge.id, {
            coordinates_x: door.pos.x,
            coordinates_y: door.pos.y,
            angleDeg: door.angleDeg
          });
        }
      }

      // Save layout to user preferences (could also be a separate entity)
      await User.updateMyUserData({
        home_layout: {
          origin: newLayout.origin,
          size: newLayout.size
        }
      });

      alert('Layout saved successfully!');
      
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Failed to save layout. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-purple-700/30">
                <div className="h-32 bg-purple-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Link 
              to={createPageUrl("HomeWorld")} 
              className="flex items-center gap-2 text-purple-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home World
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Ruler className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-indigo-300 bg-clip-text text-transparent">
                  Home Layout Designer
                </h1>
                <p className="text-purple-200/80">Design your sacred space • Position your gateways</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-purple-100 font-semibold mb-3">✨ How to Design Your Layout</h3>
          <div className="grid md:grid-cols-2 gap-4 text-purple-200 text-sm">
            <div>
              <strong>🏠 House Setup:</strong> Set your house dimensions and origin point (front door or center)
            </div>
            <div>
              <strong>🚪 Add Doors:</strong> Click "Add Door" then click on the map to place new doors
            </div>
            <div>
              <strong>📍 Position Doors:</strong> Drag existing doors to reposition them perfectly
            </div>
            <div>
              <strong>🔄 Rotate Doors:</strong> Select a door and use the angle slider to set hinge orientation
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <HomeLayoutEditor
          initial={layout}
          onSave={handleSave}
          className="mb-8"
        />

        {/* Door Count Status */}
        <div className="text-center text-purple-300/70 text-sm">
          {layout.doors.length} door{layout.doors.length !== 1 ? 's' : ''} configured
          {hinges.length > 0 && ` • ${hinges.length} Divine Hinge device${hinges.length !== 1 ? 's' : ''} connected`}
        </div>
      </div>
    </div>
  );
}