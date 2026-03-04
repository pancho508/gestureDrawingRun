import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect /admin/* routes (except /admin/login)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    const adminToken = request.cookies.get('admin_token')?.value;
    
    // Check if valid admin token exists
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
