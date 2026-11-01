"use client";

import { GoLink } from "../components/Transition";
import { useEffect, useRef } from "react";
import { gsap, prefersReduced, revealBatch, usePageFx } from "../lib/motion";
import { albums, media, moments, posts, projects, tagLabel } from "../lib/content";
import { Arrow, SectionHead } from "../components/UI";
import { useGo } from "../components/Transition";

const HERO = "hero-night.jpg";

export default function Home() {
  const { go } = useGo();
  const titleRef = useRef(null);
  const heroImg = useRef(null);

  const scope = usePageFx((root) => {
    revealBatch(root);
    if (prefersReduced()) return;

    /* 标题整体淡入上浮（不再拆字） */
    gsap.fromTo(
      titleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: "power4.out", delay: 0.2 }
    );

    gsap.fromTo(
      root.querySelectorAll("[data-hero-fade]"),
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.09, delay: 0.55 }
    );

    /* 首屏照片慢慢沉下去，标题往上走一点 */
    gsap.to(heroImg.current, {
      yPercent: 12,
      scale: 1.06,
      ease: "none",
      scrollTrigger: {
        trigger: root.querySelector("[data-hero]"),
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.to(root.querySelector("[data-hero-text]"), {
      yPercent: -18,
      opacity: 0.25,
      ease: "none",
      scrollTrigger: {
        trigger: root.querySelector("[data-hero]"),
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    /* 竖排的小字随滚动走 */
    gsap.to(root.querySelector("[data-scrollcue]"), {
      y: 46,
      repeat: -1,
      duration: 2.2,
      ease: "power2.inOut",
      yoyo: true,
    });
  }, []);

  return (
    <div ref={scope}>
      {/* ---------------------------------------------------------------- hero */}
      <section data-hero className="relative h-[100svh] min-h-[620px] w-full overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={heroImg}
            src={media(HERO)}
            alt="雾夜里，车站的轨道在路灯下伸向远方"
            className="h-full w-full scale-[1.02] object-cover object-[50%_42%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,6,7,0.86),rgba(6,6,7,0.32)_46%,rgba(6,6,7,0.55))]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-32 bg-[linear-gradient(to_bottom,rgba(4,4,5,0.62),transparent)]" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between pb-[clamp(28px,5vw,56px)] pt-[92px]">
          {/* 顶部：标记与栏目号 */}
          <div className="shell flex items-start justify-between">
            <div data-hero-fade className="flex items-center gap-3 text-white/70">
              <span className="mono text-[13px] tracking-[0.05em]">EST. 2017</span>
              <span className="h-px w-10 bg-white/30" />
              <span className="mono text-[13px] tracking-[0.05em]">SHANGHAI</span>
            </div>
            <div data-hero-fade className="hidden text-right sm:block">
              <p className="mono text-[13px] leading-[2] tracking-[0.04em] text-white/75">
                01 / 首页
                <br />
                记录 · 技术 · 摄影
              </p>
            </div>
          </div>

          {/* 底部：主副标题 + 按钮，再下面是 SCROLL */}
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-x-14 gap-y-6">
              <div data-hero-fade>
                <h1
                  ref={titleRef}
                  className="display text-left text-white"
                  style={{ fontSize: "clamp(40px, 7.4vw, 86px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
                >
                  拂晓和朋友们
                </h1>
                <p className="mt-3 max-w-[24em] text-[clamp(15px,1.5vw,19px)] leading-[1.9] text-white/85">
                  所有未熄的热爱。
                </p>
              </div>

              <div data-hero-fade className="flex items-center gap-6">
                <GoLink
                  to="/articles/p0"
                  className="group inline-flex items-center gap-3 border border-white/40 bg-white/5 px-5 py-3 text-[13px] text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
                >
                  读最新的一篇
                  <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </GoLink>
                <a
                  href="/photography"
                  onClick={(e) => {
                    e.preventDefault();
                    go("/photography");
                  }}
                  className="mono text-[13px] tracking-[0.04em] text-white/70 underline decoration-white/30 underline-offset-[6px] hover:text-white"
                >
                  进暗房
                </a>
              </div>
            </div>

            <div data-hero-fade className="mt-10 flex items-end justify-between border-t border-white/15 pt-5">
              <div className="flex items-center gap-3 text-white/65">
                <div className="relative h-10 w-px overflow-hidden bg-white/20">
                  <span data-scrollcue className="absolute left-0 top-0 h-4 w-px bg-white/80" />
                </div>
                <span className="mono text-[13px] tracking-[0.05em]">SCROLL</span>
              </div>
              <p className="mono text-[13px] leading-[2] tracking-[0.04em] text-white/65">
                最近更新 2026.10.28
                <br />
                第 47 篇 · 写于凌晨一点
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- now */}
      <section className="shell">
        <div className="grid grid-cols-2 divide-x divide-[color:var(--line)] border-b border-hair md:grid-cols-4">
          {[
            ["在写", "Node 里的流", "第 47 篇"],
            ["在读", "《夜晚的潜水艇》", "第三遍"],
            ["在拍", "霓虹下的人", "18 张"],
            ["在学", "CRDT / Rust", "ossia"],
          ].map(([k, v, m], i) => (
            <div key={k} data-anim className="px-4 py-7 first:pl-0 md:px-7">
              <p className="label">{k}</p>
              <p className="mt-3 text-[15px] leading-[1.5]">{v}</p>
              <p className="mono mt-1 text-[13px] tracking-[0.03em] text-faint">{m}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ writing */}
      <section className="shell pt-[clamp(56px,8vw,110px)]">
        <SectionHead
          no="02"
          title="精选书写"
          aside="不是点得最多的，是我自己还会回头看的。技术、读书、生活，各挑了一篇。"
        >
          <GoLink
            to="/articles"
            className="group inline-flex items-center gap-2 pb-1 text-[13px] text-mute hover:text-world"
          >
            全部文章
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </GoLink>
        </SectionHead>

        <div className="mt-10 grid grid-cols-1 gap-x-7 gap-y-12 md:grid-cols-12">
          {posts.slice(0, 3).map((p, i) => (
            <GoLink
              key={p.slug}
              to={`/articles/${p.slug}`}
              data-anim
              className={`group block ${
                i === 0 ? "md:col-span-7" : "md:col-span-5"
              } ${i === 2 ? "md:col-start-8" : ""}`}
            >
              <div className={`overflow-hidden bg-[color:var(--bg2)] ${i === 0 ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
                <img
                  src={media(p.cover)}
                  alt={p.alt}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.045]"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-6">
                <div>
                  <p className="mono text-[13px] tracking-[0.04em] text-faint">
                    {p.category} · {p.date}
                  </p>
                  <h3 className="mt-2 text-[clamp(18px,1.7vw,23px)] leading-[1.45] group-hover:underline group-hover:decoration-[0.5px] group-hover:underline-offset-[6px]">
                    {p.title}
                  </h3>
                  <p className="mt-2 max-w-[30em] text-[15px] leading-[1.85] text-mute">
                    {p.excerpt}
                  </p>
                </div>
                <span className="num shrink-0 pt-1 text-[13px] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </GoLink>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- photography */}
      <section className="mt-[clamp(70px,10vw,140px)] border-y border-hair bg-[color:var(--bg2)]">
        <div className="shell grid grid-cols-1 gap-10 py-[clamp(48px,7vw,96px)] lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display text-[clamp(30px,4vw,48px)] leading-[1.1]">
              <span className="num mr-4 align-baseline text-[0.38em] tracking-[0.08em] text-faint">03</span>
              在暗处
              <br />
              才开始显影
            </h2>
            <p className="mt-6 max-w-[24em] text-[15px] leading-[1.95] text-mute">
              我拍人像，多数是女孩。七个影集、七十一张，都拍在太阳落下去以后。
              纸面上看照片是灰的，进到暗房里才有颜色。
            </p>
            <button
              type="button"
              onClick={() => go("/photography")}
              className="group mt-8 inline-flex items-center gap-3 border border-hair-s px-5 py-3 text-[13px] transition-colors hover:border-[color:var(--fg)] hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)]"
            >
              推开暗房的门
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {albums.slice(0, 4).map((a, i) => (
                <GoLink
                  key={a.slug}
                  to={`/photography/${a.slug}`}
                  data-anim
                  className={`group relative block overflow-hidden ${
                    i % 2 === 0 ? "aspect-[3/4]" : "aspect-[3/4] translate-y-6"
                  }`}
                >
                  <img
                    src={media(a.coverFile)}
                    alt={a.cover_alt}
                    className="h-full w-full object-cover grayscale transition-all duration-[1100ms] ease-out group-hover:scale-[1.05] group-hover:grayscale-0"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.65),transparent)] p-3 pt-10">
                    <span className="mono block text-[13px] tracking-[0.04em] text-white/80">
                      {a.no} · {a.title}
                    </span>
                  </span>
                </GoLink>
              ))}
            </div>
            <div className="mt-8 flex items-baseline justify-between border-t border-hair pt-4">
              <p className="mono text-[13px] tracking-[0.04em] text-faint">
                71 张 · 7 个影集 · 2024—2026
              </p>
              <GoLink to="/photography" className="label hover:text-world">
                全部作品
              </GoLink>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ moments */}
      <section className="shell pt-[clamp(56px,8vw,110px)]">
        <SectionHead no="04" title="最近说说" aside="短的东西写在短的地方。一条一句，偶尔带一张照片。">
          <GoLink to="/moments" className="group inline-flex items-center gap-2 pb-1 text-[13px] text-mute hover:text-world">
            全部说说
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </GoLink>
        </SectionHead>

        <ul className="mt-6">
          {moments.slice(0, 4).map((m) => (
            <li key={m.date + m.time} data-anim>
              <GoLink
                to="/moments"
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 border-b border-hair py-5"
              >
                <span className="num text-[13px] text-faint">
                  {m.date} <span className="text-[13px]">{m.time}</span>
                </span>
                <span className="text-[14.5px] leading-[1.8] text-ink2 group-hover:text-[color:var(--fg)]">
                  {m.body[0]}
                </span>
                <span className="mono hidden text-[13px] tracking-[0.03em] text-faint sm:block">
                  {tagLabel[m.key]}
                </span>
              </GoLink>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------- projects */}
      <section className="shell pt-[clamp(56px,8vw,110px)] pb-[clamp(64px,9vw,120px)]">
        <SectionHead no="05" title="正在做的事" aside="动手的部分。有的快好了，有的停在半路。">
          <GoLink to="/projects" className="group inline-flex items-center gap-2 pb-1 text-[13px] text-mute hover:text-world">
            全部项目
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </GoLink>
        </SectionHead>

        <div className="mt-8 grid grid-cols-1 gap-x-8 md:grid-cols-3">
          {projects.slice(0, 3).map((p, i) => (
            <GoLink
              key={p.title}
              to="/projects"
              data-anim
              className="group border-t border-hair py-6 first:border-t-0 md:first:border-t"
            >
              <div className="flex items-baseline justify-between">
                <span className="num text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="mono text-[13px] tracking-[0.03em] text-faint">
                  {p.status} · {p.pct}
                </span>
              </div>
              <h3 className="mt-3 text-[19px] group-hover:underline group-hover:underline-offset-[5px]">
                {p.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-[15px] leading-[1.85] text-mute">{p.say}</p>
              <div className="mt-5 h-px w-full bg-[color:var(--line)]">
                <div
                  data-bar
                  className="h-px bg-[color:var(--fg)]"
                  style={{ width: p.pct || "0%" }}
                />
              </div>
            </GoLink>
          ))}
        </div>
      </section>
    </div>
  );
}
