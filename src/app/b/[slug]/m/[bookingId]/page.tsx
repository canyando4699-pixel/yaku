import { ManageBooking } from "@/components/booking/ManageBooking";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getHostBySlug } from "@/lib/booking/demo";

type PageProps = {
  params: Promise<{ slug: string; bookingId: string }>;
};

export default async function ManageBookingPage({ params }: PageProps) {
  const { slug, bookingId } = await params;
  const host = getHostBySlug(slug);

  return (
    <LocaleProvider>
      {host ? (
        <ManageBooking host={host} bookingId={bookingId} />
      ) : (
        <div className="flex min-h-full flex-1 items-center justify-center px-6">
          <p className="text-muted">404</p>
        </div>
      )}
    </LocaleProvider>
  );
}
