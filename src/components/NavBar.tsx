"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NavBar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const prime = async () => {
      const { data } = await supabase.auth.getUser();
      if (isMounted) setIsAuthenticated(!!data?.user);
    };
    prime();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setIsAuthenticated(!!session?.user);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/duck-mascot.png" alt="TrafficDuck" width={36} height={36} />
            <span className="text-2xl tracking-tight">TrafficDuck</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            {isAuthenticated ? (
              <Button variant="ghost" onClick={handleSignOut}>
                Logout
              </Button>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

