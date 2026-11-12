import { useRef, type CSSProperties, type ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/cn";
import { useFinePointer, usePrefersReducedMotion } from "../effects/useMediaQuery";

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** Lift + stronger shadow on hover. Implied by `to` and `tilt`. */
  interactive?: boolean;
  /** 3D tilt following the pointer with a glare highlight (fine pointers, no reduced motion). */
  tilt?: boolean;
  /** Makes the whole card a router link. */
  to?: string;
  /** Accessible name of the link when `to` is set (otherwise inner text is used). */
  linkLabel?: string;
  /** Pass `{ viewTransitionName: "..." }` for list -> detail morphs. */
  style?: CSSProperties;
  /** Element wrapper, default div. Use "li" inside lists. */
  as?: "div" | "li" | "article";
}

/** White rounded surface with soft shadow. */
export function Card({ children, className, interactive, tilt, to, linkLabel, style, as = "div" }: CardProps) {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.45), transparent 55%)`;
  const doTilt = !!tilt && fine && !reduce;
  const lift = interactive || !!to || !!tilt;
  const Wrapper = motion[as];

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 10);
    rx.set(-(py - 0.5) * 10);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <Wrapper
      ref={ref as never}
      onPointerMove={doTilt ? onMove : undefined}
      onPointerLeave={doTilt ? reset : undefined}
      style={{ ...(doTilt ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : {}), ...style } as never}
      className={cn(
        "group relative rounded-card bg-surface shadow-card has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent-ink",
        lift && "transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lift motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      {to ? (
        <RouterLink to={to} aria-label={linkLabel} className="block h-full overflow-hidden rounded-card focus-visible:outline-none">
          {children}
        </RouterLink>
      ) : (
        children
      )}
      {doTilt && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundImage: glare }}
        />
      )}
    </Wrapper>
  );
}
