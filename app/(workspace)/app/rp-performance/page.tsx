import { RpPerformancePage } from "@/components/workspace-pages/rp-performance-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";
import { parseWeekOffset } from "@/lib/workspace-navigation";

export default async function AppRpPerformancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const access = await getAuthenticatedAccess();

  return (
    <RpPerformancePage
      access={access}
      basePath="/app"
      weekOffset={parseWeekOffset(params.week)}
    />
  );
}
