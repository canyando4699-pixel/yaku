import { BookingFlow } from "@/components/booking/BookingFlow";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getHostBySlug } from "@/lib/booking/demo";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function BookingPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
  const host = getHostBySlug(slug);

  return (
    <LocaleProvider>
      {host ? (
        <BookingFlow host={host} fromHost={from === "host"} />
      ) : (
        <div className="flex min-h-full flex-1 items-center justify-center px-6">
          <p className="text-muted">404</p>
        </div>
      )}
    </LocaleProvider>
  );
}
