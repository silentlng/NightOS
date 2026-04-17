import { DashboardPage } from "@/components/workspace-pages/dashboard-page";
import { getPreviewAccess } from "@/lib/auth/access";

export default async function PreviewDashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  return <DashboardPage access={getPreviewAccess(role)} />;
}
