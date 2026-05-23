import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, RefreshCw, MessageSquare, Settings, Activity, Shield, Target, Lock } from "lucide-react";
import { IntegrityBadge } from '@/components/ui/integrity-badge';
import { LoadingSpinner, LoadingCard } from '@/components/ui/loading-states';
import { ErrorBoundary, EmptyState } from '@/components/ui/error-states';

export default function AgentDashboard() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data with integrity information
  const mockEvents = [
    {
      id: 'mock-1',
      created_date: new Date().toISOString(),
      actor: 'fulfillment_agent',
      stage: 'ORDER',
      code: 'ORDER_PLACED',
      message: 'Prize fulfillment initiated for Match #12345',
      meta: { prize: 'Nintendo Switch OLED', orderId: 'ord-67890' },
      integrity: {
        source: 'system',
        timestamp: new Date().toISOString(),
        signer_id: 'agent-fulfill-01'
      }
    },
    {
      id: 'mock-2',
      created_date: new Date(Date.now() - 120000).toISOString(),
      actor: 'compliance_monitor',
      stage: 'COMPLIANCE',
      code: 'AUDIT_PASSED',
      message: 'Routine compliance check completed successfully',
      meta: { scope: 'all_agents', rules_checked: 47 },
      integrity: {
        source: 'system',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        signer_id: 'agent-comply-01'
      }
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  const getStageBadgeColor = (stage) => {
    switch (stage) {
      case 'EXCEPTION': return 'bg-red-100 text-red-800';
      case 'ORDER':
      case 'TRACKING': return 'bg-green-100 text-green-800';
      case 'COMPLIANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return <ErrorBoundary error={error} onRetry={() => setError(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <Bot className="w-8 h-8 text-purple-400" />
                Agent Control Center
              </h1>
              <p className="text-gray-400 mt-2">Monitor and manage autonomous agents with full integrity tracking.</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </header>

        {/* Agent Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { name: 'Fulfillment Agent', status: 'active', tasks: 3, icon: Bot, color: 'blue' },
            { name: 'Compliance Monitor', status: 'active', tasks: 1, icon: Shield, color: 'green' },
            { name: 'Vision Support', status: 'idle', tasks: 0, icon: Target, color: 'purple' },
            { name: 'Security Guardian', status: 'active', tasks: 2, icon: Lock, color: 'orange' }
          ].map((agent) => (
            <Card key={agent.name} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <agent.icon className="w-4 h-4 text-purple-400" />
                  {agent.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={agent.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}
                  >
                    {agent.status}
                  </Badge>
                  <span className="text-gray-400 text-sm">{agent.tasks} tasks</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Stream */}
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-purple-400" />
              Agent Activity Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-gray-600 border-gray-500 text-gray-300">
                          {event.actor}
                        </Badge>
                        <Badge className={getStageBadgeColor(event.stage)}>
                          {event.stage}
                        </Badge>
                        <IntegrityBadge 
                          source={event.integrity?.source} 
                          timestamp={event.integrity?.timestamp}
                          signerId={event.integrity?.signer_id}
                        />
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(event.created_date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-200 mb-2">{event.message}</p>
                    {event.meta && Object.keys(event.meta).length > 0 && (
                      <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded mt-2">
                        <pre>{JSON.stringify(event.meta, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Bot}
                title="No agent events recorded"
                description="Agent activities will appear here once they start processing tasks"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}