import type { ButtonHTMLAttributes, ReactElement } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "h-11 px-5 rounded-full bg-btn-bg text-btn-fg font-bold text-[15px] shadow-btn " +
    "active:translate-y-[3px] active:shadow-btn-active",
  secondary: "h-9 px-3.5 rounded-[10px] bg-surface-2 text-text font-bold text-[13px] hover:bg-surface-3",
  ghost: "h-8 px-3 rounded-lg text-muted font-semibold text-[13px] hover:bg-surface-2 hover:text-text",
  danger: "h-9 px-3.5 rounded-[10px] bg-surface-2 text-err font-bold text-[13px] hover:bg-surface-3",
};

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 border-0 transition-transform duration-100 disabled:cursor-default disabled:opacity-55 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
