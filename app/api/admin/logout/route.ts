import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  // Clear the admin token cookie
  response.cookies.set({
    name: 'admin_token',
    value: '',
    httpOnly: true,
    maxAge: 0, // Immediately expire
  });

  return response;
}
