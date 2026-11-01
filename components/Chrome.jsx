"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { gsap, prefersReduced } from "../lib/motion";
import { GoLink, useGo } from "./Transition";
import { albums, isDark, nav, posts } from "../lib/content";

/* 悬浮回顶按钮：除摄影/影集页外，向下滚动一段距离后浮现 */
export function BackToTop() {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const btnRef = useRef(null);
  useEffect(() => {
    if (isDark(location.pathname)) { setShow(false); return; }
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setShow(window.scrollY > 600);
        raf = 0;
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [location.pathname]);
  useEffect(() => {
    if (!btnRef.current) return;
    if (show) {
      gsap.to(btnRef.current, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
      btnRef.current.style.pointerEvents = "auto";
    } else {
      gsap.to(btnRef.current, { opacity: 0, y: 12, duration: 0.3, ease: "power2.in" });
      btnRef.current.style.pointerEvents = "none";
    }
  }, [show]);
  const onTop = () => {
    if (prefersReduced()) return window.scrollTo(0, 0);
    gsap.to(window, { duration: 0.7, scrollTo: { y: 0 }, ease: "power3.inOut" });
  };
  if (isDark(location.pathname)) return null;
  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onTop}
      aria-label="回到顶端"
      className="fixed bottom-7 right-7 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-hair bg-[color:var(--bg)]/85 text-[color:var(--fg)] backdrop-blur-sm transition-colors hover:border-[color:var(--fg)]"
      style={{ opacity: 0, transform: "translateY(12px)" }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ==========================================================================
   顶部：一根发丝线、七个编号、一个搜索
   ========================================================================== */
export function Nav() {
  const { go } = useGo();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [photoMenu, setPhotoMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === "Escape") setSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuRef.current) return;
    if (prefersReduced()) return;
    if (menu) {
      gsap.fromTo(
        menuRef.current,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.5, ease: "power3.inOut" }
      );
      gsap.fromTo(
        menuRef.current.querySelectorAll("[data-mi]"),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.08 }
      );
    }
  }, [menu]);

  const onNav = (e, to) => {
    e.preventDefault();
    setMenu(false);
    go(to);
  };

  /* 摄影下拉：跳到 /photography 并滚到对应锚点 */
  const goPhoto = (anchor) => {
    setMenu(false);
    if (location.pathname === "/photography") {
      const el = anchor === "top" ? null : document.getElementById(anchor);
      if (el) {
        gsap.to(window, { duration: 0.8, scrollTo: { y: el, autoKill: false }, ease: "power3.inOut" });
        return;
      }
      gsap.to(window, { duration: 0.8, scrollTo: { y: 0, autoKill: false }, ease: "power3.inOut" });
      return;
    }
    /* 先跳到摄影页，落地后滚锚点 */
    pendingPhotoAnchor.current = anchor;
    go("/photography");
  };
  const pendingPhotoAnchor = useRef(null);
  useEffect(() => {
    if (location.pathname !== "/photography") return;
    const a = pendingPhotoAnchor.current;
    if (!a) return;
    pendingPhotoAnchor.current = null;
    const t = setTimeout(() => {
      if (a === "top") {
        window.scrollTo(0, 0);
        return;
      }
      const el = document.getElementById(a);
      if (el) gsap.to(window, { duration: 0.8, scrollTo: { y: el, autoKill: false }, ease: "power3.inOut" });
    }, 650);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const dark = isDark(location.pathname);
  /* 首屏有满版暗调 hero 的页面：未滚动时导航用浅色文字 */
  const hasDarkHero =
    location.pathname === "/" ||
    location.pathname.startsWith("/photography") ||
    /^\/articles\/.+/.test(location.pathname);
  const overDark = hasDarkHero && !scrolled;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-[background-color,backdrop-filter,border-color,color] duration-500 ${
          scrolled
            ? "border-b border-hair bg-[color:var(--bg)]/95 text-[color:var(--fg)] backdrop-blur-md"
            : overDark
              ? "border-b border-transparent text-white"
              : "border-b border-transparent text-[color:var(--fg)]"
        }`}
      >
        <div className="shell flex h-[64px] items-center gap-6">
          <a
            href="/"
            onClick={(e) => onNav(e, "/")}
            className="group flex shrink-0 items-baseline gap-3"
          >
            <span className="display text-[19px] tracking-[0.02em]">拂晓和朋友们</span>
            <span className="mono hidden text-[13px] tracking-[0.05em] opacity-40 md:block">
              秦川逐雪
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-6 lg:flex">
            {nav.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== "/" && location.pathname.startsWith(item.to));
              const isPhoto = item.to === "/photography";
              return (
                <div
                  key={item.to}
                  className="group relative"
                  onMouseEnter={() => isPhoto && setPhotoMenu(true)}
                  onMouseLeave={() => isPhoto && setPhotoMenu(false)}
                >
                  <a
                    href={item.to}
                    onClick={(e) => onNav(e, item.to)}
                    className="group relative flex items-baseline gap-1.5 py-2"
                  >
                    {isPhoto && (
                      <svg
                        className="mr-0.5 h-[13px] w-[13px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.4" />
                        {[0, 60, 120, 180, 240, 300].map((d) => (
                          <line
                            key={d}
                            x1="12"
                            y1="12"
                            x2={12 + 9 * Math.cos((d * Math.PI) / 180)}
                            y2={12 + 9 * Math.sin((d * Math.PI) / 180)}
                            stroke="currentColor"
                            strokeWidth="0.7"
                            opacity="0.5"
                          />
                        ))}
                      </svg>
                    )}
                    <span
                      className={`num text-[13px] tracking-[0.04em] transition-opacity ${
                        active ? "opacity-100" : "opacity-55"
                      }`}
                    >
                      {item.k}
                    </span>
                    <span
                      className={`text-[13.5px] tracking-[0.04em] transition-opacity ${
                        active ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`absolute inset-x-0 bottom-0 h-px origin-left bg-current transition-transform duration-300 group-hover:scale-x-100 ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </a>
                  {isPhoto && photoMenu && (
                    <PhotoDropdown
                      onPick={(anchor) => {
                        setPhotoMenu(false);
                        goPhoto(anchor);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setSearch(true)}
            className="ml-auto flex items-center gap-2 lg:ml-2"
            aria-label="搜索"
          >
            <kbd className="hidden border-current opacity-40 sm:inline">⌘K</kbd>
            <span className="mono text-[13px] tracking-[0.04em] opacity-55 hover:opacity-100">搜索</span>
          </button>

          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            className="flex h-9 w-9 items-center justify-center lg:hidden"
            aria-label="菜单"
            aria-expanded={menu}
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${
                  menu ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${
                  menu ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {menu && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-[65] flex flex-col bg-[color:var(--bg)] pt-[64px] lg:hidden"
        >
          <div className="shell flex flex-1 flex-col justify-center gap-1 pb-24">
            {nav.map((item) => (
              <a
                key={item.to}
                data-mi
                href={item.to}
                onClick={(e) => onNav(e, item.to)}
                className="flex items-baseline justify-between border-b border-hair py-4"
              >
                <span className="display text-[26px]">{item.label}</span>
                <span className="num text-[13px] text-faint">{item.k}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <SearchPalette open={search} onClose={() => setSearch(false)} dark={dark} />
      <ScrollLine />
    </>
  );
}

/* 摄影下拉菜单：封面 / 影集 / 散图 */
function PhotoDropdown({ onPick }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || prefersReduced()) return;
    gsap.fromTo(
      ref.current,
      { y: -8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    gsap.fromTo(
      ref.current.querySelectorAll("[data-pd]"),
      { x: -6, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: "power2.out", delay: 0.04 }
    );
  }, []);
  const items = [
    { k: "01", label: "封面", anchor: "top" },
    { k: "02", label: "影集", anchor: "albums" },
    { k: "03", label: "散图", anchor: "scatter" },
  ];
  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-[75] min-w-[160px] border border-hair bg-[color:var(--bg)] text-[color:var(--fg)] shadow-[0_24px_60px_var(--shadow)]"
    >
      {/* 顶部 padding 拉到导航项边缘，不留 mouseleave 间隙 */}
      <div className="pt-1">
      {items.map((it) => (
        <button
          key={it.k}
          data-pd
          type="button"
          onClick={() => onPick(it.anchor)}
          className="flex w-full items-baseline gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[color:var(--bg2)]"
        >
          <span className="num text-[13px] text-faint">{it.k}</span>
          <span className="text-[13px]">{it.label}</span>
        </button>
      ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   一处很细的阅读进度：viewport 顶端的一根线
   ========================================================================== */
function ScrollLine() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[72] h-px">
      <div ref={ref} className="h-full origin-left bg-[color:var(--accent)] opacity-70" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/* ==========================================================================
   搜索：一个命令行
   ========================================================================== */
function SearchPalette({ open, onClose }) {
  const { go } = useGo();
  const [q, setQ] = useState("");
  const [cur, setCur] = useState(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const index = useMemo(() => {
    const items = [
      ...posts.map((p) => ({
        to: `/articles/${p.slug}`,
        title: p.title,
        meta: `${p.category} · ${p.date}`,
        kind: "文章",
      })),
      ...albums.map((a) => ({
        to: `/photography/${a.slug}`,
        title: a.title,
        meta: `${a.meta?.join(" · ")}`,
        kind: "影集",
      })),
      ...nav.map((n) => ({ to: n.to, title: n.label, meta: "栏目", kind: "页面" })),
    ];
    return items;
  }, []);

  const result = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return index.slice(0, 8);
    return index
      .filter((it) => (it.title + " " + it.meta + " " + it.kind).toLowerCase().includes(key))
      .slice(0, 10);
  }, [index, q]);

  useEffect(() => setCur(0), [q]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    if (!prefersReduced() && boxRef.current) {
      gsap.fromTo(
        boxRef.current,
        { y: -14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.42, ease: "power3.out" }
      );
    }
    return () => clearTimeout(t);
  }, [open]);

  const pick = (to) => {
    onClose();
    go(to);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-[color:var(--bg)]/90 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={boxRef}
        className="mx-auto mt-[12vh] w-[min(680px,92vw)] border border-hair bg-[color:var(--bg)]"
        style={{ boxShadow: "0 40px 120px var(--shadow)" }}
      >
        <div className="flex items-center gap-3 border-b border-hair px-5 py-4">
          <span className="num text-[13px] text-faint">/</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCur((c) => Math.min(result.length - 1, c + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setCur((c) => Math.max(0, c - 1));
              }
              if (e.key === "Enter" && result[cur]) pick(result[cur].to);
              if (e.key === "Escape") onClose();
            }}
            placeholder="搜一个词：光圈、雨、潜水艇"
            className="w-full bg-transparent text-[17px] outline-none placeholder:text-[color:var(--faint)]"
          />
          <kbd>esc</kbd>
        </div>
        <ul className="max-h-[52vh] overflow-y-auto py-2">
          {result.map((it, i) => (
            <li key={it.to + i}>
              <button
                type="button"
                onMouseEnter={() => setCur(i)}
                onClick={() => pick(it.to)}
                className={`flex w-full items-baseline justify-between gap-4 px-5 py-3 text-left ${
                  i === cur ? "bg-[color:var(--bg2)]" : ""
                }`}
              >
                <span className="flex items-baseline gap-3">
                  <span className="label !text-[13px] !tracking-[0.04em] text-faint">{it.kind}</span>
                  <span className="text-[15px]">{it.title}</span>
                </span>
                <span className="mono shrink-0 text-[13px] text-faint">{it.meta}</span>
              </button>
            </li>
          ))}
          {!result.length && (
            <li className="px-5 py-6 text-[14px] text-mute">没有找到。换个词试试。</li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ==========================================================================
   页脚
   ========================================================================== */
export function Footer() {
  const clock = useClock();
  return (
    <footer className="relative z-10 border-t border-hair">
      <div className="shell">
        <div className="grid grid-cols-2 gap-y-10 py-14 md:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 md:col-span-2 lg:col-span-5">
            <GoLink to="/" className="display text-[32px] leading-[0.9] tracking-[-0.02em] md:text-[43px]">
              拂晓和朋友们
            </GoLink>
            <p className="mt-4 max-w-[24em] text-[15px] leading-[1.9] text-mute">
              建成于 2017 年 4 月凌晨 世纪大道的罗森中。
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="label">栏目</p>
            <ul className="mt-4 grid grid-cols-2 gap-y-1.5">
              {nav.map((n) => (
                <li key={n.to}>
                  <GoLink
                    to={n.to}
                    className="group inline-flex items-baseline gap-2 py-0.5 text-[13px] text-mute hover:text-world"
                  >
                    <span className="num text-[13px] text-faint">{n.k}</span>
                    {n.label}
                  </GoLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="label">此刻</p>
            <p className="num mt-4 text-[15px]">{clock}</p>
            <p className="mono mt-1 text-[13px] tracking-[0.06em] text-faint">上海 · UTC+8</p>
          </div>

          <div className="lg:col-span-2">
            <p className="label">写信</p>
            <a
              href="mailto:470379769@qq.com"
              className="mt-4 inline-block border-b border-hair-s pb-1 text-[14px] hover:border-[color:var(--fg)]"
            >
              470379769@qq.com
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-hair py-5">
          <span className="mono text-[13px] tracking-[0.03em] text-faint">
            © 2017–2026 拂晓 · 苏ICP备2022037935号
          </span>
          <span className="mono flex items-center gap-3 text-[13px] tracking-[0.03em] text-faint">
            由拂晓智能体-黎明核心驱动
            <span className="h-3 w-px bg-current opacity-30" />
            博客已运行 <span className="text-[13px] text-mute">{clock}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* 博客已运行计时器：从 2017-04-07 04:45 开始 */
const BIRTH = new Date("2017-04-07T04:45:00+08:00");
function useClock() {
  const [t, setT] = useState("--");
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const ms = now - BIRTH.getTime();
      const days = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setT(`${days}天 ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}
