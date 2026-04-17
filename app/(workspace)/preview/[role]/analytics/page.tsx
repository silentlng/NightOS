import { AnalyticsPage } from "@/components/workspace-pages/analytics-page";
import { getPreviewAccess } from "@/lib/auth/access";
import { parseWeekOffset } from "@/lib/workspace-navigation";

export default async function PreviewAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { role } = await params;
  const parsedSearchParams = await searchParams;

  return (
    <AnalyticsPage
      access={getPreviewAccess(role)}
      basePath={`/preview/${role}`}
      weekOffset={parseWeekOffset(parsedSearchParams.week)}
    />
  );
}
