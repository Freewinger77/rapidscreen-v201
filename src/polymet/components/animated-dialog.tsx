import { useEffect } from "react";

// Inject zoom animation styles globally
const injectZoomStyles = () => {
  if (typeof document === "undefined") return;

  const styleId = "zoom-dialog-styles";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    /* Remove default dialog animations and apply zoom effect */
    /* Force initial positioning to center to prevent bottom-right bounce */
    [data-zoom="true"] {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) scale(1) !important;
      animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    
    [data-zoom="true"][data-state="closed"] {
      animation: zoomOut 0.2s ease-in !important;
    }
    
    /* Override Shadcn's default slide-in animation */
    [data-zoom="true"][data-state="open"] {
      animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    
    /* Prevent initial positioning issues - force center position immediately */
    [data-radix-dialog-content][data-zoom="true"] {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) scale(0.85) !important;
      animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    
    /* Override any default positioning */
    [data-radix-dialog-content][data-zoom="true"][data-state="open"] {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
    }
    
    @keyframes zoomIn {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.85);
      }
      100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
    
    @keyframes zoomOut {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.85);
      }
    }
  `;
  document.head.appendChild(style);
};

// Hook to inject styles and enable zoom animation
export const useZoomDialog = () => {
  useEffect(() => {
    injectZoomStyles();
  }, []);
};

// Helper to add zoom animation data attribute
export const withZoomAnimation = (props: any = {}) => {
  return {
    ...props,
    "data-zoom": "true",
  };
};

// Default export
const AnimatedDialog = {
  useZoomDialog,
  withZoomAnimation,
};

export default AnimatedDialog;
