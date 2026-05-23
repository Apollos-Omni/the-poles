import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Draft } from "@/entities/Draft";
import { 
  Clock, 
  Edit, 
  Trash2, 
  Send, 
  Brain,
  Heart,
  MessageSquare,
  Shield,
  HelpCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const intentIcons = {
  share: MessageSquare,
  apology: Heart,
  boundary: Shield,
  question: HelpCircle,
  debrief: Brain,
  gratitude: Heart
};

const intentColors = {
  share: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  apology: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  boundary: "bg-red-500/20 text-red-300 border-red-500/30",
  question: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  debrief: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  gratitude: "bg-green-500/20 text-green-300 border-green-500/30"
};

export default function CoolingCard({ draft, onUpdate }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isCoolingComplete, setIsCoolingComplete] = useState(false);
  const [reflectionNotes, setReflectionNotes] = useState(draft.reflection_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const coolingEnd = new Date(draft.cooling_until);
      const timeDiff = coolingEnd - now;

      if (timeDiff <= 0) {
        setTimeLeft('Ready to publish');
        setIsCoolingComplete(true);
      } else {
        setTimeLeft(formatDistanceToNow(coolingEnd, { addSuffix: false }));
        setIsCoolingComplete(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [draft.cooling_until]);

  const handleUpdateReflection = async () => {
    setIsUpdating(true);
    try {
      await Draft.update(draft.id, { reflection_notes: reflectionNotes });
      onUpdate();
    } catch (error) {
      console.error('Error updating reflection:', error);
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        await Draft.delete(draft.id);
        onUpdate();
      } catch (error) {
        console.error('Error deleting draft:', error);
      }
    }
  };

  const handlePublish = async () => {
    try {
      await Draft.update(draft.id, { processing_stage: 'ready' });
      onUpdate();
    } catch (error) {
      console.error('Error updating draft status:', error);
    }
  };

  const IntentIcon = intentIcons[draft.intent] || MessageSquare;

  return (
    <Card className="bg-gradient-to-br from-purple-600/20 to-black/40 backdrop-blur-sm border border-purple-500/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/40 rounded-full flex items-center justify-center">
              <IntentIcon className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <CardTitle className="text-lg text-purple-100">
                {draft.intent.charAt(0).toUpperCase() + draft.intent.slice(1)} Message
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={intentColors[draft.intent]}>
                  {draft.intent}
                </Badge>
                {!isCoolingComplete ? (
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeLeft} left
                  </Badge>
                ) : (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 animate-pulse">
                    Ready to publish
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-purple-400">
            {formatDistanceToNow(new Date(draft.created_date), { addSuffix: true })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Message Preview */}
        <div className="p-4 bg-black/40 rounded-lg">
          <p className="text-purple-100 line-clamp-4">{draft.content}</p>
          {draft.content.length > 200 && (
            <button className="text-purple-400 hover:text-purple-300 text-sm mt-2">
              Read more...
            </button>
          )}
        </div>

        {/* AI Analysis Preview */}
        {draft.ai_analysis && (
          <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <h4 className="font-medium text-purple-200 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Analysis
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(draft.ai_analysis.tone || {}).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-sm font-bold text-white">{value}%</div>
                  <div className="text-xs text-purple-300 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reflection Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">Reflection Notes</label>
          <textarea
            value={reflectionNotes}
            onChange={(e) => setReflectionNotes(e.target.value)}
            placeholder="How do you feel about this message now? What would you change?"
            className="w-full h-20 px-3 py-2 bg-black/40 border border-purple-700/50 rounded-lg text-white placeholder-purple-400/60 text-sm resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          {reflectionNotes !== (draft.reflection_notes || '') && (
            <Button 
              size="sm" 
              onClick={handleUpdateReflection} 
              disabled={isUpdating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUpdating ? 'Saving...' : 'Save Reflection'}
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-purple-700/30">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDelete}
              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {!isCoolingComplete ? (
              <Button size="sm" disabled className="bg-gray-700 text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                Still cooling
              </Button>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Revise
                </Button>
                <Button 
                  size="sm" 
                  onClick={handlePublish}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Publish
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}