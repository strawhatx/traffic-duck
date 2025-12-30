 import { NextResponse } from 'next/server'
 import type { NextRequest } from 'next/server'
 import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
 
 const PUBLIC_PATHS = [
   '/',
   '/login',
   '/signup',
   '/sign-in',
   '/sign-up',
   '/pricing',
   '/favicon.ico',
   '/robots.txt',
   '/sitemap.xml',
 ]

export async function middleware(req: NextRequest) {
   // Basic debug to confirm middleware runs
   // eslint-disable-next-line no-console
   console.log('[middleware] path=', req.nextUrl.pathname)
 
   const res = NextResponse.next()
   res.headers.set('x-middleware-hit', '1')
   const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  // Allow public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return res
  }

  // Allow Stripe webhook
   if (pathname.startsWith('/api/stripe/webhook')) {
    return res
  }

  // ❌ Not logged in → login
  if (!user) {
    const loginUrl = new URL('/sign-in', req.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check subscription
   // Optional: subscription gating (robust against missing table)
   try {
     const { data: profile } = await supabase
       .from('profiles').select('subscription_status, price_id')
       .eq('id', user.id).maybeSingle()
     // Example gate: force billing page for users without active/trialing subscription
     if (!profile || (profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing')) {
       // Allow public pages and auth pages; otherwise redirect to pricing
       if (!PUBLIC_PATHS.includes(pathname)) {
         return NextResponse.redirect(new URL('/pricing', req.url))
       }
     }
   } catch (e) {
     // ignore subscription errors in middleware to avoid locking users out
   }

  // ✅ All good
   return res
}

 export const config = {
   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
 }