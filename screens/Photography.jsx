"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoLink } from "../components/Transition";
import { Flip, gsap, prefersReduced, ScrollTrigger, usePageFx } from "../lib/motion";
import { albums, media, photos, scatter } from "../lib/content";
import { Arrow } from "../components/UI";

const SIZES = [
  { key: 2, label: "大" },
  { key: 3, label: "中" },
  { key: 4, label: "小" },
];

export default function Photography() {
  /* 散图优先：默认展示散图区块，用户切到「全部作品」后才显示照片墙 */
  const [mode, setMode] = useState("stack");
  const [panel, setPanel] = useState("scatter");
  const [cols, setCols] = useState(() => {
    if (typeof window === "undefined") return 3;
    const saved = Number(localStorage.getItem("dx-ph-size"));
    return [2, 3, 4].includes(saved) ? saved : 3;
  });
  const [box, setBox] = useState(null);

  const sectionRef = useRef(null);   // 影集区块
  const wallRef = useRef(null);      // 照片墙区块（含 sticky header）
  const scatterRef = useRef(null);   // 散图区块
  const countRef = useRef(null);
  const nameRef = useRef(null);
  const stageRef = useRef(null);
  const deckRef = useRef(null);
  const panelRef = useRef(null);

  const scope = usePageFx((root) => {
    if (prefersReduced()) return;
    gsap.fromTo(
      root.querySelectorAll("[data-ph-fade]"),
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.08, delay: 0.25, ease: "power3.out" }
    );
    gsap.to(root.querySelector("[data-ph-hero-img]"), {
      yPercent: 10,
      scale: 1.06,
      ease: "none",
      scrollTrigger: { trigger: root.querySelector("[data-ph-hero]"), start: "top top", end: "bottom top", scrub: true },
    });
  }, []);

  /* ------------------------------------------------------------ 影集：堆叠一叠 */
  useEffect(() => {
    if (mode !== "stack" || prefersReduced()) return undefined;
    const cards = gsap.utils.toArray("[data-card]", deckRef.current);
    if (!cards.length) return undefined;

    const s2dim = (over) => (over > 0 ? 0 : Math.min(3.4, -over));

    const apply = (p) => {
      const f = p * (cards.length - 1);
      const active = Math.round(f);
      cards.forEach((c, i) => {
        const over = f - i;
        if (over > 0) {
          const t = Math.min(1, Math.max(0, (over - 0.42) / 0.58));
          gsap.set(c, {
            y: -150 * t, x: -26 * t, rotate: -4 * t,
            opacity: 1 - t, scale: 1 + 0.02 * t,
            pointerEvents: t > 0.9 ? "none" : "auto",
          });
          c.style.zIndex = 60 - i;
        } else {
          const s2 = Math.min(3.4, -over);
          gsap.set(c, {
            y: s2 * 15, x: s2 * 9, rotate: 0,
            opacity: 1, scale: 1 - s2 * 0.014,
            pointerEvents: "auto",
          });
          c.style.zIndex = 50 - i;
        }
        const t2 = over > 0 ? Math.min(1, (over - 0.42) / 0.58) : 0;
        const dimBehind = Math.min(0.62, 0.24 + s2dim(over) * 0.14);
        c.style.setProperty("--dim", over > 0 ? String(t2 * 0.35) : String(dimBehind));
      });
      if (countRef.current) countRef.current.textContent = String(active + 1).padStart(2, "0");
      const rail = deckRef.current?.parentElement?.querySelectorAll("[data-jump]");
      if (rail) [].forEach.call(rail, (b, i) => b.classList.toggle("is-on", i === active));
      if (nameRef.current) nameRef.current.textContent = albums[active]?.title || "";
    };

    apply(0);
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      /* 阶段性切换：滚一下吸附到一张卡，平滑过渡 */
      snap: {
        snapTo: 1 / (cards.length - 1),
        duration: { min: 0.4, max: 0.6 },
        ease: "power3.inOut",
        inertia: false,
      },
    });
    return () => trigger.kill();
  }, [mode]);

  useEffect(() => {
    if (mode !== "tiles" || !deckRef.current) return;
    const cards = gsap.utils.toArray("[data-card]", deckRef.current);
    gsap.set(cards, { clearProps: "transform,opacity,zIndex,pointerEvents" });
  }, [mode]);

  /* 面板切换呼吸 */
  useEffect(() => {
    if (!panelRef.current || prefersReduced()) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }
    );
  }, [panel, cols]);

  /* 密度切换：Flip 平滑重排，且给图片加 will-change 防闪烁 */
  const flipRef = useRef(null);
  const changeCols = useCallback((n) => {
    setCols((prev) => {
      if (prev === n) return prev;
      const wall = panelRef.current?.querySelector('[data-wall-grid]');
      if (wall && !prefersReduced() && window.matchMedia("(min-width: 768px)").matches) {
        /* 抓快照前给每张图锁定尺寸，避免 reflow 时图先缩后胀 */
        gsap.utils.toArray("img", wall).forEach((img) => {
          const r = img.getBoundingClientRect();
          img.style.width = r.width + "px";
          img.style.height = r.height + "px";
        });
        flipRef.current = Flip.getState(wall.children);
      }
      try { localStorage.setItem("dx-ph-size", String(n)); } catch {}
      return n;
    });
  }, []);

  useEffect(() => {
    if (!flipRef.current) return;
    const state = flipRef.current;
    flipRef.current = null;
    Flip.from(state, {
      duration: 0.66,
      ease: "power3.inOut",
      stagger: 0.01,
      absolute: true,
      scale: false,
      onComplete: () => {
        const wall = panelRef.current?.querySelector('[data-wall-grid]');
        if (wall) gsap.utils.toArray("img", wall).forEach((img) => { img.style.width = ""; img.style.height = ""; });
      },
    });
  }, [cols]);

  /* 跳到全部作品区块：避开必须滚完影集 */
  const jumpToWall = useCallback(() => {
    const el = wallRef.current;
    if (!el) return;
    if (prefersReduced()) { el.scrollIntoView(); return; }
    gsap.to(window, { duration: 0.9, scrollTo: { y: el, offsetY: 64, autoKill: false }, ease: "power3.inOut" });
  }, []);

  /* 模式切换：堆叠→垂直居中点；并列→区块顶 */
  const switchMode = useCallback((k) => {
    setMode(k);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (k === "stack") {
          /* 滚到堆叠卡片的垂直居中：section 中段 */
          const el = sectionRef.current;
          if (!el) return;
          const top = el.getBoundingClientRect().top + window.scrollY;
          const span = el.offsetHeight - window.innerHeight;
          if (prefersReduced()) window.scrollTo(0, top + span / 2);
          else gsap.to(window, { duration: 0.8, scrollTo: { y: top + span / 2, autoKill: false }, ease: "power3.inOut" });
        } else {
          /* 并列：滚到区块顶（紧贴 sticky header 下方） */
          const el = sectionRef.current;
          if (!el) return;
          if (prefersReduced()) el.scrollIntoView();
          else gsap.to(window, { duration: 0.8, scrollTo: { y: el, offsetY: 64, autoKill: false }, ease: "power3.inOut" });
        }
        ScrollTrigger.refresh();
      });
    });
  }, []);

  const jump = useCallback((i) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const y = top + (i / Math.max(1, albums.length - 1)) * span + 2;
    if (prefersReduced()) window.scrollTo(0, y);
    else gsap.to(window, { duration: 0.8, scrollTo: { y, autoKill: false }, ease: "power3.inOut" });
  }, []);

  return (
    <div ref={scope} className="bg-[color:var(--bg)] text-[color:var(--fg)]">
      {/* ------------------------------------------------------------- hero（封面） */}
      <section data-ph-hero className="relative h-[100svh] min-h-[560px] overflow-hidden">
        <img
          data-ph-hero-img
          src={media("pt-660.jpg")}
          alt="夜里，一个女孩双手捧着一支燃着的仙女棒"
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-[50%_45%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(3,3,4,0.94),rgba(3,3,4,0.28)_46%,rgba(3,3,4,0.55))]" />

        <div className="relative z-10 flex h-full flex-col justify-between pb-[clamp(26px,5vw,52px)] pt-[92px] text-white">
          <div className="shell flex items-start justify-between">
            <div data-ph-fade className="mono flex items-center gap-3 text-[13px] tracking-[0.05em] text-white/75">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d15b34]" />
              暗房 · DARKROOM
            </div>
            <div data-ph-fade className="mono hidden text-right text-[13px] leading-[2] tracking-[0.04em] text-white/70 sm:block">
              02 / 摄影
              <br />
              人像 · 夜景 · 胶片
            </div>
          </div>

          <div className="shell">
            <h1
              data-ph-fade
              className="display"
              style={{ fontSize: "clamp(72px, 15vw, 230px)", lineHeight: 0.84, letterSpacing: "0.04em" }}
            >
              摄影
            </h1>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
              <p data-ph-fade className="max-w-[26em] text-[clamp(14px,1.4vw,17px)] leading-[1.9] text-white/80">
                我拍人像，多数是女孩。七个影集、七十一张，都拍在太阳落下去以后。
                这里没有别的，只有光、表情，和一个不太会说话的人。
              </p>
              <p data-ph-fade className="mono text-[13px] leading-[2] tracking-[0.04em] text-white/70">
                71 张照片 · 7 个影集
                <br />
                2024.03 — 2026.10
              </p>
            </div>
          </div>
        </div>

        {/* 悬浮跳转：一键到全部作品 */}
        <button
          type="button"
          onClick={jumpToWall}
          aria-label="跳到全部作品"
          className="absolute bottom-7 right-7 z-20 flex items-center gap-2 border border-white/30 bg-black/30 px-4 py-2.5 text-[13px] tracking-[0.04em] text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
        >
          全部作品
          <Arrow className="h-[11px] w-[11px]" />
        </button>
      </section>

      {/* ----------------------------------------------------------- 影集 */}
      <section ref={sectionRef} id="albums" className="relative">
        <div className="sticky top-[64px] z-50 border-b border-hair bg-[color:var(--bg)]">
          <div className="shell flex flex-wrap items-center justify-between gap-4 py-3">
            <div className="flex items-baseline gap-5">
              <span className="num text-[13px] tracking-[0.05em] text-faint">01</span>
              <h2 className="display text-[clamp(24px,3.2vw,36px)]">影集</h2>
              <span className="mono text-[13px] text-mute">
                <span ref={countRef}>01</span>
                <span className="text-faint"> / {String(albums.length).padStart(2, "0")}</span>
                <span className="ml-2 text-faint">·</span>
                <span ref={nameRef} className="ml-2 text-mute">{albums[0].title}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="mono text-[13px] tracking-[0.04em] text-faint">阅读模式</span>
              <div className="flex items-center gap-1 border border-hair p-0.5">
                {[
                  ["stack", "堆叠"],
                  ["tiles", "并列"],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => switchMode(k)}
                    className={`px-3 py-1.5 text-[13px] transition-colors ${
                      mode === k
                        ? "bg-[color:var(--fg)] text-[color:var(--bg)]"
                        : "text-mute hover:text-world"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {mode === "stack" ? (
          <div
            className="relative"
            style={{ height: `calc(100svh + ${(albums.length - 1) * 54}svh)` }}
          >
            <div
              ref={stageRef}
              className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden"
            >
              <div ref={deckRef} className="relative h-[74svh] w-[min(1120px,92vw)] md:h-[min(66svh,560px)]">
                {albums.map((a, i) => (
                  <GoLink
                    key={a.slug}
                    to={`/photography/${a.slug}`}
                    data-card
                    className="group absolute inset-0 grid grid-cols-1 overflow-hidden border border-hair bg-[color:var(--bg2)] will-change-transform md:grid-cols-[1.12fr_1fr]"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={media(a.coverFile)}
                        alt={a.cover_alt}
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
                      />
                      <span className="absolute left-4 top-4 mono bg-black/55 px-2 py-1 text-[13px] tracking-[0.04em] text-white/85 backdrop-blur-sm">
                        {a.no}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center gap-4 px-[clamp(18px,3vw,44px)] py-8">
                      <p className="mono text-[13px] tracking-[0.04em] text-faint">
                        {a.meta.join(" · ")}
                      </p>
                      <h3 className="display text-[clamp(24px,3.2vw,42px)] leading-[1.15] text-chalk">
                        {a.title}
                      </h3>
                      <p className="hidden max-w-[30em] text-[13.5px] leading-[1.95] text-chalk2 sm:block">
                        {a.lead}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-2 text-[13px] text-white/70 transition-colors group-hover:text-white">
                        看影集
                        <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[#040405] transition-opacity duration-500"
                      style={{ opacity: "var(--dim,0)" }}
                    />
                  </GoLink>
                ))}
              </div>

              {/* 右侧 01-07 高透悬浮数字点选轨 */}
              <div className="absolute right-[clamp(12px,2.2vw,30px)] top-1/2 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
                {albums.map((a, i) => (
                  <button
                    key={a.slug}
                    type="button"
                    onClick={() => jump(i)}
                    data-jump
                    className="group flex items-center justify-end gap-2.5"
                    aria-label={`第 ${i + 1} 册 ${a.title}`}
                  >
                    <span className="mono text-[13px] tracking-[0.06em] text-chalk opacity-25 transition-opacity duration-300 group-hover:opacity-90 group-[.is-on]:opacity-100 group-[.is-on]:text-[color:var(--accent)]">
                      {a.no}
                    </span>
                    <span className="h-px w-3 bg-[color:var(--line-s)] opacity-40 transition-all duration-300 group-hover:w-6 group-hover:opacity-90 group-hover:bg-[color:var(--fg)] group-[.is-on]:w-7 group-[.is-on]:opacity-100 group-[.is-on]:bg-[color:var(--accent)]" />
                  </button>
                ))}
              </div>

              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 mono text-[13px] tracking-[0.05em] text-faint">
                滚动 · 一张一张翻过去
              </p>
            </div>
          </div>
        ) : (
          /* 并列模式：每张卡 hover 时在卡片内浮现简介 */
          <div className="shell grid grid-cols-2 gap-x-4 gap-y-10 pb-16 pt-4 md:grid-cols-3 xl:grid-cols-4">
            {albums.map((a) => (
              <GoLink
                key={a.slug}
                to={`/photography/${a.slug}`}
                data-card
                data-hovercard
                className="group relative block"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-[color:var(--bg2)]">
                  <img
                    src={media(a.coverFile)}
                    alt={a.cover_alt}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                  {/* 简介浮层：hover 时从底部升起 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-[#040405] via-[#040405]/88 to-transparent p-4 pt-12 text-white transition-transform duration-[420ms] ease-out group-hover:translate-y-0">
                    <p className="mono text-[13px] tracking-[0.04em] text-white/70">
                      {a.meta.join(" · ")}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-[1.7] text-white/90">
                      {a.lead}
                    </p>
                  </div>
                  <span className="absolute left-3 top-3 mono bg-black/55 px-1.5 py-0.5 text-[13px] tracking-[0.04em] text-white/85 backdrop-blur-sm">
                    {a.no}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] group-hover:underline group-hover:underline-offset-4">
                    {a.title}
                  </h3>
                  <span className="mono text-[13px] text-faint">{a.shots} 张</span>
                </div>
                <p className="mono mt-1 text-[13px] tracking-[0.03em] text-faint">
                  {a.meta[0]} · {a.meta[1]}
                </p>
              </GoLink>
            ))}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------- 照片：散图优先 */}
      <section ref={(el) => { scatterRef.current = el; wallRef.current = el; }} id="scatter" className="border-t border-hair">
        <div className="sticky top-[64px] z-40 border-b border-hair bg-[color:var(--bg)] backdrop-blur">
          <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-3">
            <div className="flex items-baseline gap-5">
              <span className="num text-[13px] tracking-[0.05em] text-faint">02</span>
              <h2 className="text-[17px]">{panel === "wall" ? "全部作品" : "散图"}</h2>
              <span className="mono text-[13px] text-faint">
                {panel === "wall" ? `${photos.length} 张` : `${scatter.length} 张`}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* 散图在左，全部作品在右 */}
              <div className="flex items-center gap-1 border border-hair p-0.5">
                {[
                  ["scatter", "散图"],
                  ["wall", "全部作品"],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPanel(k)}
                    className={`px-3 py-1.5 text-[13px] transition-colors ${
                      panel === k
                        ? "bg-[color:var(--fg)] text-[color:var(--bg)]"
                        : "text-mute hover:text-world"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 视图大小：散图与全部作品都显示 */}
              <div className="flex items-center gap-3">
                <span className="mono text-[13px] tracking-[0.04em] text-faint">视图大小</span>
                {SIZES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => changeCols(s.key)}
                    className={`relative pb-1 text-[13px] transition-colors ${
                      cols === s.key ? "text-world" : "text-mute hover:text-world"
                    }`}
                  >
                    {s.label}
                    <span
                      className={`absolute -bottom-0 left-0 h-px w-full origin-left bg-[color:var(--accent)] transition-transform ${
                        cols === s.key ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div ref={panelRef} className="shell pb-20 pt-6">
          {panel === "scatter" ? (
            <div className="flex flex-col gap-6">
              {[scatter.slice(0, 3), scatter.slice(3)].map((row, r) => (
                <div key={r} className="flex flex-wrap items-end gap-2 md:gap-3">
                  {row.map((p, i) => (
                    <button
                      key={p.img}
                      type="button"
                      onClick={() => setBox({ list: scatter, i: scatter.indexOf(p) })}
                      className="group block"
                      style={{ flex: "0 0 auto" }}
                    >
                      <div className="overflow-hidden bg-[color:var(--bg2)]">
                        <img
                          src={media(p.img)}
                          alt={p.alt}
                          loading="lazy"
                          className={`w-auto object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02] ${
                            i % 2 === 0 ? "h-[clamp(180px,34svh,340px)]" : "h-[clamp(150px,26svh,260px)]"
                          }`}
                        />
                      </div>
                      <p className="mono mt-2 text-[13px] tracking-[0.06em] text-faint">
                        <span className="text-chalk2">{p.title}</span>
                        <span className="ml-2">{p.exif.split("·")[0].trim()}</span>
                      </p>
                    </button>
                  ))}
                </div>
              ))}
              <p className="mono max-w-[44em] text-[13px] leading-[2] tracking-[0.04em] text-faint">
                散图不进影集：试光、收工前最后一张、忘了为什么按的。点开看大图，方向键翻。
              </p>
            </div>
          ) : (
            <div
              data-wall-grid
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {photos.map((p) => (
                <button
                  key={p.img}
                  type="button"
                  onClick={() => setBox({ list: photos, i: photos.indexOf(p) })}
                  className="group block text-left"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--bg2)]">
                    <img
                      src={media(p.img)}
                      alt={p.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    />
                    <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/0 transition group-hover:ring-white/20" />
                  </div>
                  <p className="mono mt-2 flex items-baseline justify-between gap-2 text-[13px] tracking-[0.06em] text-faint">
                    <span className="truncate text-chalk2">{p.title}</span>
                    <span className="shrink-0">{p.exif.split("·")[0].trim()}</span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ 收尾 */}
      <section className="border-t border-hair">
        <div className="shell grid gap-8 py-[clamp(56px,8vw,110px)] lg:grid-cols-12">
          <h2 className="display text-[clamp(26px,4vw,46px)] leading-[1.2] lg:col-span-7">
            纸面上是灰的，
            <br />
            只有在暗房里才有颜色。
          </h2>
          <div className="lg:col-span-5 lg:pl-10">
            <p className="text-[15px] leading-[1.95] text-mute">
              整站只有这一处上色。想回到文字那一侧，走廊在左边：技术、读书、生活都在那儿。
            </p>
            <GoLink
              to="/articles"
              className="group mt-6 inline-flex items-center gap-3 border border-hair-s px-5 py-3 text-[13px] hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)]"
            >
              回到书写
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </GoLink>
          </div>
        </div>
      </section>

      {box && (
        <Lightbox
          list={box.list}
          index={box.i}
          onClose={() => setBox(null)}
          onIndex={(i) => setBox((b) => ({ ...b, i }))}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   灯箱
   ========================================================================== */
function Lightbox({ list, index, onClose, onIndex }) {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const item = list[index];

  useEffect(() => {
    if (prefersReduced()) return;
    gsap.fromTo(wrapRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(
      imgRef.current,
      { scale: 0.94, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.55, ease: "power3.out" }
    );
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % list.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + list.length) % list.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, list.length, onClose, onIndex]);

  return (
    <div
      ref={wrapRef}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[100] flex flex-col bg-[#040405] text-chalk"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="mono text-[13px] tracking-[0.04em] text-chalk2">
          {String(index + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
        </span>
        <button type="button" onClick={onClose} className="mono text-[13px] tracking-[0.04em] text-chalk2 hover:text-white">
          关闭 · ESC
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
        <button
          type="button"
          onClick={() => onIndex((index - 1 + list.length) % list.length)}
          className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center text-chalk2 hover:text-white"
          aria-label="上一张"
        >
          ←
        </button>
        <img
          key={item.img}
          ref={imgRef}
          src={media(item.img)}
          alt={item.alt}
          className="max-h-full max-w-full object-contain"
        />
        <button
          type="button"
          onClick={() => onIndex((index + 1) % list.length)}
          className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center text-chalk2 hover:text-white"
          aria-label="下一张"
        >
          →
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5">
        <div>
          <h3 className="text-[16px]">{item.title}</h3>
          <p className="mono mt-1 text-[13px] tracking-[0.03em] text-chalk2">{item.exif}</p>
        </div>
        <p className="mono text-[13px] tracking-[0.04em] text-[color:#6b6862]">← → 翻 · 点空白处关闭</p>
      </div>
    </div>
  );
}
