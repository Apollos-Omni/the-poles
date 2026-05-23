import React, { useState, useEffect, useCallback } from 'react';
import { Sweepstakes } from '@/entities/Sweepstakes';
import { SkillContest } from '@/entities/SkillContest';
import { GroupBuy } from '@/entities/GroupBuy';
import { AffiliateProduct } from '@/entities/AffiliateProduct';
import { Merchant } from '@/entities/Merchant';
import { User } from '@/entities/User';
import { Gift, Shield, Award, Users, ShoppingCart } from 'lucide-react';

import SweepstakesCard from '../components/sweepstakes/SweepstakesCard';
import SkillContestCard from '../components/promotions/SkillContestCard';
import GroupBuyCard from '../components/promotions/GroupBuyCard';

const TABS = [
    { id: 'sweepstakes', label: 'Sweepstakes', icon: Shield },
    { id: 'skill_contests', label: 'Skill Contests', icon: Award },
    { id: 'group_buys', label: 'Group Buys', icon: ShoppingCart },
];

export default function PromotionsPage() {
  const [data, setData] = useState({ sweepstakes: [], skillContests: [], groupBuys: [], products: [], merchants: [] });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sweepstakes');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userData, sweepstakesData, skillContestData, groupBuyData, productData, merchantData] = await Promise.all([
        User.me(),
        Sweepstakes.list('-created_date'),
        SkillContest.list('-created_date'),
        GroupBuy.list('-created_date'),
        AffiliateProduct.list(),
        Merchant.list()
      ]);

      setUser(userData);
      setData({
        sweepstakes: sweepstakesData,
        skillContests: skillContestData,
        groupBuys: groupBuyData,
        products: productData,
        merchants: merchantData
      });
    } catch (error) {
      console.error('Error loading promotions data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'sweepstakes':
        return data.sweepstakes.map((sweep) => {
          const product = data.products.find(p => p.id === sweep.product_id);
          const merchant = data.merchants.find(m => m.id === product?.merchant_id);
          return <SweepstakesCard key={sweep.id} sweepstakes={sweep} product={product} merchant={merchant} user={user} />;
        });
      case 'skill_contests':
        return data.skillContests.map((contest) => {
          const product = data.products.find(p => p.id === contest.product_id);
          return <SkillContestCard key={contest.id} contest={contest} product={product} />;
        });
      case 'group_buys':
        return data.groupBuys.map((gb) => {
          const product = data.products.find(p => p.id === gb.product_id);
          return <GroupBuyCard key={gb.id} groupBuy={gb} product={product} />;
        });
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 bg-gray-800 rounded-lg w-1/2 mb-8 animate-pulse"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 h-96 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-indigo-300 bg-clip-text text-transparent">
                Promotions Hub
              </h1>
              <p className="text-purple-200/80">Win, create, and save together.</p>
            </div>
        </div>

        <div className="flex gap-2 mb-8 bg-black/30 p-2 rounded-xl border border-purple-700/30 w-full md:w-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm md:text-base ${
                activeTab === id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-purple-300 hover:bg-purple-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderContent().length > 0 ? renderContent() : (
             <div className="col-span-full text-center py-12 text-purple-300">
                <Gift className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
                <h3 className="text-xl font-semibold mb-2">No Active Promotions</h3>
                <p>Check back soon for new opportunities!</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}