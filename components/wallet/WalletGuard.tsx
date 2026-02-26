"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { Spinner } from "@/components/ui/Spinner";

interface WalletGuardProps {
  children: React.ReactNode;
  /** Where to redirect when wallet is not connected (default: "/") */
  redirectTo?: string;
}

/**
 * Client-side route guard.
 * Renders `children` only when a wallet is connected.
 * Redirects to `redirectTo` otherwise, showing a brief loading state
 * while the auto-reconnect check runs on mount.
 */
export function WalletGuard({
  children,
  redirectTo = "/",
}: WalletGuardProps) {
  const { isConnected, isConnecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    // Wait for the initial auto-reconnect attempt before deciding to redirect
    if (!isConnecting && !isConnected) {
      router.replace(redirectTo);
    }
  }, [isConnected, isConnecting, redirectTo, router]);

  // Show a centred spinner while connecting / hydrating
  if (isConnecting || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={28} className="text-[#B9FF66]" />
          <p className="text-sm font-medium text-[#888]">
            {isConnecting ? "Connecting wallet…" : "Checking wallet…"}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
