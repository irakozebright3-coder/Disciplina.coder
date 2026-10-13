import { useEffect, useRef } from "react";
import { initCanvasAmbientBackground } from "./sdms-ui";

/**
 * Place inside a relatively-positioned section. Content should sit above it
 * with position: relative; z-index: 1.
 */
export default function CanvasBackdrop({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cleanup = initCanvasAmbientBackground(canvasRef.current);
    return cleanup;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      data-sdms-canvas
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.85,
      }}
    />
  );
}
