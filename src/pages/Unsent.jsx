import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Draft } from '@/entities/Draft';
import { UnsentPost } from '@/entities/UnsentPost';
import { Board } from '@/entities/Board';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3, 
  Clock, 
  Heart, 
  MessageCircle, 
  Shield, 
  Users,
  Eye,
  EyeOff,
  Timer,
  Sparkles
} from "lucide-react";

import UnsentComposer from '../components/unsent/UnsentComposer';
import CoolingCard from '../components/unsent/CoolingCard';
import BoardView from '../components/unsent/BoardView';
import OfferInbox from '../components/unsent/OfferInbox';

export default function Unsent() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('compose');
  const [drafts, setDrafts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUnsentData();
  }, []);

  const loadUnsentData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      const [draftsData, postsData, boardsData] = await Promise.all([
        Draft.filter({ author_id: userData.id }, '-updated_date'),
        UnsentPost.list('-created_date', 20),
        Board.filter({ owner_id: userData.id }, '-created_date')
      ]);

      setDrafts(draftsData);
      setPosts(postsData);
      setBoards(boardsData);

      // Create default board if none exists
      if (boardsData.length === 0) {
        await Board.create({
          owner_id: userData.id,
          title: "My Unsent Messages",
          description: "A space for processing thoughts and feelings",
          visibility: "private",
          board_type: "personal"
        });
      }
    } catch (error) {
      console.error('Error loading unsent data:', error);
    }
    setIsLoading(false);
  };

  const handleDraftCreated = () => {
    loadUnsentData();
    setActiveTab('cooling');
  };

  const TabButton = ({ id, label, icon: Icon, count = 0 }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
        activeTab === id
          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
          : 'bg-black/40 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && (
        <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
          {count}
        </Badge>
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-purple-700/30">
                <div className="h-32 bg-purple-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Edit3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-pink-300 bg-clip-text text-transparent">
                Unsent
              </h1>
              <p className="text-purple-200/80">Honesty without harm • Processing before posting</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
            <p className="text-purple-100 text-sm">
              💡 <strong>How it works:</strong> Write what you really want to say, let it cool, get AI guidance, 
              then choose how to share it (if at all). Transform conflict into connection.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton 
            id="compose" 
            label="Compose" 
            icon={Edit3} 
          />
          <TabButton 
            id="cooling" 
            label="Cooling" 
            icon={Timer} 
            count={drafts.filter(d => d.processing_stage === 'cooling').length}
          />
          <TabButton 
            id="boards" 
            label="My Boards" 
            icon={Eye} 
            count={boards.length}
          />
          <TabButton 
            id="offers" 
            label="Offers" 
            icon={MessageCircle} 
            count={0} // TODO: Count pending offers
          />
          <TabButton 
            id="insights" 
            label="Insights" 
            icon={Sparkles} 
          />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {activeTab === 'compose' && (
            <UnsentComposer 
              user={user}
              onDraftCreated={handleDraftCreated}
            />
          )}

          {activeTab === 'cooling' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-purple-100">Cooling Period</h2>
                <Badge className="bg-purple-600/20 text-purple-300">
                  {drafts.filter(d => d.processing_stage === 'cooling').length} drafts
                </Badge>
              </div>
              
              {drafts.filter(d => d.processing_stage === 'cooling').map(draft => (
                <CoolingCard key={draft.id} draft={draft} onUpdate={loadUnsentData} />
              ))}
              
              {drafts.filter(d => d.processing_stage === 'cooling').length === 0 && (
                <Card className="bg-black/40 backdrop-blur-sm border border-purple-700/30 text-center p-12">
                  <Timer className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
                  <h3 className="text-xl font-semibold text-purple-200 mb-2">No Messages Cooling</h3>
                  <p className="text-purple-300/70">Draft messages will appear here during their cooling period</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'boards' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-purple-100">My Boards</h2>
              </div>
              
              {boards.map(board => (
                <BoardView key={board.id} board={board} posts={posts.filter(p => p.board_id === board.id)} />
              ))}
            </div>
          )}

          {activeTab === 'offers' && (
            <OfferInbox user={user} />
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-purple-100">Communication Insights</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-100">
                      <Heart className="w-5 h-5 text-pink-400" />
                      Healing Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Messages Processed</span>
                        <span className="text-2xl font-bold text-purple-100">{drafts.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Conflicts Resolved</span>
                        <span className="text-2xl font-bold text-green-400">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Relationships Healed</span>
                        <span className="text-2xl font-bold text-blue-400">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-100">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Communication Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Empathy Score</span>
                        <span className="text-2xl font-bold text-green-400">85%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Clarity Score</span>
                        <span className="text-2xl font-bold text-blue-400">78%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Growth Trend</span>
                        <span className="text-2xl font-bold text-purple-400">↗️ +12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}