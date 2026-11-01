"use client";

import { GoLink } from "../components/Transition";
import { nav } from "../lib/content";

export default function Missing() {
  return (
    <div className="shell flex min-h-[80svh] flex-col justify-center py-24">
      <p className="mono text-[13px] tracking-[0.05em] text-faint">404</p>
      <h1 className="display mt-6 text-[clamp(44px,9vw,120px)] leading-[1]">
        这里没有灯
      </h1>
      <p className="mt-6 max-w-[26em] text-[15px] leading-[1.9] text-mute">
        页面可能搬过家，也可能从来没存在过。走廊在下面，随便挑一间。
      </p>
      <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
        {nav.map((n) => (
          <li key={n.to}>
            <GoLink to={n.to} className="group flex items-baseline gap-2 text-[14px] text-mute hover:text-world">
              <span className="num text-[13px] text-faint">{n.k}</span>
              {n.label}
            </GoLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
