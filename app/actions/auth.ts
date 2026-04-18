"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isInternalAccessConfigured, isSupabaseConfigured } from "@/lib/env";
import {
  createInternalAccessCookieValue,
  getInternalAccessCookieOptions,
  INTERNAL_ACCESS_COOKIE_NAME,
  validateInternalAccessCode,
} from "@/lib/auth/internal-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

export interface LoginActionState {
  status: "idle" | "error" | "setup_required";
  message?: string;
}

export interface InternalAccessActionState {
  status: "idle" | "error";
  message?: string;
}

function getSafeNextPath(input: string | FormDataEntryValue | null | undefined) {
  const value = typeof input === "string" ? input : String(input ?? "");

  return value.startsWith("/") ? value : "/auth/login";
}

export async function unlockInternalAccessAction(
  _previousState: InternalAccessActionState,
  formData: FormData,
): Promise<InternalAccessActionState> {
  if (!isInternalAccessConfigured()) {
    redirect("/auth/login");
  }

  const accessCode = String(formData.get("accessCode") ?? "");
  const nextPath = getSafeNextPath(formData.get("next"));

  if (!accessCode.trim()) {
    return {
      status: "error",
      message: "Enter the internal access code to unlock NightOS.",
    };
  }

  const isValid = await validateInternalAccessCode(accessCode);

  if (!isValid) {
    return {
      status: "error",
      message: "Invalid internal access code.",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(
    INTERNAL_ACCESS_COOKIE_NAME,
    await createInternalAccessCookieValue(),
    getInternalAccessCookieOptions(),
  );

  redirect(nextPath);
}

export async function signInAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!isSupabaseConfigured()) {
    return {
      status: "setup_required",
      message:
        "Supabase auth is not configured in this environment yet. Use the preview workspace or complete the environment setup.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "Check the sign-in form values.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  redirect(parsed.data.next);
}

export async function signOutAction() {
  const cookieStore = await cookies();

  cookieStore.delete(INTERNAL_ACCESS_COOKIE_NAME);

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/auth/login");
}
