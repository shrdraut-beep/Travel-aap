import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
              🚆
            </div>
            
            <div>
              <h2 className="text-xl font-black text-white">Routripo Notice</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                An unexpected display issue occurred or an API request exceeded rate limits.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80 text-left text-xs font-mono text-rose-300 max-h-32 overflow-y-auto leading-relaxed flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
                {this.state.error.message || "Unknown error"}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-xl transition-all shadow-lg active:scale-95"
              >
                Reload Application
              </button>
              
              <button
                onClick={this.handleClearCache}
                className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Reset Cache & Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
