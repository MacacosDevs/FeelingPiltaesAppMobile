import React, { createContext, useContext, useMemo, useState } from 'react';

export type SportMode = 'pilates' | 'padel';

type SportModeContextValue = {
  sport: SportMode;
  setSport: (sport: SportMode) => void;
};

const SportModeContext = createContext<SportModeContextValue | undefined>(undefined);

export function SportModeProvider({ children }: { children: React.ReactNode }) {
  const [sport, setSport] = useState<SportMode>('pilates');

  const value = useMemo(() => ({ sport, setSport }), [sport]);

  return <SportModeContext.Provider value={value}>{children}</SportModeContext.Provider>;
}

export function useSportMode(): SportModeContextValue {
  const context = useContext(SportModeContext);
  if (!context) {
    throw new Error('useSportMode must be used within a SportModeProvider');
  }
  return context;
}
