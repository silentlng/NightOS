import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { getPreviewAccess } from "@/lib/auth/access";

export default async function PreviewWorkspaceLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}>) {
  const { role } = await params;

  if (!["admin", "manager", "rp"].includes(role)) {
    notFound();
  }

  const access = getPreviewAccess(role);

  return (
    <WorkspaceShell access={access} basePath={`/preview/${role}`}>
      {children}
    </WorkspaceShell>
  );
}
