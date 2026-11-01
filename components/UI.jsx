"use client";

import { GoLink } from "./Transition";
import { media } from "../lib/content";

export function Kicker({ children, className = "" }) {
  return <span className={`label ${className}`}>{children}</span>;
}

export function SectionHead({ no, title, aside, children, className = "" }) {
  return (
    <div className={`border-t border-hair pt-5 ${className}`}>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
        <div className="flex items-baseline gap-5">
          <span className="num text-[13px] tracking-[0.05em] text-faint">{no}</span>
          <h2 className="display text-[clamp(24px,3.4vw,38px)]">{title}</h2>
        </div>
        {aside && (
          <p className="mt-1 max-w-[24em] border-l border-hair-s pl-5 text-[15px] leading-[1.7] text-mute">
            {aside}
          </p>
        )}
        {children && <div className="ml-auto self-end">{children}</div>}
      </div>
    </div>
  );
}

export function Rule({ className = "" }) {
  return <div className={`h-px w-full bg-[color:var(--line)] ${className}`} />;
}

export function Arrow({ className = "" }) {
  return (
    <svg
      viewBox="0 0 14 14"
      className={className}
      width="13"
      height="13"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 7h11M7.6 2.4L12.2 7l-4.6 4.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function Photo({ src, alt, className = "", tone = "mono" }) {
  return (
    <img
      src={media(src)}
      alt={alt || ""}
      loading="lazy"
      draggable="false"
      className={`h-full w-full object-cover ${
        tone === "mono"
          ? "saturate-[0.85] transition-[filter,transform] duration-[900ms] ease-out hover:saturate-100 dark:saturate-100"
          : ""
      } ${className}`}
    />
  );
}

export function PageHead({ no, title, lede, meta }) {
  return (
    <header className="shell pt-[calc(64px+clamp(56px,9vw,132px))] pb-[clamp(34px,5vw,64px)]">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div>
          <h1 className="display text-[clamp(40px,7.4vw,86px)]">
            <span className="num mr-4 align-baseline text-[0.35em] tracking-[0.04em] text-faint">{no}</span>
            {title}
          </h1>
        </div>
        <div className="max-w-[30em]">
          {lede && <p className="text-[15px] leading-[1.9] text-mute">{lede}</p>}
          {meta && <p className="num mt-4 text-[13px] tracking-[0.06em] text-mute">{meta}</p>}
        </div>
      </div>
    </header>
  );
}

export function Crumbs({ items }) {
  return (
    <nav className="shell flex items-center gap-3 pt-[calc(64px+28px)]">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-3">
          {i > 0 && <span className="mono text-[13px] text-faint">/</span>}
          {it.to ? (
            <GoLink to={it.to} className="label !tracking-[0.04em] hover:text-world">
              {it.label}
            </GoLink>
          ) : (
            <span className="label !tracking-[0.04em] text-world">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
