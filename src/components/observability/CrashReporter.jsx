import { useEffect } from 'react';

// Simple crash reporting utility
export const useCrashReporter = () => {
  useEffect(() => {
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError.apply(console, args);
      
      // Report to crash service
      reportError(new Error(args.join(' ')));
    };

    // Global error handler
    const handleError = (event) => {
      reportError(event.error || new Error(event.message));
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event) => {
      reportError(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};

const reportError = (error) => {
  // In production, this would send to Sentry or similar
  const errorReport = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId: localStorage.getItem('userId') // if available
  };
  
  // For now, just log structured error
  console.log('[CRASH REPORTER]', JSON.stringify(errorReport, null, 2));
  
  // In production:
  // fetch('/api/crash-report', { 
  //   method: 'POST', 
  //   body: JSON.stringify(errorReport) 
  // }).catch(() => {}); // Silent fail for error reporting
};

export const CrashReporter = () => {
  useCrashReporter();
  return null;
};