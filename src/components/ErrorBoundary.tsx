import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center glass-card rounded-[2rem] border border-outline-variant/10 m-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="text-primary" size={32} />
          </div>
          <h2 className="font-headline font-black uppercase italic text-2xl text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mb-8">
            The application encountered an unexpected error. This has been logged and we're looking into it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-headline font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all glow-primary"
          >
            <RefreshCcw size={14} /> Reload Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-black/40 rounded-xl text-left text-[10px] text-primary overflow-auto max-w-full font-mono border border-primary/20">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
