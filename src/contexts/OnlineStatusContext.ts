import type { FC, PropsWithChildren } from 'react';
import { createContext, createElement, useContext } from 'react';

import { OnlineStatusContextUnavailableError } from '@/errors/domainErrors';

export const OnlineStatusContext = createContext<boolean | undefined>(undefined);

interface OnlineStatusProviderProps extends PropsWithChildren {
  value: boolean;
}

export const OnlineStatusProvider: FC<OnlineStatusProviderProps> = ({ value, children }) =>
  createElement(OnlineStatusContext.Provider, { value }, children);

export const useOnlineStatus = (): boolean => {
  const context = useContext(OnlineStatusContext);
  if (typeof context === 'undefined') {
    throw new OnlineStatusContextUnavailableError(
      'useOnlineStatus must be used within an OnlineStatusProvider context'
    );
  }

  return context;
};

export default OnlineStatusContext;
