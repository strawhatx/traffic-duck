"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const go = async () => {
      // Ensure session is hydrated, then route to keywords
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        if (data.session) {
          router.replace("/keywords");
        } else {
          router.replace("/sign-in");
        }
      }
    };
    go();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-slate-600">Signing you in...</p>
      </div>
    </div>
  );
}


