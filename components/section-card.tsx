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
    <section className={cn("surface space-y-6 p-6 md:p-7", className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h2 className="display-subheading">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
      {footer ? <div className="border-t border-white/8 pt-5">{footer}</div> : null}
    </section>
  );
}
