import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Intercept Chrome DevTools and .well-known probes to prevent 404 terminal logs
  if (
    request.nextUrl.pathname.includes(".well-known") ||
    request.nextUrl.pathname.includes("com.chrome.devtools")
  ) {
    return NextResponse.json({}, { status: 200 });
  }

  const apiKey = request.headers.get("x-api-key");
  const VALID_API_KEY = process.env.NEXT_PUBLIC_X_API_KEY || "1tNMPQvO5jA8EgR2sJLI2MGoPKYqgo";

  // Allow requests with valid API key
  if (apiKey && apiKey === VALID_API_KEY) {
    return NextResponse.next();
  }

  // Allow internal Next.js server-side requests (from same origin)
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const referer = request.headers.get("referer");
  
  // If request is from same host (internal Next.js SSR), allow it
  if (!origin || referer?.includes(host || "")) {
    return NextResponse.next();
  }

  // Block external requests without API key
  return NextResponse.json(
    {
      error: "access from unverified source",
      message: "you should not be here",
    },
    { status: 401 }
  );
}

export const config = {
  matcher: "/api/:path*"
};
