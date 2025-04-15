import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect all routes, including API routes (remove 'api' from negative lookahead)
    "/((?!_next/static|_next/image|favicon.ico|sign-in|sign-up).*)",
  ],
};