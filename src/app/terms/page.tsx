import Link from "next/link";
import { Text } from "@/components/ui/Text";

export const metadata = {
  title: "Terms",
  description: "The ground rules for using attunr — plain-language terms of use.",
};

export default function TermsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-5 py-8">
        <Link
          href="/"
          className="text-sm text-white/55 hover:text-white/82 transition-colors mb-6 inline-block"
        >
          ← Back
        </Link>
        <Text variant="heading" className="mb-4">Terms of Use</Text>
        <div className="space-y-4">
          <Text variant="body-sm" color="text-2">
            attunr is provided as-is for personal, non-commercial use. Use it
            responsibly and never push your voice beyond comfort.
          </Text>
          <Text variant="body-sm" color="text-2">
            The exercises and information are for educational purposes. They
            are not a substitute for professional voice or medical advice.
          </Text>
          <Text variant="body-sm" color="text-2">
            By using attunr, you agree to use it at your own risk. We are not
            liable for any harm resulting from use of the app.
          </Text>
          <Text variant="body-sm" color="text-2" className="pt-2 border-t border-white/8 mt-6">
            attunr uses{" "}
            <a
              href="https://ml5js.org/license"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline"
            >
              ml5.js
            </a>{" "}
            for pitch detection. ml5.js is licensed under the{" "}
            <a
              href="https://ml5js.org/license"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline"
            >
              ml5.js license
            </a>.
          </Text>
        </div>
      </div>
    </div>
  );
}
