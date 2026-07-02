import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    session_id,
    visitor_id,
    event_type,
    page,
    package_id,
    value,
    metadata,
  } = body as {
    session_id?: string | null;
    visitor_id?: string | null;
    event_type?: string;
    page?: string;
    package_id?: string | null;
    value?: string | null;
    metadata?: Record<string, unknown>;
  };

  if (!event_type || !page) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("analytics_events").insert([
    {
      session_id,
      visitor_id,
      event_type,
      page,
      package_id: package_id || null,
      value: value || null,
      metadata: metadata || {},
    },
  ]);

  if (error) {
    console.error("Analytics insert failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
