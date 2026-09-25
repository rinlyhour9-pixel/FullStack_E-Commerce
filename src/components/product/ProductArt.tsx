import { parseArtKey, type ArtTint } from "../../utils/imageKey";

interface ProductArtProps {
  artKey: string;
  className?: string;
  label?: string;
}

const TINTS: Record<ArtTint, { bg1: string; bg2: string; body: string; bodyDark: string; label: string }> = {
  forest: { bg1: "#e4ebe3", bg2: "#c7d6c3", body: "#2b4339", bodyDark: "#1c2e26", label: "#fbf7f1" },
  sage: { bg1: "#eef1e8", bg2: "#dbe3d3", body: "#7c8c6d", bodyDark: "#5c6a4f", label: "#fbf7f1" },
  clay: { bg1: "#f3e2d4", bg2: "#e6c4ac", body: "#c1764f", bodyDark: "#a35d3b", label: "#fbf7f1" },
  gold: { bg1: "#f3ead0", bg2: "#e8d6a4", body: "#c9a24c", bodyDark: "#a3813a", label: "#211e1c" },
  ink: { bg1: "#e7e5e2", bg2: "#c9c4bd", body: "#211e1c", bodyDark: "#000000", label: "#fbf7f1" },
};

export function ProductArt({ artKey, className = "", label }: ProductArtProps) {
  const { shape, tint, variant } = parseArtKey(artKey);
  const c = TINTS[tint] ?? TINTS.forest;
  const rotate = [-3, 2, -1, 3][variant % 4];
  const gradAngle = [45, 60, 30, 75][variant % 4];
  const uid = `${tint}-${variant}`;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      role="img"
      aria-label={label ?? "Product packaging illustration"}
    >
      <svg viewBox="0 0 400 500" className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`bg-${uid}`} cx="50%" cy="42%" r="65%" gradientTransform={`rotate(${gradAngle} 0.5 0.5)`}>
            <stop offset="0%" stopColor={c.bg1} />
            <stop offset="100%" stopColor={c.bg2} />
          </radialGradient>
          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.body} />
            <stop offset="100%" stopColor={c.bodyDark} />
          </linearGradient>
        </defs>

        <rect width="400" height="500" fill={`url(#bg-${uid})`} />
        <ellipse cx="200" cy="430" rx="110" ry="16" fill="black" opacity="0.08" />

        <g transform={`rotate(${rotate} 200 260)`}>
          <BottleShape shape={shape} bodyFill={`url(#body-${uid})`} labelFill={c.label} />
        </g>

        <g opacity="0.5" transform={`translate(70 90) rotate(${rotate * -2})`}>
          <path
            d="M0 40 C 10 10, 40 -5, 60 5 C 45 15, 40 35, 20 45 C 12 48, 4 46, 0 40 Z"
            fill={c.body}
            opacity="0.35"
          />
        </g>
      </svg>
    </div>
  );
}

function BottleShape({
  shape,
  bodyFill,
  labelFill,
}: {
  shape: string;
  bodyFill: string;
  labelFill: string;
}) {
  switch (shape) {
    case "dropper":
      return (
        <g>
          <rect x="150" y="140" width="100" height="30" rx="8" fill={bodyFill} />
          <ellipse cx="200" cy="140" rx="14" ry="10" fill={bodyFill} />
          <rect x="130" y="170" width="140" height="190" rx="20" fill={bodyFill} />
          <rect x="150" y="230" width="100" height="70" rx="6" fill={labelFill} opacity="0.92" />
          <rect x="165" y="250" width="70" height="4" rx="2" fill={bodyFill} opacity="0.5" />
          <rect x="165" y="262" width="50" height="4" rx="2" fill={bodyFill} opacity="0.35" />
          <rect x="165" y="274" width="60" height="4" rx="2" fill={bodyFill} opacity="0.35" />
        </g>
      );
    case "jar":
      return (
        <g>
          <rect x="115" y="150" width="170" height="40" rx="10" fill={bodyFill} />
          <rect x="105" y="190" width="190" height="160" rx="24" fill={bodyFill} />
          <rect x="140" y="240" width="120" height="66" rx="6" fill={labelFill} opacity="0.92" />
          <rect x="155" y="258" width="80" height="4" rx="2" fill={bodyFill} opacity="0.5" />
          <rect x="155" y="270" width="60" height="4" rx="2" fill={bodyFill} opacity="0.35" />
          <rect x="155" y="282" width="70" height="4" rx="2" fill={bodyFill} opacity="0.35" />
        </g>
      );
    case "tube":
      return (
        <g>
          <path d="M175 130 L225 130 L235 165 L165 165 Z" fill={bodyFill} />
          <rect x="165" y="165" width="70" height="15" fill={bodyFill} />
          <path
            d="M150 180 C150 165, 250 165, 250 180 L260 330 C260 355, 140 355, 140 330 Z"
            fill={bodyFill}
          />
          <rect x="160" y="225" width="80" height="60" rx="6" fill={labelFill} opacity="0.92" />
          <rect x="172" y="240" width="56" height="4" rx="2" fill={bodyFill} opacity="0.5" />
          <rect x="172" y="252" width="40" height="4" rx="2" fill={bodyFill} opacity="0.35" />
          <rect x="172" y="264" width="48" height="4" rx="2" fill={bodyFill} opacity="0.35" />
        </g>
      );
    case "spray":
      return (
        <g>
          <rect x="205" y="120" width="55" height="18" rx="6" fill={bodyFill} />
          <rect x="150" y="150" width="40" height="20" rx="6" fill={bodyFill} />
          <rect x="160" y="170" width="80" height="22" rx="8" fill={bodyFill} />
          <rect x="140" y="192" width="120" height="168" rx="18" fill={bodyFill} />
          <rect x="158" y="235" width="84" height="64" rx="6" fill={labelFill} opacity="0.92" />
          <rect x="172" y="252" width="56" height="4" rx="2" fill={bodyFill} opacity="0.5" />
          <rect x="172" y="264" width="40" height="4" rx="2" fill={bodyFill} opacity="0.35" />
          <rect x="172" y="276" width="48" height="4" rx="2" fill={bodyFill} opacity="0.35" />
        </g>
      );
    case "pump":
    default:
      return (
        <g>
          <rect x="180" y="120" width="40" height="35" rx="8" fill={bodyFill} />
          <rect x="165" y="150" width="70" height="20" rx="8" fill={bodyFill} />
          <rect x="130" y="170" width="140" height="190" rx="16" fill={bodyFill} />
          <rect x="150" y="230" width="100" height="70" rx="6" fill={labelFill} opacity="0.92" />
          <rect x="165" y="250" width="70" height="4" rx="2" fill={bodyFill} opacity="0.5" />
          <rect x="165" y="262" width="50" height="4" rx="2" fill={bodyFill} opacity="0.35" />
          <rect x="165" y="274" width="60" height="4" rx="2" fill={bodyFill} opacity="0.35" />
        </g>
      );
  }
}
