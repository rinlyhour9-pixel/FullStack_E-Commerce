import { useLanguage } from "../../context/LanguageContext";

export function AnnouncementBar() {
  const { t, language } = useLanguage();
  const loopMessages = [...t.announcement, ...t.announcement];

  return (
    <div className="overflow-hidden bg-forest py-2 text-cream">
      <div className="flex w-max animate-marquee motion-reduce:animate-none motion-reduce:justify-center">
        {loopMessages.map((message, index) => (
          <span
            key={`${message}-${index}`}
            lang={language === "km" ? "km" : undefined}
            className={`flex items-center whitespace-nowrap px-6 text-xs font-medium tracking-wide sm:text-sm ${
              language === "km" ? "font-khmer" : ""
            }`}
          >
            <span className="mr-6 h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
