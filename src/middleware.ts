import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('better-auth.session_token')?.value || request.cookies.get('neon-auth-session')?.value;
    const { pathname } = request.nextUrl;

    // Public routes
    const publicPaths = ['/login', '/register', '/auth', '/api/auth'];
    const isPublic = publicPaths.some(path => pathname.startsWith(path));

    if (!sessionToken && !isPublic && pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (sessionToken && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname === '/' && sessionToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname === '/' && !sessionToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
