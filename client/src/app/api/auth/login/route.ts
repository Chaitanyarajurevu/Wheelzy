import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    // Role mapping
    let resolvedRole = role || "renter";
    if (email.includes("admin")) resolvedRole = "system_admin";
    else if (email.includes("owner")) resolvedRole = "owner";

    // Set HTTP-only cookie simulating verified server session
    const response = NextResponse.json({
      success: true,
      user: {
        email,
        role: resolvedRole,
        campus: "UC Berkeley",
        token: `jwt_wheelzy_${Date.now()}`,
      },
      redirectTo:
        resolvedRole === "system_admin"
          ? "/admin/dashboard"
          : resolvedRole === "owner"
            ? "/owner/dashboard"
            : "/renter/dashboard",
    });

    response.cookies.set("wheelzy_role", resolvedRole, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Server authentication error." }, { status: 500 });
  }
}
