import { AnalyticsPage } from "@/components/workspace-pages/analytics-page";
import { getPreviewAccess } from "@/lib/auth/access";

export default async function PreviewAnalyticsPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  return <AnalyticsPage access={getPreviewAccess(role)} />;
}
