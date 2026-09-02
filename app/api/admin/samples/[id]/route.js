import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { db, requireAdmin } from "@/lib/server";
export const runtime = "nodejs";
export async function DELETE(request, { params }) { try { requireAdmin(request); const { id } = await params; await (await db()).collection("samples").deleteOne({ _id: new ObjectId(id) }); return new NextResponse(null, { status: 204 }); } catch { return NextResponse.json({ error: "Could not delete sample." }, { status: 400 }); } }
