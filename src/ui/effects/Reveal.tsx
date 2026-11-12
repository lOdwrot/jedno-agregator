import type { ElementType, ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "./useMediaQuery";

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
  /** Slide distance in px (default 24). */
  y?: number;
  /** Animate only the first time it enters (default true). */
  once?: boolean;
  /** Element tag, default "div". */
  as?: "div" | "section" | "li" | "article" | "span" | "p" | "ul";
}

/** Fades & slides content up when it scrolls into view. Static under reduced motion. */
export function Reveal({ children, className, delay = 0, y = 24, once = true, as = "div" }: RevealProps) {
  const reduce = usePrefersReducedMotion();
  const Tag = motion[as] as ElementType;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}

export interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  /** Seconds between children (default 0.08). */
  stagger?: number;
  as?: "div" | "ul" | "ol" | "section";
}

/** Staggers its `RevealItem` children as the group enters the viewport. */
export function RevealGroup({ children, className, stagger = 0.08, as = "div" }: RevealGroupProps) {
  const reduce = usePrefersReducedMotion();
  const Tag = motion[as] as ElementType;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Tag>
  );
}

/** Child of `RevealGroup`; inherits the stagger. Outside a group it simply renders its content. */
export function RevealItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  const reduce = usePrefersReducedMotion();
  const Tag = motion[as] as ElementType;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag className={className} variants={item}>
      {children}
    </Tag>
  );
}
