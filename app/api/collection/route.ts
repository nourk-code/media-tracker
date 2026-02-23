import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCollection, insertCollectionItem } from "@/lib/supabase/queries";
import type { MediaStatus, MediaType } from "@/lib/types/collection";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters = {
    status: searchParams.get("status") as MediaStatus | undefined,
    media_type: searchParams.get("media_type") as MediaType | undefined,
    genre: searchParams.get("genre") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
  };

  try {
    const items = await getCollection(supabase, user.id, filters);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Collection GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const item = await insertCollectionItem(supabase, {
      ...body,
      user_id: user.id,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    console.error("Collection POST error:", error);
    if (
      error instanceof Error &&
      error.message.includes("unique")
    ) {
      return NextResponse.json(
        { error: "Already in your collection" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to add" }, { status: 500 });
  }
}
