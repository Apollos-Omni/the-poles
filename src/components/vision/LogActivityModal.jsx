import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadFile } from "@/integrations/Core";
import { VisionActivity } from "@/entities/VisionActivity";
import { VisionProof } from "@/entities/VisionProof";
import { CheckCircle, Camera, Trophy, Heart, Activity, MessageCircle, Upload, X } from "lucide-react";

const activityTypes = [
  { value: 'task_completed', label: 'Task Completed', icon: CheckCircle },
  { value: 'proof_submitted', label: 'Submit Proof', icon: Camera },
  { value: 'milestone_reached', label: 'Milestone Reached', icon: Trophy },
  { value: 'check_in', label: 'Check-in', icon: Activity },
  { value: 'pledge_made', label: 'Make Pledge', icon: Heart },
  { value: 'comment', label: 'Add Comment', icon: MessageCircle }
];

export default function LogActivityModal({ vision, user, onClose, onActivityLogged }) {
  const [activityType, setActivityType] = useState('check_in');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title) return;
    setIsSubmitting(true);
    
    let proofId = null;

    try {
      // If it's a proof submission, upload file first
      if (activityType === 'proof_submitted' && file) {
        const uploadResult = await UploadFile({ file });
        const proof = await VisionProof.create({
          vision_id: vision.id,
          proof_type: 'photo', // Simplified for now
          title: title,
          description: description,
          media_url: uploadResult.file_url,
          verification_status: 'pending'
        });
        proofId = proof.id;
      }

      // Create the activity log
      await VisionActivity.create({
        vision_id: vision.id,
        user_id: user.id,
        activity_type: activityType,
        title: title,
        description: description,
        related_id: proofId,
        karma_delta: 2, // Simplified karma
      });

      onActivityLogged();
      onClose();
    } catch (error) {
      console.error("Failed to log activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Log Activity for "{vision.title}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="activity-type">Activity Type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id="activity-type" className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
                {activityTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" /> {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="title">Title / Summary</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))]" />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))]" />
          </div>
          {activityType === 'proof_submitted' && (
            <div>
              <Label htmlFor="proof-file">Proof Media</Label>
              <div className="mt-2 flex items-center justify-center w-full">
                <label htmlFor="proof-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-[rgb(var(--grey-2))] border-dashed rounded-lg cursor-pointer bg-[rgb(var(--dark-base))] hover:bg-[rgb(var(--grey-1))]">
                  {file ? (
                    <div className="text-center">
                      <p className="text-sm text-[rgb(var(--grey-3))]">{file.name}</p>
                      <Button variant="link" size="sm" className="text-red-500" onClick={(e) => { e.preventDefault(); setFile(null); }}>Remove</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-[rgb(var(--grey-3))]" />
                      <p className="mb-2 text-sm text-[rgb(var(--grey-3))]"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-[rgb(var(--grey-3))]">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                  <input id="proof-file" type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                </label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title}>
            {isSubmitting ? 'Submitting...' : 'Log Activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}