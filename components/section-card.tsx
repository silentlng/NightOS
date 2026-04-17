import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "surface relative space-y-6 overflow-hidden p-6 md:p-7",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="space-y-3">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <div className="space-y-3">
          <h2 className="display-subheading">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
      {footer ? <div className="border-t border-white/8 pt-5">{footer}</div> : null}
    </section>
  );
}
