export function getReservationSourceName() {
  return process.env.COVA_RESERVATION_SOURCE_NAME?.trim() || "Reservation Site";
}

export function isReservationSourceConfigured() {
  return Boolean(
    process.env.COVA_RESERVATION_SOURCE_URL?.trim() &&
      process.env.COVA_RESERVATION_SOURCE_PIN?.trim(),
  );
}

export function isReservationSourceApproved() {
  return process.env.NIGHTOS_RESERVATION_SOURCE_APPROVED?.trim() === "true";
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function hasServiceRoleKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function hasSyncSecret() {
  return Boolean(process.env.RESERVATION_SYNC_SHARED_SECRET?.trim());
}

export function isSyncIngestionConfigured() {
  return isSupabaseConfigured() && hasServiceRoleKey() && hasSyncSecret();
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return { url, anonKey };
}

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return key;
}

export function getSyncSecret() {
  const secret = process.env.RESERVATION_SYNC_SHARED_SECRET?.trim();

  if (!secret) {
    throw new Error("RESERVATION_SYNC_SHARED_SECRET is not configured.");
  }

  return secret;
}

export function getEnvironmentReadiness() {
  return {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
    supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    syncSharedSecret: Boolean(process.env.RESERVATION_SYNC_SHARED_SECRET?.trim()),
    reservationSourceConfigured: isReservationSourceConfigured(),
    reservationSourceApproved: isReservationSourceApproved(),
  };
}
