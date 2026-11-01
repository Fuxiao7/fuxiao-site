"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { GoLink } from "../components/Transition";
import { Flip, gsap, prefersReduced, revealBatch, usePageFx } from "../lib/motion";
import { media, posts } from "../lib/content";
import { Arrow, PageHead } from "../components/UI";

const CATS = [
  { key: "all", label: "全部" },
  { key: "技术随笔", label: "技术" },
  { key: "读书", label: "读书" },
  { key: "生活", label: "生活" },
  { key: "摄影随笔", label: "摄影" },
];

export default function Articles() {
  const [view, setView] = useState("grid");
  const [cat, setCat] = useState("all");
  const listRef = useRef(null);
  const stateRef = useRef(null);

  const scope = usePageFx((root) => {
    revealBatch(root, "[data-anim]");
  }, []);

  const list = posts.filter((p) => cat === "all" || p.category === cat);

  const mutate = (fn) => {
    if (listRef.current && !prefersReduced()) {
      stateRef.current = Flip.getState(listRef.current.querySelectorAll("[data-card]"));
    }
    fn();
  };

  useLayoutEffect(() => {
    if (!stateRef.current) return;
    Flip.from(stateRef.current, {
      duration: 0.62,
      ease: "power3.inOut",
      absolute: true,
      stagger: 0.012,
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.97, duration: 0.32, ease: "power2.in" }),
    });
    stateRef.current = null;
  }, [view, cat]);

  return (
    <div ref={scope}>
      <PageHead
        no="01"
        title="文章"
        lede="写技术，也写读书和生活。多数是在晚上写的，第二天早上改一遍，然后发出来。"
        meta={`${posts.length} 篇 · 2019—2026`}
      />

      <div className="sticky top-[64px] z-40 border-y border-hair bg-[color:var(--bg)] backdrop-blur">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {CATS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => mutate(() => setCat(c.key))}
                className={`group relative pb-0.5 text-[13px] transition-colors ${
                  cat === c.key ? "text-world" : "text-mute hover:text-world"
                }`}
              >
                {c.label}
                <span
                  className={`num ml-1.5 text-[13px] ${
                    cat === c.key ? "text-accent" : "text-faint"
                  }`}
                >
                  {c.key === "all"
                    ? posts.length
                    : posts.filter((p) => p.category === c.key).length}
                </span>
                <span
                  className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-[color:var(--fg)] transition-transform duration-300 ${
                    cat === c.key ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {[
              ["grid", "网格"],
              ["list", "列表"],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => mutate(() => setView(k))}
                className={`border px-3 py-1.5 text-[13px] transition-colors ${
                  view === k
                    ? "border-[color:var(--fg)] bg-[color:var(--fg)] text-[color:var(--bg)]"
                    : "border-hair text-mute hover:text-world"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="shell pb-[clamp(70px,9vw,130px)] pt-8">
        <div
          ref={listRef}
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-x-7 gap-y-12 md:grid-cols-12"
              : "flex flex-col"
          }
        >
          {list.map((p, i) => {
            if (view === "grid") {
              const spanClass = [
                "md:col-span-7",
                "md:col-span-5",
                "md:col-span-5",
                "md:col-span-7",
                "md:col-span-6",
                "md:col-span-6",
              ][i % 6];
              const big = i % 6 !== 1 && i % 6 !== 2;
              return (
                <GoLink
                  key={p.slug}
                  to={`/articles/${p.slug}`}
                  data-card
                  data-anim
                  className={`group block ${spanClass}`}
                >
                  <div className={`overflow-hidden bg-[color:var(--bg2)] ${big ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
                    <img
                      src={media(p.cover)}
                      alt={p.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.045]"
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-6">
                    <div>
                      <p className="mono text-[13px] tracking-[0.04em] text-faint">
                        {p.category} · {p.date}
                      </p>
                      <h2 className="mt-2 text-[clamp(17px,1.6vw,22px)] leading-[1.45] group-hover:underline group-hover:decoration-[0.5px] group-hover:underline-offset-[6px]">
                        {p.title}
                      </h2>
                      <p className="mt-2 max-w-[30em] text-[15px] leading-[1.85] text-mute">
                        {p.excerpt}
                      </p>
                    </div>
                    <span className="num shrink-0 pt-1 text-[13px] text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </GoLink>
              );
            }
            return (
              <GoLink
                key={p.slug}
                to={`/articles/${p.slug}`}
                data-card
                className="group grid grid-cols-[92px_1fr] items-start gap-5 border-b border-hair py-5 first:border-t md:grid-cols-[160px_1fr_auto] md:items-center md:gap-8"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[color:var(--bg2)]">
                  <img
                    src={media(p.cover)}
                    alt={p.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div>
                  <p className="mono text-[13px] tracking-[0.04em] text-faint">
                    {p.category} · {p.date}
                  </p>
                  <h2 className="mt-1.5 text-[clamp(16px,1.5vw,20px)] leading-[1.4] group-hover:underline group-hover:underline-offset-[5px]">
                    {p.title}
                  </h2>
                  <p className="mt-1.5 hidden max-w-[46em] text-[13px] leading-[1.8] text-mute md:block">
                    {p.excerpt}
                  </p>
                </div>
                <Arrow className="hidden text-faint transition-transform duration-300 group-hover:translate-x-1 md:block" />
              </GoLink>
            );
          })}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-hair pt-6">
          <p className="text-[13px] text-mute">
            更早的文章按年份收在归档里，一共 {posts.length} 篇。
          </p>
          <GoLink
            to="/archive"
            className="group inline-flex items-center gap-2 text-[13px] text-mute hover:text-world"
          >
            去归档
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </GoLink>
        </div>
      </section>
    </div>
  );
}
