import type { ReactElement } from "react";
import { useEffect, useRef } from "react";

import logoSvg from "../../design/brand/logo-reveal-white-clean.svg?raw";

const APP_VERSION = "0.1.0";
const STORAGE_KEY = "savoir.launch.version";
const EASE = "cubic-bezier(.2,.7,.2,1)";
const DAMP = "cubic-bezier(.22,1,.36,1)";
const FULL_MS = 2880;
const SHORT_MS = 700;

// Tracés du symbole (id, délai, durée) puis lettres qui sortent de derrière le symbole.
const STROKES: [string, number, number][] = [
  ["s3", 0, 260],
  ["s4", 200, 260],
  ["s0", 380, 380],
  ["s1", 700, 240],
  ["s2", 860, 340],
];
const EDGES: Record<string, [number, number]> = {
  c1: [902.1, 1],
  e1: [902.1, 1],
  o1: [1068.6, -1],
  e2: [1017.6, 1],
  g2: [1017.6, 1],
  a2: [1017.6, 1],
  c2: [1184.2, -1],
  y2: [1184.2, -1],
};
const LETTER_ORDER = ["c1", "o1", "e2", "c2", "e1", "g2", "y2", "a2"];

function shouldPlayFull(): boolean {
  try {
    const seen = localStorage.getItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    return seen !== APP_VERSION;
  } catch {
    return false;
  }
}

// Décidé une fois au chargement (les effets peuvent être rejoués en mode strict).
const PLAY_FULL =
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  shouldPlayFull();

function animateLogo(svg: SVGSVGElement): void {
  const q = (id: string): SVGGraphicsElement | null =>
    svg.querySelector(`#${id}`);
  const seal = q("seal");
  if (seal) seal.style.opacity = "0";
  for (const [id, delay, duration] of STROKES) {
    const p = q(id);
    if (!p) continue;
    p.style.strokeDasharray = "1 1";
    p.style.strokeDashoffset = "1";
    p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration,
      delay,
      easing: "cubic-bezier(.45,0,.25,1)",
      fill: "forwards",
    });
  }
  seal?.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 220,
    delay: 1150,
    fill: "forwards",
  });
  LETTER_ORDER.forEach((id, k) => {
    const p = q(id);
    if (!p) return;
    const box = p.getBBox();
    const [edge, dir] = EDGES[id];
    const dist = dir > 0 ? edge - box.x + 4 : -(box.x + box.width - edge + 4);
    p.style.transform = `translateX(${dist}px)`;
    p.animate(
      [
        { transform: `translateX(${dist}px)` },
        { transform: "translateX(0px)" },
      ],
      { duration: 720, delay: 1240 + k * 70, easing: DAMP, fill: "forwards" },
    );
  });
}

// Lancement : logo Echo révélé (complet après installation ou mise à jour, bref sinon).
export function LaunchScreen({ onDone }: { onDone: () => void }): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const full = PLAY_FULL;
    const svg = logoRef.current?.querySelector("svg");
    if (full && svg) animateLogo(svg);
    const hold = full ? FULL_MS : SHORT_MS;
    const fade = setTimeout(
      () =>
        rootRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 420,
          easing: EASE,
          fill: "forwards",
        }),
      hold,
    );
    const done = setTimeout(onDone, hold + 400);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 grid place-items-center bg-[#1E1830]"
    >
      <div
        ref={logoRef}
        className="w-[min(420px,50vw)] text-white [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: logoSvg }}
      />
    </div>
  );
}
