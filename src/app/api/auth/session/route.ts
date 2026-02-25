import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ access_token: null, user_id: null });
    }

    return NextResponse.json({
      access_token: session.access_token,
      user_id: session.user.id,
    });
  } catch {
    return NextResponse.json({ access_token: null, user_id: null });
  }
}
