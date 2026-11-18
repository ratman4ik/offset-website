import { ArrowUpRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";

export function Contact() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <Reveal>
        <p className="section-label">04 / Contact</p>
        <h2 id="contact-title">
          LET&apos;S MAKE
          <span>SOMETHING DIFFERENT.</span>
        </h2>
      </Reveal>

      <div className="contact-lower">
        <div className="contact-copy">
          <p>Have a project, an idea, or something harder to define?</p>
          <p>Real contact details are coming soon.</p>
        </div>
        <div className="contact-placeholder" aria-label="Email address pending">
          <span>Email</span>
          <strong>[ADDRESS PENDING]</strong>
          <ArrowUpRight />
        </div>
      </div>

      <footer className="site-footer">
        <a href="#top">OFFSET®</a>
        <p>Independent digital studio / Ireland</p>
        <p>© 2026 OFFSET®</p>
      </footer>
    </section>
  );
}
