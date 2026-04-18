#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.NIGHTOS_SMOKE_PORT ?? "3210", 10);
const baseUrl = `http://${host}:${port}`;
const nextBin = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "next.cmd" : "next",
);

function startServer() {
  return spawn(nextBin, ["start", "--hostname", host, "--port", String(port)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function waitForReady(url, timeoutMs = 30_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
        },
      });

      if (response.ok) {
        return;
      }
    } catch {
      // Wait for the server to boot.
    }

    await delay(500);
  }

  throw new Error(`Timed out while waiting for ${url} to become ready.`);
}

async function assertStatus(pathname, expectedStatuses, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: "manual",
    ...options,
  });

  if (!expectedStatuses.includes(response.status)) {
    throw new Error(
      `${pathname} returned ${response.status}, expected ${expectedStatuses.join(", ")}.`,
    );
  }

  return response;
}

async function run() {
  const server = startServer();
  let stdout = "";
  let stderr = "";

  server.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForReady(`${baseUrl}/api/health`);

    const healthResponse = await assertStatus("/api/health", [200]);
    const health = await healthResponse.json();

    if (!health?.ok) {
      throw new Error("/api/health did not return ok=true.");
    }

    await assertStatus("/", [200]);
    await assertStatus("/auth/login", [200]);
    await assertStatus("/preview/manager/dashboard", [200]);

    const protectedResponse = await assertStatus("/app/dashboard", [307, 308]);
    const protectedRedirect = protectedResponse.headers.get("location") || "";

    if (
      !protectedRedirect.startsWith("/auth/login") &&
      !protectedRedirect.startsWith("/auth/setup-required")
    ) {
      throw new Error(
        `/app/dashboard redirected to an unexpected location: ${protectedRedirect || "(missing)"}.`,
      );
    }

    await assertStatus("/api/sync/reservation-source/pull", [401, 503], {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ dryRun: true }),
    });

    console.log("NightOS smoke test passed.");
    console.log(
      JSON.stringify(
        {
          healthStatus: health.status,
          accessMode: health.environment?.accessMode,
          sourceConfigured: health.environment?.sourceConfigured,
          sourceApproved: health.environment?.sourceApproved,
        },
        null,
        2,
      ),
    );
  } finally {
    if (!server.killed) {
      server.kill("SIGTERM");
    }

    const exited = await Promise.race([
      new Promise((resolve) => {
        server.once("exit", () => resolve(true));
      }),
      delay(5_000).then(() => false),
    ]);

    if (!exited && !server.killed) {
      server.kill("SIGKILL");
    }

    if (process.env.NIGHTOS_SMOKE_DEBUG === "true") {
      if (stdout.trim()) {
        console.log(stdout.trim());
      }

      if (stderr.trim()) {
        console.error(stderr.trim());
      }
    }
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
