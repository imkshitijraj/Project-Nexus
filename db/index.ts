import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDb() {
  let workersImport: any;
  try {
    workersImport = await import("cloudflare:workers");
  } catch (err: any) {
    // If running tests or when explicitly requested, try a local test shim.
    const shouldTryShim =
      process.env.NODE_ENV === "test" || process.env.SKIP_CLOUDFLARE === "1";
    if (shouldTryShim) {
      try {
        const shimUrl = new URL("./test-shim.mjs", import.meta.url).href;
        workersImport = await import(shimUrl);
      } catch (shimErr: any) {
        throw new Error(
          "Failed to import 'cloudflare:workers' and the local test shim. " +
            (shimErr && shimErr.message ? shimErr.message : String(shimErr)),
        );
      }
    } else {
      throw new Error(
        "Failed to import 'cloudflare:workers'. This project expects to run in a Cloudflare Workers environment or with a compatible shim. " +
          (err && err.message ? err.message : String(err)),
      );
    }
  }

  const { env } = workersImport;
  if (!env || !env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}
