export * from './notification';
export * from './pushNotification';
export * from './socialShare';
export * from './weather';
import type { WeatherState } from './weather';

export interface SearchEngineProps {
  query: string;
  setQuery: (query: string) => void;
  search: (event?: React.MouseEvent | React.KeyboardEvent) => void;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  placeholder?: string;
  weather: WeatherState;
  toDate?: () => string;
}

export interface CreditProps {
  // Credit component does not require any props
}

export interface AppProps {
  // App component does not require any props
}
