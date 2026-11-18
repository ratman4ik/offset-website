import { ArrowUpRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { services } from "@/data/site";

export function Services() {
  return (
    <section className="services-section" id="services" aria-labelledby="services-title">
      <Reveal className="services-intro">
        <p className="section-label">03 / Capabilities</p>
        <h2 id="services-title">WHAT WE DO</h2>
        <p>From first idea to final interaction.</p>
      </Reveal>

      <ol className="services-list">
        {services.map((service, index) => (
          <Reveal as="li" key={service} delay={index * 0.045}>
            <span>0{index + 1}</span>
            <h3>{service}</h3>
            <ArrowUpRight />
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
