import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AIAssistant } from "./AIAssistant";
import { BackToTop } from "./BackToTop";
import { AnnouncementBanner } from "./AnnouncementBanner";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      <Header />
      <main>{children}</main>
      <Footer />
      <AIAssistant />
      <BackToTop />
    </div>
  );
}

