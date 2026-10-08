import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

/**
 * Config do UploadThing calculada UMA vez na carga do módulo.
 * Dentro do JSX do layout, o Effect do `extractRouterConfig` leria `Date.now()`
 * durante o prerender e o Next falhava com "unstable value Date.now()".
 */
export const uploadthingSSRConfig = extractRouterConfig(ourFileRouter);
