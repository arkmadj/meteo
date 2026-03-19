/**
 * Practical Decision Guide: Composition vs HOCs
 * Real-world scenarios with recommended approaches
 */

import React from 'react';

// ============================================================================
// SCENARIO 1: AUTHENTICATION - COMPOSITION WINS
// ============================================================================

/**
 * ✅ COMPOSITION APPROACH (Recommended)
 * Clear, explicit, easy to understand and test
 */

// Hook-based approach
function useAuth() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check authentication
    setLoading(false);
  }, []);

  return { user, loading, isAuthenticated: !!user };
}

// Composition component
function ProtectedRoute({ children, fallback = <div>Please log in</div> }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return fallback;

  return <>{children}</>;
}

// Usage - Clear and explicit
function CompositionAuthExample() {
  return (
    <ProtectedRoute fallback={<LoginForm />}>
      <Dashboard />
    </ProtectedRoute>
  );
}

/**
 * ❌ HOC APPROACH (Not recommended for this case)
 * More complex, harder to debug, type inference issues
 */

function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return (props: P) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <LoginForm />;

    return <Component {...props} />;
  };
}

// Usage - Less clear what's happening
const ProtectedDashboard = withAuth(Dashboard);

// ============================================================================
// SCENARIO 2: THIRD-PARTY ENHANCEMENT - HOC WINS
// ============================================================================

/**
 * ✅ HOC APPROACH (Recommended)
 * When you need to enhance components you can't modify
 */

// Third-party component you can't change
interface ThirdPartyButtonProps {
  label: string;
  onClick: () => void;
}

declare const ThirdPartyButton: React.ComponentType<ThirdPartyButtonProps>;

// HOC to add analytics to third-party component
function withAnalytics<P extends object>(Component: React.ComponentType<P>, eventName: string) {
  return (props: P) => {
    const trackEvent = () => {
      console.log(`Analytics: ${eventName}`);
      // Send to analytics service
    };

    React.useEffect(() => {
      trackEvent();
    }, []);

    return <Component {...props} />;
  };
}

// Usage - Perfect for third-party enhancement
const AnalyticsButton = withAnalytics(ThirdPartyButton, 'button-click');

/**
 * ❌ COMPOSITION APPROACH (Not practical)
 * Would require wrapping every third-party component
 */

function AnalyticsWrapper({ children, eventName }) {
  React.useEffect(() => {
    console.log(`Analytics: ${eventName}`);
  }, [eventName]);

  return children; // Can't easily inject props into children
}

// ============================================================================
// SCENARIO 3: FORM VALIDATION - COMPOSITION WINS
// ============================================================================

/**
 * ✅ COMPOSITION APPROACH (Recommended)
 * Better type safety, clearer data flow
 */

interface FormData {
  email: string;
  password: string;
}

function useFormValidation<T>(initialValues: T, validationRules: any) {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState<Partial<T>>({});

  const validate = () => {
    // Validation logic
    return Object.keys(errors).length === 0;
  };

  return { values, errors, setValues, validate };
}

function LoginForm() {
  const form = useFormValidation<FormData>(
    { email: '', password: '' },
    { email: 'required', password: 'required' }
  );

  return (
    <form>
      <input
        type="email"
        value={form.values.email}
        onChange={e => form.setValues(prev => ({ ...prev, email: e.target.value }))}
      />
      {form.errors.email && <span>{form.errors.email}</span>}
      {/* More fields... */}
    </form>
  );
}

/**
 * ❌ HOC APPROACH (Overly complex)
 * Type inference becomes difficult, harder to customize
 */

function withFormValidation<P extends object>(
  Component: React.ComponentType<P>,
  validationRules: any
) {
  return (props: P) => {
    // Complex validation logic here
    // Hard to pass validation state to component
    return <Component {...props} />;
  };
}

// ============================================================================
// SCENARIO 4: CROSS-CUTTING CONCERNS - HOC WINS
// ============================================================================

/**
 * ✅ HOC APPROACH (Recommended)
 * Perfect for concerns that apply to many components
 */

// Performance monitoring HOC
function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return (props: P) => {
    React.useEffect(() => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        console.log(`${componentName} render time: ${endTime - startTime}ms`);
      };
    });

    return <Component {...props} />;
  };
}

// Easy to apply to any component
const MonitoredDashboard = withPerformanceMonitoring(Dashboard, 'Dashboard');
const MonitoredProfile = withPerformanceMonitoring(Profile, 'Profile');

/**
 * ❌ COMPOSITION APPROACH (Repetitive)
 * Would require wrapping every component individually
 */

function PerformanceMonitor({ children, componentName }) {
  React.useEffect(() => {
    // Monitoring logic
  }, [componentName]);

  return children;
}

// Repetitive and verbose
function CompositionMonitoringExample() {
  return (
    <>
      <PerformanceMonitor componentName="Dashboard">
        <Dashboard />
      </PerformanceMonitor>
      <PerformanceMonitor componentName="Profile">
        <Profile />
      </PerformanceMonitor>
    </>
  );
}

// ============================================================================
// DECISION MATRIX
// ============================================================================

/**
 * DECISION FRAMEWORK
 *
 * Use COMPOSITION when:
 * ✅ Building new components
 * ✅ Need explicit prop flow
 * ✅ Want better TypeScript inference
 * ✅ Need conditional rendering
 * ✅ Building reusable UI components
 * ✅ Want easier testing and debugging
 *
 * Use HOCs when:
 * ✅ Enhancing third-party components
 * ✅ Adding cross-cutting concerns
 * ✅ Need runtime component modification
 * ✅ Working with class components
 * ✅ Applying same logic to many components
 * ✅ Can't modify the original component
 */

// ============================================================================
// MODERN HYBRID APPROACH
// ============================================================================

/**
 * ✅ BEST OF BOTH WORLDS
 * Use hooks for logic, composition for UI, HOCs for enhancement
 */

// 1. Custom hook for logic (reusable)
function useFeatureFlag(flagName: string) {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    // Check feature flag
    setEnabled(Math.random() > 0.5); // Mock
  }, [flagName]);

  return enabled;
}

// 2. Composition component for UI (explicit)
function FeatureGate({
  children,
  flagName,
  fallback = null,
}: {
  children: React.ReactNode;
  flagName: string;
  fallback?: React.ReactNode;
}) {
  const enabled = useFeatureFlag(flagName);
  return enabled ? <>{children}</> : <>{fallback}</>;
}

// 3. HOC for enhancement (when needed)
function withFeatureFlag<P extends object>(Component: React.ComponentType<P>, flagName: string) {
  return (props: P) => (
    <FeatureGate flagName={flagName}>
      <Component {...props} />
    </FeatureGate>
  );
}

// Usage examples
function HybridApproachExample() {
  return (
    <div>
      {/* Composition approach - explicit and clear */}
      <FeatureGate flagName="new-dashboard" fallback={<OldDashboard />}>
        <NewDashboard />
      </FeatureGate>

      {/* HOC approach - for third-party components */}
      {React.createElement(withFeatureFlag(ThirdPartyWidget, 'widget-v2'))}
    </div>
  );
}

// ============================================================================
// MIGRATION STRATEGY
// ============================================================================

/**
 * GRADUAL MIGRATION FROM HOCs TO COMPOSITION
 *
 * 1. Start with new components using composition
 * 2. Extract logic from HOCs into custom hooks
 * 3. Replace HOC usage with composition where possible
 * 4. Keep HOCs only for third-party enhancement
 * 5. Document remaining HOC usage with clear justification
 */

// Example: Migrating from HOC to composition
// Before (HOC)
const withLoading = Component => props => {
  if (props.loading) return <div>Loading...</div>;
  return <Component {...props} />;
};

// After (Composition)
function LoadingWrapper({ children, loading }) {
  if (loading) return <div>Loading...</div>;
  return children;
}

// Usage comparison
// HOC: const LoadingButton = withLoading(Button);
// Composition: <LoadingWrapper loading={isLoading}><Button /></LoadingWrapper>

// Dummy components for examples
function Dashboard() {
  return <div>Dashboard</div>;
}
function Profile() {
  return <div>Profile</div>;
}
function LoginForm() {
  return <div>Login Form</div>;
}
function NewDashboard() {
  return <div>New Dashboard</div>;
}
function OldDashboard() {
  return <div>Old Dashboard</div>;
}
function ThirdPartyWidget() {
  return <div>Third Party Widget</div>;
}
