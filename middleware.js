import { NextResponse } from 'next/server';

/**
 * Middleware für das Manifest und andere spezielle Ressourcen
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Setze spezielle Header für manifest.json
  if (pathname.endsWith('/manifest.json')) {
    // Neue Response erstellen, anstatt die bestehende zu modifizieren
    const response = NextResponse.next();
    
    // Wichtige Header setzen
    response.headers.set('Content-Type', 'application/manifest+json');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    
    return response;
  }

  // MP4-Videos mit korrekten Headers versehen
  if (pathname.match(/\/images\/.*\.mp4$/)) {
    const response = NextResponse.next();
    response.headers.set('Content-Type', 'video/mp4');
    response.headers.set('Accept-Ranges', 'bytes');
    response.headers.set('Cache-Control', 'public, max-age=86400');
    return response;
  }

  // Standard-Response für alle anderen Anfragen
  return NextResponse.next();
}

// Matcher-Konfiguration für die Middleware
export const config = {
  matcher: ['/manifest.json', '/images/:path*.mp4'],
}; 