import { NextRequest, NextResponse } from "next/server";
import { getS3PresignedUrl } from "@/libs/aws-s3";
import { userFileUpload } from "@/libs/aws-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file_name } = body;
    if (!file_name) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 }
      );
    }
    // TODO: Get user_id from session
    const user_id = 1;

    const setUploaded = await userFileUpload(file_name, user_id.toString());

    if (!setUploaded.success) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const url = await getS3PresignedUrl(file_name);

    return NextResponse.json({
      presignedUrl: url,
      chatId: setUploaded.chat_id,
    });
  } catch (error: Error | unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
