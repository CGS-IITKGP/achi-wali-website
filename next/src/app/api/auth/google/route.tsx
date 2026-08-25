import { NextRequest, NextResponse } from "next/server";

const GET = async (req: NextRequest): Promise<NextResponse> => {
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || req.nextUrl.searchParams.get("redirect") || "/";

  googleAuthUrl.searchParams.set(
    "client_id",
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID!,
  );
  googleAuthUrl.searchParams.set(
    "redirect_uri",
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI!,
  );
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("state", callbackUrl);

  return NextResponse.redirect(googleAuthUrl);
};

export { GET };
