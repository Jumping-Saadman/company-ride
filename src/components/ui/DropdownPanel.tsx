import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DropdownPanelProps {
  open: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Shared enter/exit animation for popover-style menus (notifications, demo
 * user menu) so every dropdown in the app opens and closes the same way.
 */
export function DropdownPanel({ open, className = "", children }: DropdownPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "top right" }}
          role="menu"
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
