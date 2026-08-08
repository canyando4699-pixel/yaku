import { ManageBooking } from "@/components/booking/ManageBooking";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getHostBySlug } from "@/lib/booking/demo";

type PageProps = {
  params: Promise<{ slug: string; bookingId: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function ManageBookingPage({
  params,
  searchParams,
}: PageProps) {
  const { slug, bookingId } = await params;
  const { from } = await searchParams;
  const host = getHostBySlug(slug);

  return (
    <LocaleProvider>
      {host ? (
        <ManageBooking
          host={host}
          bookingId={bookingId}
          fromHost={from === "host"}
        />
      ) : (
        <div className="flex min-h-full flex-1 items-center justify-center px-6">
          <p className="text-muted">404</p>
        </div>
      )}
    </LocaleProvider>
  );
}
