/**
 * Middleware für das Manifest
 */
export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Setze spezielle Header nur für manifest.json
  if (pathname.includes('/manifest.json')) {
    const response = NextResponse.next();
    response.headers.set('Content-Type', 'application/manifest+json');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    return response;
  }
  
  return NextResponse.next();
}

// Import NextResponse innerhalb des Moduls, um es im Code nutzen zu können
import { NextResponse } from 'next/server'; 