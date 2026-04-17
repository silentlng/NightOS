import { CrmPage } from "@/components/workspace-pages/crm-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";

export default async function AppCrmPage() {
  const access = await getAuthenticatedAccess();
  return <CrmPage access={access} />;
}
