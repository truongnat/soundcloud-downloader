'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getClientIdApiPath } from '@/lib/get-api-endpoint';

interface ClientIdContextType {
  clientId: string | null;
  isLoading: boolean;
  error: string | null;
}

const ClientIdContext = createContext<ClientIdContextType | undefined>(undefined);

export const ClientIdProvider = ({ children }: { children: ReactNode }) => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const res = await fetch(getClientIdApiPath());
        const { clientId, error } = await res.json();
        if (error) {
          throw new Error(error);
        }
        setClientId(clientId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientId();
  }, []);

  return (
    <ClientIdContext.Provider value={{ clientId, isLoading, error }}>
      {children}
    </ClientIdContext.Provider>
  );
};

export const useClientId = () => {
  const context = useContext(ClientIdContext);
  if (context === undefined) {
    throw new Error('useClientId must be used within a ClientIdProvider');
  }
  return context;
};
