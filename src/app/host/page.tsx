import { HostDashboard } from "@/components/booking/HostDashboard";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { ThemeProvider } from "@/i18n/ThemeProvider";

export default function HostPage() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <div className="flex h-dvh min-h-0 flex-col">
          <HostDashboard />
        </div>
      </ThemeProvider>
    </LocaleProvider>
  );
}
