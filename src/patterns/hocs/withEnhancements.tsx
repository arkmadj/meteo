/**
 * Higher-Order Component (HOC) Examples
 * When HOCs are still the right choice in TypeScript React
 */

import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';

// ============================================================================
// TYPES FOR HOCs
// ============================================================================

// Helper type to extract props from a component
type _ComponentProps<T> = T extends ComponentType<infer P> ? P : never;

// Helper type to make certain props optional
type _Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// HOC that injects props
type _InjectedProps<T> = {
  [K in keyof T]: T[K];
};

// HOC that removes props
type _WithoutProps<T, K extends keyof T> = Omit<T, K>;

// ============================================================================
// HOC: WITH ANALYTICS (Cross-cutting concern)
// ============================================================================

interface AnalyticsProps {
  trackingId?: string;
  eventName?: string;
}

/**
 * HOC for adding analytics tracking to any component
 * Good use case: Cross-cutting concern that applies to many components
 */
export function withAnalytics<P extends object>(
  Component: ComponentType<P>,
  defaultEventName?: string
) {
  type Props = P & AnalyticsProps;

  const WithAnalyticsComponent = (props: Props) => {
    const { trackingId, eventName = defaultEventName, ...componentProps } = props;

    useEffect(() => {
      if (trackingId && eventName) {
        // Simulate analytics tracking
        console.log(`Analytics: ${eventName} tracked with ID: ${trackingId}`);

        // In real app, you'd call your analytics service
        // analytics.track(eventName, { trackingId, ...metadata });
      }
    }, [trackingId, eventName]);

    return <Component {...(componentProps as P)} />;
  };

  WithAnalyticsComponent.displayName = `withAnalytics(${Component.displayName || Component.name})`;

  return WithAnalyticsComponent;
}

// ============================================================================
// HOC: WITH LOADING STATE (UI Enhancement)
// ============================================================================

interface LoadingProps {
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * HOC for adding loading states to existing components
 * Good use case: Enhancing third-party or existing components
 */
export function withLoading<P extends object>(Component: ComponentType<P>) {
  type Props = P & LoadingProps;

  const WithLoadingComponent = (props: Props) => {
    const {
      isLoading = false,
      loadingComponent = <div>Loading...</div>,
      ...componentProps
    } = props;

    if (isLoading) {
      return <>{loadingComponent}</>;
    }

    return <Component {...(componentProps as P)} />;
  };

  WithLoadingComponent.displayName = `withLoading(${Component.displayName || Component.name})`;

  return WithLoadingComponent;
}

// ============================================================================
// HOC: WITH ERROR BOUNDARY (Error Handling)
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  fallback?: (error: Error) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * HOC for wrapping components with error boundaries
 * Good use case: Adding error handling to existing components
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  defaultFallback?: (error: Error) => React.ReactNode
) {
  type Props = P & ErrorBoundaryProps;

  class WithErrorBoundaryComponent extends React.Component<Props, ErrorBoundaryState> {
    constructor(props: Props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      this.props.onError?.(error, errorInfo);
    }

    render() {
      if (this.state.hasError && this.state.error) {
        const fallback = this.props.fallback || defaultFallback;
        if (fallback) {
          return fallback(this.state.error);
        }

        return (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>{this.state.error.message}</p>
          </div>
        );
      }

      const { fallback, onError, ...componentProps } = this.props;
      return <Component {...(componentProps as P)} />;
    }
  }

  (WithErrorBoundaryComponent as any).displayName =
    `withErrorBoundary(${Component.displayName || Component.name})`;

  return WithErrorBoundaryComponent;
}

// ============================================================================
// HOC: WITH PERMISSIONS (Authorization)
// ============================================================================

interface User {
  id: number;
  name: string;
  permissions: string[];
  role: string;
}

interface PermissionProps {
  user?: User | null;
  requiredPermissions?: string[];
  requiredRole?: string;
  fallback?: React.ReactNode;
}

/**
 * HOC for adding permission checks to components
 * Good use case: Authorization logic that needs to be applied to many components
 */
export function withPermissions<P extends object>(Component: ComponentType<P>) {
  type Props = P & PermissionProps;

  const WithPermissionsComponent = (props: Props) => {
    const {
      user,
      requiredPermissions = [],
      requiredRole,
      fallback = <div>Access denied</div>,
      ...componentProps
    } = props;

    // Check if user has required role
    if (requiredRole && user?.role !== requiredRole) {
      return <>{fallback}</>;
    }

    // Check if user has required permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        user?.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return <>{fallback}</>;
      }
    }

    return <Component {...(componentProps as P)} />;
  };

  WithPermissionsComponent.displayName = `withPermissions(${Component.displayName || Component.name})`;

  return WithPermissionsComponent;
}

// ============================================================================
// HOC: WITH THEME (Styling Enhancement)
// ============================================================================

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
}

interface ThemeProps {
  theme?: Theme;
}

const defaultTheme: Theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#333333',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
};

/**
 * HOC for injecting theme props into components
 * Good use case: Styling system that needs to be applied consistently
 */
export function withTheme<P extends object>(Component: ComponentType<P & ThemeProps>) {
  const WithThemeComponent = (props: P & Partial<ThemeProps>) => {
    const { theme = defaultTheme, ...componentProps } = props;

    return <Component {...(componentProps as P)} theme={theme} />;
  };

  WithThemeComponent.displayName = `withTheme(${Component.displayName || Component.name})`;

  return WithThemeComponent;
}

// ============================================================================
// HOC COMPOSITION: COMBINING MULTIPLE HOCs
// ============================================================================

/**
 * Utility function to compose multiple HOCs
 * Helps avoid deeply nested HOC calls
 */
export function compose<T>(
  ...hocs: Array<(component: ComponentType<unknown>) => ComponentType<unknown>>
) {
  return (Component: ComponentType<T>) => {
    return hocs.reduceRight((acc, hoc) => hoc(acc), Component);
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Basic component to enhance
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

// Enhanced button with multiple HOCs
const EnhancedButton = compose(withAnalytics, withLoading, withErrorBoundary, withTheme)(Button);

// Usage with type safety
export function HOCExample() {
  const [loading, setLoading] = useState(false);
  const [user] = useState<User>({
    id: 1,
    name: 'John Doe',
    permissions: ['read', 'write'],
    role: 'admin',
  });

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div>
      <h2>HOC Examples</h2>

      {/* Basic enhanced button */}
      {React.createElement(EnhancedButton as any, {
        onClick: handleClick,
        isLoading: loading,
        trackingId: 'button-click',
        eventName: 'enhanced-button-clicked',
        theme: {
          colors: {
            primary: '#28a745',
            secondary: '#6c757d',
            background: '#ffffff',
            text: '#333333',
          },
          spacing: {
            small: '4px',
            medium: '8px',
            large: '16px',
          },
        },
        children: 'Enhanced Button',
      })}

      {/* Button with permissions */}
      {React.createElement(
        withPermissions(Button) as any,
        {
          onClick: handleClick,
          user,
          requiredPermissions: ['write'],
          fallback: <div>You don't have permission to use this button</div>,
        } as any,
        'Protected Button'
      )}
    </div>
  );
}

// ============================================================================
// WHEN TO USE HOCs vs COMPOSITION
// ============================================================================

/**
 * Use HOCs when:
 * 1. Enhancing third-party components you can't modify
 * 2. Adding cross-cutting concerns (analytics, logging)
 * 3. Runtime component enhancement based on conditions
 * 4. Working with class components that can't use hooks
 * 5. Need to modify component behavior without changing its API
 *
 * Prefer Composition when:
 * 1. Building new components from scratch
 * 2. Need explicit control over rendering
 * 3. Want better TypeScript inference
 * 4. Building reusable UI components
 * 5. Need conditional rendering based on props
 */
