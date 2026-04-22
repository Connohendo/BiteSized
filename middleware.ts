import { NextResponse, type NextRequest } from "next/server";

// Session refresh is handled by server/client Supabase; Edge middleware
// does not run Supabase to avoid MIDDLEWARE_INVOCATION_FAILED on Vercel.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
