"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";
import { IslandButton } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { ensureDemoAccount, getSession, signIn, signUp } from "@/lib/auth/localAuth";
import { safeNextPath } from "@/lib/auth/safeNextPath";

type Mode = "login" | "signup";

export function AuthScreen({
  mode,
  nextPath = "/host",
}: {
  mode: Mode;
  nextPath?: string;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const redirectTo = safeNextPath(nextPath);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [oauthNote, setOauthNote] = useState<string | null>(null);

  useEffect(() => {
    void ensureDemoAccount();
    if (getSession()) router.replace(redirectTo);
  }, [redirectTo, router]);

  function handleOauthSoon() {
    setError(null);
    setOauthNote(t.authOauthSoon);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setOauthNote(null);

    const result =
      mode === "signup"
        ? await signUp({ displayName, email, password, passwordConfirm })
        : await signIn({ email, password });

    setPending(false);

    if (!result.ok) {
      const map = {
        exists: t.authErrorExists,
        invalid: t.authErrorInvalid,
        mismatch: t.authErrorMismatch,
        weak: t.authErrorWeak,
      } as const;
      setError(map[result.error]);
      return;
    }

    router.replace(redirectTo);
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#0c0c0e]">
      <Image
        src="/images/tatami-garden-4k.png"
        alt=""
        fill
        priority
        unoptimized
        quality={100}
        sizes="100vw"
        className="pointer-events-none object-cover object-center brightness-[1.06] contrast-[1.1] saturate-[1.08]"
        aria-hidden
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,12,14,0.05)_0%,rgba(12,12,14,0.18)_55%,rgba(12,12,14,0.42)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0c0c0e]/55 to-transparent"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="font-display text-xl tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
          <span className="mr-2 text-accent">約</span>
          Yaku
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8">
          <h1 className="font-display text-3xl text-white md:text-4xl">
            {mode === "signup" ? t.createAccount : t.signIn}
          </h1>
          <p className="mt-2 text-sm text-white/60">{t.authHintLocal}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" ? (
              <label className="block">
                <span className="mb-1.5 block text-sm text-white/70">
                  {t.displayNameLabel}
                </span>
                <input
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none backdrop-blur-sm placeholder:text-white/30 focus:border-accent/60"
                  autoComplete="name"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-sm text-white/70">{t.email}</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none backdrop-blur-sm placeholder:text-white/30 focus:border-accent/60"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-white/70">{t.password}</span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none backdrop-blur-sm placeholder:text-white/30 focus:border-accent/60"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>

            {mode === "signup" ? (
              <label className="block">
                <span className="mb-1.5 block text-sm text-white/70">
                  {t.passwordConfirm}
                </span>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none backdrop-blur-sm placeholder:text-white/30 focus:border-accent/60"
                  autoComplete="new-password"
                />
              </label>
            ) : null}

            {error ? <p className="text-sm text-[#ff8a80]">{error}</p> : null}

            <IslandButton
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={pending}
            >
              {pending ? "…" : mode === "signup" ? t.createAccount : t.signIn}
              <Icon name="arrowRight" className="h-4 w-4" />
            </IslandButton>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/15" />
            <span className="text-xs tracking-wide text-white/45 uppercase">
              {t.orContinueWithEmail}
            </span>
            <span className="h-px flex-1 bg-white/15" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleOauthSoon}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white text-sm font-medium text-[#1f1f1f] shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:bg-white/90 active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t.continueWithGoogle}
            </button>
            <button
              type="button"
              onClick={handleOauthSoon}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-black text-sm font-medium text-white ring-1 ring-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:bg-[#111] active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              {t.continueWithApple}
            </button>
          </div>

          {oauthNote ? (
            <p className="mt-3 text-center text-sm text-white/70">{oauthNote}</p>
          ) : null}

          <p className="mt-6 text-center text-sm text-white/55">
            {mode === "signup" ? (
              <>
                {t.alreadyHaveAccount}{" "}
                <Link
                  href={`/login?next=${encodeURIComponent(redirectTo)}`}
                  className="text-white underline underline-offset-4"
                >
                  {t.signIn}
                </Link>
              </>
            ) : (
              <>
                {t.noAccountYet}{" "}
                <Link
                  href={`/signup?next=${encodeURIComponent(redirectTo)}`}
                  className="text-white underline underline-offset-4"
                >
                  {t.createAccount}
                </Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
