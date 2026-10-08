import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/session";

const f = createUploadthing();

export const ourFileRouter = {
  // Upload de imagens (BI e fotos do carro): 4MB por ficheiro.
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Corre no servidor antes do upload — exige sessão iniciada.
    .middleware(async () => {
      const session = await getSession();
      if (!session?.user) throw new UploadThingError("Não autorizado");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Devolve a URL ao cliente (lida no onClientUploadComplete).
      return { uploadedBy: metadata.userId, url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
