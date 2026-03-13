import Link from "next/link";

export const metadata = {
  title: "Privacy",
  description: "Privacy policy for attunr.",
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
        <h1 className="text-xl font-semibold text-white mb-4">Privacy Policy</h1>
        <div className="text-sm text-white/75 space-y-4 leading-relaxed">
          <p>
            attunr processes your voice locally in the browser. No voice data is
            sent to our servers.
          </p>
          <p>
            We use localStorage to remember your preferences (voice type,
            journey progress, settings). You can clear these in your browser
            settings at any time.
          </p>
          <p>
            If you accept cookies (when shown), we may use them for the same
            purpose. We do not use tracking or advertising cookies.
          </p>
          <p>
            For questions, please reach out through the contact details on the
            main site.
          </p>
        </div>
      </div>
    </div>
  );
}
