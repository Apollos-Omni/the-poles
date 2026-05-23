import React from 'react';
import { Badge } from '@/components/ui/badge'; // Corrected path
import { Cpu, User, Download, Settings } from 'lucide-react';
import { INTEGRITY } from '@/components/ui/constants'; // Corrected path

const iconMap = {
  Cpu,
  User, 
  Download,
  Settings
};

export const IntegrityBadge = ({ source, timestamp, signerId }) => {
  const config = INTEGRITY.sourceBadges[source] || INTEGRITY.sourceBadges.system;
  const Icon = iconMap[config.icon];
  
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200', 
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 text-xs ${colorClasses[config.color]}`}
      title={`Source: ${config.label}${timestamp ? ` | ${new Date(timestamp).toLocaleString()}` : ''}${signerId ? ` | ID: ${signerId}` : ''}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export const EvidenceLog = ({ events }) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-900">Evidence Log</h4>
      {events?.length > 0 ? (
        <div className="space-y-1">
          {events.map((event, index) => (
            <div key={index} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <IntegrityBadge source={event.source} />
                <span>{event.action}</span>
              </div>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No evidence records</p>
      )}
    </div>
  );
};