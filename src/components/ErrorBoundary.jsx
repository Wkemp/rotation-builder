import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Logged to the console so it's visible in dev tools even without this UI
    console.error('Rotation Builder crashed:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink text-chalk p-6">
          <div className="max-w-lg w-full bg-ink-raised border border-serve/40 rounded-xl p-5">
            <h1 className="font-display text-lg font-semibold text-chalk mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-chalk-dim mb-3">
              The app hit an error and had to stop rendering here, rather than showing a blank
              screen. Your data is still saved — reloading should get you back to normal.
            </p>
            <p className="text-xs font-data text-serve bg-ink rounded px-2 py-1.5 mb-4 break-words">
              {this.state.error?.message || String(this.state.error)}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="h-11 px-4 rounded-lg bg-gold text-ink text-sm font-medium hover:bg-gold-dim transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
