"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollAnimateProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollAnimate({ children, className = "", delay = 0 }: ScrollAnimateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`scroll-animate ${isVisible ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

