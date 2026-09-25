import { Link } from "react-router-dom";
import { LeafMarkIcon } from "../ui/icons";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2 font-display text-2xl font-medium tracking-tight text-ink ${className}`}
      aria-label="TAMJIT home"
    >
      <LeafMarkIcon className="h-6 w-6 text-forest transition-transform duration-300 group-hover:-rotate-12" />
      <span>
        TAM<span className="text-clay">JIT</span>
      </span>
    </Link>
  );
}
