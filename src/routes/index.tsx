import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { AnnouncementBanner } from "@/components/site/AnnouncementBanner";
import { Footer } from "@/components/site/Footer";
import { AIAssistant } from "@/components/site/AIAssistant";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { QuickAccess } from "@/components/site/QuickAccess";
import { News } from "@/components/site/News";
import { GalleryPreview } from "@/components/site/GalleryPreview";
import { AdmissionsBanner } from "@/components/site/AdmissionsBanner";
import { getDocuments, getGalleryImages, getNews } from "@/lib/content.functions";

const homeQueryOptions = queryOptions({
  queryKey: ["home"],
  queryFn: async () => {
    const [news, interestDocs, gallery] = await Promise.all([
      getNews({ data: { limit: 3 } }),
      getDocuments({ data: { category: "general", limit: 5 } }),
      getGalleryImages({ data: { limit: 6 } }),
    ]);
    return { news, interestDocs, gallery };
  },
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQueryOptions),
  head: () => ({
    meta: [
      { title: "Colegio Cafam" },
      { name: "description", content: "Colegio Cafam: educación de calidad desde 1971. Admisiones 2027 abiertas, vida escolar, deporte, arte y tecnología." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://connecteducafam.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://connecteducafam.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "School",
          name: "Colegio Cafam",
          description:
            "Colegio Cafam: educación de calidad desde 1971 en Bogotá. Formación académica, deportiva, artística y tecnológica de transición a once.",
          url: "https://connecteducafam.lovable.app/",
          logo: "https://connecteducafam.lovable.app/favicon.png",
          telephone: "+57 601 307 8060",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Av. Cra. 68 No. 90-88",
            addressLocality: "Bogotá",
            addressCountry: "CO",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const data = Route.useLoaderData();
  const { news = [], interestDocs = [], gallery = [] } = data || {};

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      <Header />
      <main>
        <HeroCarousel />
        <QuickAccess />
        <News news={news} interestDocs={interestDocs} />
        <GalleryPreview images={gallery} />
        <AdmissionsBanner />
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
}
