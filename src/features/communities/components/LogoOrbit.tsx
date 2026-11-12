import { motion } from "motion/react";
import type { Partner } from "@/data/schemas";
import { usePrefersReducedMotion } from "@/ui";
import { CommunityLogo } from "./CommunityLogo";

const RINGS = [
  { radius: 70, duration: 38, count: 3, size: 44 },
  { radius: 118, duration: 62, count: 5, size: 52 },
] as const;

/** Decorative orbit of community logos (aria-hidden; static under reduced motion). */
export function LogoOrbit({ partners }: { partners: Partner[] }) {
  const reduce = usePrefersReducedMotion();
  if (partners.length === 0) return null;
  let idx = 0;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative hidden size-[17rem] shrink-0 md:block"
    >
      <div className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft blur-xl" />
      {RINGS.map((ring, ri) => {
        const dir = ri % 2 === 0 ? 1 : -1;
        return (
          <motion.div
            key={ring.radius}
            className="absolute top-1/2 left-1/2 size-0"
            animate={reduce ? undefined : { rotate: 360 * dir }}
            transition={{ duration: ring.duration, ease: "linear", repeat: Infinity }}
          >
            <span
              className="absolute rounded-full border border-dashed border-navy/15"
              style={{
                width: ring.radius * 2,
                height: ring.radius * 2,
                left: -ring.radius,
                top: -ring.radius,
              }}
            />
            {Array.from({ length: ring.count }, (_, i) => {
              const p = partners[idx++ % partners.length];
              if (!p) return null;
              const angle = (360 / ring.count) * i + ri * 30;
              return (
                <span
                  key={`${ring.radius}-${i}`}
                  className="absolute"
                  style={{
                    transform: `rotate(${angle}deg) translateX(${ring.radius}px) rotate(${-angle}deg)`,
                  }}
                >
                  <motion.span
                    className="block"
                    style={{ marginLeft: -ring.size / 2, marginTop: -ring.size / 2 }}
                    animate={reduce ? undefined : { rotate: -360 * dir }}
                    transition={{ duration: ring.duration, ease: "linear", repeat: Infinity }}
                  >
                    <CommunityLogo name={p.name} src={p.imageUrl} size={ring.size} />
                  </motion.span>
                </span>
              );
            })}
          </motion.div>
        );
      })}
    </div>
  );
}
