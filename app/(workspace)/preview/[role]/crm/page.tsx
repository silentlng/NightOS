import { CrmPage } from "@/components/workspace-pages/crm-page";
import { getPreviewAccess } from "@/lib/auth/access";

export default async function PreviewCrmPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  return <CrmPage access={getPreviewAccess(role)} />;
}
