// src/components/common/CrashlyticsErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { crashlytics } from '../../services/crashlytics';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class CrashlyticsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Report crash to Firebase Crashlytics telemetry
    crashlytics.recordError(
      error,
      {
        componentStack: errorInfo.componentStack,
        boundary: 'CrashlyticsErrorBoundary',
      },
      true // Fatal component crash
    );
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-[20px] flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                An unexpected exception occurred. Our telemetry engine has recorded the crash report for rapid resolution.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-[16px] p-3 text-left overflow-hidden">
                <p className="text-[11px] font-mono text-red-300 break-words line-clamp-3">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-[16px] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-[16px] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-orange-600/30"
              >
                <Home className="w-4 h-4" /> Reload App
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-mono">
              RoutTripo Crashlytics Telemetry Active • Protected
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
