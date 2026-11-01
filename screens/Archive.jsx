"use client";

import { GoLink } from "../components/Transition";
import { archive } from "../lib/content";
import { revealBatch, usePageFx } from "../lib/motion";
import { PageHead } from "../components/UI";

export default function Archive() {
  const scope = usePageFx((root) => {
    revealBatch(root, "[data-anim]");
  }, []);

  const total = archive.reduce((n, g) => n + g.rows.length, 0);

  return (
    <div ref={scope}>
      <PageHead
        no="05"
        title="归档"
        lede="全部文章按年份排。标题、日期、分类，没有摘要也没有缩略图，翻起来快。"
        meta={`${total} 篇 · ${archive.length} 年`}
      />

      <div className="shell pb-[clamp(70px,9vw,120px)]">
        <div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-hair py-3">
          {archive.map((g) => (
            <a
              key={g.year}
              href={`#y${g.year}`}
              className="mono text-[13px] tracking-[0.03em] text-mute hover:text-world"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(`y${g.year}`);
                if (!el) return;
                window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
              }}
            >
              {g.year}
              <span className="ml-1.5 text-faint">{g.rows.length}</span>
            </a>
          ))}
        </div>

        {archive.map((g) => (
          <section key={g.year} id={`y${g.year}`} className="pt-[150px] lg:pt-[clamp(48px,4.6vw,62px)]">
            <div data-anim className="flex items-baseline justify-between border-b border-hair pb-2">
              <h2 className="display num text-[clamp(26px,3.4vw,40px)] leading-none">{g.year}</h2>
              <span className="mono text-[13px] text-faint">{g.rows.length} 篇</span>
            </div>

            <ul>
              {g.rows.map((r, i) => (
                <li key={r.date + r.title} data-anim>
                  <GoLink
                    to="/articles/p0"
                    className="group grid grid-cols-[52px_1fr_auto] items-baseline gap-x-5 border-b border-hair py-3.5 transition-colors md:grid-cols-[70px_1fr_120px]"
                  >
                    <span className="num text-[13px] tracking-[0.04em] text-faint transition-colors group-hover:text-accent">
                      {r.date}
                    </span>
                    <span className="text-[15px] leading-[1.6] transition-transform duration-300 group-hover:translate-x-1 group-hover:underline group-hover:underline-offset-4">
                      {r.title}
                    </span>
                    <span className="mono text-right text-[13px] tracking-[0.06em] text-faint">
                      {r.cat}
                    </span>
                  </GoLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
