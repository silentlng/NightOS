import { RpPerformancePage } from "@/components/workspace-pages/rp-performance-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";

export default async function AppRpPerformancePage() {
  const access = await getAuthenticatedAccess();
  return <RpPerformancePage access={access} />;
}
