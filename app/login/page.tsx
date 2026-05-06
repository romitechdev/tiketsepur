"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";

const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function getAppBaseUrl() {
  return appBaseUrl;
}

export default function LoginPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  async function sendMagicLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${getAppBaseUrl()}/`,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setMessage("Link masuk sudah dikirim ke email Anda.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim link masuk");
    } finally {
      setSubmitting(false);
    }
  }

  async function signInWithGoogle() {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getAppBaseUrl()}/`,
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk dengan Google");
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin border-4 border-black border-t-transparent" />
          <p className="text-[10px] font-black uppercase tracking-widest">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-10 md:px-8">
      <div className="w-full border-[3px] border-black bg-white p-8 shadow-kinetic md:p-10">
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Masuk ke TiketSepur</p>
        <h1 className="mb-3 text-4xl font-black uppercase tracking-tighter">Login</h1>
        <p className="mb-8 text-sm font-semibold text-gray-600">
          Masuk dengan email atau Google untuk mulai jual dan kelola tiket.
        </p>

        <form onSubmit={sendMagicLink} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest">Email</label>
            <div className="flex items-center gap-3 border-[2px] border-black px-4 py-3">
              <Mail className="h-4 w-4 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@domain.com"
                className="w-full bg-transparent text-sm font-bold outline-none"
              />
            </div>
          </div>

          {error && <p className="text-xs font-black uppercase tracking-widest text-red-600">{error}</p>}
          {message && <p className="text-xs font-black uppercase tracking-widest text-green-700">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 bg-black px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {submitting ? "Mengirim..." : "Kirim Link Masuk"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-black" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">atau</span>
          <div className="h-px flex-1 bg-black" />
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={submitting}
          className="w-full border-[2px] border-black px-6 py-3 text-[10px] font-black uppercase tracking-widest transition hover:bg-gray-100 disabled:opacity-50"
        >
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
}