import "./globals.css";

export const metadata = {
  title: "拂晓和朋友们 · 秦川逐雪",
  description: "所有未熄的热爱 — 技术、摄影与生活的个人文集。",
};

const FONTS =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@300;400;600&display=swap";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2efe8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS} rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
