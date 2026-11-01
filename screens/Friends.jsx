"use client";

import { friends } from "../lib/content";
import { revealBatch, usePageFx } from "../lib/motion";
import { Arrow, PageHead } from "../components/UI";

export default function Friends() {
  const scope = usePageFx((root) => {
    revealBatch(root, "[data-anim]");
  }, []);

  return (
    <div ref={scope}>
      <PageHead
        no="06"
        title="友链"
        lede="十个还在写的人。都是我自己会去读的站，不做互相导流的生意，也不换流量。"
        meta={`${friends.length} 个 · 每两周看一眼`}
      />

      <section className="shell">
        <div className="grid grid-cols-1 border-t border-hair md:grid-cols-2 md:gap-x-12">
          {friends.map((f, i) => (
            <a
              key={f.name}
              href="#"
              data-anim
              className="group flex items-start justify-between gap-6 border-b border-hair py-6"
            >
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="num text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="text-[19px] transition-colors group-hover:text-accent">{f.name}</h2>
                  <span className="mono text-[13px] text-faint">{f.site}</span>
                </div>
                <p className="mt-2 max-w-[34em] pl-6 text-[15px] leading-[1.85] text-mute">
                  {f.desc}
                </p>
              </div>
              <Arrow className="mt-1.5 shrink-0 text-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-world" />
            </a>
          ))}
        </div>
      </section>

      <section className="shell pb-[clamp(70px,9vw,120px)] pt-[clamp(40px,6vw,80px)]">
        <div className="grid gap-8 border-t border-hair pt-6 lg:grid-cols-12">
          <h2 className="display text-[clamp(22px,2.6vw,30px)] lg:col-span-5">想交换链接</h2>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-[15px] leading-[1.95] text-mute">
              写信到{" "}
              <a href="mailto:470379769@qq.com" className="border-b border-hair-s pb-0.5 hover:border-[color:var(--fg)]">
                470379769@qq.com
              </a>
              ，把站名、地址和一句介绍给我。我大约每两周看一次信箱，通过了会在这页加上。
            </p>
            <p className="mt-4 text-[15px] leading-[1.9] text-faint">
              我这边可以用的信息：站名「拂晓和朋友们」，地址 fuxiao.art，一句介绍「在月光下，记录所有未熄的热爱」。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
