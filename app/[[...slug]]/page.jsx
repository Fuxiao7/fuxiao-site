"use client";

import dynamic from "next/dynamic";

const AppRoot = dynamic(() => import("../../components/AppRoot"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100vh", background: "#f2efe8" }} />,
});

export default function Page() {
  return <AppRoot />;
}
