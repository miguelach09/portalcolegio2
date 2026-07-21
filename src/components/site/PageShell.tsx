import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AIAssistant } from "./AIAssistant";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <Footer />
      <AIAssistant />
    </div>
  );
}
