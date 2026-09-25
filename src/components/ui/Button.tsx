import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-clay text-cream hover:bg-clay-dark active:bg-clay-dark disabled:bg-clay/50",
  secondary: "bg-forest text-cream hover:bg-forest-dark active:bg-forest-dark disabled:bg-forest/50",
  outline: "border border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink/5 disabled:opacity-50",
  ghost: "bg-transparent text-ink hover:bg-ink/5 disabled:opacity-50",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-full gap-1.5",
  md: "px-6 py-3 text-sm rounded-full gap-2",
  lg: "px-8 py-4 text-base rounded-full gap-2",
};

const BASE =
  "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 ease-out disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { to?: undefined };

type ButtonAsLink = CommonProps & Omit<LinkProps, keyof CommonProps>;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function isLinkProps(props: ButtonProps): props is ButtonAsLink {
  return (props as { to?: unknown }).to !== undefined;
}

function decoration(variant: Variant, size: Size, fullWidth: boolean | undefined, className: string) {
  return `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`;
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", icon, iconRight, isLoading, fullWidth, className = "", children } = props;
  const classes = decoration(variant, size, fullWidth, className);

  const content = (
    <>
      {isLoading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      <span>{children}</span>
      {!isLoading && iconRight}
    </>
  );

  if (isLinkProps(props)) {
    const linkProps = props;
    return (
      <Link to={linkProps.to} className={classes} replace={linkProps.replace} state={linkProps.state}>
        {content}
      </Link>
    );
  }

  const buttonProps = props;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classes}
      onClick={buttonProps.onClick}
      disabled={isLoading || buttonProps.disabled}
      aria-label={buttonProps["aria-label"]}
      aria-pressed={buttonProps["aria-pressed"]}
      title={buttonProps.title}
      autoFocus={buttonProps.autoFocus}
      name={buttonProps.name}
      value={buttonProps.value}
      form={buttonProps.form}
    >
      {content}
    </button>
  );
}
