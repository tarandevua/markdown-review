import { describe, expect, it } from "vitest";
import { resolveStoreConfig } from "./config";

describe("resolveStoreConfig", () => {
  it("uses local JSON storage outside Vercel when Supabase is not configured", () => {
    expect(resolveStoreConfig({})).toEqual({ kind: "file" });
  });

  it("uses Supabase when both credentials are present", () => {
    expect(resolveStoreConfig({
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_SECRET_KEY: "secret",
    })).toEqual({
      kind: "supabase",
      url: "https://project.supabase.co",
      secretKey: "secret",
    });
  });

  it("accepts the public URL variable while keeping the service key server-only", () => {
    expect(resolveStoreConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "secret",
    }).kind).toBe("supabase");
  });

  it("accepts the legacy service-role key", () => {
    expect(resolveStoreConfig({
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "legacy-secret",
    }).kind).toBe("supabase");
  });

  it("rejects partial Supabase configuration", () => {
    expect(() => resolveStoreConfig({ SUPABASE_URL: "https://project.supabase.co" }))
      .toThrow(/partially configured/);
  });

  it("never falls back to the read-only file store on Vercel", () => {
    expect(() => resolveStoreConfig({ VERCEL: "1" }))
      .toThrow(/required on Vercel/);
  });
});
