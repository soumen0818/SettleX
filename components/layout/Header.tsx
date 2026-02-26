"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const appLinks = [
  { label: "Expenses", href: "/expenses" },
  { label: "Trips", href: "/trips" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isConnected } = useWallet();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "top-3 mx-4 sm:mx-6 lg:mx-8"
            : "top-0 mx-0"
        )}
      >
        <div
          className={cn(
            "transition-all duration-300",
            isScrolled
              ? "bg-white/90 backdrop-blur-xl border border-[#E5E5E5] rounded-2xl shadow-[0_4px_32px_-8px_rgba(0,0,0,0.12)]"
              : "bg-white/80 backdrop-blur-sm border-b border-[#E5E5E5]/60"
          )}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex items-center justify-center w-8 h-8 bg-[#B9FF66] rounded-xl shadow-[0_2px_12px_-2px_rgba(185,255,102,0.5)] group-hover:shadow-[0_4px_16px_-2px_rgba(185,255,102,0.7)] transition-all duration-200">
                  <Zap size={16} className="text-[#0F0F14] fill-[#0F0F14]" />
                </div>
                <span className="text-lg font-black tracking-tight text-[#0F0F14]">
                  Settle<span className="text-[#B9FF66] drop-shadow-sm">X</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-[#555] hover:text-[#0F0F14] rounded-xl hover:bg-black/5 transition-all duration-150"
                  >
                    {link.label}
                  </Link>
                ))}
                {isConnected && (
                  <>
                    <span className="w-px h-4 bg-[#E5E5E5] mx-1" />
                    {appLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="px-4 py-2 text-sm font-semibold text-[#0F0F14] hover:text-[#555] rounded-xl hover:bg-black/5 transition-all duration-150"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-3">
                <ConnectWalletButton />
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-black/5 transition-all"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X size={20} className="text-[#0F0F14]" />
                ) : (
                  <Menu size={20} className="text-[#0F0F14]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-20 left-4 right-4 z-40 bg-white rounded-2xl border border-[#E5E5E5] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15)] p-4"
          >
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-[#555] hover:text-[#0F0F14] rounded-xl hover:bg-black/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {isConnected && (
                <>
                  <hr className="my-1 border-[#F0F0F0]" />
                  {appLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-2.5 text-sm font-semibold text-[#0F0F14] hover:text-[#555] rounded-xl hover:bg-black/5 transition-all"
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
            <div className="flex flex-col gap-2 pt-3 border-t border-[#E5E5E5]">
              <ConnectWalletButton compact className="w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
