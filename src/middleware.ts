import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // IMPORTANT: supabaseResponse may have been updated by supabase.auth.getUser()
  // with new Set-Cookie headers. We must return this supabaseResponse or
  // transfer its cookies if we return a different response.

  if (user) {
    // User is authenticated, check if their profile is complete.
    const { data: activeUser, error: activeUserError } = await supabase
      .from('active_users')
      .select('id')
      .eq('id', user.id)
      .limit(1)
      .single();

    // Profile is considered incomplete if there's an error fetching it (excluding "not found")
    // or if activeUser is null.
    let isProfileComplete = !!activeUser;
    if (activeUserError && activeUserError.code !== 'PGRST116') { // PGRST116: No rows found
      console.error('Middleware: Error checking active_users:', activeUserError.message);
      // Potentially treat as incomplete or handle error differently,
      // for now, let's assume profile is incomplete if error occurs
      isProfileComplete = false; 
    } else if (!activeUser) {
      isProfileComplete = false;
    }

    const currentPath = request.nextUrl.pathname;
    const allowedPathsWhenProfileIncomplete = [
      '/completar-perfil',
      '/login', // Should not be strictly necessary if user exists, but good for safety
      // Add any API routes essential for profile completion if not covered by matcher
    ];
    const isAuthRoute = currentPath.startsWith('/auth/'); // e.g., /auth/signout

    if (!isProfileComplete && !allowedPathsWhenProfileIncomplete.includes(currentPath) && !isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/completar-perfil';
      
      // Create a new redirect response
      const response = NextResponse.redirect(redirectUrl);

      // Copy all cookies from the potentially updated supabaseResponse to the new response
      supabaseResponse.cookies.getAll().forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value, cookie);
      });
      return response;
    }
  } else {
    // User is NOT authenticated
    const currentPath = request.nextUrl.pathname;
    if (
      !currentPath.startsWith('/login') &&
      !currentPath.startsWith('/auth') // Allows /auth/callback, /auth/signout etc.
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      
      // Create a new redirect response
      const response = NextResponse.redirect(redirectUrl);
      
      // Copy all cookies from the potentially updated supabaseResponse to the new response
      supabaseResponse.cookies.getAll().forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value, cookie);
      });
      return response;
    }
  }

  // If no redirect happened, return the supabaseResponse, which handles cookie updates.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de petición excepto las que empiezan por:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}