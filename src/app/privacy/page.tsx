import Link from "next/link";
import { Text } from "@/components/ui/Text";

export const metadata = {
  title: "Privacy",
  description: "How attunr handles your data — short version: your voice stays on your device.",
};

export default function PrivacyPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-5 py-8">
        <Link
          href="/"
          className="text-sm text-white/55 hover:text-white/82 transition-colors mb-6 inline-block"
        >
          ← Back
        </Link>
        <Text variant="heading" className="mb-4">Privacy Policy</Text>
        <div className="space-y-4">
          <Text variant="body-sm" color="text-2">
            attunr processes your voice locally in the browser. No voice data is
            sent to our servers.
          </Text>
          <Text variant="body-sm" color="text-2">
            We use localStorage to remember your preferences (voice type,
            journey progress, settings). You can clear these in your browser
            settings at any time.
          </Text>
          <Text variant="body-sm" color="text-2">
            We do not use cookies. Anonymous usage analytics (via PostHog) are
            stored in localStorage. We do not use tracking or advertising cookies.
          </Text>
          <Text variant="body-sm" color="text-2">
            For questions, please reach out through the contact details on the
            main site.
          </Text>
        </div>
      </div>
    </div>
  );
}
