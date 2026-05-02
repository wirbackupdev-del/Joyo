// lib/progress.ts
import { createClient } from "@/lib/supabase/client";

/**
 * Syncs the child's progress to Supabase.
 * Called non-blocking from the game page — errors are swallowed gracefully
 * so network issues never break the child's gameplay.
 */
export async function syncProgressToSupabase(
  starsTotal: number,
  completedModule: string
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anonymous / not-logged-in: skip silently (COPPA — no forced account creation)
  if (!user) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      stars_total: starsTotal,
      last_module: completedModule,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
      ignoreDuplicates: false,
    }
  );

  if (error) {
    console.warn("[Joyo] Progress sync failed:", error.message);
  }
}

/**
 * Marks a full module as completed (e.g. "shapes" after all 5 shapes done).
 * Uses array_append to avoid duplicate entries.
 */
export async function markModuleComplete(moduleId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // First fetch existing completed_modules to avoid duplication
  const { data: profile } = await supabase
    .from("profiles")
    .select("completed_modules")
    .eq("id", user.id)
    .single();

  const existing: string[] = profile?.completed_modules ?? [];
  if (existing.includes(moduleId)) return; // already done

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      completed_modules: [...existing, moduleId],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}
