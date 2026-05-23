import React from 'react';
import { Lock, Ticket, ShieldQuestion, PowerOff, Radio, Gift } from 'lucide-react';

const features = [
  { name: 'Wireless Solenoid Lock', icon: Lock },
  { name: 'Secure Command Tickets', icon: Ticket },
  { name: 'Door State Sensors', icon: ShieldQuestion },
  { name: 'Offline-Safe Modes', icon: PowerOff },
  { name: 'Optional Radio Unlock', icon: Radio },
  { name: 'Raffle-Ready Gateway', icon: Gift },
];

export default function FeatureGrid() {
  return (
    <section className="py-16 sm:py-24">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div key={feature.name} className="p-6 bg-[rgba(255,255,255,0.05)] rounded-2xl border border-mystic-violet/30 backdrop-blur-md text-center">
            <feature.icon className="w-10 h-10 mx-auto text-aura-lilac" />
            <p className="mt-4 font-semibold text-white">{feature.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}