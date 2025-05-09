import { NextRequest, NextResponse } from "next/server";
import { getDocumentId } from "@/libs/aws-db";
export async function POST(req: NextRequest) {
  const body = await req.json();
  let document_id = -1;
  const { message, chat_id } = body;
  document_id = body.document_id;

  if (!message || !chat_id) {
    return NextResponse.json(
      { error: "Nissing Required Fields" },
      { status: 400 }
    );
  }

  if (!document_id) {
    document_id = await getDocumentId(chat_id);
  }

  if (document_id === -1) {
    return NextResponse.json(
      { error: "Document ID not found" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${process.env.BASE_APP_URL}api/v1/documents/question/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message,
        document_id: document_id,
      }),
    }
  );

  const data = await response?.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.detail }, { status: 400 });
  }

  const answer = data.answer;

  return NextResponse.json({ answer });
}
