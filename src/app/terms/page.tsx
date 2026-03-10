import Link from "next/link";

export const metadata = {
  title: "Terms",
  description: "Terms of use for attunr.",
};

export default function TermsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-5 py-8">
        <Link
          href="/"
          className="text-sm text-white/45 hover:text-white/75 transition-colors mb-6 inline-block"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-semibold text-white mb-4">Terms of Use</h1>
        <div className="text-sm text-white/65 space-y-4 leading-relaxed">
          <p>
            attunr is provided as-is for personal, non-commercial use. Use it
            responsibly and never push your voice beyond comfort.
          </p>
          <p>
            The exercises and information are for educational purposes. They
            are not a substitute for professional voice or medical advice.
          </p>
          <p>
            By using attunr, you agree to use it at your own risk. We are not
            liable for any harm resulting from use of the app.
          </p>
        </div>
      </div>
    </div>
  );
}
