import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client, for use in Client Components
// (sign-up/sign-in forms, etc).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
