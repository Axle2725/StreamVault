// frontend/src/hooks/useScrollReveal.ts
//
// Pairs with the .sv-reveal / .sv-visible utility classes in
// theme.css. Attach the returned ref to any element with
// className="sv-reveal" and it'll get .sv-visible added the
// moment it scrolls into view, triggering the fade/slide-up
// transition defined in theme.css.

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("sv-visible");
          observer.disconnect(); // reveal once, don't re-toggle on scroll back
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
