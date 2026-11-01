"use client";

import { about, media } from "../lib/content";
import { gsap, prefersReduced, revealBatch, usePageFx } from "../lib/motion";
import { PageHead } from "../components/UI";

export default function About() {
  const scope = usePageFx((root) => {
    revealBatch(root, "[data-anim]");
    if (prefersReduced()) return;
    gsap.fromTo(
      root.querySelector("[data-portrait]"),
      { scale: 1.08, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.4, ease: "power3.out" }
    );
  }, []);

  return (
    <div ref={scope}>
      <PageHead
        no="07"
        title="关于"
        lede="拂晓，前端工程师，住在杭州。这个站从 2019 年写到现在，没有换过域名，也没有换过主题。"
        meta="杭州 · 一个人 · 一周一篇"
      />

      <section className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
        <figure data-anim className="lg:col-span-4">
          <div className="overflow-hidden bg-[color:var(--bg2)]">
            <img
              data-portrait
              src={media("portrait-alt.jpg")}
              alt="雾天窗前的人影，站在钢架与天光之间"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <figcaption className="mono mt-3 text-[13px] leading-[1.8] tracking-[0.04em] text-faint">
            这张是朋友拍的，雾天，我家窗前。
          </figcaption>
        </figure>

        <div className="lg:col-span-7 lg:col-start-6">
          {about.bio.map((p, i) => (
            <p
              key={i}
              data-anim
              className={
                i === 0
                  ? "display text-[clamp(20px,2.2vw,27px)] leading-[1.7]"
                  : "mt-5 text-[15px] leading-[2] text-ink2"
              }
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="shell pt-[clamp(50px,7vw,100px)]">
        <div className="grid gap-x-10 gap-y-10 border-t border-hair pt-8 md:grid-cols-3">
          {about.cols.map((col) => (
            <div key={col.title} data-anim>
              <h2 className="mono text-[13px] tracking-[0.05em] text-faint">{col.title}</h2>
              <ul className="mt-4">
                {col.items.map((it) => (
                  <li key={it} className="border-b border-hair py-2.5 text-[14px] leading-[1.7] text-ink2">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="shell pb-[clamp(70px,9vw,120px)] pt-[clamp(50px,7vw,100px)]" id="credits">
        <div className="grid gap-8 border-t border-hair pt-6 lg:grid-cols-12">
          <h2 className="mono text-[13px] tracking-[0.05em] text-faint lg:col-span-3">图片来源</h2>
          <div className="lg:col-span-8 lg:col-start-4">
            <p className="text-[13.5px] leading-[1.95] text-mute">
              照片来自 Unsplash（Unsplash License，可商用、需署名）。人像部分取自同一图库，
              它们是占位素材，等我自己拍够一组就换掉。影集里的模特姓名、故事与 EXIF 都是示例，
              不是这些照片的真实信息。
            </p>
            <p className="mt-4 text-[13.5px] leading-[1.95] text-mute">
              六张二次元插图为本站用 AI 图像生成制作的占位图（非 Unsplash 素材）：深夜书桌、末班电车、
              台灯下的书、屏幕的冷光、暗房显影、雨夜便利店。字体是 Noto Serif SC 与 JetBrains Mono。
            </p>
            <p className="mono mt-6 text-[13px] tracking-[0.03em] text-faint">
              Next.js · React Router · Tailwind CSS · GSAP — 2026 年重写
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
