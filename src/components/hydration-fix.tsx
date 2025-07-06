"use client";

import { useEffect } from "react";

/**
 * Component to fix hydration mismatches related to cursor styles and theme
 * This component runs only on the client side to ensure consistency
 */
export function HydrationFix() {
  useEffect(() => {
    // Fix any cursor style mismatches by ensuring body has consistent cursor
    if (typeof document !== "undefined") {
      // Remove any inline cursor styles that might cause hydration mismatches
      document.body.style.removeProperty("cursor");
      
      // Ensure consistent cursor behavior
      const style = document.createElement("style");
      style.textContent = `
        body {
          cursor: auto !important;
        }
      `;
      document.head.appendChild(style);
      
      // Clean up on unmount
      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}
