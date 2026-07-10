"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { connectFreighter, getFreighterSnapshot } from "@/lib/stellar/freighter";

type WalletContextValue = {
  address: string | null;
  network: string | null;
  isConnecting: boolean;
  error: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: PropsWithChildren) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const snapshot = await getFreighterSnapshot();
      setAddress(snapshot.address);
      setNetwork(snapshot.network);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Failed to refresh wallet.");
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const snapshot = await connectFreighter();
      setAddress(snapshot.address);
      setNetwork(snapshot.network);
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const clear = useCallback(() => {
    setAddress(null);
    setNetwork(null);
    setError(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      network,
      isConnecting,
      error,
      isConnected: Boolean(address),
      connect,
      refresh,
      clear,
    }),
    [address, network, isConnecting, error, connect, refresh, clear],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider.");
  }

  return context;
}
