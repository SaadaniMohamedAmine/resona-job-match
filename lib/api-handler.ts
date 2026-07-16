import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export function withErrorHandling(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}
