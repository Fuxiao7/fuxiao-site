"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReduced, revealBatch, usePageFx } from "../lib/motion";
import { media, moments, tagLabel } from "../lib/content";
import { PageHead } from "../components/UI";

const TAGS = [
  { key: "all", label: "全部" },
  { key: "write", label: "写字" },
  { key: "tech", label: "技术" },
  { key: "life", label: "生活" },
  { key: "read", label: "读书" },
  { key: "photo", label: "摄影" },
];

export default function Moments() {
  const [tag, setTag] = useState("all");
  const listRef = useRef(null);

  const scope = usePageFx((root) => {
    revealBatch(root, "[data-anim]");
  }, []);

  const list = moments.filter((m) => tag === "all" || m.key === tag);

  useEffect(() => {
    if (!listRef.current || prefersReduced()) return;
    gsap.fromTo(
      listRef.current.querySelectorAll("[data-m]"),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.035, ease: "power2.out", overwrite: true }
    );
  }, [tag]);

  /* 年份分组：按数据里的 year 字段，日期降序 */
  const groups = [];
  [...list]
    .sort((a, b) => (b.year + b.date < a.year + a.date ? -1 : 1))
    .forEach((m) => {
      const last = groups[groups.length - 1];
      if (!last || last.year !== m.year) groups.push({ year: m.year, items: [m] });
      else last.items.push(m);
    });

  return (
    <div ref={scope}>
      <PageHead
        no="03"
        title="说说"
        lede="短的东西写在短的地方。一条一句，偶尔带一张照片。标签可以点，点完只看那一类。"
        meta={`${moments.length} 条 · 2025—2026`}
      />

      <div className="sticky top-[64px] z-40 border-y border-hair bg-[color:var(--bg)] backdrop-blur">
        <div className="shell flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
          <span className="mono text-[13px] tracking-[0.05em] text-faint">标签</span>
          {TAGS.map((t) => {
            const n = t.key === "all" ? moments.length : moments.filter((m) => m.key === t.key).length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTag(t.key)}
                className={`group relative pb-0.5 text-[13px] transition-colors ${
                  tag === t.key ? "text-world" : "text-mute hover:text-world"
                }`}
              >
                {t.label}
                <span className={`num ml-1.5 text-[13px] ${tag === t.key ? "text-accent" : "text-faint"}`}>
                  {n}
                </span>
                <span
                  className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-[color:var(--fg)] transition-transform duration-300 ${
                    tag === t.key ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <section className="shell pb-[clamp(70px,9vw,130px)] pt-4">
        <div ref={listRef}>
          {groups.map((g) => (
            <div key={g.year}>
              <div className="flex items-baseline justify-between border-b border-hair py-4">
                <span className="num text-[13px] tracking-[0.04em] text-faint">{g.year}</span>
                <span className="mono text-[13px] text-faint">{g.items.length} 条</span>
              </div>
              {g.items.map((m) => (
                <article
                  key={m.date + m.time}
                  data-m
                  className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-hair py-7 md:grid-cols-[110px_1fr_auto]"
                >
                  <div className="flex items-baseline gap-2 md:block md:pt-1">
                    <span className="num text-[13px]">{m.date}</span>
                    <span className="num text-[13px] text-faint md:mt-1 md:block">{m.time}</span>
                  </div>

                  <div className="max-w-[40em]">
                    {m.body.map((p, k) => (
                      <p key={k} className="mb-2 text-[15px] leading-[1.95] text-ink2 last:mb-0">
                        {p}
                      </p>
                    ))}
                    {m.images?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {m.images.map((src) => (
                          <a
                            key={src}
                            href={media(src)}
                            target="_blank"
                            rel="noreferrer"
                            className="group block overflow-hidden"
                          >
                            <img
                              src={media(src)}
                              alt=""
                              loading="lazy"
                              className="h-[180px] w-auto object-cover saturate-[0.9] transition-all duration-700 hover:saturate-100"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setTag(m.key)}
                    className="mono self-start text-[13px] tracking-[0.04em] text-faint hover:text-accent md:pt-1"
                  >
                    [#{tagLabel[m.key]}]
                  </button>
                </article>
              ))}
            </div>
          ))}
        </div>

        {!list.length && <p className="py-16 text-[14px] text-mute">这一类还没有。</p>}
      </section>
    </div>
  );
}
