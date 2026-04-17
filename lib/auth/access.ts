import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppAccess, AppRole } from "@/types/app";
import type { ProfileRow, RpProfileRow } from "@/types/database";

const roleSchema = z.enum(["admin", "manager", "rp"]);

function parseRole(input: string | undefined): AppRole {
  return roleSchema.catch("manager").parse(input);
}

export function getPreviewAccess(roleInput?: string): AppAccess {
  const role = parseRole(roleInput);

  return {
    mode: "preview",
    role,
    viewerName:
      role === "admin"
        ? "Preview admin"
        : role === "manager"
          ? "Preview manager"
          : "Preview RP",
    previewRole: role,
  };
}

export const getAuthenticatedAccess = cache(async (): Promise<AppAccess> => {
  if (!isSupabaseConfigured()) {
    redirect("/auth/setup-required");
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, email, full_name, role, is_active")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (!profile?.is_active) {
    redirect("/auth/setup-required?reason=profile");
  }

  const { data: rpProfile } = await supabase
    .from("rp_profiles")
    .select("id, profile_id, display_name, status, source_labels")
    .eq("profile_id", user.id)
    .maybeSingle<RpProfileRow>();

  return {
    mode: "authenticated",
    role: parseRole(profile.role),
    viewerName: profile.full_name || user.email || "Cova user",
    email: user.email ?? null,
    userId: user.id,
    rpProfileId: rpProfile?.id ?? null,
    rpDisplayName: rpProfile?.display_name ?? null,
    rpSourceLabels: rpProfile?.source_labels ?? [],
  };
});
