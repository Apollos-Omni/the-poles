import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Plus, 
  CreditCard, 
  Landmark,
  DollarSign,
  ArrowRight,
  ExternalLink
} from "lucide-react";

// Mock data
const mockPaymentMethods = [
  { id: 'pm_1', type: 'card', brand: 'Visa', last4: '4242', is_default: true },
  { id: 'pm_2', type: 'bank', bank_name: 'Chase', last4: '3456', is_default: false },
];

const mockTransactions = [
  { id: 'txn_1', type: 'pledge', amount: -25.00, description: 'Pledge to "Build Community Garden"', date: '2023-10-26' },
  { id: 'txn_2', type: 'payout', amount: 150.00, description: 'Weekly Payout', date: '2023-10-25' },
  { id: 'txn_3', type: 'pledge', amount: -10.00, description: 'Pledge to "Launch Podcast"', date: '2023-10-24' },
];

export default function PaymentsHub({ user, profile, onClose, onUpdated }) {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSetupPayouts = () => {
    setIsConnecting(true);
    // In a real app, this would redirect to Stripe's hosted onboarding
    console.log("Redirecting to Stripe Connect onboarding...");
    setTimeout(() => {
      alert("This would redirect to Stripe. For now, we'll simulate a successful connection.");
      // onUpdated(); // This would be called by a webhook in reality
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-400" />
            Wallet & Payments
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Left Column: Payouts & Balance */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-green-600/10 to-black/40 border-green-700/30">
              <CardHeader>
                <CardTitle className="text-lg text-green-100">Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.stripe_connect_id ? (
                  <div className="space-y-4">
                    <p className="text-green-300/80 text-sm">Your account is connected and ready to receive payouts.</p>
                    <Badge className="bg-green-600/20 text-green-300">Verified</Badge>
                    <Button variant="outline" className="w-full text-green-200 border-green-500/50 hover:bg-green-600/20">
                      View Payout Dashboard <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-yellow-300/80 text-sm">Connect a bank account to receive payouts for pledges and vision completions.</p>
                    <Button onClick={handleSetupPayouts} disabled={isConnecting} className="w-full bg-green-600 hover:bg-green-700">
                      {isConnecting ? 'Connecting...' : 'Setup Payouts'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-[rgb(var(--grey-2))] border-[rgb(var(--grey-3))]/20">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Available Balance</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="text-4xl font-bold text-green-400">$150.00</div>
                    <p className="text-sm text-gray-400 mt-1">Next payout: Nov 1, 2023</p>
                </CardContent>
            </Card>
          </div>

          {/* Right Column: Payment Methods & History */}
          <div className="space-y-6">
            <Card className="bg-[rgb(var(--grey-2))] border-[rgb(var(--grey-3))]/20">
              <CardHeader>
                <CardTitle className="text-lg text-white">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {paymentMethods.map(pm => (
                    <div key={pm.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {pm.type === 'card' ? <CreditCard className="w-5 h-5 text-purple-400" /> : <Landmark className="w-5 h-5 text-blue-400" />}
                        <div>
                          <span className="text-sm font-medium text-white">
                            {pm.brand || pm.bank_name} ending in {pm.last4}
                          </span>
                          {pm.is_default && <Badge className="ml-2 bg-purple-600/30 text-purple-300 border-0">Default</Badge>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full text-purple-200 border-purple-500/50 hover:bg-purple-600/20">
                  <Plus className="w-4 h-4 mr-2" /> Add Payment Method
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[rgb(var(--grey-2))] border-[rgb(var(--grey-3))]/20">
              <CardHeader>
                <CardTitle className="text-lg text-white">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map(t => (
                     <div key={t.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1 truncate pr-2">
                           <p className="text-white font-medium">{t.description}</p>
                           <p className="text-gray-400 text-xs">{t.date}</p>
                        </div>
                        <div className={`font-semibold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                        </div>
                     </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}