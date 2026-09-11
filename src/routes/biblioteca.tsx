import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Centro de Recursos Educativos — Colegio Cafam" },
      { name: "description", content: "Catálogo del Centro de Recursos Educativos del Colegio Cafam: libros de consulta en sala y Plan Lector." },
    ],
    links: [{ rel: "canonical", href: "https://connecteducafam.lovable.app/cre" }],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/cre" });
  },
  component: () => null,
});
