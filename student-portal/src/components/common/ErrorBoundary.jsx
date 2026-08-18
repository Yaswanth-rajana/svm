import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught component error in route:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl glass-panel border border-red-500/20 bg-red-500/[0.02] text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto shadow-lg">
            <AlertTriangle size={28} />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white">
              Something went wrong loading this section
            </h3>
            <p className="text-xs text-gray-400">
              An unexpected rendering error occurred. The rest of the portal navigation remains operational.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reload Section</span>
            </button>

            <a
              href={ROUTES.DASHBOARD}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300 transition-all active:scale-95"
            >
              <Home size={14} />
              <span>Dashboard</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
