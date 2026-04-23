import type { CreationResult } from "./cif";

export function buildCanonPayload(result: CreationResult) {
  return {
    cif: result.cif ?? {},
    image: result.image_url
      ? {
          url: result.image_url,
          path: result.image_path ?? null,
        }
      : undefined,
    generation_meta: result.generation_meta ?? undefined,
  };
}