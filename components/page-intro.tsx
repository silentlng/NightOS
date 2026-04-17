import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-4">
        <p className="eyebrow">{eyebrow}</p>
        <div className="space-y-3">
          <h1 className="display-heading max-w-3xl">{title}</h1>
          <p className="section-copy">{description}</p>
        </div>
      </div>
      {aside ? <div className="lg:max-w-sm">{aside}</div> : null}
    </div>
  );
}
