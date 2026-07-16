import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorHandling(handler: (...args: any[]) => Promise<Response>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (...args: any[]) => {
    try {
      return await handler(...args);
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
