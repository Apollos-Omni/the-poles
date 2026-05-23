import React, { useState } from 'react';
import ProductResolver from '../components/match-creator/ProductResolver';
import SkillMatchRoom from '../components/match-creator/SkillMatchRoom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap } from 'lucide-react';

export default function MVP() {
  const [currentStep, setCurrentStep] = useState(1);
  const [resolvedProduct, setResolvedProduct] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleProductResolved = (product, roomConfig) => {
    setResolvedProduct(product);
    setSelectedRoom(roomConfig);
    setCurrentStep(2);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setResolvedProduct(null);
    setSelectedRoom(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Santa Clause MVP
              </h1>
              <p className="text-slate-600">Product → Skill Match → Prize Fulfillment</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                currentStep >= 1 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'
                }`}>1</span>
                Resolve Product
              </div>
              
              <ArrowRight className="w-5 h-5 text-slate-400" />
              
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                currentStep >= 2 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-slate-400 text-white'
                }`}>2</span>
                Run Skill Match
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <ProductResolver onProductResolved={handleProductResolved} />
        )}

        {currentStep === 2 && resolvedProduct && selectedRoom && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Skill Match Room</h2>
              <button 
                onClick={resetFlow}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Start Over
              </button>
            </div>
            <SkillMatchRoom 
              product={resolvedProduct} 
              roomConfig={selectedRoom}
            />
          </div>
        )}
      </div>
    </div>
  );
}