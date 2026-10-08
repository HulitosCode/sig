import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// Domínios do CDN do UploadThing. O formato moderno usa subdomínio
// (ex.: https://<appId>.ufs.sh/f/<key>), por isso comparamos o hostname
// exacto OU o sufixo ".<dominio>".
const UPLOADTHING_HOST_SUFFIXES = ["ufs.sh", "utfs.io", "uploadthing.com"];

// Extrai a key da URL do UploadThing (ex.: https://<appId>.ufs.sh/f/<key>).
// Retorna null para URLs que não pertencem ao UploadThing (ex.: base64/local).
export function getUploadKey(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const isUploadThing = UPLOADTHING_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith("." + suffix)
    );
    if (!isUploadThing) return null;
    const match = parsed.pathname.match(/^\/f\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Apaga a imagem no UploadThing a partir da URL. Falhas são logadas, não propagadas.
export async function deleteUploadedImage(
  url: string | null | undefined
): Promise<void> {
  const key = getUploadKey(url);
  if (!key) return;
  try {
    const result = await utapi.deleteFiles(key);
    if (!result.success) {
      console.error("[UploadThing] Falha ao excluir imagem:", { key, result });
    }
  } catch (err) {
    console.error("[UploadThing] Falha ao excluir imagem:", err);
  }
}
