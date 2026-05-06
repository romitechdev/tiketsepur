"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";

type ProfileResponse = {
  user?: { name?: string | null; email?: string | null };
  isAdmin?: boolean;
  needsOnboarding?: boolean;
};

export default function Navbar() {
  const { user, loading, signOut } = useSupabaseAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user) {
        setDisplayName("");
        setIsAdmin(false);
        return;
      }

      setDisplayName((user.user_metadata?.full_name as string | undefined) || user.email || "Pengguna");

      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok || cancelled) {
          return;
        }

        const data = (await res.json()) as ProfileResponse;

        if (data.user?.name) {
          setDisplayName(data.user.name);
        }

        if (typeof data.isAdmin === "boolean") {
          setIsAdmin(data.isAdmin);
        }

        if (data.needsOnboarding && pathname !== "/onboarding") {
          router.push("/onboarding");
        }
      } catch {
        // Keep the navbar usable even when the profile endpoint fails.
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, pathname, router]);

  const links = useMemo(
    () => [
      { href: "/", label: "Tiket" },
      { href: "/upload", label: "Jual Tiket" },
      ...(user ? [{ href: "/my-tickets", label: "Tiket Saya" }] : []),
    ],
    [user]
  );

  async function handleSignOut() {
    setProfileMenuOpen(false);
    setMobileOpen(false);
    await signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <nav className="sticky top-0 z-40 border-b-4 border-black bg-white">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 lg:px-8 animate-pulse">
          <div className="h-8 w-32 bg-gray-200" />
          <div className="h-8 w-40 bg-gray-200" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-40 border-b-4 border-black bg-white">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-[1.55rem] font-extrabold tracking-[-0.04em] text-black md:text-[1.8rem]">
          <Image
            src="/logo.png"
            alt="TiketSepur"
            width={38}
            height={38}
            className="h-10 w-10 object-contain"
            priority
          />
          <span className="leading-none">
            <span className="text-black">Tiket</span>
            <span className="text-gray-800">Sepur</span>
          </span>
        </Link>

        <div className="ml-auto mr-8 hidden items-center gap-10 text-sm font-black uppercase tracking-[0.18em] text-gray-700 md:flex lg:mr-12">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-black">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative flex items-center gap-3">
              <button
                onClick={() => setProfileMenuOpen((previous) => !previous)}
                className="hidden items-center gap-2 border-[2px] border-black px-4 py-2 text-[11px] font-black uppercase tracking-widest transition hover:bg-gray-100 md:flex"
              >
                {displayName || "Pengguna"}
                <ChevronDown className="h-4 w-4" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-12 z-50 hidden w-52 border-[3px] border-black bg-white shadow-kinetic md:block">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block border-b-2 border-black px-4 py-3 text-[10px] font-black uppercase tracking-widest transition hover:bg-gray-100"
                    >
                      Dashboard Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block border-b-2 border-black px-4 py-3 text-[10px] font-black uppercase tracking-widest transition hover:bg-gray-100"
                  >
                    Edit Profile
                  </Link>
                  {user && (
                    <Link
                      href="/activity"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block border-b-2 border-black px-4 py-3 text-[10px] font-black uppercase tracking-widest transition hover:bg-gray-100"
                    >
                      Aktivitas Saya
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block border-b-2 border-black px-4 py-3 text-[10px] font-black uppercase tracking-widest transition hover:bg-gray-100"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest transition hover:bg-gray-100"
                  >
                    Keluar
                  </button>
                </div>
              )}

              <button
                onClick={handleSignOut}
                className="hidden"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden bg-black px-8 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-gray-800 md:inline-flex">
              Masuk
            </Link>
          )}

          <button className="md:hidden" onClick={() => setMobileOpen((previous) => !previous)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-4 border-t-2 border-black bg-white px-6 py-6 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-black uppercase tracking-[0.18em] transition hover:text-gray-600"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-black uppercase tracking-[0.18em] transition hover:text-gray-600"
              >
                Edit Profile
              </Link>
              <Link
                href="/activity"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-black uppercase tracking-[0.18em] transition hover:text-gray-600"
              >
                Aktivitas Saya
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block text-[11px] font-black uppercase tracking-widest transition hover:text-gray-600"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="block text-sm font-black uppercase tracking-[0.18em] transition hover:text-gray-600"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-black uppercase tracking-[0.18em] transition hover:text-gray-600"
            >
              Masuk
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}