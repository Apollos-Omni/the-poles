import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Target, 
  DoorOpen,
  Users, 
  Zap,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const actions = [
  {
    title: "Add Vision",
    description: "Set new goals",
    icon: Target,
    url: "VisionTracker",
    color: "bg-purple-500 hover:bg-purple-600"
  },
  {
    title: "Manage Gateway",
    description: "Control a threshold",
    icon: DoorOpen,
    url: "HingeControl", 
    color: "bg-blue-500 hover:bg-blue-600"
  },
  {
    title: "Join Community",
    description: "Connect with others",
    icon: Users,
    url: "Community",
    color: "bg-green-500 hover:bg-green-600"
  }
];

export default function QuickActions() {
  return (
    <Card className="bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
          <Zap className="w-6 h-6 text-orange-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => (
            <Link key={action.title} to={createPageUrl(action.url)}>
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4 border-orange-100 hover:border-orange-200 hover:bg-orange-50 transition-all"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{action.title}</div>
                  <div className="text-sm text-gray-500">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}