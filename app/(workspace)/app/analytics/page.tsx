import { AnalyticsPage } from "@/components/workspace-pages/analytics-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";
import { parseWeekOffset } from "@/lib/workspace-navigation";

export default async function AppAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const access = await getAuthenticatedAccess();

  return (
    <AnalyticsPage
      access={access}
      basePath="/app"
      weekOffset={parseWeekOffset(params.week)}
    />
  );
}
