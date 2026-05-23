import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, Wifi, WifiOff, Lock, Unlock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  "online": "bg-green-100 text-green-800 border-green-200",
  "offline": "bg-red-100 text-red-800 border-red-200", 
  "locked": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "unlocked": "bg-blue-100 text-blue-800 border-blue-200",
  "maintenance": "bg-purple-100 text-purple-800 border-purple-200"
};

const statusIcons = {
  "online": Wifi,
  "offline": WifiOff,
  "locked": Lock,
  "unlocked": Unlock,
  "maintenance": Shield
};

export default function HingeStatus({ hinges }) {
  const activeHinges = hinges.filter(h => h.status === 'online' || h.status === 'locked' || h.status === 'unlocked').length;
  const totalHinges = hinges.length;

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 hover:border-blue-200 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
            <DoorOpen className="w-6 h-6 text-blue-600" />
            Gateway Status
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {activeHinges}/{totalHinges} Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {hinges.slice(0, 3).map((hinge) => {
            const StatusIcon = statusIcons[hinge.status];
            return (
              <div key={hinge.id} className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <StatusIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{hinge.name}</p>
                    <p className="text-sm text-gray-500">{hinge.location}</p>
                  </div>
                </div>
                <Badge className={`${statusColors[hinge.status]} border text-xs`}>
                  {hinge.status}
                </Badge>
              </div>
            );
          })}
          
          {totalHinges === 0 && (
            <div className="text-center py-6 text-gray-500">
              <DoorOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No gateways established</p>
            </div>
          )}

          <Link 
            to={createPageUrl("HingeControl")} 
            className="block w-full mt-4 p-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-xl font-medium transition-colors"
          >
            Manage All Gateways →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}