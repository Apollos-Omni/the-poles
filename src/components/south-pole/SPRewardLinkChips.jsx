import React, { useState } from "react";

const REWARD_LINK_GROUPS = [
  {
    icon: "✈️",
    text: "Vacations",
    links: [
      { name: "Expedia Vacation Packages", url: "https://www.expedia.com/Vacation-Packages" },
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Airbnb", url: "https://www.airbnb.com" },
      { name: "Vrbo", url: "https://www.vrbo.com" },
      { name: "Tripadvisor", url: "https://www.tripadvisor.com" },
    ],
  },
  {
    icon: "🎟️",
    text: "Event Tickets",
    links: [
      { name: "Ticketmaster", url: "https://www.ticketmaster.com" },
      { name: "StubHub", url: "https://www.stubhub.com" },
      { name: "SeatGeek", url: "https://seatgeek.com" },
      { name: "Vivid Seats", url: "https://www.vividseats.com" },
      { name: "Eventbrite", url: "https://www.eventbrite.com" },
    ],
  },
  {
    icon: "🚢",
    text: "Cruises",
    links: [
      { name: "Royal Caribbean", url: "https://www.royalcaribbean.com" },
      { name: "Carnival Cruise Line", url: "https://www.carnival.com" },
      { name: "Norwegian Cruise Line", url: "https://www.ncl.com" },
      { name: "Princess Cruises", url: "https://www.princess.com" },
      { name: "Celebrity Cruises", url: "https://www.celebritycruises.com" },
    ],
  },
  {
    icon: "🏕️",
    text: "Adventures",
    links: [
      { name: "G Adventures", url: "https://www.gadventures.com" },
      { name: "Intrepid Travel", url: "https://www.intrepidtravel.com/us" },
      { name: "REI Travel", url: "https://www.rei.com/travel" },
      { name: "Viator", url: "https://www.viator.com" },
      { name: "GetYourGuide", url: "https://www.getyourguide.com" },
    ],
  },
  {
    icon: "🎵",
    text: "Concerts",
    links: [
      { name: "Live Nation", url: "https://www.livenation.com" },
      { name: "Ticketmaster Concerts", url: "https://www.ticketmaster.com/concerts" },
      { name: "AXS", url: "https://www.axs.com" },
      { name: "Bandsintown", url: "https://www.bandsintown.com" },
      { name: "Songkick", url: "https://www.songkick.com" },
    ],
  },
  {
    icon: "🌍",
    text: "Experiences",
    links: [
      { name: "Viator", url: "https://www.viator.com" },
      { name: "GetYourGuide", url: "https://www.getyourguide.com" },
      { name: "Klook", url: "https://www.klook.com/en-US" },
      { name: "Airbnb Experiences", url: "https://www.airbnb.com/experiences" },
      { name: "Fever", url: "https://feverup.com" },
    ],
  },
];

export default function SPRewardLinkChips() {
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <div className="flex flex-wrap gap-2 mt-5">
      {REWARD_LINK_GROUPS.map((tag) => {
        const isOpen = activeMenu === tag.text;

        return (
          <div key={tag.text} className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(isOpen ? null : tag.text)}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              className="bg-cyan-900/30 border border-cyan-700/30 text-cyan-300 text-xs px-3 py-1 rounded-full hover:bg-cyan-800/50 hover:border-cyan-500/50 transition-all flex items-center gap-1.5"
            >
              <span>{tag.icon}</span>
              <span>{tag.text}</span>
              <span className="text-cyan-400/70">▾</span>
            </button>

            {isOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close reward link menu"
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                  onClick={() => setActiveMenu(null)}
                />

                <div
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-cyan-600/40 bg-black/95 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl"
                >
                  <div className="border-b border-cyan-700/30 px-4 py-3">
                    <p className="text-sm font-bold text-white">
                      {tag.icon} {tag.text}
                    </p>
                    <p className="text-[11px] text-cyan-300/60">
                      Choose a company website to explore prize options.
                    </p>
                  </div>

                  <div className="py-1">
                    {tag.links.map((company) => (
                      <a
                        key={company.name}
                        href={company.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        onClick={() => setActiveMenu(null)}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-900/40 hover:text-white transition-colors"
                      >
                        <span>{company.name}</span>
                        <span className="text-cyan-400/70">↗</span>
                      </a>
                    ))}
                  </div>

                  <div className="border-t border-cyan-700/30 bg-cyan-950/20 px-4 py-2 text-[11px] leading-relaxed text-cyan-300/55">
                    External websites open in a new tab. Future partner or affiliate links may support The North Pole Fund.
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}