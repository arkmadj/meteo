import React, { Suspense } from 'react';

import { useTheme } from '@/design-system/theme';

import Loading from '@/components/ui/feedback/Loading';

/**
 * Props for SuspenseWrapper component
 */
interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingText?: string;
  minHeight?: string;
  className?: string;
  variant?: 'default' | 'fullscreen' | 'card' | 'inline' | 'skeleton';
}

/**
 * Theme-aware loading fallback component
 */
const LoadingFallback: React.FC<{
  variant: 'default' | 'fullscreen' | 'card' | 'inline' | 'skeleton';
  loadingText: string;
}> = ({ variant, loadingText }) => {
  const { theme } = useTheme();

  switch (variant) {
    case 'default':
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loading />
            <p className="mt-4 text-[var(--theme-text-secondary)]">{loadingText}</p>
          </div>
        </div>
      );

    case 'fullscreen':
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loading />
            <p className="mt-4 text-[var(--theme-text-secondary)] text-lg">{loadingText}</p>
          </div>
        </div>
      );

    case 'card':
      return (
        <div className="flex items-center justify-center min-h-[300px] bg-[var(--theme-surface)] rounded-lg border border-[var(--theme-border)]">
          <div className="text-center">
            <Loading />
            <p className="mt-4 text-[var(--theme-text-secondary)]">{loadingText}</p>
          </div>
        </div>
      );

    case 'inline':
      return (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center space-x-3">
            <div
              className="animate-spin rounded-full h-5 w-5 border-b-2"
              style={{ borderColor: theme.accentColor }}
            ></div>
            <span className="text-sm text-[var(--theme-text-secondary)]">{loadingText}</span>
          </div>
        </div>
      );

    case 'skeleton':
      return (
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            <div
              className="h-4 rounded w-3/4"
              style={{
                backgroundColor: theme.isDark
                  ? theme.colors.neutral[700]
                  : theme.colors.neutral[300],
              }}
            ></div>
            <div className="space-y-2">
              <div
                className="h-4 rounded"
                style={{
                  backgroundColor: theme.isDark
                    ? theme.colors.neutral[700]
                    : theme.colors.neutral[300],
                }}
              ></div>
              <div
                className="h-4 rounded w-5/6"
                style={{
                  backgroundColor: theme.isDark
                    ? theme.colors.neutral[700]
                    : theme.colors.neutral[300],
                }}
              ></div>
              <div
                className="h-4 rounded w-4/6"
                style={{
                  backgroundColor: theme.isDark
                    ? theme.colors.neutral[700]
                    : theme.colors.neutral[300],
                }}
              ></div>
            </div>
            <div className="flex justify-center pt-4">
              <span className="text-xs text-[var(--theme-text-secondary)]">{loadingText}</span>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loading />
            <p className="mt-4 text-[var(--theme-text-secondary)]">{loadingText}</p>
          </div>
        </div>
      );
  }
};

/**
 * Reusable Suspense wrapper component with different loading variants
 * Fully theme-aware with support for dark/light modes and high contrast
 */
export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback,
  loadingText = 'Loading...',
  minHeight,
  className = '',
  variant = 'default',
}) => {
  // Use custom fallback if provided, otherwise use theme-aware variant-specific fallback
  const loadingFallback = fallback || (
    <LoadingFallback variant={variant} loadingText={loadingText} />
  );

  // Apply minHeight if specified
  const wrapperStyle = minHeight ? { minHeight } : undefined;

  return (
    <div className={className} style={wrapperStyle}>
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </div>
  );
};

/**
 * Specialized Suspense wrapper for showcase components
 */
export const ShowcaseSuspense: React.FC<{
  children: React.ReactNode;
  componentName: string;
  className?: string;
}> = ({ children, componentName, className = '' }) => (
  <SuspenseWrapper variant="card" loadingText={`Loading ${componentName}...`} className={className}>
    {children}
  </SuspenseWrapper>
);

/**
 * Specialized Suspense wrapper for dashboard components
 */
export const DashboardSuspense: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <SuspenseWrapper
    variant="card"
    loadingText="Loading Dashboard..."
    minHeight="400px"
    className={className}
  >
    {children}
  </SuspenseWrapper>
);

/**
 * Specialized Suspense wrapper for test components
 */
export const TestSuspense: React.FC<{
  children: React.ReactNode;
  testName: string;
}> = ({ children, testName }) => (
  <SuspenseWrapper variant="fullscreen" loadingText={`Loading ${testName}...`}>
    {children}
  </SuspenseWrapper>
);

/**
 * Specialized Suspense wrapper for route components
 */
export const RouteSuspense: React.FC<{
  children: React.ReactNode;
  routeName: string;
  className?: string;
}> = ({ children, routeName, className = '' }) => (
  <SuspenseWrapper
    variant="fullscreen"
    loadingText={`Loading ${routeName}...`}
    className={className}
  >
    {children}
  </SuspenseWrapper>
);

/**
 * Specialized Suspense wrapper for inline components
 */
export const InlineSuspense: React.FC<{
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}> = ({ children, loadingText = 'Loading...', className = '' }) => (
  <SuspenseWrapper variant="inline" loadingText={loadingText} className={className}>
    {children}
  </SuspenseWrapper>
);

/**
 * Specialized Suspense wrapper with skeleton loading
 */
export const SkeletonSuspense: React.FC<{
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}> = ({ children, loadingText = 'Loading content...', className = '' }) => (
  <SuspenseWrapper variant="skeleton" loadingText={loadingText} className={className}>
    {children}
  </SuspenseWrapper>
);

/**
 * Higher-order component to wrap any component with Suspense
 */
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    variant?: SuspenseWrapperProps['variant'];
    loadingText?: string;
    minHeight?: string;
    className?: string;
  } = {}
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <SuspenseWrapper {...options}>
      <Component {...props} ref={ref} />
    </SuspenseWrapper>
  ));

  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Error Boundary component for handling lazy loading errors
 */
class SuspenseErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    componentName: string;
    onRetry: () => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Suspense component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load {this.props.componentName}
          </h3>
          <p className="text-gray-600 mb-4">{this.state.error?.message || 'An error occurred'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onRetry();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to create a Suspense boundary with error handling
 */
export const useSuspenseWithErrorBoundary = (
  componentName: string,
  variant: SuspenseWrapperProps['variant'] = 'default'
) => {
  const [retryKey, setRetryKey] = React.useState(0);

  const retry = React.useCallback(() => {
    setRetryKey(prev => prev + 1);
  }, []);

  const SuspenseBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <SuspenseErrorBoundary componentName={componentName} onRetry={retry}>
      <SuspenseWrapper variant={variant} loadingText={`Loading ${componentName}...`}>
        <div key={retryKey}>{children}</div>
      </SuspenseWrapper>
    </SuspenseErrorBoundary>
  );

  return { SuspenseBoundary, retry };
};

export default SuspenseWrapper;
