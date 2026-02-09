import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith('/api/admin') || pathname.startsWith('/admin');

  // Protect admin routes
  if (isAdminRoute) {
    // No token ➜ redirect to login
    if (!token) {
      // console.log('⛔ No token for admin route:', pathname);
      return NextResponse.redirect(
        new URL(`/login?returnUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }

    try {
      // Decode **without** verifying signature (Edge‑compatible)
      const decoded: { role?: string } = jwtDecode(token);
      // console.log('✅ Token decoded:', decoded);

      // Reject non‑admin users
      if (decoded.role?.toUpperCase() !== 'ADMIN') {
        // console.log('⛔ User is not admin');
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // console.log('✅ Admin access granted');
    } catch (err) {
      console.error('⛔ Invalid token:', err);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // All good → continue
  return NextResponse.next();
}

// Apply middleware to admin routes only
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
