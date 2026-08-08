import { HostDashboard } from "@/components/booking/HostDashboard";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export default function HostPage() {
  return (
    <LocaleProvider>
      <HostDashboard />
    </LocaleProvider>
  );
}
