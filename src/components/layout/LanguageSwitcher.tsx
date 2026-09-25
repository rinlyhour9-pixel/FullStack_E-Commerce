import { useLanguage } from "../../context/LanguageContext";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-ink/15 bg-white p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`rounded-full px-2.5 py-1 transition ${
          language === "en" ? "bg-forest text-cream" : "text-ink-soft hover:text-ink"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        lang="km"
        onClick={() => setLanguage("km")}
        aria-pressed={language === "km"}
        className={`font-khmer rounded-full px-2.5 py-1 transition ${
          language === "km" ? "bg-forest text-cream" : "text-ink-soft hover:text-ink"
        }`}
      >
        ខ្មែរ
      </button>
    </div>
  );
}
