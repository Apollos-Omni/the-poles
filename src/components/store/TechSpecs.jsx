import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function TechSpecs() {
  const specs = {
    "Dimensions": "100mm × 50mm × 14mm",
    "Power": "5V USB-C or 4x AA Batteries (optional backup)",
    "Materials": "Injection-molded ABS, steel-reinforced chassis",
    "Compatibility": "Supports standard residential and commercial doors up to 2 inches thick.",
    "Radio": "ESP32 (Wi-Fi + BLE), optional LoRa/NRF module support",
    "Environmental": "Indoor use only. Operating temperature: 0°C to 50°C (32°F to 122°F)",
  };

  return (
    <section className="py-16 sm:py-24">
       <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Technical Specifications</h2>
      </div>
      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {Object.entries(specs).map(([key, value]) => (
          <AccordionItem value={key} key={key} className="border-b border-mystic-violet/30">
            <AccordionTrigger className="text-lg font-medium text-aura-lilac hover:no-underline">{key}</AccordionTrigger>
            <AccordionContent className="text-gray-300">{value}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}