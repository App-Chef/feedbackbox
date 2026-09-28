import { NextResponse } from "next/server";
import { CORS_HEADERS, handleFeedbackSubmission } from "@/lib/feedback-submission";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const { status, body, headers } = await handleFeedbackSubmission(request);
    return NextResponse.json(body, { status, headers: { ...CORS_HEADERS, ...headers } });
  } catch (error) {
    console.error("POST /api/feedback", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't save your feedback. Please try again." },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
