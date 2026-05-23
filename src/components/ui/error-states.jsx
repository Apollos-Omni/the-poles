
import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Corrected path
import { Card, CardContent } from '@/components/ui/card'; // Corrected path
import { createPageUrl } from '@/utils';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In a browser environment, 'process' is not defined.
    // We can infer a production-like environment if the hostname is not 'localhost'.
    const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
    if (isProduction) {
      // TODO: Send to Sentry or similar
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay 
          title="Something went wrong"
          message="An unexpected error occurred. Please try refreshing the page."
          onRetry={() => {
            this.setState({ hasError: false, error: null });
            if (this.props.onRetry) this.props.onRetry();
          }}
          showRetry={true}
        />
      );
    }

    return this.props.children;
  }
}

export const ErrorDisplay = ({ 
  title = 'Error', 
  message, 
  onRetry, 
  showRetry = false,
  icon: Icon = AlertTriangle,
  className = ''
}) => (
  <Card className={`bg-gray-800 border-red-700/50 ${className}`}>
    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" className="border-red-500/50 text-red-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </CardContent>
  </Card>
);

export const NetworkError = ({ onRetry }) => (
  <ErrorDisplay
    icon={WifiOff}
    title="Connection Error"
    message="Unable to connect to Divine Hinge services. Please check your connection and try again."
    onRetry={onRetry}
    showRetry={true}
  />
);

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
    {Icon && (
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 opacity-50">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-200 mb-2">{title}</h3>
    {description && <p className="text-gray-400 mb-4">{description}</p>}
    {action}
  </div>
);

export const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
    <div className="text-9xl font-bold text-purple-400 mb-4">404</div>
    <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
    <p className="text-gray-400 mb-8">The sacred pathway you seek does not exist.</p>
    <Button asChild>
      <a href={createPageUrl('Dashboard')}>Return to Dashboard</a>
    </Button>
  </div>
);
