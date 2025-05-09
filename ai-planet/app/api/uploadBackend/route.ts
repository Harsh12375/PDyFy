import { NextRequest, NextResponse } from "next/server";
import { setDocumentId } from "@/libs/aws-db";
import axios from "axios";
export async function POST(req: NextRequest) {
  const body = await req.formData();
  const file = body.get("file");
  const chat_id = body.get("chat_id");

  if (!file || !chat_id) {
    return NextResponse.json(
      { error: "File and chat_id are required" },
      { status: 400 }
    );
  }

  const formData = new FormData();
  formData.append("file", file as Blob);

  const response = await axios.post(
    `${process.env.BASE_APP_URL}api/v1/documents/upload/`,
    formData
  );

  const data = response.data;

  await setDocumentId(chat_id as string, data.id);

  return NextResponse.json({ success: true });
}
