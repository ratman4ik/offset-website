"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const SESSION_KEY = "offset-intro-played-v2";
const LETTERS = ["O", "F", "F", "S", "E", "T"] as const;
const ENTRANCES = [
  { x: "-0.7vw", y: "3vh", rotate: -2.5 },
  { x: "-0.3vw", y: "-5vh", rotate: 2 },
  { x: "0.25vw", y: "5vh", rotate: -2 },
  { x: "0.4vw", y: "-2vh", rotate: 2.5 },
  { x: "-0.25vw", y: "5.5vh", rotate: -2 },
  { x: "0.65vw", y: "2vh", rotate: 2.5 },
] as const;

const easeOut = [0.16, 1, 0.3, 1] as const;
const easeInOut = [0.76, 0, 0.24, 1] as const;

export function StudioIntro() {
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);
  const focusHomepageAfterExit = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shouldSkip = root.dataset.offsetIntro === "skip" || motionPreference.matches;

    if (shouldSkip) {
      root.dataset.offsetIntro = "skip";
      const frame = window.requestAnimationFrame(() => {
        setVisible(false);
        setMounted(false);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    root.dataset.offsetIntro = "play";
    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Storage can be unavailable in strict privacy contexts. The intro
      // remains dismissible and the fail-safe still guarantees page access.
    }

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      root.dataset.offsetIntro = "skip";
      setVisible(false);
      setMounted(false);
    };

    motionPreference.addEventListener("change", handleMotionPreference);

    return () => {
      motionPreference.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  const dismiss = useCallback((focusHomepage = false) => {
    focusHomepageAfterExit.current = focusHomepage;
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (root.dataset.offsetIntro === "skip") return;

    const body = document.body;
    const page = document.querySelector<HTMLElement>("#site-shell");
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousPageInert = page?.inert ?? false;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    if (page) page.inert = true;

    const finishTimer = window.setTimeout(() => dismiss(false), 2350);
    const failSafeTimer = window.setTimeout(() => {
      root.dataset.offsetIntro = "complete";
      setVisible(false);
      setMounted(false);
    }, 3600);

    return () => {
      window.clearTimeout(finishTimer);
      window.clearTimeout(failSafeTimer);
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
      if (page) page.inert = previousPageInert;
    };
  }, [dismiss, mounted]);

  const handleExitComplete = useCallback(() => {
    document.documentElement.dataset.offsetIntro = "complete";
    setMounted(false);

    if (focusHomepageAfterExit.current) {
      focusHomepageAfterExit.current = false;
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
      });
    }
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.section
          className="studio-intro"
          aria-label="OFFSET introduction"
          initial={{ y: "0%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.75, ease: easeInOut }}
        >
          <motion.button
            className="studio-intro-skip"
            type="button"
            onClick={() => dismiss(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.18 }}
          >
            Skip intro
          </motion.button>

          <div className="studio-intro-stage">
            <p className="studio-intro-wordmark" aria-label="OFFSET registered">
              {LETTERS.map((letter, index) => (
                <motion.span
                  className="studio-intro-letter"
                  key={`${letter}-${index}`}
                  aria-hidden="true"
                  initial={{
                    opacity: 0,
                    x: ENTRANCES[index].x,
                    y: ENTRANCES[index].y,
                    rotate: ENTRANCES[index].rotate,
                  }}
                  animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                  transition={{
                    duration: 0.82,
                    delay: 0.18 + index * 0.085,
                    ease: easeOut,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
              <motion.span
                className="studio-intro-register"
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.4, delay: 0.94, ease: easeOut }}
              >
                ®
              </motion.span>
            </p>

            <div className="studio-intro-rule" aria-hidden="true">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.72, delay: 1.16, ease: easeInOut }}
              />
            </div>
          </div>
          <div className="studio-intro-exit-edge" aria-hidden="true" />
        </motion.section>
      )}
    </AnimatePresence>
  );
}
