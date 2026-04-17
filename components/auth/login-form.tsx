"use client";

import { useActionState } from "react";
import { signInAction, type LoginActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {
  status: "idle",
};

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(signInAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input name="next" type="hidden" value={nextPath} />
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" placeholder="manager@cova-club.com" type="email" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground" htmlFor="password">
          Password
        </label>
        <Input id="password" name="password" placeholder="••••••••" type="password" />
      </div>

      {state.message ? (
        <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning">
          {state.message}
        </div>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Signing in..." : "Sign in to NightOS"}
      </Button>
    </form>
  );
}
