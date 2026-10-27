import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.delete("wheelzy_token");
  response.cookies.delete("wheelzy_user");
  return response;
}
