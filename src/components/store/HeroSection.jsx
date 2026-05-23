import React from 'react';
import { ShieldCheck, PlayCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative py-20 sm:py-32">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
          Smart. Secure. Built to last.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300 sm:text-xl">
          The Multi-Purpose Hinge locks fast, senses precisely, and proves every action. Control doors locally or over secure radio—no cloud lock-in.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <button className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-black bg-mystic-violet hover:bg-aura-lilac transition-colors duration-300">
            Buy Now
          </button>
          <button className="inline-flex items-center justify-center px-8 py-4 border border-mystic-violet text-base font-medium rounded-full text-aura-lilac bg-transparent hover:bg-mystic-violet/20 transition-colors duration-300">
            <PlayCircle className="w-5 h-5 mr-2" />
            See How It Works
          </button>
        </div>
        <div className="mt-12 flex justify-center items-center gap-4 text-sm text-gray-400">
          <ShieldCheck className="w-5 h-5 text-green-400"/>
          <span>Patent-Pending Hardware</span>
          <span className="text-gray-600">|</span>
          <span>Texas-Assembled</span>
           <span className="text-gray-600">|</span>
          <span>30-Day Returns</span>
        </div>
      </div>
    </section>
  );
}