import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryColors = {
  personal: "bg-purple-100 text-purple-800",
  community: "bg-green-100 text-green-800",
  spiritual: "bg-yellow-100 text-yellow-800",
  professional: "bg-blue-100 text-blue-800",
  health: "bg-red-100 text-red-800",
  relationships: "bg-pink-100 text-pink-800"
};

export default function VisionProgress({ visions }) {
  const averageProgress = visions.length > 0 
    ? visions.reduce((sum, v) => sum + v.progress, 0) / visions.length 
    : 0;

  return (
    <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 hover:border-purple-200 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
            <Target className="w-6 h-6 text-purple-600" />
            Vision Progress
          </CardTitle>
          <div className="text-right">
            <div className="text-sm font-semibold text-purple-700">{Math.round(averageProgress)}%</div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {visions.slice(0, 3).map((vision) => (
            <div key={vision.id} className="p-3 bg-white/70 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 truncate">{vision.title}</h4>
                <span className={`px-2 py-1 rounded text-xs ${categoryColors[vision.category]}`}>
                  {vision.category}
                </span>
              </div>
              <div className="space-y-2">
                <Progress value={vision.progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{vision.progress}% complete</span>
                  {vision.target_date && (
                    <span>Target: {new Date(vision.target_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {visions.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No active visions</p>
            </div>
          )}

          <Link 
            to={createPageUrl("VisionTracker")} 
            className="block w-full mt-4 p-3 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-xl font-medium transition-colors"
          >
            View All Visions →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}