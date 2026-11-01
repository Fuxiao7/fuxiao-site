"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, Flip };

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 在一个页面级 scope 里跑 GSAP，卸载时整体 revert */
export function usePageFx(setup, deps = []) {
  const scope = useRef(null);
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const ctx = gsap.context(() => {
      setup(scope.current);
      ScrollTrigger.refresh();
    }, scope.current);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return scope;
}

/** 通用入场：进入视口就浮上来，只跑一次 */
export function revealBatch(root, selector = "[data-anim]") {
  const els = gsap.utils.toArray(selector, root);
  if (!els.length) return;
  if (prefersReduced()) {
    gsap.set(els, { opacity: 1, y: 0 });
    return;
  }
  gsap.set(els, { opacity: 0, y: 26 });
  ScrollTrigger.batch(els, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: "power3.out",
        stagger: 0.055,
        overwrite: true,
        delay: 0.04,
      }),
  });
}

/** 把一个标题拆成可动的字（中文按字，英文按词） */
export function splitLines(el) {
  if (!el) return [];
  const text = el.textContent || "";
  el.textContent = "";
  const out = [];
  [...text].forEach((ch) => {
    if (ch === " ") {
      el.appendChild(document.createTextNode(" "));
      return;
    }
    const wrap = document.createElement("span");
    wrap.style.display = "inline-block";
    wrap.style.overflow = "hidden";
    wrap.style.verticalAlign = "top";
    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.textContent = ch;
    wrap.appendChild(inner);
    el.appendChild(wrap);
    out.push(inner);
  });
  return out;
}

export function scrollToTop(duration = 0.85) {
  if (prefersReduced()) {
    window.scrollTo(0, 0);
    return;
  }
  gsap.to(window, {
    scrollTo: { y: 0, autoKill: false },
    duration,
    ease: "power2.inOut",
    overwrite: true,
  });
}
