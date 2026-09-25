import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface NavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

export interface FloatingNavbarProps {
  navItems?: NavItem[];
  logo?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

/**
 * 🛰️ Floating Navbar (Glassmorphic Floating Pill)
 *
 * Modern island navigation bar with frosted glass backdrop blur,
 * animated active item indicator, and mobile sheet collapse.
 */
export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
  navItems = [
    { name: "Features", link: "#features" },
    { name: "Solutions", link: "#solutions" },
    { name: "Documentation", link: "#docs" },
    { name: "Pricing", link: "#pricing" },
  ],
  logo = (
    <div className="flex items-center gap-2 font-bold tracking-tight text-white">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 font-black text-white text-xs shadow-md shadow-indigo-500/30">
        Δ
      </div>
      <span>Agora</span>
    </div>
  ),
  actionButton = { label: "Get Started", href: "#signup" },
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(navItems[0]?.name || "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto relative flex items-center justify-between gap-4 rounded-full border border-white/[0.1] bg-[#0c0e12]/80 px-4 py-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-white/[0.12] dark:bg-[#07080a]/85 ${
          scrolled ? "py-2 shadow-indigo-500/5" : "py-2.5"
        } ${className}`}
      >
        {/* Logo */}
        <div className="pl-1 pr-3">{logo}</div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <a
                key={item.name}
                href={item.link}
                onClick={() => setActiveTab(item.name)}
                className={`relative px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.08]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.icon}
                  {item.name}
                </span>
              </a>
            );
          })}
        </nav>

        {/* Action Button */}
        {actionButton && (
          <div className="hidden sm:flex items-center pl-2">
            <a
              href={actionButton.href || "#"}
              onClick={actionButton.onClick}
              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-95"
            >
              {actionButton.label}
            </a>
          </div>
        )}

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white md:hidden hover:bg-white/[0.12]"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown Modal */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-16 inset-x-4 max-w-sm mx-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12]/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  onClick={() => {
                    setActiveTab(item.name);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <span>{item.name}</span>
                  {item.icon}
                </a>
              ))}
              {actionButton && (
                <div className="pt-2 border-t border-white/10">
                  <a
                    href={actionButton.href || "#"}
                    onClick={() => {
                      actionButton.onClick?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                  >
                    {actionButton.label}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default FloatingNavbar;
