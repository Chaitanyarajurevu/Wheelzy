import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const roleCookie = req.cookies.get("wheelzy_role");
  const role = roleCookie?.value || "renter";

  return NextResponse.json({
    authenticated: !!roleCookie,
    role,
    verified: true,
  });
}
