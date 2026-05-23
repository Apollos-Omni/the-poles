
import React, { useState, useEffect } from "react";
import { useDoor, useDoorActions } from "../hinge-sdk/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, DoorOpen, DoorClosed, Wifi, WifiOff } from "lucide-react";

const statusColors = {
  "OPEN": "bg-green-100 text-green-800",
  "CLOSED": "bg-blue-100 text-blue-800", 
  "UNKNOWN": "bg-gray-100 text-gray-800"
};

const statusIcons = {
  "OPEN": DoorOpen,
  "CLOSED": DoorClosed,
  "UNKNOWN": WifiOff
};

function DoorRow({ door, stream, sender, issuer, supabaseToken, getPhoneLocation }) {
  const tele = useDoor(door.device_id, stream);
  
  const { open, close, lock, unlock, isLoading, error } = useDoorActions({
    door,
    issuer,
    sender,
    supabaseToken,
    getPhoneLocation,
  });

  const StatusIcon = statusIcons[tele?.door_state] || WifiOff;
  const isOnline = tele && (Date.now() - new Date(tele.ts).getTime() < 30000);

  return (
    <Card className="bg-black/20 backdrop-blur-sm border border-blue-700/30 text-white transition-all hover:border-blue-500/70">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-100">
            <StatusIcon className="w-5 h-5 text-blue-300" />
            {door.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`border-blue-500/50 text-blue-200`}>
              {tele?.door_state || "UNKNOWN"}
            </Badge>
            <Badge variant={isOnline ? "default" : "destructive"} className={isOnline ? 'bg-green-600/30 text-green-200 border-green-500/50' : 'bg-red-600/30 text-red-200 border-red-500/50'}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-blue-300">
              <span className="font-medium text-blue-100">Device:</span> 
              <code className="ml-1 text-xs">{door.device_id.slice(0, 8)}...</code>
            </div>
            <div className="text-sm text-blue-300">
              <span className="font-medium text-blue-100">Location:</span> {door.location || "Unknown"}
            </div>
            <div className="text-sm text-blue-300">
              <span className="font-medium text-blue-100">Last Motion:</span> {tele?.last_motion ? new Date(tele.last_motion).toLocaleString() : "-"}
            </div>
            <div className="text-sm text-blue-300">
              <span className="font-medium text-blue-100">Event:</span> {tele?.event || "-"}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-100 mb-2">Actions:</div>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={open}
                disabled={isLoading}
                className="text-blue-200 border-blue-600 hover:bg-blue-700/40 hover:text-white"
              >
                <DoorOpen className="w-4 h-4 mr-1" />
                Open
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={close}
                disabled={isLoading}
                 className="text-blue-200 border-blue-600 hover:bg-blue-700/40 hover:text-white"
              >
                <DoorClosed className="w-4 h-4 mr-1" />
                Close
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={lock}
                disabled={isLoading}
                 className="text-blue-200 border-blue-600 hover:bg-blue-700/40 hover:text-white"
              >
                <Lock className="w-4 h-4 mr-1" />
                Lock
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={unlock}
                disabled={isLoading}
                 className="text-blue-200 border-blue-600 hover:bg-blue-700/40 hover:text-white"
              >
                <Unlock className="w-4 h-4 mr-1" />
                Unlock
              </Button>
            </div>
            {error && (
              <div className="text-xs text-red-400 mt-2">{error}</div>
            )}
            {isLoading && (
              <div className="text-xs text-blue-400 mt-2 animate-pulse">Sending command...</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DoorsTable(props) {
  const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!props.api) return;
    (async () => {
      setLoading(true);
      try {
        const doorsData = await props.api.listDoors();
        setDoors(doorsData);
        setErr(null);
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [props.api]);


  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3">Loading doors...</span>
    </div>
  );

  if (err) return (
    <div className="text-red-600 p-4 bg-red-50 rounded-lg">
      <strong>Error:</strong> {String(err.message || err)}
    </div>
  );

  if (!doors.length) return (
    <div className="text-center p-8 text-gray-500">
      <DoorClosed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p>No doors configured yet.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {doors.map(d => <DoorRow key={d.id} door={d} {...props} />)}
    </div>
  );
}
