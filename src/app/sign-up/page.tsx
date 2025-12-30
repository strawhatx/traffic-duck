"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setMessage("Magic link sent. Check your email to continue.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-lg p-6 bg-white">
        <h1 className="text-2xl mb-4">Create your account</h1>
        <div className="space-y-3">
          <Button
            className="w-full"
            variant="outline"
            onClick={async () => {
              setError(null);
              setMessage(null);
              setLoading(true);
              const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo:
                    typeof window !== "undefined"
                      ? `${window.location.origin}/auth/callback`
                      : undefined,
                },
              });
              setLoading(false);
              if (oauthError) setError(oauthError.message);
            }}
          >
            Continue with Google
          </Button>
        </div>
        <div className="my-4 text-center text-sm text-slate-500">or</div>
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="text-sm block mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending link..." : "Send magic link"}
          </Button>
        </form>
        <p className="text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-600 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}


