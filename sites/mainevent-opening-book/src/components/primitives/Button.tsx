import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Rendered before the label. Decorative only; never the sole meaning. */
  glyph?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  glyph,
  children,
  className,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={[styles.btn, styles[variant], styles[size], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {glyph ? (
        <span className={styles.glyph} aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
