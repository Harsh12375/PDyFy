import { getDocumentId } from "@/libs/aws-db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chat_id } = body;

  const documentId = await getDocumentId(chat_id);

  return NextResponse.json({ documentId });
}
