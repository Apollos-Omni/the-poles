import { useEffect, useState } from 'react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: null,
    renderTime: null,
    navigationTiming: null
  });

  useEffect(() => {
    // Core Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, renderTime: entry.startTime }));
            }
            break;
          case 'navigation':
            setMetrics(prev => ({ ...prev, navigationTiming: entry }));
            break;
          case 'largest-contentful-paint':
            console.log('[PERF] LCP:', entry.startTime);
            break;
        }
      });
    });

    observer.observe({ entryTypes: ['paint', 'navigation', 'largest-contentful-paint'] });

    // Bundle size estimation
    const bundleSize = performance.getEntriesByType('resource')
      .filter(r => r.name.includes('.js'))
      .reduce((total, r) => total + (r.transferSize || 0), 0);

    console.log('[PERF] Estimated bundle size:', (bundleSize / 1024).toFixed(2), 'KB');

    return () => observer.disconnect();
  }, []);

  const checkPerformanceTargets = () => {
    const warnings = [];
    
    if (metrics.renderTime > 2500) {
      warnings.push(`Render time ${metrics.renderTime.toFixed(0)}ms exceeds Android target (2500ms)`);
    }
    
    if (metrics.renderTime > 1800) {
      warnings.push(`Render time ${metrics.renderTime.toFixed(0)}ms exceeds iOS target (1800ms)`);
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
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="space-y-1">
        <div className="font-bold text-green-400">Performance Monitor</div>
        <div>Load: {metrics.loadTime?.toFixed(1)}ms</div>
        <div>Render: {metrics.renderTime?.toFixed(1)}ms</div>
        <div>Memory: {(performance.memory?.usedJSHeapSize / 1024 / 1024)?.toFixed(1)}MB</div>
        {warnings.length > 0 && (
          <div className="text-red-400 mt-2">
            {warnings.map((warning, i) => (
              <div key={i}>⚠ {warning}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};