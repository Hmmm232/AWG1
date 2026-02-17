import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          fontFamily: 'var(--font-sans)',
        }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--color-ink-faint)', marginBottom: '1.5rem' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
