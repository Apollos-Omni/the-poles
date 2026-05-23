import React, { useState, useEffect, useCallback } from 'react';
import { Vision } from '@/entities/Vision';
import { VisionActivity } from '@/entities/VisionActivity';
import { VisionMilestone } from '@/entities/VisionMilestone';
import { VisionTask } from '@/entities/VisionTask';
import { VisionProof } from '@/entities/VisionProof';
import { VisionSupporter } from '@/entities/VisionSupporter';
import { User } from '@/entities/User';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProgressRing from '../components/vision/ProgressRing';
import IntegrityChip from '../components/vision/IntegrityChip';
import LogActivityModal from '../components/vision/LogActivityModal';
import { ArrowLeft, Target, Plus, Share2, Users, CheckCircle, Image, Link2, GitCommit, MessageSquare } from 'lucide-react';
import { format } from "date-fns";

// Mock data until components are built
const MilestoneList = ({ milestones }) => <div className="p-4 bg-[rgb(var(--grey-1))] rounded-lg">Milestones ({milestones.length})</div>;
const ProofGrid = ({ proofs }) => <div className="p-4 bg-[rgb(var(--grey-1))] rounded-lg">Proofs ({proofs.length})</div>;
const SupporterBar = ({ supporters }) => <div className="p-4 bg-[rgb(var(--grey-1))] rounded-lg">Supporters ({supporters.length})</div>;

export default function VisionDetail() {
  const { id } = useParams();
  const [vision, setVision] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [supporters, setSupporters] = useState([]);
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogActivity, setShowLogActivity] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [
        visionData,
        milestoneData,
        taskData,
        proofData,
        supporterData,
        activityData,
        userData
      ] = await Promise.all([
        Vision.get(id),
        VisionMilestone.filter({ vision_id: id }),
        VisionTask.filter({ vision_id: id }),
        VisionProof.filter({ vision_id: id }),
        VisionSupporter.filter({ vision_id: id }),
        VisionActivity.filter({ vision_id: id }, '-created_date', 20),
        User.me()
      ]);

      setVision(visionData);
      setMilestones(milestoneData);
      setTasks(taskData);
      setProofs(proofData);
      setSupporters(supporterData);
      setActivities(activityData);
      setUser(userData);
    } catch (error) {
      console.error("Failed to load vision details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return <div className="p-8 text-white">Loading vision...</div>;
  }

  if (!vision) {
    return <div className="p-8 text-white">Vision not found.</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl("VisionTracker")} className="flex items-center gap-2 text-[rgb(var(--grey-3))] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to all visions
        </Link>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {vision.cover_image_url && 
              <img src={vision.cover_image_url} alt={vision.title} className="w-full md:w-1/3 h-auto object-cover rounded-lg" />
            }
            <div className="flex-1">
              <Badge className="bg-purple-600/20 text-purple-300 mb-2">{vision.category}</Badge>
              <h1 className="text-4xl font-bold text-white mb-2">{vision.title}</h1>
              <p className="text-lg text-[rgb(var(--grey-3))] mb-4">{vision.description}</p>
              <div className="flex items-center gap-4">
                <ProgressRing progress={vision.progress} size={80} strokeWidth={6} />
                <IntegrityChip score={vision.integrity_score} />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="flex flex-wrap gap-3 p-4 bg-[rgb(var(--grey-1))] rounded-lg mb-8">
          <Button onClick={() => setShowLogActivity(true)}><Plus className="w-4 h-4 mr-2" /> Log Activity</Button>
          <Button variant="outline">Invite Collaborator</Button>
          <Button variant="outline">Pledge Support</Button>
          <Button variant="outline"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-purple-400" /> Milestones & Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <MilestoneList milestones={milestones} tasks={tasks} />
              </CardContent>
            </Card>
            <Card className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Proofs</CardTitle>
              </CardHeader>
              <CardContent>
                <ProofGrid proofs={proofs} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" /> Supporters</CardTitle>
              </CardHeader>
              <CardContent>
                <SupporterBar supporters={supporters} />
              </CardContent>
            </Card>
            <Card className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GitCommit className="w-5 h-5 text-gray-400" /> Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map(act => (
                    <div key={act.id} className="text-sm text-[rgb(var(--grey-3))]">{act.title}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showLogActivity && (
        <LogActivityModal 
          vision={vision}
          user={user}
          onClose={() => setShowLogActivity(false)}
          onActivityLogged={loadData}
        />
      )}
    </div>
  );
}