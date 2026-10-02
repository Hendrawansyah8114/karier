import { NextRequest, NextResponse } from 'next/server';
import { validSession, authorize } from '@/lib/auth';
export function proxy(req:NextRequest) {
 const path=req.nextUrl.pathname;
 if(path==='/login'||path==='/api/auth/login'||path==='/api/auth/logout'||path==='/karier-logo.svg'||path==='/favicon.svg')return NextResponse.next();
 if(!validSession(req)){if(path.startsWith('/api/'))return authorize(req)!;return NextResponse.redirect(new URL('/login',req.url));}
 const response=NextResponse.next();response.headers.set('Cache-Control','private, no-store');response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy','same-origin');response.headers.set('X-Frame-Options','DENY');return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
