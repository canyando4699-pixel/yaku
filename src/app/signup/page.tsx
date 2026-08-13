import { AuthScreen } from "@/components/auth/AuthScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { safeNextPath } from "@/lib/auth/safeNextPath";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  return (
    <LocaleProvider>
      <AuthScreen mode="signup" nextPath={nextPath} />
    </LocaleProvider>
  );
}
