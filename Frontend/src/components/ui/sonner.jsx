import React from "react";
import { Toaster as Sonner } from "sonner";
import {
  CircleCheck,
  AlertOctagon,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import "@/utils/toast"; // Initialize global toast patch and sanitization

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      position="top-right"
      theme="dark"
      closeButton={true}
      duration={4000}
      visibleToasts={5}
      expand={true}
      gap={12}
      pauseWhenPageIsHidden={true}
      className="toaster group"
      icons={{
        success: (
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <CircleCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
        ),
        error: (
          <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <AlertOctagon className="w-4 h-4 stroke-[2.2]" />
          </div>
        ),
        warning: (
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
          </div>
        ),
        info: (
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            <Info className="w-4 h-4 stroke-[2.2]" />
          </div>
        ),
        loading: (
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Loader2 className="w-4 h-4 animate-spin stroke-[2.2]" />
          </div>
        ),
        close: <X className="w-3.5 h-3.5 stroke-[2.5]" />,
      }}
      toastOptions={{
        closeButton: true,
        closeButtonAriaLabel: "Close notification",
        duration: 4000,
        classNames: {
          toast: "hirenest-toast group",
          title: "hirenest-toast-title",
          description: "hirenest-toast-desc",
          closeButton: "hirenest-toast-close",
          actionButton: "hirenest-toast-action",
          cancelButton: "hirenest-toast-cancel",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
