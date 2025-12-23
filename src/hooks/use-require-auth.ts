"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UseRequireAuthResult = {
  loading: boolean;
  userId: string | null;
};

export function useRequireAuth(redirectBase: string = "/sign-in"): UseRequireAuthResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;
      if (!cancelled) setUserId(uid);
      if (!uid) {
        const redirectTo = `${pathname || "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
        router.replace(`${redirectBase}?redirectTo=${encodeURIComponent(redirectTo)}`);
      } else {
        if (!cancelled) setLoading(false);
      }
    };
    check();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname]);

  return { loading, userId };
}


