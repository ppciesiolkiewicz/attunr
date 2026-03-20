import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Manifesto",
  description: "Breath, Voice, Soul — the attunr manifesto.",
};

const fraunces = `"Fraunces", Georgia, serif`;
const body = `"Outfit", system-ui, sans-serif`;

function Separator() {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <span className="h-px w-8 bg-white/12" />
      <span className="block w-1 h-1 rounded-full bg-violet-400/40" />
      <span className="h-px w-8 bg-white/12" />
    </div>
  );
}

export default function ManifestoPage() {
  return (
    <div className="h-full overflow-y-auto manifesto-scroll">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Outfit:wght@300;400;500&display=swap');
        .manifesto-scroll { scroll-behavior: smooth; }
        .manifesto-body p { margin-bottom: 1.15em; }
        .manifesto-body p:last-child { margin-bottom: 0; }
      `}</style>

      <div className="max-w-lg mx-auto px-6 pt-8 pb-16">
        {/* ── Title ──────────────────────────────────── */}
        <h1
          className="text-3xl sm:text-4xl text-center leading-tight mb-3 text-white"
          style={{ fontFamily: fraunces, fontWeight: 600 }}
        >
          Breath, Voice, Soul
        </h1>

        <Separator />

        {/* ── Opening — etymology (centered, poetic) ── */}
        <div className="text-center mb-2">
          <p
            className="text-base leading-relaxed text-white/65 mb-4"
            style={{ fontFamily: body, fontWeight: 300 }}
          >
            In Sanskrit,{" "}
            <em
              className="text-white/80"
              style={{ fontFamily: fraunces, fontStyle: "italic" }}
            >
              prana
            </em>{" "}
            means both breath and life force. In Hebrew,{" "}
            <em
              className="text-white/80"
              style={{ fontFamily: fraunces, fontStyle: "italic" }}
            >
              neshama
            </em>{" "}
            — breath and soul. In Latin,{" "}
            <em
              className="text-white/80"
              style={{ fontFamily: fraunces, fontStyle: "italic" }}
            >
              spiritus
            </em>
            . In Greek,{" "}
            <em
              className="text-white/80"
              style={{ fontFamily: fraunces, fontStyle: "italic" }}
            >
              pneuma
            </em>
            .
          </p>
          <p
            className="text-base leading-relaxed text-white/65"
            style={{ fontFamily: body, fontWeight: 300 }}
          >
            Across nearly every ancient language, the word for breath and the
            word for soul are the same. This is not a coincidence. This is
            thousands of years of humans knowing something we&rsquo;re only now
            forgetting: that the breath is the most essential thing about being
            alive.
          </p>
        </div>

        {/* ── Centered pull-quote ──────────────────── */}
        <p
          className="text-center text-lg sm:text-xl text-white/85 my-10"
          style={{
            fontFamily: fraunces,
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          Your voice is just breath shaped by the body.
          <br />
          When you hum, you&rsquo;re giving your breath a form.
          <br />
          You&rsquo;re doing the oldest human practice there is.
        </p>

        <Separator />

        {/* ── The world that's coming ─────────────── */}
        <section className="mb-2">
          <h2
            className="text-xs uppercase tracking-[0.2em] text-violet-400/50 mb-5"
            style={{ fontFamily: body, fontWeight: 500 }}
          >
            The world that&rsquo;s coming
          </h2>
          <div
            className="manifesto-body"
            style={{ fontFamily: body, fontWeight: 300 }}
          >
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              Everything external is being automated. AI writes, creates,
              thinks, speaks, decides. Work — the thing that gave most people
              structure, identity, purpose — is shifting under everyone&rsquo;s
              feet. Not all at once. But steadily.
            </p>
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              When that happens, people don&rsquo;t just lose a job. They lose
              the thing that told them who they are. And the response
              won&rsquo;t be more screens, more content, more optimisation. The
              response will be a hunger for something real. Something felt.
              Something that can&rsquo;t be generated, outsourced, or automated.
            </p>
            <p
              className="text-[0.94rem] text-white/80"
              style={{
                fontFamily: fraunces,
                fontWeight: 400,
                fontStyle: "italic",
              }}
            >
              The response will be: come back to your body.
            </p>
          </div>
        </section>

        <Separator />

        {/* ── The radical act ─────────────────────── */}
        <section className="mb-2">
          <h2
            className="text-xs uppercase tracking-[0.2em] text-violet-400/50 mb-5"
            style={{ fontFamily: body, fontWeight: 500 }}
          >
            Radically internal
          </h2>
          <div
            className="manifesto-body"
            style={{ fontFamily: body, fontWeight: 300 }}
          >
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              In an age where everything external can be done for you, the
              radical act is going internal.
            </p>
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              Not as escapism. Not as retreat. As the most grounded thing you
              can do. When the world speeds up and abstracts, the practice is to
              slow down and feel. When identity becomes untethered from output,
              the anchor is the body. When everything is generated, the one
              thing that remains authentically yours is what you feel when you
              close your eyes and hum.
            </p>
            <p
              className="text-[0.94rem] leading-[1.75] text-white/80"
              style={{
                fontFamily: fraunces,
                fontWeight: 400,
                fontStyle: "italic",
              }}
            >
              Your breath. Your vibration. Your chest resonating with a tone
              that fits your voice and no one else&rsquo;s.
            </p>
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              That&rsquo;s not wellness. That&rsquo;s not self-improvement.
              That&rsquo;s the foundation for being human in a world
              that&rsquo;s changing faster than we can process.
            </p>
          </div>
        </section>

        <Separator />

        {/* ── Where attunr sits ───────────────────── */}
        <section className="mb-2">
          <h2
            className="text-xs uppercase tracking-[0.2em] text-violet-400/50 mb-5"
            style={{ fontFamily: body, fontWeight: 500 }}
          >
            Where attunr sits
          </h2>
          <div
            className="manifesto-body"
            style={{ fontFamily: body, fontWeight: 300 }}
          >
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              Attunr is a body practice that uses sound. That&rsquo;s the
              simplest description and it&rsquo;s true. But the deeper truth is
              that attunr is a practice for staying human.
            </p>
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              <strong
                className="text-white/78 font-normal"
                style={{ fontFamily: fraunces, fontWeight: 500 }}
              >
                Wellbeing
              </strong>{" "}
              — the immediate, felt benefit. Your nervous system calms. Your
              breath deepens. Your body releases tension. Every session leaves
              you feeling different than when you started. This is real, this is
              now, and for most people this is the reason they open the app.
            </p>
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              <strong
                className="text-white/78 font-normal"
                style={{ fontFamily: fraunces, fontWeight: 500 }}
              >
                Ancient wisdom
              </strong>{" "}
              — seed mantras, sustained tones, intentional vocalisation. These
              practices are thousands of years old. Attunr doesn&rsquo;t invent
              anything — it reframes what humans have always done and makes it
              accessible, structured, and progressive.
            </p>
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              <strong
                className="text-white/78 font-normal"
                style={{ fontFamily: fraunces, fontWeight: 500 }}
              >
                The authenticity crisis
              </strong>{" "}
              — the growing hunger for something that can&rsquo;t be faked,
              generated, or consumed passively. Your voice is the original
              instrument. The feeling it creates in your body is the original
              experience. No algorithm is between you and what you feel.
            </p>
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              <strong
                className="text-white/78 font-normal"
                style={{ fontFamily: fraunces, fontWeight: 500 }}
              >
                The post-work question
              </strong>{" "}
              — when people ask &ldquo;what do I do with my time, my identity,
              my sense of self?&rdquo; one answer is: come back to your body.
              Learn to feel. Build a practice that deepens over time. Not
              productivity. Not distraction. Presence.
            </p>
            <p className="text-[0.94rem] leading-[1.75] text-white/62">
              These layers coexist. A person might download attunr because
              they&rsquo;re stressed and need three minutes of calm. They stay
              because something deeper is happening — they&rsquo;re reconnecting
              with a part of themselves they didn&rsquo;t know they&rsquo;d
              lost.
            </p>
          </div>
        </section>

        <Separator />

        {/* ── Closing — centered, elevated ─────────── */}
        <div className="text-center py-6">
          <p
            className="text-lg sm:text-xl text-white/70 mb-3"
            style={{
              fontFamily: fraunces,
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.6,
            }}
          >
            Everything else can be generated.
            <br />
            This can only be felt.
          </p>
          <p
            className="text-base text-violet-400/60 mt-6"
            style={{
              fontFamily: fraunces,
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            Find what&rsquo;s truly you.
          </p>
          <Separator />
          <Link href="/journey" tabIndex={-1} className="mt-6 inline-block">
            <Button variant="landing" size="lg" className="px-14">
              Begin the journey
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
