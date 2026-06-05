import { NextResponse } from "next/server";
import { getLocalById, getSlotsByLocal, getPlatosByLocal } from "@/lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const local = await getLocalById(id);
  if (!local) {
    return NextResponse.json({ error: "Local no encontrado" }, { status: 404 });
  }
  const [slots, platos] = await Promise.all([
    getSlotsByLocal(id),
    getPlatosByLocal(id),
  ]);
  return NextResponse.json({ local, slots, platos });
}
