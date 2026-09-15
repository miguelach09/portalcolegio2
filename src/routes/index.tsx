import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { ArrowRight, BookOpen } from "lucide-react";
import { Header } from "@/components/site/Header";
import { AnnouncementBanner } from "@/components/site/AnnouncementBanner";
import { Footer } from "@/components/site/Footer";
import { AIAssistant } from "@/components/site/AIAssistant";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { QuickAccess } from "@/components/site/QuickAccess";
import { News } from "@/components/site/News";
import { GalleryPreview } from "@/components/site/GalleryPreview";
import { AdmissionsBanner } from "@/components/site/AdmissionsBanner";
import { Reveal } from "@/components/site/Reveal";
import { getDocuments, getGalleryImages, getNews } from "@/lib/content.functions";
import { getLibraryBooks } from "@/lib/library.functions";
import { formatCOP, type LibraryBook } from "@/lib/library.types";

const homeQueryOptions = queryOptions({
  queryKey: ["home"],
  queryFn: async () => {
    const [news, interestDocs, gallery, books] = await Promise.all([
      getNews({ data: { limit: 3 } }),
      getDocuments({ data: { category: "general", limit: 5 } }),
      getGalleryImages({ data: { limit: 6 } }),
      getLibraryBooks({ data: {} }),
    ]);
    return { news, interestDocs, gallery, books };
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
  const { news = [], interestDocs = [], gallery = [], books = [] } = data || {};

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      <Header />
      <main>
        <h1 className="sr-only">Colegio Cafam — educación de calidad en Bogotá desde 1971</h1>
        <HeroCarousel />
        <Reveal>
          <QuickAccess />
        </Reveal>
        <Reveal>
          <News news={news} interestDocs={interestDocs} />
        </Reveal>
        <Reveal>
          <CreStrip books={books} />
        </Reveal>
        <Reveal>
          <GalleryPreview images={gallery} />
        </Reveal>
        <Reveal>
          <AdmissionsBanner />
        </Reveal>
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
}

function CreStrip({ books }: { books: LibraryBook[] }) {
  const recent = books.slice(0, 4);
  if (recent.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            CRE — Biblioteca
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
            Centro de Recursos Educativos
          </h2>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Descubre los libros de consulta en sala y del Plan Lector disponibles en el CRE.
          </p>
        </div>
        <Link
          to="/cre"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
        >
          Ver catálogo completo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {recent.map((book) => (
          <Link
            key={book.id}
            to="/cre"
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={`Portada de ${book.title}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <h3 className="font-display font-bold leading-tight text-foreground group-hover:text-primary">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              {book.kind === "plan_lector" && book.price_cop !== null && (
                <p className="mt-auto pt-2 font-display text-base font-bold text-primary">
                  {formatCOP(Number(book.price_cop))}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
