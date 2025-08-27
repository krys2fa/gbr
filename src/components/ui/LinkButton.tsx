"use client";
import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "glass";
type ButtonSize = "sm" | "md" | "lg";

export interface LinkButtonProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: any; // accept any to avoid typed-route generic friction
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

export function LinkButton({
  className,
  variant = "glass",
  size = "md",
  leftIcon,
  rightIcon,
  children,
  href,
  prefetch = true,
  ...props
}: LinkButtonProps) {
  const base = "glass-press btn-inline";
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
      : "text-sm px-4 py-2.5";

  return (
    <Link
      href={href as any}
      prefetch={prefetch}
      className={cn(base, variantClass, sizeClass, className)}
      {...props}
    >
      {leftIcon ? (
        <span aria-hidden style={{ display: "inline-flex" }}>
          {leftIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {rightIcon ? (
        <span aria-hidden style={{ display: "inline-flex" }}>
          {rightIcon}
        </span>
      ) : null}
    </Link>
  );
}
