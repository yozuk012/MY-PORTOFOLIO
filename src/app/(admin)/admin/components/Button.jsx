// src/app/(admin)/admin/components/Button.jsx
"use client";

import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = "",
  disabled,
  ...props
}) {
  // Base — focus ring accent, tactile feedback
  const baseStyles =
    "inline-flex items-center justify-center font-medium font-mono uppercase tracking-widest rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]";

  // Variants — accent-based, borderless editorial
  const variants = {
    primary:
      "border border-accent text-accent hover:bg-accent hover:text-background",
    secondary:
      "border border-border/60 text-text-muted hover:text-text-main hover:border-accent/40",
    danger:
      "border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60",
    ghost:
      "text-text-muted hover:text-text-main hover:bg-surface",
    outline:
      "border border-border/60 text-accent hover:bg-accent/10 hover:border-accent/40",
  };

  // Sizes
  const sizes = {
    sm: "px-3 py-1.5 text-[10px] gap-1.5",
    md: "px-4 py-2 text-xs gap-2",
    lg: "px-6 py-3 text-sm gap-2.5",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <svg
          className="animate-spin h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {/* Left Icon */}
      {!isLoading && LeftIcon && <LeftIcon className="w-3.5 h-3.5" />}

      {/* Text */}
      <span>{children}</span>

      {/* Right Icon */}
      {!isLoading && RightIcon && <RightIcon className="w-3.5 h-3.5" />}
    </button>
  );
}