import { CrmPage } from "@/components/workspace-pages/crm-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";
import { parseWeekOffset } from "@/lib/workspace-navigation";

export default async function AppCrmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const access = await getAuthenticatedAccess();

  return (
    <CrmPage
      access={access}
      basePath="/app"
      weekOffset={parseWeekOffset(params.week)}
    />
  );
}
