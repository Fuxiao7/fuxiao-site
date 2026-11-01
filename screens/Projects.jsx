"use client";

import { useMemo, useState } from "react";
import { gsap, prefersReduced, revealBatch, usePageFx } from "../lib/motion";
import { media, projectTagLabel, projectTags, projects } from "../lib/content";
import { PageHead } from "../components/UI";

export default function Projects() {
  const [tag, setTag] = useState("all");
  const scope = usePageFx((root) => {
    revealBatch(root, "[data-anim]");
    if (prefersReduced()) return;
    gsap.utils.toArray("[data-proj]").forEach((row) => {
      const bar = row.querySelector("[data-bar]");
      const to = bar?.dataset.to || "0%";
      gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: to,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 82%", once: true },
        }
      );
      gsap.fromTo(
        row.querySelectorAll("[data-shot]"),
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 84%", once: true },
        }
      );
    });
  }, []);

  const list = useMemo(
    () => (tag === "all" ? projects : projects.filter((p) => (p.tags || []).includes(tag))),
    [tag]
  );
  const counts = useMemo(() => {
    const c = { all: projects.length };
    projectTags.forEach((t) => {
      c[t] = projects.filter((p) => (p.tags || []).includes(t)).length;
    });
    return c;
  }, []);

  return (
    <div ref={scope}>
      <PageHead
        no="04"
        title="项目"
        lede="动手的那部分。有的是给自己造的工具，有的是为了弄明白一件事。状态都写在上面，不美化。"
        meta={`${projects.length} 个 · 2023—2026`}
      />

      {/* 标签筛选栏 */}
      <section className="shell">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-hair py-3">
          <FilterBtn label="全部" count={counts.all} active={tag === "all"} onClick={() => setTag("all")} />
          {projectTags.map((t) => (
            <FilterBtn
              key={t}
              label={projectTagLabel[t]}
              count={counts[t]}
              active={tag === t}
              onClick={() => setTag(t)}
            />
          ))}
        </div>
      </section>

      <section className="shell">
        {list.map((p, i) => (
          <article
            key={p.title}
            data-proj
            data-anim
            className="grid items-start gap-x-10 gap-y-6 border-t border-hair py-[clamp(36px,5vw,70px)] lg:grid-cols-12"
          >
            <div className={`lg:col-span-5 ${i % 2 ? "lg:order-2 lg:col-start-8" : ""}`}>
              <h2 data-anim className="display text-[clamp(26px,3.4vw,40px)]">
                <span className="num mr-4 align-baseline text-[0.38em] tracking-[0.03em] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p.title}
              </h2>
              <p data-anim className="mono mt-3 text-[13px] tracking-[0.03em] text-faint">
                {p.status} · {p.when}
              </p>
              <p data-anim className="mt-4 max-w-[26em] text-[15px] leading-[1.95] text-mute">
                {p.say}
              </p>

              <div data-anim className="mt-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-[color:var(--line)]">
                  <div
                    data-bar
                    data-to={p.pct || "0%"}
                    className="h-px bg-[color:var(--fg)]"
                    style={{ width: p.pct || "0%" }}
                  />
                </div>
                <span className="num text-[13px] text-faint">{p.pct}</span>
              </div>

              <ul data-anim className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5">
                {p.spec.map((s) => (
                  <li key={s} className="mono text-[13px] tracking-[0.04em] text-mute">
                    <span className="mr-1 text-faint">[+]</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`grid gap-2 md:grid-cols-2 lg:col-span-6 ${
                i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-7"
              }`}
            >
              {(p.images || []).map((src, k) => (
                <div
                  key={src + k}
                  data-shot
                  className={`overflow-hidden bg-[color:var(--bg2)] ${
                    k === 0 ? "md:col-span-2 aspect-[16/10]" : "aspect-[4/3]"
                  }`}
                >
                  <img
                    src={media(src)}
                    alt={`${p.title} 的截图`}
                    loading="lazy"
                    className="h-full w-full object-cover saturate-[0.9] transition-transform duration-[1200ms] hover:scale-[1.03]"
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
        {!list.length && (
          <p className="py-20 text-center text-[14px] text-mute">这个标签下还没有项目。</p>
        )}
      </section>

      <section className="shell pb-[clamp(70px,9vw,120px)] pt-10">
        <div className="border-t border-hair pt-6">
          <p className="label">还没开始的</p>
          <ul className="mt-5 grid gap-x-10 gap-y-3 md:grid-cols-2">
            {[
              ["把冲扫流程写成脚本", "停在色彩管理"],
              ["一个只读 RSS 的阅读器", "想清楚之前不动手"],
              ["给影集做一个可分享的排版器", "等这本册子做满"],
            ].map(([t, note]) => (
              <li key={t} data-anim className="flex items-baseline justify-between border-b border-hair py-3">
                <span className="text-[14px]">{t}</span>
                <span className="mono text-[13px] text-faint">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function FilterBtn({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex items-baseline gap-1.5 py-1 text-[13px] transition-colors"
    >
      <span className={`num text-[13px] ${active ? "text-accent" : "text-faint"}`}>{count}</span>
      <span className={`${active ? "text-world" : "text-mute group-hover:text-world"}`}>{label}</span>
      <span
        className={`absolute -bottom-0 left-0 h-px w-full origin-left bg-[color:var(--fg)] transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </button>
  );
}
