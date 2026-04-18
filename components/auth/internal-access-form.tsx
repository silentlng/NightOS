"use client";

import { useActionState } from "react";
import { unlockInternalAccessAction, type InternalAccessActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: InternalAccessActionState = {
  status: "idle",
};

export function InternalAccessForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(
    unlockInternalAccessAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <input name="next" type="hidden" value={nextPath} />

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground" htmlFor="accessCode">
          Internal access code
        </label>
        <Input
          autoComplete="one-time-code"
          id="accessCode"
          name="accessCode"
          placeholder="Enter internal code"
          type="password"
        />
      </div>

      {state.message ? (
        <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning">
          {state.message}
        </div>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Unlocking..." : "Unlock internal platform"}
      </Button>
    </form>
  );
}
