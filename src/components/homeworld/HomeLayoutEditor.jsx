import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, Upload, Move, Plus, Trash2, RotateCw } from 'lucide-react';

export default function HomeLayoutEditor({ initial, onSave, onClose, className = '' }) {
  const [layout, setLayout] = useState(initial);
  const [mode, setMode] = useState('select'); // 'select' or 'add-door'
  const [scale, setScale] = useState(50); // px/m
  const [selectedId, setSelectedId] = useState(null);
  const svgRef = useRef(null);
  const [dragState, setDragState] = useState(null);

  const w = layout.size.width * scale;
  const h = layout.size.height * scale;
  const toPx = (m) => m * scale;
  const toMeters = (px) => px / scale;

  function addDoorAt(xm, ym) {
    const id = `door-${Math.random().toString(36).slice(2, 7)}`;
    const door = { 
      id, 
      name: 'New Door', 
      pos: { x: +xm.toFixed(2), y: +ym.toFixed(2) }, 
      angleDeg: 0,
      state: 'closed',
      lock: 'locked'
    };
    setLayout(l => ({ ...l, doors: [...l.doors, door] }));
    setSelectedId(id);
  }

  function onSvgClick(e) {
    if (mode !== 'add-door') return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const xm = toMeters(px);
    const ym = toMeters(h - py); // invert y
    addDoorAt(xm, ym);
  }

  function onMouseDownDoor(e, door) {
    e.stopPropagation();
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setDragState({ 
      id: door.id, 
      start: { x: px, y: py }, 
      orig: { x: toPx(door.pos.x), y: h - toPx(door.pos.y) } 
    });
    setSelectedId(door.id);
  }

  function onMouseMove(e) {
    if (!dragState) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const dx = px - dragState.start.x;
    const dy = py - dragState.start.y;
    const nx = dragState.orig.x + dx;
    const ny = dragState.orig.y + dy;
    const xm = toMeters(nx);
    const ym = toMeters(h - ny);
    
    setLayout(l => ({ 
      ...l, 
      doors: l.doors.map(d => 
        d.id === dragState.id 
          ? { ...d, pos: { x: +xm.toFixed(2), y: +ym.toFixed(2) } } 
          : d
      ) 
    }));
  }

  function onMouseUp() {
    setDragState(null);
  }

  function updateDoor(id, patch) {
    setLayout(l => ({ 
      ...l, 
      doors: l.doors.map(d => d.id === id ? { ...d, ...patch } : d) 
    }));
  }

  function removeDoor(id) {
    setLayout(l => ({ ...l, doors: l.doors.filter(d => d.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  }

  function exportJson() {
    const j = JSON.stringify(layout, null, 2);
    const blob = new Blob([j], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'home-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setLayout(JSON.parse(String(reader.result)));
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    };
    reader.readAsText(file);
  }

  const selectedDoor = layout.doors.find(d => d.id === selectedId) || null;

  return (
    <div className={`grid lg:grid-cols-3 gap-8 ${className}`}>
      {/* Main Editor */}
      <div className="lg:col-span-2">
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-700/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-200">Home Layout Editor</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={mode === 'select' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('select')}
                  className="text-xs"
                >
                  <Move className="w-4 h-4 mr-1" />
                  Select
                </Button>
                <Button
                  variant={mode === 'add-door' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('add-door')}
                  className="text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Door
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Label className="text-purple-200 text-sm">Scale:</Label>
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={20}
                max={120}
                step={5}
                className="flex-1 max-w-32"
              />
              <span className="text-purple-200 text-sm w-16">{scale}px/m</span>
            </div>

            <div
              className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300"
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <svg 
                ref={svgRef} 
                viewBox={`0 0 ${w} ${h}`} 
                width={w} 
                height={h} 
                onClick={onSvgClick}
                className="block mx-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              >
                <rect 
                  x={0} 
                  y={0} 
                  width={w} 
                  height={h} 
                  fill="#fafafa" 
                  stroke="#222" 
                  strokeWidth={2} 
                  rx={12} 
                />
                {layout.doors.map(door => {
                  const x = toPx(door.pos.x);
                  const y = h - toPx(door.pos.y);
                  const len = toPx(0.9);
                  const thick = toPx(0.05);
                  const rot = door.angleDeg;
                  const isSelected = door.id === selectedId;
                  
                  return (
                    <g key={door.id} transform={`translate(${x} ${y}) rotate(${-rot})`}>
                      <rect 
                        x={-len/2} 
                        y={-thick*3} 
                        width={len} 
                        height={thick*6} 
                        fill={isSelected ? '#8b5cf680' : 'transparent'}
                        onMouseDown={(e) => onMouseDownDoor(e, door)}
                        style={{ cursor: 'grab' }}
                      />
                      <rect 
                        x={-len/2} 
                        y={-thick/2} 
                        width={len} 
                        height={thick} 
                        fill={isSelected ? '#8b5cf6' : '#111'} 
                        rx={2} 
                      />
                      <circle 
                        cx={len/2 + toPx(0.1)} 
                        cy={0} 
                        r={toPx(0.06)} 
                        fill={isSelected ? '#3b82f6' : '#666'} 
                      />
                      {door.name && (
                        <text 
                          x={0} 
                          y={-toPx(0.25)} 
                          textAnchor="middle" 
                          fontSize={12} 
                          fill="#111"
                        >
                          {door.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Panel */}
      <div className="space-y-6">
        {/* House Properties */}
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-700/30">
          <CardHeader>
            <CardTitle className="text-purple-200 text-lg">House Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-purple-200">Origin Point</Label>
              <Select 
                value={layout.origin} 
                onValueChange={(value) => setLayout(l => ({ ...l, origin: value }))}
              >
                <SelectTrigger className="bg-purple-900/30 border-purple-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front-door">Front Door</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-purple-200">Width (m)</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.1"
                  value={layout.size.width}
                  onChange={(e) => setLayout(l => ({ 
                    ...l, 
                    size: { ...l.size, width: +e.target.value } 
                  }))}
                  className="bg-purple-900/30 border-purple-700/50 text-white"
                />
              </div>
              <div>
                <Label className="text-purple-200">Height (m)</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.1"
                  value={layout.size.height}
                  onChange={(e) => setLayout(l => ({ 
                    ...l, 
                    size: { ...l.size, height: +e.target.value } 
                  }))}
                  className="bg-purple-900/30 border-purple-700/50 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Door Properties */}
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-700/30">
          <CardHeader>
            <CardTitle className="text-purple-200 text-lg">
              {selectedDoor ? 'Edit Door' : 'Selected Door'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDoor ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-purple-200">Door Name</Label>
                  <Input
                    value={selectedDoor.name || ''}
                    onChange={(e) => updateDoor(selectedDoor.id, { name: e.target.value })}
                    placeholder="e.g. Front Door"
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200">X (m)</Label>
                    <Input
                      type="number"
                      step="0.05"
                      value={selectedDoor.pos.x}
                      onChange={(e) => updateDoor(selectedDoor.id, { 
                        pos: { ...selectedDoor.pos, x: +e.target.value } 
                      })}
                      className="bg-purple-900/30 border-purple-700/50 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-200">Y (m)</Label>
                    <Input
                      type="number"
                      step="0.05"
                      value={selectedDoor.pos.y}
                      onChange={(e) => updateDoor(selectedDoor.id, { 
                        pos: { ...selectedDoor.pos, y: +e.target.value } 
                      })}
                      className="bg-purple-900/30 border-purple-700/50 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-purple-200 flex items-center gap-2">
                    <RotateCw className="w-4 h-4" />
                    Angle: {selectedDoor.angleDeg}°
                  </Label>
                  <Slider
                    value={[selectedDoor.angleDeg]}
                    onValueChange={(value) => updateDoor(selectedDoor.id, { angleDeg: value[0] })}
                    min={0}
                    max={359}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeDoor(selectedDoor.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                    className="flex-1 border-purple-700/50 text-purple-300"
                  >
                    Deselect
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-purple-300/70 text-sm text-center py-8">
                Select a door to edit its properties, or click "Add Door" and then click on the map to place a new door.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-700/30">
          <CardHeader>
            <CardTitle className="text-purple-200 text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => onSave?.(layout)} 
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Layout
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={exportJson} className="border-purple-700/50 text-purple-300">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild className="w-full border-purple-700/50 text-purple-300">
                  <span>
                    <Upload className="w-4 h-4 mr-1" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={importJson}
                />
              </label>
            </div>

            <div>
              <Label className="text-purple-200 text-xs">Layout JSON</Label>
              <Textarea
                className="mt-1 h-32 text-xs bg-purple-900/30 border-purple-700/50 text-white font-mono"
                readOnly
                value={JSON.stringify(layout, null, 2)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}