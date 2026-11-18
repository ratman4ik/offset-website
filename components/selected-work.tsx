import Image from "next/image";
import { ArrowUpRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { projects, type Project } from "@/data/site";

function ProjectPreview({ project }: { project: Project }) {
  return (
    <div className="project-preview">
      {project.preview ? (
        <Image
          className={project.previewPosition === "center" ? "project-preview-image-center" : undefined}
          src={project.preview}
          alt={project.previewAlt}
          fill
          sizes="(max-width: 680px) calc(100vw - 2rem), (max-width: 1024px) 46vw, 31vw"
        />
      ) : (
        <div className="project-preview-placeholder" role="img" aria-label={project.previewAlt}>
          <span>PREVIEW / ACCESS REQUIRED</span>
          <strong>NOIR<br />AUTO</strong>
          <small>LIVE SITE OPENS VIA CHATGPT</small>
        </div>
      )}

      <span className="project-number" aria-hidden="true">{project.index}</span>
      <span className="project-view">
        VIEW PROJECT
        <ArrowUpRight />
      </span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${project.title} by ${project.creator}`}
      >
        <ProjectPreview project={project} />
        <div className="project-card-copy">
          <div>
            <p className="project-category">{project.category}</p>
            <h3>{project.title}</h3>
          </div>
          <p className="project-creator">
            <span>BY</span>
            {project.creator}
          </p>
        </div>
      </a>
    </article>
  );
}

export function SelectedWork() {
  return (
    <section className="work-section" id="work" aria-labelledby="work-title">
      <Reveal className="section-heading section-heading-dark">
        <p className="section-label">01 / Selected Work</p>
        <h2 id="work-title">BUILT TO LEAVE A MARK.</h2>
        <p className="section-aside">
          Self-initiated portfolio concepts exploring identity, interaction and digital
          atmosphere.
        </p>
      </Reveal>

      <div className="project-list">
        {projects.map((project, index) => (
          <Reveal className="project-card-reveal" key={project.title} delay={index * 0.055}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
