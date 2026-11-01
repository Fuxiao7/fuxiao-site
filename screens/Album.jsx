"use client";

import { useParams } from "react-router-dom";
import { GoLink } from "../components/Transition";
import { albums, albumBySlug, media } from "../lib/content";
import { gsap, prefersReduced, usePageFx } from "../lib/motion";
import { Arrow, Crumbs } from "../components/UI";

export default function Album() {
  const { slug } = useParams();
  const album = albumBySlug(slug) || albums[0];
  const i = album.index;
  const next = albums[(i + 1) % albums.length];

  const scope = usePageFx((root) => {
    if (prefersReduced()) return;
    gsap.fromTo(
      root.querySelector("[data-al-title]"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: "power4.out", delay: 0.1 }
    );
    gsap.to(root.querySelector("[data-al-cover]"), {
      yPercent: 12,
      scale: 1.08,
      ease: "none",
      scrollTrigger: { trigger: root.querySelector("[data-al-hero]"), start: "top top", end: "bottom top", scrub: true },
    });
    gsap.utils.toArray("[data-al-anim]").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });
    gsap.utils.toArray("[data-al-img]").forEach((el) => {
      gsap.fromTo(
        el.querySelector("img"),
        { scale: 1.12 },
        {
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        }
      );
    });
  }, [album.slug]);

  return (
    <article ref={scope} className="bg-[color:var(--bg)] text-[color:var(--fg)]">
      <Crumbs items={[{ label: "摄影", to: "/photography" }, { label: album.title }]} />

      <header data-al-hero className="relative mt-6 h-[76svh] min-h-[440px] overflow-hidden">
        <img
          data-al-cover
          src={media(album.coverFile)}
          alt={album.cover_alt}
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[50%_38%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(3,3,4,0.95),rgba(3,3,4,0.25)_52%,rgba(3,3,4,0.45))]" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-[clamp(24px,4vw,56px)] text-white">
          <div className="shell">
            <p className="mono text-[13px] tracking-[0.04em] text-white/75">
              影集 {album.no} / {String(albums.length).padStart(2, "0")} · {album.meta[0]}
            </p>
            <h1 data-al-title className="display mt-4 text-[clamp(40px,7vw,96px)] leading-[1.02]">
              {album.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-4">
              {album.meta.map((m) => (
                <span key={m} className="mono text-[13px] tracking-[0.03em] text-white/65">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 引子 */}
      <section className="shell grid gap-10 pt-[clamp(40px,6vw,84px)] lg:grid-cols-12">
        <p data-al-anim className="display text-[clamp(21px,2.6vw,32px)] leading-[1.55] lg:col-span-7">
          {album.lead}
        </p>
        <dl data-al-anim className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 self-end lg:col-span-4 lg:col-start-9">
          {album.specs.map(([k, v]) => (
            <div key={k} className="col-span-2 grid grid-cols-[72px_1fr] gap-4 border-b border-hair py-1.5">
              <dt className="mono text-[13px] tracking-[0.04em] text-faint">{k}</dt>
              <dd className="mono text-[13px] text-chalk2">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 为什么拍这一组 */}
      <section className="shell pt-[clamp(48px,7vw,100px)]">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 data-al-anim className="mono text-[13px] tracking-[0.05em] text-faint">
              01 — 为什么拍这一组
            </h2>
          </div>
          <div data-al-anim className="lg:col-span-6">
            <div className="space-y-[1.2em] text-[16px] leading-[2] text-chalk2">
              {album.why.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
          </div>
          <blockquote data-al-anim className="border-l border-hair-s pl-5 text-[15px] leading-[1.9] text-chalk lg:col-span-3">
            {album.quoteText}
            <cite className="mono mt-3 block text-[13px] not-italic tracking-[0.04em] text-faint">
              {album.quoteBy}
            </cite>
          </blockquote>
        </div>
      </section>

      {/* 图组一 */}
      <section className="shell grid gap-2 pt-[clamp(36px,5vw,64px)] md:grid-cols-2">
        {album.runs1.map((r) => (
          <figure key={r.src} data-al-img className="overflow-hidden">
            <img src={media(r.src)} alt={r.alt} className="aspect-[4/5] w-full object-cover" />
            <figcaption className="mono mt-2 text-[13px] tracking-[0.06em] text-faint">{r.cap}</figcaption>
          </figure>
        ))}
      </section>

      {/* 我和她 */}
      <section className="shell pt-[clamp(48px,7vw,100px)]">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 data-al-anim className="mono text-[13px] tracking-[0.05em] text-faint">
              02 — 我和她
            </h2>
          </div>
          <div data-al-anim className="lg:col-span-6">
            <div className="space-y-[1.2em] text-[16px] leading-[2] text-chalk2">
              {album.story.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
          </div>
          <blockquote data-al-anim className="border-l border-hair-s pl-5 text-[15px] leading-[1.9] text-chalk lg:col-span-3">
            {album.storyQuoteText}
          </blockquote>
        </div>
      </section>

      {/* 图组二 */}
      <section className="shell pt-[clamp(36px,5vw,64px)]">
        {album.runs2.map((r) => (
          <figure key={r.src} data-al-img className="overflow-hidden">
            <img src={media(r.src)} alt={r.alt} className="aspect-[3/2] w-full object-cover" />
            <figcaption className="mono mt-2 text-[13px] tracking-[0.06em] text-faint">{r.cap}</figcaption>
          </figure>
        ))}
      </section>

      {/* 怎么准备的 */}
      <section className="shell pt-[clamp(48px,7vw,100px)]">
        <div className="grid gap-8 border-t border-hair pt-6 lg:grid-cols-12">
          <h2 data-al-anim className="mono text-[13px] tracking-[0.05em] text-faint lg:col-span-3">
            03 — 怎么准备的
          </h2>
          <ul className="lg:col-span-7 lg:col-start-5">
            {album.processPairs.map((p) => (
              <li
                key={p.k}
                data-al-anim
                className="grid grid-cols-[68px_1fr] gap-5 border-b border-hair py-3.5"
              >
                <span className="mono pt-0.5 text-[13px] tracking-[0.04em] text-faint">{p.k}</span>
                <span className="text-[14px] leading-[1.9] text-chalk2">{p.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 下一个 */}
      <section className="shell pb-[clamp(60px,9vw,120px)] pt-[clamp(44px,6vw,90px)]">
        <GoLink to={`/photography/${next.slug}`} className="group grid items-end gap-6 lg:grid-cols-12">
          <p className="mono text-[13px] tracking-[0.04em] text-faint lg:col-span-3">下一册</p>
          <div className="lg:col-span-8">
            <div className="overflow-hidden">
              <img
                src={media(next.coverFile)}
                alt={next.cover_alt}
                className="h-[clamp(160px,26svh,280px)] w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="display text-[24px]">{next.title}</span>
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </GoLink>
      </section>
    </article>
  );
}
