import { MinusIcon, PlusIcon } from "./icons";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label = "Quantity",
}: QuantitySelectorProps) {
  const dims = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <div
      className="inline-flex items-center rounded-full border border-ink/15 bg-white"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className={`flex ${dims} items-center justify-center rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-30`}
        aria-label="Decrease quantity"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className={`min-w-[2ch] px-1 text-center ${textSize} font-medium tabular-nums`} aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className={`flex ${dims} items-center justify-center rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-30`}
        aria-label="Increase quantity"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
