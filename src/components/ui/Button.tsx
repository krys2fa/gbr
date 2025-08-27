"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "glass"; // neutral glass

type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base = "glass-press btn-inline"; /* shared motion + inline layout */

    const variantClass =
      variant === "glass"
        ? "btn-glass"
        : variant === "secondary"
        ? "btn-secondary"
        : variant === "success"
        ? "btn-success"
        : variant === "danger"
        ? "btn-danger"
        : "btn-primary";

    const sizeClass =
      size === "sm"
        ? "text-sm px-3 py-2"
        : size === "lg"
        ? "text-base px-5 py-3"
        : "text-sm px-4 py-2.5"; // md

    return (
      <button
        ref={ref}
        className={cn(base, variantClass, sizeClass, className)}
        disabled={disabled || loading}
        {...props}
      >
        {leftIcon ? (
          <span
            aria-hidden
            className="icon-left"
            style={{ display: "inline-flex" }}
          >
            {leftIcon}
          </span>
        ) : null}
        <span>{children}</span>
        {rightIcon ? (
          <span
            aria-hidden
            className="icon-right"
            style={{ display: "inline-flex" }}
          >
            {rightIcon}
          </span>
        ) : null}
      </button>
    );
  }
);
Button.displayName = "Button";
