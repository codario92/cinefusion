export type CanonEntityType = "character" | "location" | "prop";

export type CIFv1 = {
  schemaVersion: 1;

  // locked traits = identity
  locked: Record<string, unknown>;

  // changeable layers (outfits, time-of-day, expression sets, etc.)
  layers: Record<string, unknown>;

  // "what not to do" constraints
  constraints: {
    negative: string[];
    positive?: string[];
  };

  // optional style rules
  style?: {
    aesthetic?: string; // e.g., "purple-black anime inked"
    palette?: string[];
    notes?: string;
  };
};