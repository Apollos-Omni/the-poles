import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  X, 
  FileImage, 
  FileVideo, 
  Link, 
  Hash,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { UploadFile } from "@/integrations/Core";
import { VisionProof } from '@/entities/VisionProof';

const proofTypes = [
  { value: 'photo', label: 'Photo Evidence', icon: Camera },
  { value: 'video', label: 'Video Evidence', icon: FileVideo },
  { value: 'link', label: 'External Link', icon: Link },
  { value: 'receipt', label: 'Receipt/Document', icon: FileImage },
  { value: 'witness', label: 'Witness Statement', icon: Users }
];

export default function ProofUploader({ 
  visionId, 
  taskId = null, 
  milestoneId = null, 
  isOpen, 
  onClose, 
  onUploaded 
}) {
  const [proof, setProof] = useState({
    title: '',
    description: '',
    proof_type: 'photo',
    location: '',
    witnesses: []
  });
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileHash, setFileHash] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  // Simulate file hash generation (in real app, would use crypto.subtle)
  const generateFileHash = useCallback(async (file) => {
    // Simplified hash simulation - in production use crypto.subtle.digest
    const arrayBuffer = await file.arrayBuffer();
    const hashArray = Array.from(new Uint8Array(arrayBuffer.slice(0, 1024)));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 32);
  }, []);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    
    if (selectedFile) {
      // Generate hash for duplicate detection
      try {
        const hash = await generateFileHash(selectedFile);
        setFileHash(hash);
        // In real app, check against existing hashes
        setDuplicateWarning(Math.random() < 0.1); // 10% chance for demo
      } catch (error) {
        console.error('Error generating file hash:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!proof.title.trim() || (proof.proof_type !== 'link' && !file && !linkUrl)) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let mediaUrl = linkUrl;
      
      // Upload file if provided
      if (file) {
        const uploadResult = await UploadFile({ file });
        mediaUrl = uploadResult.file_url;
        setUploadProgress(100);
      }
      
      // Create proof record
      const proofData = {
        vision_id: visionId,
        task_id: taskId,
        milestone_id: milestoneId,
        proof_type: proof.proof_type,
        title: proof.title,
        description: proof.description,
        media_url: mediaUrl,
        link_url: proof.proof_type === 'link' ? linkUrl : null,
        location: proof.location || null,
        witnesses: proof.witnesses.length > 0 ? proof.witnesses : null,
        file_hash: fileHash,
        verification_status: 'pending'
      };
      
      await VisionProof.create(proofData);
      
      onUploaded?.();
      onClose();
      
      // Reset form
      setProof({
        title: '',
        description: '',
        proof_type: 'photo',
        location: '',
        witnesses: []
      });
      setFile(null);
      setLinkUrl('');
      setFileHash(null);
      setDuplicateWarning(false);
    } catch (error) {
      console.error('Error uploading proof:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const selectedProofType = proofTypes.find(t => t.value === proof.proof_type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            Submit Proof
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Proof Type */}
          <div>
            <Label className="text-purple-200">Proof Type</Label>
            <Select value={proof.proof_type} onValueChange={(value) => setProof(prev => ({ ...prev, proof_type: value }))}>
              <SelectTrigger className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
                {proofTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label className="text-purple-200">Proof Title</Label>
            <Input
              value={proof.title}
              onChange={(e) => setProof(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What does this proof show?"
              className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white mt-2"
            />
          </div>

          {/* File Upload or Link Input */}
          {proof.proof_type === 'link' ? (
            <div>
              <Label className="text-purple-200">External Link</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white mt-2"
              />
            </div>
          ) : (
            <div>
              <Label className="text-purple-200">Upload File</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[rgb(var(--grey-2))] border-dashed rounded-lg cursor-pointer bg-[rgb(var(--dark-base))] hover:bg-[rgb(var(--grey-1))]">
                  {file ? (
                    <div className="text-center">
                      <selectedProofType.icon className="w-8 h-8 mb-2 text-blue-400 mx-auto" />
                      <p className="text-sm text-blue-200">{file.name}</p>
                      <p className="text-xs text-purple-300">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      {duplicateWarning && (
                        <div className="flex items-center justify-center gap-1 mt-2 text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs">Similar file detected</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={(e) => { e.preventDefault(); setFile(null); setFileHash(null); setDuplicateWarning(false); }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-[rgb(var(--grey-3))]" />
                      <p className="mb-2 text-sm text-[rgb(var(--grey-3))]">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-[rgb(var(--grey-3))]">
                        {proof.proof_type === 'video' ? 'MP4, WebM up to 50MB' : 'PNG, JPG, GIF up to 10MB'}
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept={proof.proof_type === 'video' ? 'video/*' : 'image/*'}
                    onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  />
                </label>
              </div>
              
              {isUploading && (
                <div className="mt-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-purple-300 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <Label className="text-purple-200">Description</Label>
            <Textarea
              value={proof.description}
              onChange={(e) => setProof(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide additional context..."
              rows={3}
              className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white mt-2"
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-purple-200">Location (Optional)</Label>
              <Input
                value={proof.location}
                onChange={(e) => setProof(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Where was this taken?"
                className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white mt-2"
              />
            </div>
          </div>
          
          {/* Hash Display */}
          {fileHash && (
            <div className="text-xs text-purple-300 flex items-center gap-2">
              <Hash className="w-3 h-3" />
              File Hash: {fileHash}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isUploading || !proof.title.trim() || (proof.proof_type !== 'link' && !file && !linkUrl)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? 'Submitting...' : 'Submit Proof'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}