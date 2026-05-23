import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Clock, 
  Check, 
  X, 
  Edit, 
  AlertCircle,
  Heart,
  Mail
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const offerStatuses = {
  pending: { color: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30", icon: Clock },
  accepted: { color: "bg-green-600/20 text-green-300 border-green-500/30", icon: Check },
  rejected: { color: "bg-red-600/20 text-red-300 border-red-500/30", icon: X },
  revise: { color: "bg-blue-600/20 text-blue-300 border-blue-500/30", icon: Edit },
  expired: { color: "bg-gray-600/20 text-gray-300 border-gray-500/30", icon: AlertCircle }
};

const intentColors = {
  share: "bg-blue-500/20 text-blue-300",
  apology: "bg-pink-500/20 text-pink-300",
  boundary: "bg-red-500/20 text-red-300",
  question: "bg-yellow-500/20 text-yellow-300",
  debrief: "bg-purple-500/20 text-purple-300",
  gratitude: "bg-green-500/20 text-green-300"
};

// Mock data for demonstration
const mockOffers = [
  {
    id: '1',
    post_id: 'post1',
    from_user: { display_name: 'Sarah', handle: '@sarah_flows' },
    to_board: 'My Processing Board',
    status: 'pending',
    offer_message: 'I wrote this after our conversation yesterday. I hope it helps clarify where I was coming from.',
    post_preview: 'I wanted to explain why I felt hurt when you said my project was "unrealistic". I know you meant to be helpful, but...',
    intent: 'share',
    created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    post_id: 'post2', 
    from_user: { display_name: 'Marcus', handle: '@marcus_builds' },
    to_board: 'Family Reflections',
    status: 'accepted',
    offer_message: 'This is something I should have said years ago.',
    post_preview: 'Dad, I realize now that when I was pushing back against your advice, it wasn\'t because I didn\'t value it...',
    intent: 'apology',
    created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reviewer_notes: 'Thank you for your honesty. This means a lot.'
  }
];

export default function OfferInbox({ user }) {
  const [offers, setOffers] = useState(mockOffers);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleOfferResponse = (offerId, newStatus, notes = '') => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, status: newStatus, reviewer_notes: notes }
        : offer
    ));
    setSelectedOffer(null);
  };

  const pendingOffers = offers.filter(o => o.status === 'pending');
  const reviewedOffers = offers.filter(o => o.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-purple-100">Offer Inbox</h2>
        <Badge className="bg-purple-600/20 text-purple-300">
          {pendingOffers.length} pending
        </Badge>
      </div>

      {/* Pending Offers */}
      {pendingOffers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-200">Pending Review</h3>
          {pendingOffers.map((offer) => {
            const StatusIcon = offerStatuses[offer.status].icon;
            return (
              <Card key={offer.id} className="bg-gradient-to-br from-purple-600/20 to-black/40 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600/40 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-200" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-purple-100">
                          Post Offer from {offer.from_user.display_name}
                        </CardTitle>
                        <p className="text-purple-300 text-sm">{offer.from_user.handle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={intentColors[offer.intent]}>
                        {offer.intent}
                      </Badge>
                      <Badge className={offerStatuses[offer.status].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {offer.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Offer Message */}
                    <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-700/40">
                      <p className="text-purple-100 text-sm font-medium mb-2">Their message:</p>
                      <p className="text-purple-200/90">{offer.offer_message}</p>
                    </div>

                    {/* Post Preview */}
                    <div className="p-3 bg-black/30 rounded-lg border border-purple-700/30">
                      <p className="text-purple-100 text-sm font-medium mb-2">Post preview:</p>
                      <p className="text-purple-200/80 text-sm italic">"{offer.post_preview}..."</p>
                    </div>

                    {/* Timing Info */}
                    <div className="flex items-center justify-between text-sm text-purple-300">
                      <span>Offered {formatDistanceToNow(new Date(offer.created_date), { addSuffix: true })}</span>
                      {offer.expires_at && (
                        <span>Expires {formatDistanceToNow(new Date(offer.expires_at), { addSuffix: true })}</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-purple-700/30">
                      <Button
                        onClick={() => handleOfferResponse(offer.id, 'accepted')}
                        className="bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleOfferResponse(offer.id, 'revise')}
                        variant="outline"
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Request Changes
                      </Button>
                      <Button
                        onClick={() => handleOfferResponse(offer.id, 'rejected')}
                        variant="outline"
                        className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recent Activity */}
      {reviewedOffers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-200">Recent Activity</h3>
          {reviewedOffers.map((offer) => {
            const StatusIcon = offerStatuses[offer.status].icon;
            return (
              <Card key={offer.id} className="bg-black/40 backdrop-blur-sm border border-purple-700/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-purple-200">
                          <span className="font-medium">{offer.from_user.display_name}</span> - Post offer
                        </p>
                        <p className="text-purple-300/70 text-sm">
                          {formatDistanceToNow(new Date(offer.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge className={offerStatuses[offer.status].color}>
                      {offer.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {offers.length === 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-700/30 text-center p-12">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-xl font-semibold text-purple-200 mb-2">No Post Offers</h3>
          <p className="text-purple-300/70">When people want to share posts on your boards, they'll appear here</p>
        </Card>
      )}
    </div>
  );
}