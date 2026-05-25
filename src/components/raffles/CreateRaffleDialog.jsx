import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Link as LinkIcon, DollarSign } from "lucide-react";
import { Raffle } from "@/entities/Raffle";
import { RaffleProduct } from "@/entities/RaffleProduct";
import { Merchant } from "@/entities/Merchant";

export default function CreateRaffleDialog({ user, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Product Info, 2: Raffle Settings
  const [formData, setFormData] = useState({
    // Product data
    productUrl: '',
    title: '',
    imageUrl: '',
    priceSnapshotCents: '',
    category: 'electronics',
    merchantName: '',
    merchantDomain: '',
    
    // Raffle data
    entryPriceCents: 500, // $5 default
    maxEntries: '',
    deadline: '',
    region: 'US'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateMaxEntries = () => {
    if (formData.priceSnapshotCents && formData.entryPriceCents) {
      const buffer = 1.1; // prize buffer
      const totalNeeded = formData.priceSnapshotCents * buffer;
      return Math.ceil(totalNeeded / formData.entryPriceCents);
    }
    return '';
  };

  const handleNext = () => {
    const calculatedMaxEntries = calculateMaxEntries();
    setFormData(prev => ({
      ...prev,
      maxEntries: calculatedMaxEntries
    }));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create or find merchant
      const merchants = await Merchant.list();
      let merchant = merchants.find(m => m.domain === formData.merchantDomain);
      
      if (!merchant) {
        merchant = await Merchant.create({
          name: formData.merchantName,
          domain: formData.merchantDomain,
          logo_url: `https://logo.clearbit.com/${formData.merchantDomain}`
        });
      }

      // Create product
      const product = await RaffleProduct.create({
        merchant_id: merchant.id,
        url: formData.productUrl,
        title: formData.title,
        image_url: formData.imageUrl,
        price_snapshot_cents: parseInt(formData.priceSnapshotCents),
        currency: 'usd',
        category: formData.category
      });

      // Create raffle
      await Raffle.create({
        product_id: product.id,
        status: 'DRAFT',
        entry_price_cents: parseInt(formData.entryPriceCents),
        max_entries: parseInt(formData.maxEntries),
        current_entries: 0,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        server_seed_hash: `hash_${Date.now()}_${Math.random()}`,
        region: formData.region,
        buffer_pct: 10
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating raffle:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gradient-to-br from-purple-900 to-black border border-purple-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plus className="w-6 h-6 text-purple-400" />
              <CardTitle className="text-purple-200">
                Create New Raffle - Step {step} of 2
              </CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-purple-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              <h3 className="text-lg font-semibold text-purple-200 mb-4">Product Information</h3>
              
              <div className="space-y-2">
                <Label className="text-purple-200">Product URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    placeholder="https://amazon.com/dp/B123456789"
                    value={formData.productUrl}
                    onChange={(e) => handleInputChange('productUrl', e.target.value)}
                    className="pl-10 bg-purple-900/30 border-purple-700/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-purple-200">Merchant Name</Label>
                  <Input
                    placeholder="Amazon"
                    value={formData.merchantName}
                    onChange={(e) => handleInputChange('merchantName', e.target.value)}
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-200">Merchant Domain</Label>
                  <Input
                    placeholder="amazon.com"
                    value={formData.merchantDomain}
                    onChange={(e) => handleInputChange('merchantDomain', e.target.value)}
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200">Product Title</Label>
                <Input
                  placeholder="iPhone 15 Pro - 256GB - Natural Titanium"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="bg-purple-900/30 border-purple-700/50 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200">Product Image URL</Label>
                <Input
                  placeholder="https://images.example.com/product.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  className="bg-purple-900/30 border-purple-700/50 text-white"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-purple-200">Product Price (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      type="number"
                      placeholder="1199.00"
                      step="0.01"
                      value={formData.priceSnapshotCents ? (formData.priceSnapshotCents / 100).toFixed(2) : ''}
                      onChange={(e) => handleInputChange('priceSnapshotCents', Math.round(parseFloat(e.target.value || 0) * 100))}
                      className="pl-10 bg-purple-900/30 border-purple-700/50 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-200">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-purple-900/30 border-purple-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-700">
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="border-purple-700/50 text-purple-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  Next: Raffle Settings
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-purple-200 mb-4">Raffle Settings</h3>

              <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/30 mb-6">
                <h4 className="font-semibold text-purple-200 mb-2">Product Summary</h4>
                <p className="text-white">{formData.title}</p>
                <p className="text-purple-300 text-sm">
                  ${(formData.priceSnapshotCents / 100).toLocaleString()} • {formData.merchantName}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-purple-200">Entry Price (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      max="20"
                      value={(formData.entryPriceCents / 100).toFixed(2)}
                      onChange={(e) => handleInputChange('entryPriceCents', Math.round(parseFloat(e.target.value || 0) * 100))}
                      className="pl-10 bg-purple-900/30 border-purple-700/50 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-200">Max Entries (Calculated)</Label>
                  <Input
                    type="number"
                    value={formData.maxEntries}
                    onChange={(e) => handleInputChange('maxEntries', parseInt(e.target.value))}
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200">Deadline (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="bg-purple-900/30 border-purple-700/50 text-white"
                />
              </div>

              <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                <h4 className="text-green-300 font-semibold mb-2">Economics Summary</h4>
                <div className="space-y-1 text-sm text-green-200">
                  <div>Target Revenue: ${((formData.entryPriceCents * formData.maxEntries) / 100).toLocaleString()}</div>
                  <div>Product Cost: ${(formData.priceSnapshotCents / 100).toLocaleString()}</div>
                  <div>Buffer: ${(((formData.entryPriceCents * formData.maxEntries) - formData.priceSnapshotCents) / 100).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="border-purple-700/50 text-purple-300"
                >
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onClose} className="border-purple-700/50 text-purple-300">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Create Raffle'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
