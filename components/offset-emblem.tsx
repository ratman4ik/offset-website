"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const OffsetEmblemCanvas = dynamic(
  () => import("@/components/offset-emblem-canvas").then((module) => module.OffsetEmblemCanvas),
  { ssr: false },
);

export function OffsetEmblem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const [webglAvailable, setWebglAvailable] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const handleCanvasUnavailable = useCallback(() => {
    setWebglAvailable(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = 0;
    let attempts = 0;

    const detectWebgl = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (cancelled) return;

      if (context) {
        setWebglAvailable(true);
        return;
      }

      attempts += 1;
      if (attempts < 20) {
        retryTimer = window.setTimeout(detectWebgl, 250);
      }
    };

    const frame = window.requestAnimationFrame(detectWebgl);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "120px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="offset-emblem"
      data-active={isVisible ? "true" : "false"}
      role="img"
      aria-label="Interactive three-dimensional OFFSET emblem"
    >
      {webglAvailable && (
        <OffsetEmblemCanvas
          active={isVisible}
          reducedMotion={reduceMotion}
          onUnavailable={handleCanvasUnavailable}
        />
      )}
    </div>
  );
}
