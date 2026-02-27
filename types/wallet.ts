export interface WalletState {
  publicKey: string | null;
  balance: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  isLoadingBalance: boolean;
  /** True once the one-time localStorage auto-reconnect check has finished.
   *  WalletGuard waits for this before deciding to redirect. */
  isHydrated: boolean;
  network: string | null;
  error: string | null;
}

export interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
}

export type WalletContextType = WalletState & WalletActions;
