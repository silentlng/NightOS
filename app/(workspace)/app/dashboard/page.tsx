import { DashboardPage } from "@/components/workspace-pages/dashboard-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";
import { parseWeekOffset } from "@/lib/workspace-navigation";

export default async function AppDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const access = await getAuthenticatedAccess();

  return (
    <DashboardPage
      access={access}
      basePath="/app"
      weekOffset={parseWeekOffset(params.week)}
    />
  );
}
