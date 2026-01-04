"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const isDev = process.env.NODE_ENV !== "production";

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

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
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
    // If email confirmation is disabled in dev, user will be signed in immediately.
    // Otherwise, they will need to confirm via email.
    router.push("/dashboard");
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
        {isDev && (
          <>
            <div className="my-4 text-center text-sm text-slate-500">or (dev)</div>
            <form onSubmit={handlePasswordSignUp} className="space-y-4">
              <div>
                <label className="text-sm block mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm block mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm block mb-1">Confirm password</label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </Button>
            </form>
          </>
        )}
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


