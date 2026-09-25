import { useToast } from "../../context/ToastContext";
import { CheckIcon, AlertIcon, InfoIcon } from "./icons";

const ICONS = {
  success: CheckIcon,
  error: AlertIcon,
  info: InfoIcon,
};

const STYLES = {
  success: "bg-forest text-cream border-forest-dark",
  error: "bg-clay-dark text-cream border-clay-dark",
  info: "bg-ink text-cream border-ink",
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-32 z-100 flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={`animate-pop pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-full border px-4 py-3 shadow-card-hover ${STYLES[toast.variant]}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="ml-auto shrink-0 rounded-full p-1 text-cream/80 transition hover:bg-white/10 hover:text-cream"
              aria-label="Dismiss notification"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
