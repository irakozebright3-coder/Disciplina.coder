import { useEffect } from "react";
import "./sdms-ui.css";
import { initCircleDotCursor, initLiquidButtons } from "./sdms-ui";

/**
 * Add this once inside your existing App component, or call the initializers
 * from the top-level app effect. This does not replace your routes or providers.
 */
export function SDMSVisualEnhancements() {
  useEffect(() => {
    const cleanCursor = initCircleDotCursor();
    const cleanButtons = initLiquidButtons(document);
    return () => {
      cleanCursor?.();
      cleanButtons?.();
    };
  }, []);

  return null;
}
