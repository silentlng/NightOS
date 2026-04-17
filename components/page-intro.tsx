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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] xl:items-end">
      <div className="space-y-5">
        <p className="eyebrow">{eyebrow}</p>
        <div className="space-y-4">
          <h1 className="display-heading max-w-4xl">{title}</h1>
          <p className="section-copy max-w-3xl">{description}</p>
        </div>
      </div>
      {aside ? <div className="xl:justify-self-end xl:max-w-md">{aside}</div> : null}
    </div>
  );
}
