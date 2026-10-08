import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Rotas do UploadThing (GET/POST /api/uploadthing).
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
