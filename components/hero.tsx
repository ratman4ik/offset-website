"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { ArrowDown } from "@/components/icons";
import { OffsetEmblem } from "@/components/offset-emblem";
import { assetPath } from "@/lib/asset-path";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const backgroundPoster = assetPath("/videos/offset-background-poster.jpg");
  const { scrollY } = useScroll();
  const wordmarkY = useTransform(scrollY, [0, 800], [0, reduceMotion ? 0 : 80]);

  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    if (reduceMotion) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    const playVideo = () => {
      void video.play().catch(() => {
        // The poster remains visible when autoplay is unavailable.
      });
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) playVideo();
    };

    playVideo();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reduceMotion]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div
        className="hero-wordmark-media"
        style={{ backgroundImage: `url("${backgroundPoster}")` }}
        aria-hidden="true"
      >
        <video
          ref={backgroundVideoRef}
          className="hero-wordmark-video"
          autoPlay
          muted
          loop
          playsInline
          poster={backgroundPoster}
          preload="auto"
          tabIndex={-1}
        >
          <source
            src={assetPath("/videos/offset-background.webm")}
            type='video/webm; codecs="vp9"'
          />
          <source src={assetPath("/videos/offset-background.mp4")} type="video/mp4" />
        </video>
      </div>

      <div className="hero-kicker" aria-hidden="true">
        <span>Independent digital studio</span>
        <span>Issue 001 / 2026</span>
      </div>

      <motion.div
        className="hero-wordmark-wrap"
        style={{ y: wordmarkY }}
        initial={reduceMotion ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 1, delay: 0.1, ease }}
      >
        <p className="hero-wordmark" aria-label="OFFSET registered">
          OFFSET<span>®</span>
        </p>
      </motion.div>

      <OffsetEmblem />

      <div className="hero-grid">
        <motion.h1
          id="hero-title"
          initial={reduceMotion ? false : { opacity: 0, y: 46 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease }}
        >
          WE DON&apos;T DO
          <span>ORDINARY.</span>
        </motion.h1>

        <motion.div
          className="hero-copy"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p>
            Independent digital studio building distinctive websites and digital
            experiences.
          </p>
          <p className="hero-place">Based in Ireland. Working beyond borders.</p>
        </motion.div>
      </div>

      <motion.a
        className="scroll-cue"
        href="#work"
        aria-label="Scroll to selected work"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span>Selected work</span>
        <ArrowDown />
      </motion.a>
    </section>
  );
}
