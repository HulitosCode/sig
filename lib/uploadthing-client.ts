import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Helpers do cliente: useUploadThing/uploadFiles tipados com o router.
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
