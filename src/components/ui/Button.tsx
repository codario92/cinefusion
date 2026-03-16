// src/app/components/ui/Button.tsx
"use client";

import * as React from "react";
import { cn } from "../../../lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "base" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-black hover:bg-zinc-200 focus-visible:ring-white/70 ring-offset-transparent",
  secondary:
    "bg-zinc-900 text-white border border-white/20 hover:bg-zinc-800 focus-visible:ring-white/70 ring-offset-transparent",
  ghost:
    "bg-transparent text-white hover:bg-white/10 focus-visible:ring-white/70 ring-offset-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  base: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "base", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
