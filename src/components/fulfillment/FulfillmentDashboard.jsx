import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, Clock, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";

export default function FulfillmentDashboard() {
  const [fulfillmentStats, setFulfillmentStats] = useState({
    pending: 3,
    processing: 7,
    shipped: 12,
    delivered: 45,
    failed: 2
  });

  const [recentFulfillments, setRecentFulfillments] = useState([
    { id: 'fulfill-1', match_id: 'match-123', status: 'shipped', product: 'Nintendo Switch OLED', winner: 'user-456', updated: '2 hours ago' },
    { id: 'fulfill-2', match_id: 'match-124', status: 'processing', product: 'Apple AirPods Pro', winner: 'user-789', updated: '4 hours ago' },
    { id: 'fulfill-3', match_id: 'match-125', status: 'delivered', product: 'LEGO Star Wars', winner: 'user-012', updated: '1 day ago' }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'processing': return 'bg-blue-500/20 text-blue-300';
      case 'shipped': return 'bg-purple-500/20 text-purple-300';
      case 'delivered': return 'bg-green-500/20 text-green-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Package;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'failed': return AlertTriangle;
      default: return Package;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(fulfillmentStats).map(([status, count]) => {
          const Icon = getStatusIcon(status);
          return (
            <Card key={status} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm capitalize">{status}</p>
                    <p className="text-white text-2xl font-bold">{count}</p>
                  </div>
                  <Icon className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Fulfillments */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Recent Fulfillments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentFulfillments.map((fulfillment) => {
              const StatusIcon = getStatusIcon(fulfillment.status);
              return (
                <div key={fulfillment.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">{fulfillment.product}</p>
                      <p className="text-gray-400 text-sm">Winner: {fulfillment.winner}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(fulfillment.status)}>
                      {fulfillment.status}
                    </Badge>
                    <p className="text-gray-500 text-xs mt-1">{fulfillment.updated}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Fulfillment Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">
              <Package className="w-4 h-4 mr-2" />
              Process Pending
            </Button>
            <Button variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">
              <Truck className="w-4 h-4 mr-2" />
              Track Shipments
            </Button>
            <Button variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Handle Failed
            </Button>
            <Button variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}