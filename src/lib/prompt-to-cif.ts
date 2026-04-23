import type { CharacterCIF } from "@/lib/cif";

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function pickFirst(text: string, map: Array<{ terms: string[]; value: string }>) {
  for (const item of map) {
    if (hasAny(text, item.terms)) return item.value;
  }
  return "";
}

function inferBodyType(text: string) {
  if (hasAny(text, ["fat", "overweight", "obese", "heavyset", "big belly", "chubby"])) {
    return "overweight";
  }
  if (hasAny(text, ["muscular", "buff", "ripped", "jacked"])) {
    return "muscular";
  }
  if (hasAny(text, ["skinny", "thin", "lean", "scrawny"])) {
    return "lean";
  }
  if (hasAny(text, ["athletic", "fit"])) {
    return "athletic";
  }
  return "";
}

function inferRole(text: string, explicitRole?: string) {
  if (explicitRole?.trim()) return explicitRole.trim();

  if (hasAny(text, ["villain", "bad guy", "evil", "antagonist"])) return "villain";
  if (hasAny(text, ["hero", "protagonist", "good guy", "main character"])) return "protagonist";
  if (hasAny(text, ["mentor", "teacher", "guide"])) return "mentor";
  if (hasAny(text, ["sidekick", "companion"])) return "sidekick";

  return "protagonist";
}

function inferArchetype(text: string) {
  if (hasAny(text, ["villain", "evil", "bad guy"])) return "menacing antagonist";
  if (hasAny(text, ["hero", "protagonist"])) return "emerging hero";
  if (hasAny(text, ["mentor", "teacher"])) return "wise guide";
  return "emerging hero";
}

function inferCostume(text: string) {
  if (hasAny(text, ["chicken suit", "chicken costume"])) return "full chicken suit";
  if (hasAny(text, ["armor", "armour"])) return "armor";
  if (hasAny(text, ["robe", "robes"])) return "robe";
  if (hasAny(text, ["jacket"])) return "jacket";
  if (hasAny(text, ["suit"])) return "formal suit";
  return "";
}

function inferSpeciesPresentation(text: string) {
  if (hasAny(text, ["man in a chicken suit", "fat man in a chicken suit", "human in a chicken suit"])) {
    return "human in costume";
  }
  if (hasAny(text, ["chicken man", "bird man", "avian humanoid"])) {
    return "bird-themed humanoid";
  }
  if (hasAny(text, ["robot", "android", "cyborg"])) {
    return "artificial humanoid";
  }
  return "human";
}

function inferHair(text: string) {
  return pickFirst(text, [
    { terms: ["black hair", "dark hair"], value: "black" },
    { terms: ["blonde hair", "yellow hair"], value: "blonde" },
    { terms: ["brown hair"], value: "brown" },
    { terms: ["white hair", "silver hair"], value: "white" },
    { terms: ["red hair"], value: "red" },
    { terms: ["blue hair"], value: "blue" },
    { terms: ["bald"], value: "bald" },
  ]);
}

function inferEyes(text: string) {
  return pickFirst(text, [
    { terms: ["brown eyes"], value: "brown" },
    { terms: ["blue eyes"], value: "blue" },
    { terms: ["green eyes"], value: "green" },
    { terms: ["red eyes"], value: "red" },
    { terms: ["yellow eyes", "gold eyes"], value: "yellow" },
  ]);
}

function inferStyle(text: string) {
  if (hasAny(text, ["anime", "manga"])) return "anime";
  if (hasAny(text, ["cartoon"])) return "cartoon";
  if (hasAny(text, ["realistic", "photoreal"])) return "realistic";
  return "anime";
}

function inferTone(text: string) {
  if (hasAny(text, ["dark", "sinister", "evil", "villain"])) return "serious";
  if (hasAny(text, ["funny", "goofy", "comedic"])) return "comedic";
  if (hasAny(text, ["cute", "soft"])) return "light";
  return "serious";
}

export function promptToCIF(args: {
  prompt: string;
  name?: string;
  role?: string;
}): CharacterCIF {
  const raw = `${args.prompt} ${args.name ?? ""} ${args.role ?? ""}`.toLowerCase();

  const role = inferRole(raw, args.role);
  const archetype = inferArchetype(raw);
  const build = inferBodyType(raw);
  const outfit = inferCostume(raw);
  const speciesPresentation = inferSpeciesPresentation(raw);
  const hair = inferHair(raw);
  const eyes = inferEyes(raw);
  const visualStyle = inferStyle(raw);
  const tone = inferTone(raw);

  const mustKeep: string[] = [];
  const avoid: string[] = [];

  if (build === "overweight") mustKeep.push("visibly overweight body type");
  if (outfit === "full chicken suit") mustKeep.push("full chicken suit");
  if (role === "villain") mustKeep.push("villain presentation");
  if (speciesPresentation === "human in costume") {
    mustKeep.push("human wearing costume");
    avoid.push("literal chicken anatomy");
    avoid.push("generic bird monster");
  }

  mustKeep.push("full body visible");
  mustKeep.push("clear silhouette");
  avoid.push("cropped body");
  avoid.push("text overlay");

  return {
    identity: {
      name: args.name?.trim() || "Unnamed Character",
      role,
      archetype,
    },
    appearance: {
      hair: hair || undefined,
      eyes: eyes || undefined,
      height: undefined,
      build: build || undefined,
      outfit: outfit || undefined,
    },
    style: {
      visual_style: visualStyle,
      lighting: "neutral dramatic lighting",
      tone,
    },
    constraints: {
      must_keep: mustKeep,
      avoid: avoid,
    },
    references: {
  species_presentation: speciesPresentation,
},
  };
}

export function buildStrictImagePrompt(args: {
  prompt: string;
  cif: CharacterCIF;
}) {
  const { cif, prompt } = args;

  const identity = cif.identity ?? {};
  const appearance = cif.appearance ?? {};
  const style = cif.style ?? {};
  const constraints = cif.constraints ?? {};
  const references = cif.references ?? {};

  return `
STRICT CHARACTER GENERATION INSTRUCTIONS

You must generate EXACTLY what is described.
Do not simplify, reinterpret, substitute, or stylize away key traits.

USER DESCRIPTION:
${prompt}

STRUCTURED CHARACTER REQUIREMENTS:
- Name: ${identity.name || "Unnamed Character"}
- Role: ${identity.role || "protagonist"}
- Archetype: ${identity.archetype || "emerging hero"}
- Hair: ${appearance.hair || "unspecified"}
- Eyes: ${appearance.eyes || "unspecified"}
- Build: ${appearance.build || "unspecified"}
- Outfit: ${appearance.outfit || "unspecified"}
- Style: ${style.visual_style || "anime"}
- Lighting: ${style.lighting || "neutral dramatic lighting"}
- Tone: ${style.tone || "serious"}
- Species presentation: ${references.species_presentation || "human"}

MANDATORY VISUAL RULES:
${(constraints.must_keep ?? []).map((v) => `- ${v}`).join("\n")}

NEGATIVE RULES:
${(constraints.avoid ?? []).map((v) => `- avoid ${v}`).join("\n")}

OUTPUT REQUIREMENTS:
- full body character
- clean readable silhouette
- single character only
- neutral or white background
- no text, no logos, no watermark
- polished anime concept art
- character design must clearly match the structured requirements

FINAL INSTRUCTION:
Return a single accurate character design that prioritizes continuity usefulness and trait readability.
`.trim();
}