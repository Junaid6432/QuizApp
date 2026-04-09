import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-premium-gradient flex items-center justify-center p-6 text-white font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel max-w-lg w-full p-8 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-2">Kuch Masla Ho Gaya!</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                App ko load karne mein aik error aaya hai. Aksar ye missing setup ya internet ki wajah se hota hai.
              </p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 text-left border border-white/5 overflow-auto max-h-40">
              <code className="text-xs text-red-400 font-mono">
                {this.state.error?.message || "Unknown Runtime Error"}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                RELOAD APP
              </button>
              
              <button 
                onClick={() => {
                  window.location.href = '/';
                  this.setState({ hasError: false });
                }}
                className="btn-outline flex-1 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                GO HOME
              </button>
            </div>

            <p className="text-[10px] text-slate-500 pt-4 uppercase tracking-[0.2em]">
              Technical Support: Verify Firebase Configuration
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
