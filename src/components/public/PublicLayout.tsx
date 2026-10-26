import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SahAI } from "./SahAI";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full min-w-0 max-w-full flex-col overflow-x-clip bg-background">
      <Header />
      <main className="w-full min-w-0 flex-1">{children}</main>
      <Footer />
      <SahAI />
    </div>
  );
}
