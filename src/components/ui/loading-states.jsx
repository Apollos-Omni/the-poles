import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2 className={`animate-spin text-purple-400 ${sizeClasses[size]} ${className}`} />
  );
};

export const LoadingCard = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-700 rounded-lg p-4 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex gap-2">
        <div className="h-6 bg-gray-600 rounded w-20"></div>
        <div className="h-6 bg-gray-600 rounded w-16"></div>
      </div>
      <div className="h-4 bg-gray-600 rounded w-24"></div>
    </div>
    <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
  </div>
);

export const LoadingPage = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
    <LoadingSpinner size="xl" className="mb-4" />
    <p className="text-gray-300">{message}</p>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse">
        {Array(cols).fill(0).map((_, j) => (
          <div key={j} className="h-6 bg-gray-600 rounded flex-1"></div>
        ))}
      </div>
    ))}
  </div>
);