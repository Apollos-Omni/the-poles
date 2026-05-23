
import React, { useState, useEffect, useCallback } from 'react';
import { HingeDevice } from '@/entities/HingeDevice';
import { HingeState } from '@/entities/HingeState';
import { User } from '@/entities/User';
import { Globe, DoorOpen, Palette } from 'lucide-react';
import HomeLayoutMap from '../components/homeworld/HomeLayoutMap';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

export default function HomeWorld() {
  const [hinges, setHinges] = useState([]);
  const [states, setStates] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const hingeData = await HingeDevice.list();
      setHinges(hingeData);
      
      const statePromises = hingeData.map(h => HingeState.filter({ device_id: h.id }));
      const stateResults = await Promise.all(statePromises);

      const newStates = {};
      stateResults.forEach((stateArr, index) => {
        if (stateArr.length > 0) {
          newStates[hingeData[index].id] = stateArr[0];
        }
      });
      setStates(newStates);

    } catch (error) {
      console.error("Error loading Home World data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const sendCommand = async (deviceId, commandType, args = {}) => {
    try {
        console.log(`Sending command: ${commandType} to ${deviceId}`, args);
        // This would call the actual API endpoint
        // For now, we simulate optimistic update
        const hinge = hinges.find(h => h.id === deviceId);
        const currentState = states[deviceId];
        if (!hinge || !currentState) return;

        if (commandType === 'LOCK' || commandType === 'UNLOCK') {
            const nextLockState = commandType === 'LOCK' ? 'locked' : 'unlocked';
            setStates(prev => ({
                ...prev,
                [deviceId]: { ...prev[deviceId], lock_state: nextLockState }
            }));
        }
    } catch(e) {
        console.error("Failed to send command:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
            <div className="h-10 w-1/3 bg-gray-700 rounded mb-6"></div>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-blue-700/30 p-8 h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Sacred Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1"> {/* Added flex-1 here */}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-white to-indigo-300 bg-clip-text text-transparent">
                Home World
              </h1>
              <p className="text-blue-200/80">Your personal realm, visualized.</p>
            </div>
            {/* Assuming createPageUrl("HomeLayoutDesigner") maps to a path like "/home-layout-designer" */}
            <Link to="/home-layout-designer"> 
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600">
                <Palette className="w-5 h-5 mr-2" />
                Edit Layout
              </Button>
            </Link>
        </div>

        {hinges.length > 0 ? (
          <HomeLayoutMap
            hinges={hinges}
            states={states}
            onDoorTap={sendCommand}
          />
        ) : (
            <div className="text-center p-12 bg-black/30 rounded-2xl border border-blue-700/30">
                <DoorOpen className="w-16 h-16 mx-auto mb-4 text-blue-400/50" />
                <h3 className="text-xl font-semibold text-blue-200">No Gateways Found</h3>
                <p className="text-blue-300/70 mb-6">Add a Divine Hinge device to see your Home World take shape.</p>
                <Button>Add Device</Button>
            </div>
        )}

      </div>
    </div>
  );
}
