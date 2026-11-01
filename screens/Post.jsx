"use client";

import { useParams } from "react-router-dom";
import { GoLink } from "../components/Transition";
import { articleFor, postIndex } from "../lib/bodies";
import { media, posts } from "../lib/content";
import { gsap, prefersReduced, usePageFx } from "../lib/motion";
import { Arrow, Crumbs } from "../components/UI";

export default function Post() {
  const { slug } = useParams();
  const post = articleFor(slug);
  const i = Math.max(0, postIndex(post.slug));
  const prev = posts[i - 1];
  const next = posts[i + 1];
  const words = post.blocks.reduce(
    (n, b) => n + (b.text ? b.text.replace(/\s/g, "").length : 0),
    0
  );
  const minutes = Math.max(2, Math.round(words / 400));

  const scope = usePageFx((root) => {
    if (prefersReduced()) return;
    const title = root.querySelector("[data-title]");
    gsap.fromTo(
      title,
      { y: 26, opacity: 0, clipPath: "inset(0 0 100% 0)" },
      { y: 0, opacity: 1, clipPath: "inset(0 0 -10% 0)", duration: 1.1, ease: "power4.out" }
    );
    gsap.fromTo(
      root.querySelectorAll("[data-lead]"),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, delay: 0.2, ease: "power3.out" }
    );
    gsap.utils.toArray("[data-block]").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });
    gsap.fromTo(
      root.querySelector("[data-cover]"),
      { scale: 1.08 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.querySelector("[data-cover]"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }, [post.slug]);

  return (
    <article ref={scope}>
      <Crumbs items={[{ label: "文章", to: "/articles" }, { label: post.category }]} />

      <header className="shell pt-8 md:pt-14">
        <div className="mx-auto max-w-[46rem]">
          <h1
            data-title
            className="display text-[clamp(32px,5.6vw,62px)] leading-[1.16]"
          >
            {post.title}
          </h1>

          <div
            data-lead
            className="mt-5 flex flex-wrap items-center gap-3 border-b border-hair pb-5"
          >
            <span className="mono text-[13px] tracking-[0.03em] text-accent">{post.category}</span>
            <span className="h-px w-8 bg-[color:var(--line-s)]" />
            <span className="num text-[13px] tracking-[0.03em] text-faint">{post.date}</span>
          </div>

          <p data-lead className="mt-6 text-[clamp(15px,1.5vw,19px)] leading-[1.9] text-mute">
            {post.deck}
          </p>

          <div
            data-lead
            className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-hair py-3"
          >
            <span className="mono text-[13px] tracking-[0.04em] text-faint">
              拂晓 · 写于杭州
            </span>
            <span className="mono text-[13px] tracking-[0.04em] text-faint">
              约 {minutes} 分钟 · {words} 字
            </span>
          </div>
        </div>
      </header>

      <figure className="mt-10">
        <div className="overflow-hidden bg-[color:var(--bg2)]">
          <img
            data-cover
            src={media(post.cover)}
            alt={post.alt}
            className="mx-auto h-[clamp(240px,52svh,560px)] w-full max-w-[1600px] object-cover"
          />
        </div>
        <figcaption className="shell mono mt-3 text-[13px] tracking-[0.06em] text-faint">
          图为占位插图 · 与正文内容无直接关系
        </figcaption>
      </figure>

      <div className="shell">
        <div className="prose-lamp mx-auto mt-14 max-w-[42rem] pb-10">
          {post.blocks.map((b, k) => {
            if (b.t === "h2")
              return (
                <h2 data-block key={k}>
                  {b.text}
                </h2>
              );
            if (b.t === "q")
              return (
                <blockquote data-block key={k}>
                  {b.text}
                </blockquote>
              );
            if (b.t === "code")
              return (
                <pre data-block key={k}>
                  <code>{b.text}</code>
                </pre>
              );
            if (b.t === "img")
              return (
                <figure data-block key={k}>
                  <img src={media(b.src)} alt={b.alt} className="w-full" />
                  {b.cap && <figcaption>{b.cap}</figcaption>}
                </figure>
              );
            return (
              <p data-block key={k}>
                {b.text}
              </p>
            );
          })}
        </div>
      </div>

      <div className="shell">
        <div className="mx-auto max-w-[42rem] border-t border-hair pt-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="label">标签</span>
            {[post.category, "长期有效", "杭州"].map((t) => (
              <span key={t} className="mono text-[13px] text-mute">
                #{t}
              </span>
            ))}
          </div>
        </div>

        <nav className="mx-auto mt-12 grid max-w-[42rem] grid-cols-1 gap-6 border-t border-hair pt-8 sm:grid-cols-2">
          {prev ? (
            <GoLink to={`/articles/${prev.slug}`} className="group">
              <span className="label">上一篇</span>
              <span className="mt-2 block text-[16px] leading-[1.5] group-hover:underline group-hover:underline-offset-4">
                {prev.title}
              </span>
            </GoLink>
          ) : (
            <span />
          )}
          {next ? (
            <GoLink to={`/articles/${next.slug}`} className="group sm:text-right">
              <span className="label">下一篇</span>
              <span className="mt-2 flex items-baseline justify-start gap-2 text-[16px] leading-[1.5] group-hover:underline group-hover:underline-offset-4 sm:justify-end">
                {next.title}
                <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </GoLink>
          ) : (
            <GoLink to="/articles" className="group sm:text-right">
              <span className="label">回到列表</span>
              <span className="mt-2 flex items-baseline justify-start gap-2 text-[16px] sm:justify-end">
                全部文章
                <Arrow />
              </span>
            </GoLink>
          )}
        </nav>
      </div>
    </article>
  );
}
