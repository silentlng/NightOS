import { RpPerformancePage } from "@/components/workspace-pages/rp-performance-page";
import { getPreviewAccess } from "@/lib/auth/access";

export default async function PreviewRpPerformancePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  return <RpPerformancePage access={getPreviewAccess(role)} />;
}
