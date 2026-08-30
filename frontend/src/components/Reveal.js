"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook de scroll-reveal basé sur IntersectionObserver.
 * Renvoie une ref à attacher à l'élément + un booléen `visible`.
 *
 * @param {Object} options
 * @param {number} options.threshold - proportion visible pour déclencher (0..1)
 * @param {string} options.rootMargin - marge autour du viewport
 * @param {boolean} options.once - ne se déclenche qu'une seule fois
 */
export function useReveal({
  threshold = 0.05,
  rootMargin = "0px",
  once = true,
} = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Pas d'IntersectionObserver (SSR ou vieux navigateur) : on affiche
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    // Safety net : si l'élément est déjà dans le viewport au montage
    // mais que l'observer ne déclenche pas (rare sur certains mobiles),
    // on force l'affichage après 800ms.
    const fallback = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setVisible(true);
      }
    }, 800);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [threshold, rootMargin, once]);

  return [ref, visible];
}

/**
 * Variantes d'animation disponibles pour <Reveal>.
 * Chacune correspond à une animation Tailwind définie dans tailwind.config.js.
 */
const VARIANTS = {
  up: "animate-reveal-up",
  left: "animate-reveal-left",
  right: "animate-reveal-right",
  pop: "animate-pop-in",
};

/**
 * Composant qui anime ses enfants lorsqu'ils entrent dans le viewport.
 *
 * @param {("up"|"left"|"right"|"pop")} variant - type d'animation
 * @param {number} delay - délai en ms (effet cascade)
 * @param {string} className - classes additionnelles
 * @param {boolean} as - balise/conteneur (par défaut "div")
 */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
  ...rest
}) {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={ref}
      className={`${className} ${visible ? VARIANTS[variant] || VARIANTS.up : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
