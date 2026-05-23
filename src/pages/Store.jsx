import React from 'react';
import HeroSection from '../components/store/HeroSection';
import FeatureGrid from '../components/store/FeatureGrid';
import BundleOffers from '../components/store/BundleOffers';
import TechSpecs from '../components/store/TechSpecs';
import FaqSection from '../components/store/FaqSection';
import { ShieldCheck, ArrowRight, Video } from 'lucide-react';

export default function Store() {
  return (
    <div className="bg-void-black text-white">
      <style>{`
        .bg-void-black { background-color: #0c0c0c; }
        .text-aura-lilac { color: #d6b3ff; }
        .border-mystic-violet { border-color: #a855f7; }
        .bg-mystic-violet { background-color: #a855f7; }
        .hover\\:bg-aura-lilac:hover { background-color: #d6b3ff; }
      `}</style>
      
      {/* The main content for the store page, structured by your wireframe */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        
        {/* Why this hinge section */}
        <section className="py-16 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Why Divine Hinge?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">From precision engineering to provably-fair access.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pain Point 1 -> Solution */}
            <div className="p-8 bg-[rgba(255,255,255,0.05)] rounded-2xl border border-mystic-violet/30 backdrop-blur-md">
              <h3 className="text-xl font-semibold text-aura-lilac">Insecure & Clunky</h3>
              <p className="mt-2 text-gray-300">Traditional locks are easily bypassed and lack any form of audit trail.</p>
            </div>
            <div className="flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-mystic-violet hidden md:block"/>
            </div>
            <div className="p-8 bg-[rgba(255,255,255,0.05)] rounded-2xl border border-mystic-violet/30 backdrop-blur-md">
              <h3 className="text-xl font-semibold text-aura-lilac">Secure Command Tickets</h3>
              <p className="mt-2 text-gray-300">Unlock with short-lived, single-use signed tickets that prevent replay attacks.</p>
            </div>
          </div>
        </section>

        <FeatureGrid />
        
        <BundleOffers />
        
        <TechSpecs />

        <FaqSection />
      </div>
    </div>
  );
}