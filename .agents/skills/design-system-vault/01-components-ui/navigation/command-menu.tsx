import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

export interface CommandMenuProps {
  items?: CommandItem[];
  isOpen?: boolean;
  onClose?: () => void;
  placeholder?: string;
}

const defaultCommands: CommandItem[] = [
  {
    id: "nav-dashboard",
    label: "Go to Overview Dashboard",
    category: "Navigation",
    shortcut: "G D",
    onSelect: () => console.log("Navigate: Dashboard"),
  },
  {
    id: "nav-analytics",
    label: "View Analytics & Metrics",
    category: "Navigation",
    shortcut: "G A",
    onSelect: () => console.log("Navigate: Analytics"),
  },
  {
    id: "nav-settings",
    label: "Workspace Settings",
    category: "Navigation",
    shortcut: "G S",
    onSelect: () => console.log("Navigate: Settings"),
  },
  {
    id: "act-new-project",
    label: "Create New Project...",
    category: "Actions",
    shortcut: "⌘ N",
    onSelect: () => console.log("Action: New Project"),
  },
  {
    id: "act-copy-link",
    label: "Copy Invite Link",
    category: "Actions",
    shortcut: "⌘ C",
    onSelect: () => console.log("Action: Copy Link"),
  },
  {
    id: "sys-toggle-theme",
    label: "Toggle Dark / Light Mode",
    category: "System",
    shortcut: "⌘ T",
    onSelect: () => console.log("Action: Toggle Theme"),
  },
];

/**
 * ⚡ Command Menu (Raycast / Linear / Spotlight Cmd+K)
 *
 * Keyboard-first navigation and rapid command execution modal with
 * fuzzy-search filtering, category grouping, and smooth micro-springs.
 */
export const CommandMenu: React.FC<CommandMenuProps> = ({
  items = defaultCommands,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  placeholder = "Type a command or search...",
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalOpen;

  const handleClose = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalOpen(false);
    }
    setSearch("");
    setSelectedIndex(0);
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isControlled) {
          controlledOnClose ? controlledOnClose() : null;
        } else {
          setInternalOpen((prev) => !prev);
        }
      } else if (e.key === "Escape" && open) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isControlled, controlledOnClose]);

  // Focus input automatically when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter items
  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation up/down/enter
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!open || filtered.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          selected.onSelect();
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [open, filtered, selectedIndex]);

  // Group items by category
  const categories = Array.from(new Set(filtered.map((item) => item.category)));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 sm:pt-28">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f14] shadow-2xl shadow-black/80"
          >
            {/* Search Input */}
            <div className="flex items-center border-b border-white/10 px-4 py-3.5">
              <svg
                className="mr-3 h-5 w-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <kbd className="hidden rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-block">
                ESC
              </kbd>
            </div>

            {/* Command Results List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No commands found matching "{search}"
                </div>
              ) : (
                categories.map((cat) => {
                  const catItems = filtered.filter((i) => i.category === cat);
                  return (
                    <div key={cat} className="mb-2 last:mb-0">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {cat}
                      </div>
                      {catItems.map((item) => {
                        const globalIndex = filtered.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              item.onSelect();
                              handleClose();
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "text-slate-300 hover:bg-white/[0.05]"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {item.icon}
                              {item.label}
                            </span>
                            {item.shortcut && (
                              <kbd
                                className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                                  isSelected
                                    ? "bg-indigo-700/60 text-indigo-100"
                                    : "bg-white/[0.08] text-slate-400"
                                }`}
                              >
                                {item.shortcut}
                              </kbd>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer help tip */}
            <div className="flex items-center justify-between border-t border-white/10 bg-[#090b0e] px-4 py-2 text-[10px] text-slate-500">
              <span>Use ↑ ↓ to navigate</span>
              <span>↵ to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandMenu;
