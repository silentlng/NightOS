import { SettingsPage } from "@/components/workspace-pages/settings-page";
import { getPreviewAccess } from "@/lib/auth/access";

export default async function PreviewSettingsPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  return <SettingsPage access={getPreviewAccess(role)} />;
}
