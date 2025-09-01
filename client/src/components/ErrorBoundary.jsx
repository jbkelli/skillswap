// src/components/ErrorBoundary.jsx
import React from 'react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // Log error to service if needed
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-center py-8 text-red-500">Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}
export default ErrorBoundary;