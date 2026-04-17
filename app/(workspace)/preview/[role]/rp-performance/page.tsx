import { RpPerformancePage } from "@/components/workspace-pages/rp-performance-page";
import { getPreviewAccess } from "@/lib/auth/access";
import { parseWeekOffset } from "@/lib/workspace-navigation";

export default async function PreviewRpPerformancePage({
  params,
  searchParams,
}: {
  params: Promise<{ role: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { role } = await params;
  const parsedSearchParams = await searchParams;

  return (
    <RpPerformancePage
      access={getPreviewAccess(role)}
      basePath={`/preview/${role}`}
      weekOffset={parseWeekOffset(parsedSearchParams.week)}
    />
  );
}
