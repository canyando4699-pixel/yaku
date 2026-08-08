import { AuthScreen } from "@/components/auth/AuthScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/host";

  return (
    <LocaleProvider>
      <AuthScreen mode="signup" nextPath={nextPath} />
    </LocaleProvider>
  );
}
