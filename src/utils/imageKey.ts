export type BottleShape = "pump" | "dropper" | "jar" | "tube" | "spray";
export type ArtTint = "forest" | "sage" | "clay" | "gold" | "ink";

export interface ParsedArtKey {
  shape: BottleShape;
  tint: ArtTint;
  variant: number;
}

export function makeArtKey(shape: BottleShape, tint: ArtTint, variant = 0): string {
  return `${shape}:${tint}:${variant}`;
}

export function parseArtKey(key: string): ParsedArtKey {
  const [shape, tint, variant] = key.split(":");
  return {
    shape: (shape as BottleShape) ?? "jar",
    tint: (tint as ArtTint) ?? "forest",
    variant: Number(variant) || 0,
  };
}
