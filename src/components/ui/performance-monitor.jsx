import React, { useEffect, useState } from 'react';
import { APP_CONFIG } from './constants';

// Performance monitoring utilities for ship-ready app
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: null,
    renderTime: null,
    bundleSize: null
  });

  useEffect(() => {
    // Measure initial load time
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));

    // Measure render completion
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const renderEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (renderEntry) {
        setMetrics(prev => ({ ...prev, renderTime: renderEntry.startTime }));
      }
    });

    observer.observe({ entryTypes: ['paint'] });

    return () => observer.disconnect();
  }, []);

  const checkPerformanceTargets = () => {
    const warnings = [];
    
    if (metrics.loadTime > APP_CONFIG.performance.targetLaunchTime.android) {
      warnings.push(`Load time ${metrics.loadTime}ms exceeds Android target`);
    }
    
    return warnings;
  };

  return { metrics, checkPerformanceTargets };
};

export const PerformanceDebugger = ({ enabled = false }) => {
  const { metrics, checkPerformanceTargets } = usePerformanceMonitor();
  
  if (!enabled) return null;

  const warnings = checkPerformanceTargets();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>Load: {metrics.loadTime?.toFixed(1)}ms</div>
        <div>Render: {metrics.renderTime?.toFixed(1)}ms</div>
        {warnings.length > 0 && (
          <div className="text-red-400">
            {warnings.map((warning, i) => <div key={i}>⚠ {warning}</div>)}
          </div>
        )}
      </div>
    </div>
  );
};