"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  animation = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: "up" | "in" | "left" | "right" | "blur";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transforms: Record<string, string> = {
    up: "translateY(40px)",
    in: "scale(0.96)",
    left: "translateX(-30px)",
    right: "translateX(30px)",
    blur: "translateY(10px)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[animation],
        filter: animation === "blur" ? (visible ? "blur(0)" : "blur(8px)") : undefined,
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
