import { SettingsPage } from "@/components/workspace-pages/settings-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";
import { parseWeekOffset } from "@/lib/workspace-navigation";

export default async function AppSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const access = await getAuthenticatedAccess();

  return (
    <SettingsPage
      access={access}
      basePath="/app"
      weekOffset={parseWeekOffset(params.week)}
    />
  );
}
