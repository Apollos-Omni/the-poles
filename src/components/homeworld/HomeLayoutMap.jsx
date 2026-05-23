import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from 'lucide-react';

const defaultColors = {
  doorClosed: '#22c55e',
  doorOpen: '#ef4444',
  lockLocked: '#0ea5e9',
  lockUnlocked: '#a855f7',
  hover: '#ffffff22',
  background: '#00000044',
  outline: '#888888'
};

function HomeMap2D({ layout, colors = defaultColors, onDoorTap, scale = 40 }) {
  if (!layout) return null;

  const w = layout.size.width * scale;
  const h = layout.size.height * scale;
  const toPx = (m) => m * scale;

  function doorColor(d) {
    if (d.state === 'open') return colors.doorOpen;
    if (d.state === 'closed') return colors.doorClosed;
    return colors.outline;
  }
  function lockColor(d) {
    if (d.lock === 'locked') return colors.lockLocked;
    if (d.lock === 'unlocked') return colors.lockUnlocked;
    return colors.outline;
  }
  function nextAction(d) {
    return d.lock === 'locked' ? 'UNLOCK' : 'LOCK';
  }

  return (
    <div style={{ background: colors.background, padding: 12, borderRadius: 16, border: '1px solid #334155' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
        <rect x={0} y={0} width={w} height={h} fill='none' stroke={colors.outline} strokeWidth={2} rx={8} />
        {layout.doors.map(d => {
          const x = toPx(d.pos.x);
          const y = h - toPx(d.pos.y);
          const len = toPx(0.9);
          const thick = toPx(0.05);
          const rot = d.angleDeg;
          return (
            <g key={d.id} transform={`translate(${x} ${y}) rotate(${-rot})`}>
              <rect x={-len/2} y={-thick*4} width={len} height={thick*8} fill='transparent'
                onClick={() => onDoorTap?.(d.id, nextAction(d))}
                onMouseEnter={(e) => (e.currentTarget.style.fill = colors.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.fill = 'transparent')}
                style={{ cursor: 'pointer' }}
              />
              <rect x={-len/2} y={-thick/2} width={len} height={thick} fill={doorColor(d)} rx={2} />
              <circle cx={len/2 + toPx(0.1)} cy={0} r={toPx(0.06)} fill={lockColor(d)} />
              {d.name && <text x={0} y={-toPx(0.25)} textAnchor='middle' fontSize={12} fill='#eee'>{d.name}</text>}
            </g>
          )
        })}
      </svg>
    </div>
  );
}

function ColorLegend({ colors, onChange }) {
  const keys = Object.keys(colors);
  return (
    <Card className="bg-black/30 border-blue-700/30 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-200">
            <Palette className="w-5 h-5"/>
            Customize Map Colors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {keys.map(k => (
            <label key={k} className="flex items-center gap-2 justify-between">
              <span className="text-sm text-blue-300 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
              <input type="color" value={colors[k]} onChange={(e) => onChange({ [k]: e.target.value })} 
                className="w-8 h-8 bg-transparent border-none rounded"
              />
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomeLayoutMap({ hinges, states, onDoorTap }) {
  const [colors, setColors] = useState(defaultColors);

  // Derive layout from hinge data
  const layout = {
    origin: 'center',
    size: { width: 20, height: 15 }, // Static size for now
    doors: hinges.map(h => {
      const state = states[h.id];
      return {
        id: h.id,
        name: h.name,
        pos: { x: h.coordinates_x || 10, y: h.coordinates_y || 7.5 },
        angleDeg: h.angleDeg || 0, // Assume angle property or default
        state: state?.door_state || 'unknown',
        lock: state?.lock_state || 'unknown'
      };
    })
  };

  const handleColorChange = (newColor) => {
    setColors(prev => ({ ...prev, ...newColor }));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <HomeMap2D
          layout={layout}
          colors={colors}
          onDoorTap={onDoorTap}
        />
      </div>
      <div>
        <ColorLegend colors={colors} onChange={handleColorChange} />
      </div>
    </div>
  );
}