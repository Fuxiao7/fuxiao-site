"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap, prefersReduced, scrollToTop } from "../lib/motion";
import { isDark } from "../lib/content";

const GoCtx = createContext(null);
export const useGo = () => useContext(GoCtx);

/** 站内链接：点击走 go()（交叉溶解 + 回顶），Ctrl/⌘+点击仍开新标签 */
export function GoLink({ to, children, ...rest }) {
  const { go } = useGo();
  return (
    <a
      href={to}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        go(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/**
 * 全站统一的页面切换：交叉溶解淡入淡出。
 * 一层遮罩淡入覆盖旧页面 → 中点切路由 + 回顶 → 淡出露出新页面。
 */
export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dissolveRef = useRef(null);
  const busy = useRef(false);

  const tone = (path) => (isDark(path) ? "#08080a" : "#f2efe8");

  const runDissolve = useCallback(
    (to, done) => {
      const dissolve = dissolveRef.current;
      dissolve.style.background = tone(to);
      dissolve.classList.add("is-live");
      const tl = gsap.timeline({ onComplete: done });
      tl.set(dissolve, { opacity: 0 })
        .to(dissolve, {
          opacity: 1,
          duration: 0.32,
          ease: "power2.in",
        })
        .add(() => {
          document.documentElement.classList.toggle("dark", isDark(to));
          navigate(to);
          window.scrollTo(0, 0);
        })
        .to(dissolve, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        })
        .add(() => dissolve.classList.remove("is-live"));
      return tl;
    },
    [navigate]
  );

  const go = useCallback(
    (to) => {
      if (!to) return;
      const here = location.pathname;
      if (to === here) {
        scrollToTop(0.8);
        return;
      }
      if (busy.current) return;
      if (prefersReduced()) {
        navigate(to);
        window.scrollTo(0, 0);
        return;
      }
      busy.current = true;
      const release = () => {
        requestAnimationFrame(() => requestAnimationFrame(() => { busy.current = false; }));
      };
      runDissolve(to, release);
    },
    [location.pathname, navigate, runDissolve]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark(location.pathname));
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    document.documentElement.classList.toggle("dark", isDark(location.pathname));
  }, []);

  const value = useMemo(() => ({ go, path: location.pathname }), [go, location.pathname]);

  return (
    <GoCtx.Provider value={value}>
      {children}
      <div className="dissolve" ref={dissolveRef} aria-hidden="true" />
    </GoCtx.Provider>
  );
}
