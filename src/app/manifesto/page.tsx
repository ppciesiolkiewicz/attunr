import Link from "next/link";
import { Text } from "@/components/ui/Text";

export const metadata = {
  title: "Manifesto",
  description: "Breath, Voice, Soul — the attunr manifesto.",
};

export default function ManifestoPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-5 py-8">
        <Link
          href="/"
          className="text-sm text-white/55 hover:text-white/82 transition-colors mb-6 inline-block"
        >
          &larr; Back
        </Link>

        <Text variant="heading" className="mb-6">
          Breath, Voice, Soul
        </Text>

        <div className="space-y-4 mb-10">
          <Text variant="body-sm" color="text-2">
            In Sanskrit, <em>prana</em> means both breath and life force. In
            Hebrew, <em>neshama</em> — breath and soul. In Latin,{" "}
            <em>spiritus</em>. In Greek, <em>pneuma</em>.
          </Text>
          <Text variant="body-sm" color="text-2">
            Across nearly every ancient language, the word for breath and the
            word for soul are the same. This is not a coincidence. This is
            thousands of years of humans knowing something we&rsquo;re only now
            forgetting: that the breath is the most essential thing about being
            alive.
          </Text>
          <Text variant="body-sm" color="text-2">
            And your voice is just breath shaped by the body. When you hum,
            you&rsquo;re giving your breath a form. You&rsquo;re doing the
            oldest human practice there is.
          </Text>
        </div>

        <Text variant="heading-sm" className="mb-4">
          The world that&rsquo;s coming
        </Text>

        <div className="space-y-4 mb-10">
          <Text variant="body-sm" color="text-2">
            Everything external is being automated. AI writes, creates, thinks,
            speaks, decides. Work — the thing that gave most people structure,
            identity, purpose — is shifting under everyone&rsquo;s feet. Not all
            at once. But steadily.
          </Text>
          <Text variant="body-sm" color="text-2">
            When that happens, people don&rsquo;t just lose a job. They lose the
            thing that told them who they are. And the response won&rsquo;t be
            more screens, more content, more optimisation. The response will be a
            hunger for something real. Something felt. Something that can&rsquo;t
            be generated, outsourced, or automated.
          </Text>
          <Text variant="body-sm" color="text-2">
            The response will be: come back to your body.
          </Text>
        </div>

        <Text variant="heading-sm" className="mb-4">
          The radical act
        </Text>

        <div className="space-y-4 mb-10">
          <Text variant="body-sm" color="text-2">
            In an age where everything external can be done for you, the radical
            act is going internal.
          </Text>
          <Text variant="body-sm" color="text-2">
            Not as escapism. Not as retreat. As the most grounded thing you can
            do. When the world speeds up and abstracts, the practice is to slow
            down and feel. When identity becomes untethered from output, the
            anchor is the body. When everything is generated, the one thing that
            remains authentically yours is what you feel when you close your eyes
            and hum.
          </Text>
          <Text variant="body-sm" color="text-2">
            Your breath. Your vibration. Your chest resonating with a tone that
            fits your voice and no one else&rsquo;s.
          </Text>
          <Text variant="body-sm" color="text-2">
            That&rsquo;s not wellness. That&rsquo;s not self-improvement.
            That&rsquo;s the foundation for being human in a world that&rsquo;s
            changing faster than we can process.
          </Text>
        </div>

        <Text variant="heading-sm" className="mb-4">
          Where attunr sits
        </Text>

        <div className="space-y-4 mb-10">
          <Text variant="body-sm" color="text-2">
            Attunr is a body practice that uses sound. That&rsquo;s the simplest
            description and it&rsquo;s true. But the deeper truth is that attunr
            is a practice for staying human.
          </Text>
          <Text variant="body-sm" color="text-2">
            <strong>Wellbeing</strong> — the immediate, felt benefit. Your
            nervous system calms. Your breath deepens. Your body releases
            tension. Every session leaves you feeling different than when you
            started. This is real, this is now, and for most people this is the
            reason they open the app.
          </Text>
          <Text variant="body-sm" color="text-2">
            <strong>Ancient wisdom</strong> — seed mantras, sustained tones,
            intentional vocalisation. These practices are thousands of years old.
            Attunr doesn&rsquo;t invent anything — it reframes what humans have
            always done and makes it accessible, structured, and progressive.
          </Text>
          <Text variant="body-sm" color="text-2">
            <strong>The authenticity crisis</strong> — the growing hunger for
            something that can&rsquo;t be faked, generated, or consumed
            passively. Your voice is the original instrument. The feeling it
            creates in your body is the original experience. No algorithm is
            between you and what you feel.
          </Text>
          <Text variant="body-sm" color="text-2">
            <strong>The post-work question</strong> — when people ask
            &ldquo;what do I do with my time, my identity, my sense of
            self?&rdquo; one answer is: come back to your body. Learn to feel.
            Build a practice that deepens over time. Not productivity. Not
            distraction. Presence.
          </Text>
          <Text variant="body-sm" color="text-2">
            These layers coexist. A person might download attunr because
            they&rsquo;re stressed and need three minutes of calm. They stay
            because something deeper is happening — they&rsquo;re reconnecting
            with a part of themselves they didn&rsquo;t know they&rsquo;d lost.
          </Text>
        </div>

        <Text variant="heading-sm" className="mb-4">
          The vision
        </Text>

        <div className="space-y-4 mb-10">
          <Text variant="body-sm" color="text-2">
            Short term: attunr is the app that helps you feel your voice in your
            body. A somatic practice. A nervous system reset. Something that
            works in three minutes.
          </Text>
          <Text variant="body-sm" color="text-2">
            Medium term: attunr becomes the practice people reach for when they
            need to come back to themselves. Not just calm — presence. Not just
            relaxation — reconnection. The practice grows with movement, with
            rhythm, with new ways to feel.
          </Text>
          <Text variant="body-sm" color="text-2">
            Long term: attunr is a guide for people navigating a world where
            everything external is shifting. A practice for staying human. A
            place where the question &ldquo;who am I when the machines do
            everything?&rdquo; has a simple, felt answer: you&rsquo;re the one
            who can feel this. You&rsquo;re the one with breath in your body and
            a voice that resonates.
          </Text>
          <Text variant="body-sm" color="text-2">
            That&rsquo;s enough. That&rsquo;s everything.
          </Text>
        </div>

        <div className="border-t border-white/10 pt-6 space-y-2">
          <Text variant="body-sm" color="text-2" className="italic">
            Everything else can be generated. This can only be felt.
          </Text>
          <Text variant="body-sm" color="text-2" className="italic">
            Find what&rsquo;s truly you.
          </Text>
        </div>
      </div>
    </div>
  );
}
