/**
 * Composition Pattern Examples
 * Modern approach using hooks + composition for sharing logic
 * Updated to use TanStack Query for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

interface DataContextValue<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  update: (newData: T) => void;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

// ============================================================================
// COMPOSITION: DATA PROVIDER
// ============================================================================

const DataContext = createContext<DataContextValue<unknown> | null>(null);

interface DataProviderProps<T> {
  children: React.ReactNode;
  queryKey: string[];
  fetcher: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Generic data provider using composition with TanStack Query
 * Provides data fetching logic to child components
 *
 * @example
 * ```tsx
 * <DataProvider
 *   queryKey={['users']}
 *   fetcher={fetchUsers}
 *   onSuccess={(data) => console.log('Users loaded:', data)}
 * >
 *   <UserList />
 * </DataProvider>
 * ```
 */
export function DataProvider<T>({
  children,
  queryKey,
  fetcher,
  onSuccess,
  onError,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 30 * 60 * 1000, // 30 minutes
}: DataProviderProps<T>) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: fetcher,
    enabled,
    staleTime,
    gcTime,
  });

  // Call callbacks when data changes
  React.useEffect(() => {
    if (data) {
      onSuccess?.(data);
    }
  }, [data, onSuccess]);

  React.useEffect(() => {
    if (error) {
      onError?.(error as Error);
    }
  }, [error, onError]);

  const [localData, setLocalData] = useState<T | null>(data || null);

  // Update local data when query data changes
  React.useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  const update = useCallback((newData: T) => {
    setLocalData(newData);
  }, []);

  const contextValue: DataContextValue<T> = {
    data: localData,
    loading: isLoading,
    error: error as Error | null,
    refetch,
    update,
  };

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
}

/**
 * Hook to consume data from DataProvider
 */
export function useData<T>(): DataContextValue<T> {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context as DataContextValue<T>;
}

// ============================================================================
// COMPOSITION: AUTH PROVIDER
// ============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider using composition
 * Manages user authentication state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, _password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: 1,
      name: 'John Doe',
      email,
      role: email.includes('admin') ? 'admin' : 'user',
    };

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const hasRole = useCallback(
    (role: string) => {
      return user?.role === role;
    },
    [user]
  );

  // Initialize user from localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
      }
    }
  }, []);

  const contextValue: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook to consume auth from AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// COMPOSITION: CONDITIONAL RENDERING
// ============================================================================

interface ConditionalProps {
  children: React.ReactNode;
  condition: boolean;
  fallback?: React.ReactNode;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * Conditional rendering component
 * Handles loading states and conditional display
 */
export function Conditional({
  children,
  condition,
  fallback = null,
  loading = false,
  loadingComponent = <div>Loading...</div>,
}: ConditionalProps) {
  if (loading) {
    return <>{loadingComponent}</>;
  }

  return condition ? <>{children}</> : <>{fallback}</>;
}

// ============================================================================
// COMPOSITION: PROTECTED ROUTE
// ============================================================================

interface ProtectedProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

/**
 * Protected component using composition
 * Combines auth and conditional rendering
 */
export function Protected({
  children,
  requiredRole,
  fallback = <div>Access denied</div>,
}: ProtectedProps) {
  const { isAuthenticated, hasRole } = useAuth();

  const hasAccess = isAuthenticated && (!requiredRole || hasRole(requiredRole));

  return (
    <Conditional condition={hasAccess} fallback={fallback}>
      {children}
    </Conditional>
  );
}

// ============================================================================
// COMPOSITION: ERROR BOUNDARY
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error boundary using composition
 * Provides error handling for child components
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
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
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example showing composition in action with TanStack Query
 */
export function CompositionExample() {
  const fetchUsers = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' as const },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' as const },
    ];
  };

  return (
    <AuthProvider>
      <ErrorBoundary>
        {/* Now using TanStack Query with queryKey */}
        <DataProvider
          queryKey={['users']}
          fetcher={fetchUsers}
          onSuccess={users => console.log('Users loaded:', users.length)}
        >
          <Protected requiredRole="admin">
            <UserList />
          </Protected>
        </DataProvider>
      </ErrorBoundary>
    </AuthProvider>
  );
}

function UserList() {
  const { data: users, loading, error } = useData<User[]>();

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!users) return <div>No users found</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} ({user.email}) - {user.role}
        </li>
      ))}
    </ul>
  );
}
