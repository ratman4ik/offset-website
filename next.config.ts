import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const githubPagesBasePath = "/offset-website";

export default function nextConfig(phase: string): NextConfig {
  const basePath = phase === PHASE_DEVELOPMENT_SERVER ? "" : githubPagesBasePath;

  return {
    output: "export",
    basePath,
    trailingSlash: true,
    env: {
      NEXT_PUBLIC_OFFSET_BASE_PATH: basePath,
    },
    images: {
      unoptimized: true,
    },
  };
}
