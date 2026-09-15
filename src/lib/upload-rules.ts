// Reglas de archivos permitidos para las subidas del panel de administración.

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"] as const;
export const DOCUMENT_EXTENSIONS = ["pdf", "xls", "xlsx"] as const;
export const KNOWLEDGE_EXTENSIONS = ["pdf", "xls", "xlsx", "jpg", "jpeg", "png"] as const;

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png";
export const DOCUMENT_ACCEPT = ".pdf,.xls,.xlsx";
export const KNOWLEDGE_ACCEPT = ".pdf,.xls,.xlsx,.jpg,.jpeg,.png";

export function validateFileExtension(
  file: File,
  allowed: readonly string[],
): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowed.includes(ext)) {
    return `Formato no permitido (.${ext || "?"}). Usa: ${allowed
      .map((e) => `.${e}`)
      .join(", ")}.`;
  }
  return null;
}
