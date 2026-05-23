import React, { useState, useEffect, useCallback } from 'react';
import { Sweepstakes } from '@/entities/Sweepstakes';
import { SweepstakesEntry } from '@/entities/SweepstakesEntry';
import { AffiliateProduct } from '@/entities/AffiliateProduct';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  Plus, 
  Clock, 
  Users, 
  Trophy,
  ExternalLink,
  Shield,
  Zap,
  CheckCircle
} from "lucide-react";

import SweepstakesCard from '../components/sweepstakes/SweepstakesCard';

export default function SweepstakesPage() {
  const [user, setUser] = useState(null);
  const [sweepstakes, setSweepstakes] = useState([]);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSweepstakes, setNewSweepstakes] = useState({
    title: '',
    productUrl: '',
    suggestedContributionCents: 500,
    targetEntries: 100,
    deadline: ''
  });

  const loadSweepstakesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // In production, these would be real API calls
      // For now, create sample data
      const sampleSweepstakes = [
        {
          id: 'sweep-1',
          title: 'Win AirPods Pro 2',
          product_url: 'https://www.amazon.com/Apple-Generation-Cancelling-Transparency-Personalized/dp/B0BDHWDR12',
          suggested_contribution_cents: 299,
          target_entries: 250,
          current_entries: 187,
          paid_entries: 142,
          amoe_entries: 45,
          status: 'OPEN',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          official_rules_url: '/rules/airpods-sweep',
          eligible_regions: ['US', 'CA'],
          created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sweep-2',
          title: 'PlayStation 5 Console',
          product_url: 'https://www.amazon.com/PlayStation-5-Console/dp/B0CL61F39H',
          suggested_contribution_cents: 999,
          target_entries: 500,
          current_entries: 423,
          paid_entries: 380,
          amoe_entries: 43,
          status: 'OPEN',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          official_rules_url: '/rules/ps5-sweep',
          eligible_regions: ['US'],
          created_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sweep-3',
          title: 'iPad Air M2',
          product_url: 'https://www.amazon.com/2024-Apple-iPad-Air-11-inch/dp/B0D3J7FC1P',
          suggested_contribution_cents: 599,
          target_entries: 300,
          current_entries: 298,
          paid_entries: 267,
          amoe_entries: 31,
          status: 'LOCKED',
          deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          official_rules_url: '/rules/ipad-sweep',
          eligible_regions: ['US', 'CA', 'UK'],
          winner_entry_id: 'entry-winner-123',
          draw_proof: {
            entryCount: 298,
            winnerIndex: 142,
            timestamp: new Date().toISOString(),
            randomnessSource: 'chainlink-vrf'
          },
          created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setSweepstakes(sampleSweepstakes);

      // Sample user entries
      const userEntries = [
        { id: 'entry-1', sweepstakes_id: 'sweep-1', user_id: userData.id, entry_method: 'paid', contribution_amount_cents: 299 },
        { id: 'entry-2', sweepstakes_id: 'sweep-2', user_id: userData.id, entry_method: 'amoe', contribution_amount_cents: 0 }
      ];
      setEntries(userEntries);

    } catch (error) {
      console.error('Error loading sweepstakes:', error);
      // Fallback data for demo
      setSweepstakes([]);
      setEntries([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSweepstakesData();
  }, [loadSweepstakesData]);

  const createSweepstakes = async () => {
    try {
      // In production: POST /v1/sweepstakes
      const newSweep = {
        id: `sweep-${Math.random().toString(36).substring(2)}`,
        ...newSweepstakes,
        current_entries: 0,
        paid_entries: 0,
        amoe_entries: 0,
        status: 'OPEN',
        official_rules_url: '/rules/generic',
        eligible_regions: ['US'],
        created_date: new Date().toISOString()
      };
      
      setSweepstakes(prev => [newSweep, ...prev]);
      setShowCreateForm(false);
      setNewSweepstakes({
        title: '',
        productUrl: '',
        suggestedContributionCents: 500,
        targetEntries: 100,
        deadline: ''
      });
    } catch (error) {
      console.error('Error creating sweepstakes:', error);
    }
  };

  const enterSweepstakes = async (sweepstakesId, method = 'paid') => {
    try {
      // In production: POST /v1/sweepstakes/:id/enter
      const entry = {
        id: `entry-${Math.random().toString(36).substring(2)}`,
        sweepstakes_id: sweepstakesId,
        user_id: user.id,
        entry_method: method,
        contribution_amount_cents: method === 'paid' ? 
          sweepstakes.find(s => s.id === sweepstakesId)?.suggested_contribution_cents || 500 : 0,
        created_date: new Date().toISOString()
      };

      setEntries(prev => [...prev, entry]);
      
      // Update sweepstakes counts
      setSweepstakes(prev => prev.map(s => 
        s.id === sweepstakesId 
          ? { 
              ...s, 
              current_entries: s.current_entries + 1,
              [method === 'paid' ? 'paid_entries' : 'amoe_entries']: s[method === 'paid' ? 'paid_entries' : 'amoe_entries'] + 1
            }
          : s
      ));

      alert(`Successfully entered via ${method.toUpperCase()}!`);
    } catch (error) {
      console.error('Error entering sweepstakes:', error);
    }
  };

  const getStats = () => {
    const total = sweepstakes.length;
    const active = sweepstakes.filter(s => s.status === 'OPEN').length;
    const userEntriesCount = entries.length;
    const totalValue = sweepstakes.reduce((sum, s) => 
      sum + (s.suggested_contribution_cents * s.target_entries), 0
    ) / 100;

    return { total, active, userEntriesCount, totalValue };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-blue-300 bg-clip-text text-transparent">
                Divine Sweepstakes
              </h1>
              <p className="text-purple-200/80">Win amazing prizes • AMOE Compliant • Provably Fair</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Sweepstakes
          </Button>
        </div>

        {/* Compliance Notice */}
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h3 className="text-green-200 font-semibold">Legal & Fair</h3>
              <p className="text-green-300/80 text-sm">
                🔸 <strong>No Purchase Necessary</strong> - Free AMOE entry available for all sweepstakes
                <br />
                🔸 <strong>Equal Odds</strong> - Paid and free entries have identical winning chances  
                <br />
                🔸 <strong>Provably Fair</strong> - All draws use verifiable randomness with public proofs
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 backdrop-blur-sm border border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 mx-auto mb-3 text-purple-400" />
              <div className="text-2xl font-bold text-purple-100">{stats.total}</div>
              <div className="text-purple-300 text-sm">Total Sweepstakes</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-700/20 backdrop-blur-sm border border-green-500/30">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-green-400" />
              <div className="text-2xl font-bold text-green-100">{stats.active}</div>
              <div className="text-green-300 text-sm">Active Now</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-sm border border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-3 text-blue-400" />
              <div className="text-2xl font-bold text-blue-100">{stats.userEntriesCount}</div>
              <div className="text-blue-300 text-sm">Your Entries</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-700/20 backdrop-blur-sm border border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-100">${stats.totalValue.toLocaleString()}</div>
              <div className="text-yellow-300 text-sm">Total Prize Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Sweepstakes Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sweepstakes.map((sweepstake) => {
            const userEntry = entries.find(e => e.sweepstakes_id === sweepstake.id);
            return (
              <SweepstakesCard
                key={sweepstake.id}
                sweepstakes={sweepstake}
                userEntry={userEntry}
                onEnter={enterSweepstakes}
                user={user}
              />
            );
          })}
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gradient-to-br from-purple-900/95 to-black/95 border border-purple-700/50">
              <CardHeader>
                <CardTitle className="text-purple-200">Create New Sweepstakes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm mb-2">Title</label>
                  <Input
                    value={newSweepstakes.title}
                    onChange={(e) => setNewSweepstakes(prev => ({...prev, title: e.target.value}))}
                    placeholder="Win Amazing Product!"
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 text-sm mb-2">Product URL</label>
                  <Input
                    value={newSweepstakes.productUrl}
                    onChange={(e) => setNewSweepstakes(prev => ({...prev, productUrl: e.target.value}))}
                    placeholder="https://www.amazon.com/dp/..."
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 text-sm mb-2">Suggested Contribution (cents)</label>
                  <Input
                    type="number"
                    value={newSweepstakes.suggestedContributionCents}
                    onChange={(e) => setNewSweepstakes(prev => ({...prev, suggestedContributionCents: parseInt(e.target.value) || 0}))}
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 text-sm mb-2">Target Entries</label>
                  <Input
                    type="number"
                    value={newSweepstakes.targetEntries}
                    onChange={(e) => setNewSweepstakes(prev => ({...prev, targetEntries: parseInt(e.target.value) || 1}))}
                    className="bg-purple-900/30 border-purple-700/50 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    className="border-purple-700/50 text-purple-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createSweepstakes}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}