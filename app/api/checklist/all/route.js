import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAllDaysData } from "@/lib/sheets";

export async function GET() {
  try {
    const user = await requireAuth();
    const allDays = await getAllDaysData(user.email);

    return NextResponse.json({ allDays });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}