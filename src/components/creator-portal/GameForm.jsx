import React, { useState } from 'react';
import { Game } from '@/entities/Game';
import { GameBuild } from '@/entities/GameBuild';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GameForm({ user, onGameCreated }) {
    const [title, setTitle] = useState('');
    const [mode, setMode] = useState('skill');
    const [ageRating, setAgeRating] = useState('E');
    const [platform, setPlatform] = useState('html5');
    const [bundleUrl, setBundleUrl] = useState('');
    const [version, setVersion] = useState('1.0.0');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newGame = await Game.create({
                owner_id: user.id,
                title,
                mode,
                age_rating: ageRating,
                status: 'pending_review'
            });

            await GameBuild.create({
                game_id: newGame.id,
                platform,
                bundle_url: bundleUrl,
                version
            });
            
            onGameCreated();
        } catch (error) {
            console.error("Failed to create game:", error);
        }
    };

    return (
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-700/30">
            <CardHeader>
                <CardTitle className="text-purple-200">Submit New Game</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="title" className="text-purple-300">Game Title</Label>
                            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-purple-900/30 border-purple-700/50" />
                        </div>
                        <div>
                            <Label htmlFor="mode" className="text-purple-300">Game Mode</Label>
                             <Select onValueChange={setMode} defaultValue={mode}>
                                <SelectTrigger className="bg-purple-900/30 border-purple-700/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="skill">Skill Contest</SelectItem>
                                    <SelectItem value="sweepstakes">Sweepstakes (AMOE)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="ageRating" className="text-purple-300">Age Rating</Label>
                             <Select onValueChange={setAgeRating} defaultValue={ageRating}>
                                <SelectTrigger className="bg-purple-900/30 border-purple-700/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="E">E (Everyone)</SelectItem>
                                    <SelectItem value="T">T (Teen)</SelectItem>
                                    <SelectItem value="M">M (Mature)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="platform" className="text-purple-300">Platform</Label>
                             <Select onValueChange={setPlatform} defaultValue={platform}>
                                <SelectTrigger className="bg-purple-900/30 border-purple-700/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="html5">HTML5</SelectItem>
                                    <SelectItem value="webgl">WebGL</SelectItem>
                                    <SelectItem value="unity">Unity Web</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="bundleUrl" className="text-purple-300">Bundle URL</Label>
                            <Input id="bundleUrl" value={bundleUrl} onChange={e => setBundleUrl(e.target.value)} required placeholder="https://cdn.example.com/game.zip" className="bg-purple-900/30 border-purple-700/50"/>
                        </div>
                         <div>
                            <Label htmlFor="version" className="text-purple-300">Version</Label>
                            <Input id="version" value={version} onChange={e => setVersion(e.target.value)} required placeholder="1.0.0" className="bg-purple-900/30 border-purple-700/50"/>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">Submit for Review</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}