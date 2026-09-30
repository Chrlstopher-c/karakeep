import type { ButtonHTMLAttributes, ReactElement } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

const VARIANTS = {
  primary:
    "h-12 px-6 rounded-full bg-white text-night font-bold shadow-[0_4px_0_var(--color-brand-300)] " +
    "active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-brand-300)] disabled:opacity-60",
  ghost:
    "h-8 px-3.5 rounded-full border-[1.5px] border-border text-text text-[13px] font-semibold " +
    "hover:border-accent",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={`cursor-pointer transition-transform duration-100 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
