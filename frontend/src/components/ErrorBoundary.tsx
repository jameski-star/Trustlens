import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error.message);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="container-page py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#FEF2F2] rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-[#DC2626]" />
            </div>
            <h2 className="font-heading font-700 text-xl text-[var(--text-primary)] mb-2">
              Analysis Temporarily Unavailable
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              We encountered an unexpected issue. Please try again.
            </p>
            <button onClick={this.handleReset} className="btn-primary gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
