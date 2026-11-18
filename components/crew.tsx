"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Reveal } from "@/components/reveal";
import { team, type TeamMember } from "@/data/site";

const restingRotations = [-1.8, 1.15, -0.85] as const;
const barcodePattern = [1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1] as const;

function BadgeArtwork({ member }: { member: TeamMember }) {
  return (
    <div className={`pass-art pass-art-${member.badge}`}>
      <Image
        className="pass-photo"
        src={member.photo}
        alt={`Portrait of ${member.name}`}
        fill
        draggable={false}
        sizes="(max-width: 620px) calc(100vw - 4.25rem), (max-width: 900px) 42vw, 21.5rem"
      />
    </div>
  );
}

function BadgeBarcode() {
  return (
    <div className="pass-barcode" aria-hidden="true">
      {barcodePattern.map((width, index) => (
        <span className={`barcode-width-${width}`} key={`${width}-${index}`} />
      ))}
    </div>
  );
}

function CrewPass({
  member,
  index,
  canInteract,
  reduceMotion,
}: {
  member: TeamMember;
  index: number;
  canInteract: boolean;
  reduceMotion: boolean;
}) {
  const stationRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const activePointer = useRef<number | null>(null);
  const dragSample = useRef({
    startX: 0,
    startY: 0,
    startAngle: 0,
    pendulumLength: 420,
    lastAngle: 0,
    lastTime: 0,
    velocity: 0,
  });
  const animations = useRef<Array<{ stop: () => void }>>([]);
  const [dragging, setDragging] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const rest = reduceMotion ? 0 : restingRotations[index];
  const pendulumAngle = useMotionValue(rest);
  const cardTwist = useMotionValue(0);

  const stopAnimations = useCallback(() => {
    animations.current.forEach((animation) => animation.stop());
    animations.current = [];
  }, []);

  const settle = useCallback(() => {
    stopAnimations();
    const releaseVelocity = Math.max(-95, Math.min(95, dragSample.current.velocity));
    animations.current = [
      animate(pendulumAngle, rest, {
        type: "spring",
        stiffness: 46,
        damping: 7.5,
        mass: 0.92,
        velocity: releaseVelocity,
        restDelta: 0.025,
        restSpeed: 0.06,
      }),
      animate(rotateX, 0, { type: "spring", stiffness: 125, damping: 15, mass: 0.72 }),
      animate(rotateY, 0, { type: "spring", stiffness: 118, damping: 14, mass: 0.76 }),
      animate(cardTwist, 0, { type: "spring", stiffness: 105, damping: 13, mass: 0.72 }),
    ];
  }, [cardTwist, pendulumAngle, rest, rotateX, rotateY, stopAnimations]);

  const finishDrag = useCallback((pointerId?: number) => {
    if (activePointer.current === null) return;
    if (pointerId !== undefined && activePointer.current !== pointerId) return;

    activePointer.current = null;
    setDragging(false);
    settle();
  }, [settle]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handlePointerEnd = (event: PointerEvent) => finishDrag(event.pointerId);
    const handleWindowBlur = () => finishDrag();

    window.addEventListener("pointerup", handlePointerEnd, true);
    window.addEventListener("pointercancel", handlePointerEnd, true);
    window.addEventListener("blur", handleWindowBlur);
    card.addEventListener("lostpointercapture", handlePointerEnd);

    return () => {
      window.removeEventListener("pointerup", handlePointerEnd, true);
      window.removeEventListener("pointercancel", handlePointerEnd, true);
      window.removeEventListener("blur", handleWindowBlur);
      card.removeEventListener("lostpointercapture", handlePointerEnd);
      stopAnimations();
    };
  }, [finishDrag, stopAnimations]);

  useEffect(() => {
    if (!reduceMotion) return;
    stopAnimations();
    pendulumAngle.set(0);
    rotateX.set(0);
    rotateY.set(0);
    cardTwist.set(0);
  }, [cardTwist, pendulumAngle, reduceMotion, rotateX, rotateY, stopAnimations]);

  const beginDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!canInteract) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    stopAnimations();
    activePointer.current = event.pointerId;
    const stationRect = stationRef.current?.getBoundingClientRect();
    const cardRect = cardRef.current?.getBoundingClientRect();
    const pendulumLength = stationRect && cardRect
      ? Math.max(280, cardRect.top + cardRect.height * 0.48 - stationRect.top)
      : 420;
    const now = performance.now();
    dragSample.current = {
      startX: event.clientX,
      startY: event.clientY,
      startAngle: pendulumAngle.get(),
      pendulumLength,
      lastAngle: pendulumAngle.get(),
      lastTime: now,
      velocity: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (activePointer.current !== event.pointerId) return;
    if (event.pointerType === "mouse" && (event.buttons & 1) !== 1) {
      finishDrag(event.pointerId);
      return;
    }

    const sample = dragSample.current;
    const deltaX = event.clientX - sample.startX;
    const deltaY = event.clientY - sample.startY;
    const angleDelta = -(deltaX / sample.pendulumLength) * (180 / Math.PI);
    const nextAngle = Math.max(rest - 15, Math.min(rest + 15, sample.startAngle + angleDelta));
    const now = performance.now();
    const elapsed = Math.max(8, now - sample.lastTime);

    sample.velocity = ((nextAngle - sample.lastAngle) / elapsed) * 1000;
    sample.lastAngle = nextAngle;
    sample.lastTime = now;

    pendulumAngle.set(nextAngle);
    rotateX.set(Math.max(-7, Math.min(7, -deltaY * 0.035)));
    rotateY.set(Math.max(-8, Math.min(8, deltaX * 0.025)));
    cardTwist.set(Math.max(-2.4, Math.min(2.4, deltaX * 0.012)));
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (activePointer.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag(event.pointerId);
  };

  return (
    <div ref={stationRef} className={`pass-station pass-station-${member.badge}`}>
      <div
        className="pass-hanger"
        data-dragging={dragging ? "true" : "false"}
        style={{ "--swing-delay": `${index * -1.35}s` } as CSSProperties}
      >
        <motion.div className="pass-pendulum" style={{ rotateZ: pendulumAngle }}>
          <div className="lanyard-rig" aria-hidden="true">
            <span className="lanyard-anchor" />
            <span className="lanyard-strap lanyard-strap-left" />
            <span className="lanyard-strap lanyard-strap-right" />
            <span className="lanyard-junction" />
            <span className="lanyard-hook" />
            <span className="lanyard-ring" />
          </div>
          <motion.article
            ref={cardRef}
            className={`crew-pass crew-pass-${member.badge}`}
            aria-label={`${member.name}, ${member.role}, OFFSET studio identification badge`}
            data-draggable={canInteract ? "true" : "false"}
            data-dragging={dragging ? "true" : "false"}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDragStart={(event) => event.preventDefault()}
            style={{ rotateX, rotateY, rotateZ: cardTwist }}
          >
          <div className="pass-surface" aria-hidden="true" />
          <div className="pass-registration" aria-hidden="true">
            <span className="registration-mark registration-mark-nw" />
            <span className="registration-mark registration-mark-ne" />
            <span className="registration-mark registration-mark-sw" />
            <span className="registration-mark registration-mark-se" />
          </div>
          <div className="pass-eyelet" aria-hidden="true"><span /></div>
          <div className="pass-topline">
            <div className="pass-topline-copy">
              <span>OFFSET® / PERSONNEL</span>
              <span className="pass-discipline">{member.discipline}</span>
            </div>
            <span>{member.serial}</span>
          </div>
          <BadgeArtwork member={member} />
          <div className="pass-info">
            <div>
              <p>{member.name}</p>
              <p>{member.role}</p>
            </div>
            <span>0{index + 1}</span>
          </div>
          <div className="pass-footer">
            <BadgeBarcode />
            <p aria-hidden="true">
              INDEPENDENT DIGITAL STUDIO<br />
              IRELAND / OFFSET® 2026
            </p>
          </div>
          </motion.article>
        </motion.div>
      </div>
    </div>
  );
}

export function Crew() {
  const reduceMotionPreference = useReducedMotion();
  const reduceMotion = Boolean(reduceMotionPreference);
  const canInteract = !reduceMotion;

  return (
    <section className="crew-section" id="crew" aria-labelledby="crew-title">
      <Reveal className="section-heading section-heading-dark">
        <p className="section-label">02 / The Crew</p>
        <h2 id="crew-title">SMALL TEAM.<br />SHARP IDEAS.</h2>
        <p className="section-aside">
          Three disciplines. One studio system. Drag the passes on desktop.
        </p>
      </Reveal>

      <div className="crew-grid">
        {team.map((member, index) => (
          <CrewPass
            key={member.name}
            member={member}
            index={index}
            canInteract={canInteract}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}
