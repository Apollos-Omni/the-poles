import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  Trophy,
  ExternalLink,
  DollarSign,
  Gift,
  CheckCircle,
  Lock,
  Zap
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function SweepstakesCard({ sweepstakes, userEntry, onEnter, user }) {
  const [isEntering, setIsEntering] = useState(false);

  const progressPercentage = (sweepstakes.current_entries / sweepstakes.target_entries) * 100;
  const isActive = sweepstakes.status === 'OPEN';
  const isLocked = sweepstakes.status === 'LOCKED';
  const isCompleted = sweepstakes.status === 'COMPLETED';
  const hasUserEntered = !!userEntry;

  const handleEnter = async (method) => {
    if (!user || hasUserEntered || !isActive) return;
    
    setIsEntering(true);
    try {
      await onEnter(sweepstakes.id, method);
    } finally {
      setIsEntering(false);
    }
  };

  const getStatusColor = () => {
    switch (sweepstakes.status) {
      case 'OPEN': return 'bg-green-100 text-green-800 border-green-200';
      case 'LOCKED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = () => {
    switch (sweepstakes.status) {
      case 'OPEN': return <Clock className="w-4 h-4" />;
      case 'LOCKED': return <Lock className="w-4 h-4" />;
      case 'COMPLETED': return <Trophy className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`bg-white/60 backdrop-blur-sm border transition-all duration-300 hover:border-blue-300 ${
      hasUserEntered ? 'border-green-400' : 'border-slate-200'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-slate-800 text-lg mb-2">
              {sweepstakes.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor()}>
                {getStatusIcon()}
                <span className="ml-1">{sweepstakes.status}</span>
              </Badge>
              {hasUserEntered && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Entered
                </Badge>
              )}
            </div>
          </div>
          
          {sweepstakes.product_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(sweepstakes.product_url, '_blank', 'noopener,noreferrer')}
              className="text-slate-500 hover:text-slate-800"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="text-slate-700 font-medium">
              {sweepstakes.current_entries} / {sweepstakes.target_entries}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-sky-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500">{Math.round(progressPercentage)}% filled</div>
        </div>

        {/* Entry Breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-100/70 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-slate-600">Paid</span>
            </div>
            <div className="text-green-700 font-semibold">{sweepstakes.paid_entries || 0}</div>
          </div>
          
          <div className="bg-slate-100/70 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">AMOE</span>
            </div>
            <div className="text-blue-700 font-semibold">{sweepstakes.amoe_entries || 0}</div>
          </div>
        </div>

        {/* Timing */}
        {sweepstakes.deadline && (
          <div className="text-sm text-slate-500">
            {isActive ? 
              `Ends ${formatDistanceToNow(new Date(sweepstakes.deadline), { addSuffix: true })}` :
              `Ended ${format(new Date(sweepstakes.deadline), 'MMM d, yyyy')}`
            }
          </div>
        )}

        {/* Entry Cost */}
        {sweepstakes.suggested_contribution_cents && (
          <div className="text-sm text-slate-500">
            Suggested contribution: <span className="text-slate-800 font-semibold">
              ${(sweepstakes.suggested_contribution_cents / 100).toFixed(2)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {isActive && !hasUserEntered && (
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => handleEnter('paid')}
              disabled={isEntering}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
            >
              {isEntering ? 'Entering...' : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Enter (Paid)
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => handleEnter('amoe')}
              disabled={isEntering}
              variant="outline"
              className="flex-1 border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              {isEntering ? 'Entering...' : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Free Entry
                </>
              )}
            </Button>
          </div>
        )}

        {hasUserEntered && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 text-sm font-medium">
                You're entered via {userEntry.entry_method.toUpperCase()}!
              </span>
            </div>
            {userEntry.entry_method === 'paid' && (
              <div className="text-xs text-green-700 mt-1">
                Contributed ${(userEntry.contribution_amount_cents / 100).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {isLocked && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-center">
            <Lock className="w-5 h-5 mx-auto mb-2 text-yellow-600" />
            <span className="text-yellow-800 text-sm">
              Entries locked - Drawing in progress
            </span>
          </div>
        )}

        {isCompleted && sweepstakes.draw_proof && (
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">Draw Complete</span>
            </div>
            <div className="text-xs text-blue-700">
              Winner selected from {sweepstakes.draw_proof.entryCount} entries
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-blue-600 hover:text-blue-800 p-0 h-auto"
              onClick={() => console.log('View proof:', sweepstakes.draw_proof)}
            >
              <Zap className="w-3 h-3 mr-1" />
              View Draw Proof
            </Button>
          </div>
        )}

        {/* Official Rules Link */}
        {sweepstakes.official_rules_url && (
          <div className="pt-2 border-t border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(sweepstakes.official_rules_url, '_blank')}
              className="text-slate-500 hover:text-slate-800 p-0 h-auto text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Official Rules
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}