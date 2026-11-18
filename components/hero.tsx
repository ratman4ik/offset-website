"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { ArrowDown } from "@/components/icons";
import { OffsetEmblem } from "@/components/offset-emblem";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const wordmarkY = useTransform(scrollY, [0, 800], [0, reduceMotion ? 0 : 80]);

  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!video) return;

    if (reduceMotion) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    void video.play().catch(() => {
      // The solid panel remains visible when autoplay is unavailable.
    });
  }, [reduceMotion]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-wordmark-media" aria-hidden="true">
        <video
          ref={backgroundVideoRef}
          className="hero-wordmark-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        >
          <source src="/videos/offset-background.webm" type="video/mp4" />
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
