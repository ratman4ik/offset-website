import { Contact } from "@/components/contact";
import { Crew } from "@/components/crew";
import { CursorAura } from "@/components/cursor-aura";
import { Hero } from "@/components/hero";
import { SelectedWork } from "@/components/selected-work";
import { Services } from "@/components/services";
import { SiteHeader } from "@/components/site-header";
import { StudioIntro } from "@/components/studio-intro";

export default function Home() {
  return (
    <>
      <StudioIntro />
      <div id="site-shell">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <CursorAura />
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <SelectedWork />
          <Crew />
          <Services />
          <Contact />
        </main>
      </div>
    </>
  );
}
