"use client";

import { useActionState } from "react";
import { runSourceControlAction, type SourceControlActionState } from "@/app/actions/sync";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

const initialState: SourceControlActionState = {
  status: "idle",
};

export function SourceControlPanel({
  weekOffset,
}: {
  weekOffset: number;
}) {
  const [state, action, pending] = useActionState(
    runSourceControlAction,
    initialState,
  );

  return (
    <div className="space-y-4">
      <form action={action} className="grid gap-3 md:grid-cols-2">
        <input name="weekOffset" type="hidden" value={String(weekOffset)} />
        <Button disabled={pending} name="actionMode" type="submit" value="inspect">
          {pending ? "Checking source..." : "Run source readiness check"}
        </Button>
        <Button
          disabled={pending}
          name="actionMode"
          type="submit"
          value="persist"
          variant="outline"
        >
          {pending ? "Persisting..." : "Persist week to Supabase"}
        </Button>
      </form>

      {state.status !== "idle" ? (
        <div
          className={`rounded-[1.6rem] border px-4 py-4 text-sm leading-6 ${
            state.status === "success"
              ? "border-success/25 bg-success/10 text-success"
              : "border-danger/25 bg-danger/10 text-danger"
          }`}
        >
          <p className="font-medium">{state.message}</p>
          {(state.weekLabel || state.syncedAt || typeof state.reservations === "number") ? (
            <div className="mt-3 space-y-1 text-xs uppercase tracking-[0.18em]">
              {state.weekLabel ? <p>Window: {state.weekLabel}</p> : null}
              {typeof state.tables === "number" ? <p>Tables: {state.tables}</p> : null}
              {typeof state.reservations === "number" ? (
                <p>Reservations: {state.reservations}</p>
              ) : null}
              {state.syncedAt ? <p>Updated: {formatDateTime(state.syncedAt)}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
