
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  CalendarIcon, 
  Plus, 
  X,
  Upload,
  Link,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { Vision } from '@/entities/Vision';

const categoryOptions = [
  { value: 'personal', label: 'Personal Growth', color: 'from-purple-500 to-purple-600' },
  { value: 'community', label: 'Community Impact', color: 'from-green-500 to-green-600' },
  { value: 'spiritual', label: 'Spiritual Journey', color: 'from-yellow-500 to-yellow-600' },
  { value: 'professional', label: 'Career Development', color: 'from-blue-500 to-blue-600' },
  { value: 'health', label: 'Health & Wellness', color: 'from-red-500 to-red-600' },
  { value: 'relationships', label: 'Relationships', color: 'from-pink-500 to-pink-600' },
  { value: 'environment', label: 'Environmental', color: 'from-teal-500 to-teal-600' },
  { value: 'education', label: 'Learning & Education', color: 'from-indigo-500 to-indigo-600' }
];

const verificationMethods = [
  { value: 'photo_proof', label: 'Photo Evidence' },
  { value: 'witness', label: 'Witness Verification' },
  { value: 'third_party', label: 'Third-party Validation' },
  { value: 'data_source', label: 'Data Source Integration' },
  { value: 'self_report', label: 'Self Reporting' }
];

export default function VisionComposer({ user, onClose, onCreated }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vision, setVision] = useState({
    title: '',
    description: '',
    category: '',
    why_matters: '',
    region: '',
    target_date: null,
    verification_method: 'photo_proof',
    sources: [],
    visibility: 'public',
    karma_reward: 10
  });
  const [newSource, setNewSource] = useState('');

  const handleInputChange = (field, value) => {
    setVision(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSource = () => {
    if (newSource.trim()) {
      setVision(prev => ({
        ...prev,
        sources: [...prev.sources, newSource.trim()]
      }));
      setNewSource('');
    }
  };

  const removeSource = (index) => {
    setVision(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await Vision.create({
        ...vision,
        status: 'active',
        progress: 0,
        integrity_score: 50,
        likes_count: 0,
        supporters_count: 0,
        target_date: vision.target_date ? format(vision.target_date, 'yyyy-MM-dd') : null
      });
      
      onCreated();
      onClose();
    } catch (error) {
      console.error('Error creating vision:', error);
    }
    setIsSubmitting(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return vision.title.trim() && vision.description.trim() && vision.category;
      case 2:
        return vision.why_matters.trim();
      case 3:
        return vision.verification_method;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-purple-200">Vision Title *</Label>
              <Input
                id="title"
                value={vision.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="What do you want to achieve?"
                className="mt-2 bg-black/40 border-purple-700/50 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-purple-200">Description *</Label>
              <Textarea
                id="description"
                value={vision.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your vision in detail..."
                rows={4}
                className="mt-2 bg-black/40 border-purple-700/50 text-white"
              />
            </div>

            <div>
              <Label className="text-purple-200">Category *</Label>
              <Select value={vision.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-2 bg-black/40 border-purple-700/50 text-white">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-purple-900 border-purple-700 max-h-60 overflow-auto"
                  position="popper"
                  sideOffset={5}
                >
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-purple-800 focus:bg-purple-800">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${option.color}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region" className="text-purple-200">Region/Location</Label>
                <Input
                  id="region"
                  value={vision.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  placeholder="Where will this happen?"
                  className="mt-2 bg-black/40 border-purple-700/50 text-white"
                />
              </div>

              <div>
                <Label className="text-purple-200">Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-2 w-full bg-black/40 border-purple-700/50 text-white justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {vision.target_date ? format(vision.target_date, 'PPP') : 'Set target date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 bg-purple-900 border-purple-700" 
                    align="start"
                    sideOffset={5}
                  >
                    <Calendar
                      mode="single"
                      selected={vision.target_date}
                      onSelect={(date) => handleInputChange('target_date', date)}
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="why_matters" className="text-purple-200">Why This Matters *</Label>
              <Textarea
                id="why_matters"
                value={vision.why_matters}
                onChange={(e) => handleInputChange('why_matters', e.target.value)}
                placeholder="Explain the impact and importance of this vision..."
                rows={4}
                className="mt-2 bg-black/40 border-purple-700/50 text-white"
              />
            </div>

            <div>
              <Label className="text-purple-200">Supporting Sources</Label>
              <div className="mt-2 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="Add a source, reference, or link..."
                    className="bg-black/40 border-purple-700/50 text-white flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addSource()}
                  />
                  <Button onClick={addSource} size="sm" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="sm:inline hidden">Add</span>
                  </Button>
                </div>
                
                {vision.sources.length > 0 && (
                  <div className="space-y-1">
                    {vision.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between bg-purple-900/30 p-2 rounded">
                        <span className="text-purple-200 text-sm flex-1 mr-2 break-words">{source}</span>
                        <Button
                          onClick={() => removeSource(index)}
                          size="sm"
                          variant="ghost"
                          className="text-purple-400 hover:text-white flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-purple-200">Visibility</Label>
              <Select value={vision.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                <SelectTrigger className="mt-2 bg-black/40 border-purple-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  className="bg-purple-900 border-purple-700"
                  position="popper"
                  sideOffset={5}
                >
                  <SelectItem value="public" className="text-white hover:bg-purple-800 focus:bg-purple-800">Public - Everyone can see</SelectItem>
                  <SelectItem value="followers" className="text-white hover:bg-purple-800 focus:bg-purple-800">Followers - Only followers can see</SelectItem>
                  <SelectItem value="private" className="text-white hover:bg-purple-800 focus:bg-purple-800">Private - Only you can see</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-purple-200">Verification Method *</Label>
              <p className="text-purple-300/70 text-sm mb-4">
                How will you prove progress on this vision?
              </p>
              <Select value={vision.verification_method} onValueChange={(value) => handleInputChange('verification_method', value)}>
                <SelectTrigger className="bg-black/40 border-purple-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  className="bg-purple-900 border-purple-700 max-h-60 overflow-auto"
                  position="popper"
                  sideOffset={5}
                >
                  {verificationMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="text-white hover:bg-purple-800 focus:bg-purple-800">
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-purple-200">Karma Reward</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={vision.karma_reward}
                onChange={(e) => handleInputChange('karma_reward', parseInt(e.target.value))}
                className="mt-2 bg-black/40 border-purple-700/50 text-white"
              />
              <p className="text-purple-300/70 text-xs mt-1">
                Karma points you'll earn when this vision is completed
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 p-4 rounded-lg border border-purple-500/30">
              <h4 className="font-semibold text-purple-200 mb-2">Vision Summary</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-purple-300">Title:</span> <span className="text-white break-words">{vision.title}</span></div>
                <div><span className="text-purple-300">Category:</span> <span className="text-white">{categoryOptions.find(c => c.value === vision.category)?.label}</span></div>
                <div><span className="text-purple-300">Target Date:</span> <span className="text-white">{vision.target_date ? format(vision.target_date, 'PPP') : 'Not set'}</span></div>
                <div><span className="text-purple-300">Verification:</span> <span className="text-white">{verificationMethods.find(v => v.value === vision.verification_method)?.label}</span></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-w-[95vw] sm:w-full bg-gradient-to-br from-purple-900/95 to-black/95 border border-purple-700/50 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-white bg-clip-text text-transparent flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Create New Vision
          </DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === currentStep 
                    ? 'bg-purple-600 text-white' 
                    : step < currentStep 
                      ? 'bg-purple-800 text-purple-200' 
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-purple-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-purple-300 mt-2">
            Step {currentStep}: {
              currentStep === 1 ? 'Basic Information' :
              currentStep === 2 ? 'Purpose & Impact' :
              'Verification & Review'
            }
          </div>
        </DialogHeader>

        <div className="py-4 sm:py-6 px-2 sm:px-0">
          {renderStep()}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 sm:pt-6 border-t border-purple-700/30">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : onClose()}
            className="border-purple-700/50 text-purple-300 hover:text-white order-2 sm:order-1"
          >
            {currentStep > 1 ? 'Previous' : 'Cancel'}
          </Button>
          
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 order-1 sm:order-2"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 order-1 sm:order-2"
            >
              {isSubmitting ? 'Creating...' : 'Create Vision'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
