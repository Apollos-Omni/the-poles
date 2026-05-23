import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FaqSection() {
    const faqs = {
        "How do I install the Divine Hinge?": "Installation is simple and requires only a Phillips head screwdriver. A detailed video guide is available on our support page. Most users complete the installation in under 15 minutes.",
        "What is the return policy?": "We offer a 30-day, no-questions-asked return policy. If you're not satisfied for any reason, contact our support for a return merchandise authorization (RMA) number.",
        "Where do you ship from?": "All our products are assembled with care and shipped from our facility in Galveston, TX.",
        "What's the difference between Wi-Fi and Radio mode?": "Wi-Fi mode connects directly to your home network for ease of use. Secure Radio mode (LoRa/NRF) offers a non-internet-connected, point-to-point option for maximum security and offline reliability.",
        "What is the warranty?": "The Divine Hinge comes with a 1-year limited warranty covering defects in materials and workmanship. Extended warranties are available for purchase.",
    };

    return (
        <section className="py-16 sm:py-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                {Object.entries(faqs).map(([key, value]) => (
                    <AccordionItem value={key} key={key} className="border-b border-mystic-violet/30">
                        <AccordionTrigger className="text-lg font-medium text-left text-aura-lilac hover:no-underline">{key}</AccordionTrigger>
                        <AccordionContent className="text-gray-300">{value}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}