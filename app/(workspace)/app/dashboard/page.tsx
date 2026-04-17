import { DashboardPage } from "@/components/workspace-pages/dashboard-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";

export default async function AppDashboardPage() {
  const access = await getAuthenticatedAccess();
  return <DashboardPage access={access} />;
}
