import { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { logger } from '../../services/logger';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('ErrorBoundary caught an error', 'ErrorBoundary', { error: String(error), componentStack: errorInfo.componentStack || '' });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            {/* Decorative blob background */}
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-miro-red/20 blob animate-pulse" />
              <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-miro-yellow/20 blob-2 animate-pulse" />
            </div>

            {/* Error icon */}
            <motion.div
              className="relative w-24 h-24 mx-auto mb-6 bg-miro-red/10 rounded-3xl flex items-center justify-center"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-12 h-12 text-miro-red" />
            </motion.div>

            <h1 className="text-3xl font-display font-bold text-miro-blue dark:text-ink-light mb-3">
              Oops! Something went wrong
            </h1>

            <p className="text-miro-blue/60 dark:text-ink-light/60 mb-6">
              Don't worry, your progress is saved. Let's get you back on track!
            </p>

            {/* Error details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-miro-red/5 dark:bg-miro-red/10 rounded-xl text-left">
                <p className="text-sm font-mono text-miro-red break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                leftIcon={<Home className="w-4 h-4" />}
              >
                Go Home
              </Button>
            </div>

            {/* Decorative star */}
            <motion.span
              className="absolute top-1/4 right-1/4 text-3xl text-miro-yellow"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              ✦
            </motion.span>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
