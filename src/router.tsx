import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { isAdminPath } from './lib/admin-visit';
import { closeAdminSession } from './lib/admin-session';

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  router.subscribe('onBeforeNavigate', ({ fromLocation, toLocation }) => {
    if (fromLocation && isAdminPath(fromLocation.pathname) && !isAdminPath(toLocation.pathname)) {
      void closeAdminSession(queryClient);
    }
  });

  return router;
};
