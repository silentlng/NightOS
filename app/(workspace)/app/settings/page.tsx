import { SettingsPage } from "@/components/workspace-pages/settings-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";

export default async function AppSettingsPage() {
  const access = await getAuthenticatedAccess();
  return <SettingsPage access={access} />;
}
