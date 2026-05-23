import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Draft } from "@/entities/Draft";
import { 
  Send, 
  Clock, 
  Heart, 
  MessageSquare, 
  Shield, 
  HelpCircle,
  Brain,
  Timer
} from "lucide-react";

const intentTypes = [
  { value: 'share', label: 'Share', icon: MessageSquare, description: 'Share thoughts or experiences' },
  { value: 'apology', label: 'Apology', icon: Heart, description: 'Acknowledge hurt and seek healing' },
  { value: 'boundary', label: 'Boundary', icon: Shield, description: 'Set or clarify boundaries' },
  { value: 'question', label: 'Question', icon: HelpCircle, description: 'Ask for clarity or understanding' },
  { value: 'debrief', label: 'Debrief', icon: Brain, description: 'Process and reflect together' },
  { value: 'gratitude', label: 'Gratitude', icon: Heart, description: 'Express appreciation' }
];

const coolingPeriods = [
  { value: 5, label: '5 minutes', description: 'Quick pause' },
  { value: 30, label: '30 minutes', description: 'Standard cooling' },
  { value: 120, label: '2 hours', description: 'Deep reflection' },
  { value: 1440, label: '24 hours', description: 'Full processing' }
];

export default function UnsentComposer({ user, onDraftCreated }) {
  const [formData, setFormData] = useState({
    content: '',
    intent: 'share',
    target_user_id: '',
    cooling_minutes: 120,
    tags: []
  });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContentChange = (e) => {
    const content = e.target.value;
    setFormData(prev => ({ ...prev, content }));
    
    // Simulate AI analysis (in real app, this would call AI service)
    if (content.length > 50) {
      setIsAnalyzing(true);
      setTimeout(() => {
        setAiAnalysis({
          tone: {
            empathy: Math.floor(Math.random() * 40) + 60,
            clarity: Math.floor(Math.random() * 30) + 70,
            blame: Math.floor(Math.random() * 30),
            toxicity: Math.floor(Math.random() * 20)
          },
          suggestions: [
            'Consider starting with "I feel..." to express your emotions',
            'Try focusing on specific behaviors rather than character judgments',
            'What outcome are you hoping for from this message?'
          ]
        });
        setIsAnalyzing(false);
      }, 1500);
    } else {
      setAiAnalysis(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const coolingUntil = new Date();
      coolingUntil.setMinutes(coolingUntil.getMinutes() + formData.cooling_minutes);
      
      await Draft.create({
        author_id: user.id,
        content: formData.content,
        intent: formData.intent,
        target_user_id: formData.target_user_id || null,
        cooling_until: coolingUntil.toISOString(),
        processing_stage: 'cooling',
        ai_analysis: aiAnalysis,
        tags: formData.tags
      });
      
      // Reset form
      setFormData({
        content: '',
        intent: 'share',
        target_user_id: '',
        cooling_minutes: 120,
        tags: []
      });
      setAiAnalysis(null);
      
      onDraftCreated();
    } catch (error) {
      console.error('Error creating draft:', error);
    }
    setIsSubmitting(false);
  };

  const selectedIntent = intentTypes.find(t => t.value === formData.intent);

  return (
    <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-100">
          <Send className="w-5 h-5" />
          Compose Unsent Message
        </CardTitle>
        <p className="text-purple-300/80 text-sm">
          Write what you really want to say. It will go through a cooling period before you can choose how to share it.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Intent Selection */}
          <div className="space-y-3">
            <Label className="text-purple-200">What's your intent?</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {intentTypes.map((intent) => {
                const Icon = intent.icon;
                return (
                  <button
                    key={intent.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, intent: intent.value }))}
                    className={`p-3 rounded-lg text-left transition-all duration-200 ${
                      formData.intent === intent.value
                        ? 'bg-purple-600/40 border-2 border-purple-400 text-white'
                        : 'bg-black/40 border border-purple-700/30 text-purple-300 hover:bg-purple-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{intent.label}</span>
                    </div>
                    <p className="text-xs opacity-80">{intent.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label className="text-purple-200">Your message</Label>
            <textarea
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Write what you really want to say..."
              className="w-full h-32 px-4 py-3 bg-black/40 border border-purple-700/50 rounded-lg text-white placeholder-purple-400/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              required
            />
            <div className="flex justify-between text-sm">
              <span className="text-purple-400/60">{formData.content.length} characters</span>
              {isAnalyzing && (
                <span className="text-purple-300 flex items-center gap-1">
                  <Brain className="w-3 h-3 animate-pulse" />
                  Analyzing...
                </span>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          {aiAnalysis && (
            <div className="space-y-3 p-4 bg-black/40 rounded-lg border border-purple-700/30">
              <h4 className="font-medium text-purple-100 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Analysis
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(aiAnalysis.tone).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-white">{value}%</div>
                    <div className="text-xs text-purple-300 capitalize">{key}</div>
                    <div className={`w-full h-1 rounded mt-1 ${
                      key === 'empathy' || key === 'clarity' 
                        ? value > 70 ? 'bg-green-500' : value > 50 ? 'bg-yellow-500' : 'bg-red-500'
                        : value < 30 ? 'bg-green-500' : value < 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium text-purple-200">Suggestions:</h5>
                {aiAnalysis.suggestions.map((suggestion, index) => (
                  <p key={index} className="text-sm text-purple-300/80 flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    {suggestion}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Cooling Period */}
          <div className="space-y-2">
            <Label className="text-purple-200 flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Cooling Period
            </Label>
            <Select value={formData.cooling_minutes.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, cooling_minutes: parseInt(value) }))}>
              <SelectTrigger className="bg-black/40 border-purple-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-purple-900 border-purple-700">
                {coolingPeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value.toString()} className="text-white hover:bg-purple-800">
                    <div className="flex flex-col">
                      <span>{period.label}</span>
                      <span className="text-xs text-purple-300">{period.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-purple-700/30">
            <div className="text-sm text-purple-300/70">
              Your message will be processed and enter a cooling period
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.content.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Start Cooling Period
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}