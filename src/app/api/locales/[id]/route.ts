import { NextResponse } from "next/server";
import { getLocalById, getSlotsByLocal } from "@/lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const local = await getLocalById(id);
  if (!local) {
    return NextResponse.json({ error: "Local no encontrado" }, { status: 404 });
  }
  const slots = await getSlotsByLocal(id);
  return NextResponse.json({ local, slots });
}
