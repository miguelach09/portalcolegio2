import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { QuickAccess } from "@/components/site/QuickAccess";
import { News } from "@/components/site/News";
import { GalleryPreview } from "@/components/site/GalleryPreview";
import { AdmissionsBanner } from "@/components/site/AdmissionsBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Colegio Cafam — Formación integral en Bogotá" },
      { name: "description", content: "Colegio Cafam: educación de calidad desde 1971. Admisiones 2027 abiertas, vida escolar, deporte, arte y tecnología." },
      { property: "og:title", content: "Colegio Cafam — Formación integral en Bogotá" },
      { property: "og:description", content: "Educación de calidad desde 1971. Admisiones 2027 abiertas." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel />
        <QuickAccess />
        <News />
        <GalleryPreview />
        <AdmissionsBanner />
      </main>
      <Footer />
    </div>
  );
}
