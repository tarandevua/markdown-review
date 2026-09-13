export type StoreConfig =
  | { kind: "file" }
  | { kind: "supabase"; url: string; secretKey: string };

type StoreEnvironment = Readonly<{
  [key: string]: string | undefined;
  VERCEL?: string;
  SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}>;

export function resolveStoreConfig(environment: StoreEnvironment): StoreConfig {
  const url = environment.SUPABASE_URL ?? environment.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = environment.SUPABASE_SECRET_KEY ?? environment.SUPABASE_SERVICE_ROLE_KEY;

  if (url && secretKey) {
    return { kind: "supabase", url, secretKey };
  }

  if (url || secretKey) {
    throw new Error(
      "Supabase storage is partially configured. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SECRET_KEY.",
    );
  }

  if (environment.VERCEL) {
    throw new Error(
      "Supabase storage is required on Vercel. Set SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }

  return { kind: "file" };
}
