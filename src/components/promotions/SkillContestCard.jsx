import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, UserCheck, FileText, CheckSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function SkillContestCard({ contest, product }) {
  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-black/60 to-blue-900/40 backdrop-blur-md border border-blue-700/30 hover:border-blue-500/50 transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Skill Contest
            </Badge>
        </div>
        <CardContent className="p-0">
            <div className="relative h-48 overflow-hidden">
                <img src={product?.image_url} alt={product?.title} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            <div className="p-6 space-y-4">
                <div>
                    <p className="text-sm text-blue-300 font-semibold">{contest.title}</p>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        Prize: {product?.title}
                    </h3>
                </div>

                <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/30">
                    <p className="text-sm text-blue-200 font-medium mb-1">Challenge:</p>
                    <p className="text-sm text-blue-300/80 line-clamp-2">{contest.prompt}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center text-xs text-blue-200/90">
                    <div className="bg-black/30 p-2 rounded-lg flex items-center justify-center gap-1.5"><UserCheck className="w-4 h-4 text-blue-400"/>Judged by Experts</div>
                    <div className="bg-black/30 p-2 rounded-lg flex items-center justify-center gap-1.5"><CheckSquare className="w-4 h-4 text-blue-400"/>Merit-Based</div>
                </div>

                {contest.end_date && (
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-300 bg-blue-900/30 rounded-lg py-2">
                        <Clock className="w-4 h-4" />
                        <span>Ends {formatDistanceToNow(new Date(contest.end_date), { addSuffix: true })}</span>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold">
                        <Award className="w-4 h-4 mr-2" />
                        Submit Entry
                    </Button>
                    <Button asChild variant="outline" size="icon" className="border-blue-600/50 text-blue-300 hover:bg-blue-800/40">
                        <a href={contest.scoring_rubric_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4" />
                        </a>
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}