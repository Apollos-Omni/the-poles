import React, { useState } from 'react';
import { Manifest } from '@/entities/Manifest';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const defaultManifest = {
  "gameId": "",
  "title": "",
  "mode": "skill",
  "minPlayers": 2,
  "maxPlayers": 10,
  "scoring": {
    "type": "deterministic",
    "verifier": "server",
    "tiebreakers": ["fastestTime"]
  },
  "product": {
    "retailer": "amazon",
    "sourceUrl": "https://www.amazon.com/dp/B08QJ8H8J8"
  },
  "regionsAllowed": ["US"],
  "ageRating": "E",
  "anticheat": [],
  "build": {}
};

export default function ManifestBuilder({ game }) {
    const [manifest, setManifest] = useState(JSON.stringify({ ...defaultManifest, gameId: game.id, title: game.title }, null, 2));

    const handleSubmit = async () => {
        try {
            await Manifest.create({
                game_id: game.id,
                manifest_data: JSON.parse(manifest)
            });
            alert('Manifest submitted successfully!');
        } catch (error) {
            console.error("Failed to submit manifest:", error);
            alert('Error submitting manifest. Check console for details.');
        }
    };

    return (
        <div className="space-y-4">
            <Label htmlFor="manifest-json" className="text-purple-300">Game Manifest (JSON)</Label>
            <Textarea
                id="manifest-json"
                value={manifest}
                onChange={(e) => setManifest(e.target.value)}
                rows={20}
                className="font-mono bg-purple-900/30 border-purple-700/50 text-sm"
            />
            <div className="flex justify-end">
                <Button onClick={handleSubmit} className="bg-gradient-to-r from-indigo-600 to-blue-600">Save Manifest</Button>
            </div>
        </div>
    );
}