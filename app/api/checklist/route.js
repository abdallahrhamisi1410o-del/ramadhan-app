import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSubmissions, saveSubmissions } from "@/lib/sheets";

export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const day = parseInt(searchParams.get("day"));

    const submissions = await getSubmissions(user.email, day);

    return NextResponse.json({ submissions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    const { day, checkedActivities } = await request.json();

    await saveSubmissions(user.email, day, checkedActivities);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
