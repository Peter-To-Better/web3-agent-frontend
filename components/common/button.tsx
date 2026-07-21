import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-accent text-ink-bg font-semibold hover:opacity-90 active:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed",
  secondary:
    "bg-transparent text-ink-fg border border-ink-border hover:border-ink-fg-secondary",
};

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150";

interface CommonProps {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "px-5 py-2 text-[13px]",
  md: "px-8 py-3.5 text-[15px]",
  lg: "px-10 py-4 text-[16px]",
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", icon, className = "", children, ...rest } = props;
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {icon}
      {children}
    </button>
  );
}
