import { AnalyticsPage } from "@/components/workspace-pages/analytics-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";

export default async function AppAnalyticsPage() {
  const access = await getAuthenticatedAccess();
  return <AnalyticsPage access={access} />;
}
