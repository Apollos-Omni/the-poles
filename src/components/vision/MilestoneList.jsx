import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  CheckCircle, 
  Circle, 
  Clock, 
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { format, isAfter } from "date-fns";

export default function MilestoneList({ milestones, tasks, onTaskToggle, onMilestoneComplete, canEdit = false }) {
  const [expandedMilestones, setExpandedMilestones] = useState(new Set());

  const toggleMilestone = (milestoneId) => {
    const newExpanded = new Set(expandedMilestones);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedMilestones(newExpanded);
  };

  const getMilestoneProgress = (milestone) => {
    const milestoneTasks = tasks.filter(t => t.milestone_id === milestone.id);
    if (milestoneTasks.length === 0) return milestone.completed ? 100 : 0;
    
    const completedTasks = milestoneTasks.filter(t => t.completed).length;
    return (completedTasks / milestoneTasks.length) * 100;
  };

  const isOverdue = (targetDate) => {
    return targetDate && isAfter(new Date(), new Date(targetDate));
  };

  if (milestones.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 mx-auto mb-4 text-purple-400/50" />
        <h3 className="text-lg font-semibold text-purple-200 mb-2">No Milestones Yet</h3>
        <p className="text-purple-300/70">Break down your vision into achievable milestones</p>
        {canEdit && (
          <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((milestone) => {
        const progress = getMilestoneProgress(milestone);
        const milestoneTasks = tasks.filter(t => t.milestone_id === milestone.id);
        const isExpanded = expandedMilestones.has(milestone.id);
        const overdue = isOverdue(milestone.target_date);

        return (
          <Card key={milestone.id} className="bg-gradient-to-br from-purple-600/10 to-black/40 backdrop-blur-sm border border-purple-700/30">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleMilestone(milestone.id)}
                    className="mt-1 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {milestone.completed ? 
                        <CheckCircle className="w-5 h-5 text-green-400" /> :
                        <Circle className="w-5 h-5 text-purple-400" />
                      }
                      <CardTitle className={`text-lg ${milestone.completed ? 'line-through text-purple-300' : 'text-purple-100'}`}>
                        {milestone.title}
                      </CardTitle>
                    </div>
                    
                    {milestone.description && (
                      <p className="text-purple-200/80 text-sm mb-3">{milestone.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-purple-300 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-purple-900/40" />
                      </div>
                      
                      {milestone.target_date && (
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          <span className={overdue ? 'text-red-400' : 'text-purple-300'}>
                            {format(new Date(milestone.target_date), 'MMM d')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={milestone.completed ? 'bg-green-600/20 text-green-300' : 'bg-purple-600/20 text-purple-300'}>
                          {milestone.completed ? 'Completed' : `${milestoneTasks.length} tasks`}
                        </Badge>
                        {overdue && !milestone.completed && (
                          <Badge className="bg-red-600/20 text-red-300 border-red-500/30">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      {canEdit && !milestone.completed && progress === 100 && (
                        <Button
                          size="sm"
                          onClick={() => onMilestoneComplete?.(milestone.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && milestoneTasks.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-2 ml-7">
                  {milestoneTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-800/20 transition-colors">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => onTaskToggle?.(task.id)}
                        disabled={!canEdit}
                      />
                      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-purple-300' : 'text-purple-100'}`}>
                        {task.title}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-purple-400">
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}