import { WorkspaceShell } from "@/components/workspace-shell";
import { getAuthenticatedAccess } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export default async function AuthenticatedWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await getAuthenticatedAccess();

  return (
    <WorkspaceShell access={access} basePath="/app">
      {children}
    </WorkspaceShell>
  );
}
