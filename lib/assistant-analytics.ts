import { supabaseAdmin } from "@/lib/supabase-admin";

export async function logAssistantInteraction(params: {
  originalMessage: string;
  answer: string | null;
  sessionId?: string | null;
  visitorId?: string | null;
  page?: string | null;
  packageId?: string | null;
  detectedCategory?: string | null;
  detectedDate?: string | null;
}) {
  try {
    const placeholderValues = ["input", "potreed", "", null];
    const rawValue = params.originalMessage?.toString() ?? "";
    const safeValue = placeholderValues.includes(rawValue) ? null : rawValue;

    const { error } = await supabaseAdmin.from("analytics_events").insert({
      event_type: "assistant_interaction",
      session_id: params.sessionId ?? null,
      visitor_id: params.visitorId ?? null,
      page: params.page ?? "assistant",
      package_id: params.packageId ?? null,
      value: safeValue,
      metadata: JSON.stringify({
        response: params.answer ?? null,
        detectedCategory: params.detectedCategory ?? null,
        detectedDate: params.detectedDate ?? null,
      }),
    });
    if (error) console.error("analytics insert error:", error);
  } catch (e) {
    console.error("analytics insert failed:", e);
  }
}