import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
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
      { property: "og:title", content: "Colegio Cafam" },
      { property: "og:description", content: "Colegio Cafam: educación de calidad desde 1971. Admisiones 2027 abiertas, vida escolar, deporte, arte y tecnología." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const { data } = Route.useLoaderData();
  const { news = [], interestDocs = [], gallery = [] } = data || {};

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel />
        <QuickAccess />
        <News news={news} interestDocs={interestDocs} />
        <GalleryPreview images={gallery} />
        <AdmissionsBanner />
      </main>
      <Footer />
    </div>
  );
}
