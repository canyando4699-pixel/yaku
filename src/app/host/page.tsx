import { HostBookings } from "@/components/booking/HostBookings";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export default function HostPage() {
  return (
    <LocaleProvider>
      <HostBookings />
    </LocaleProvider>
  );
}
