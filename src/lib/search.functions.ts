import { createServerFn } from "@tanstack/react-start";
import { runSiteSearch } from "./search.server";

export const searchSite = createServerFn({ method: "GET" })
  .inputValidator((input: { q?: string } = {}) => ({
    q: typeof input.q === "string" ? input.q.slice(0, 80) : "",
  }))
  .handler(async ({ data }) => runSiteSearch(data.q));
