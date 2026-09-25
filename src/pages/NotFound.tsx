import { Button } from "../components/ui/Button";
import { LeafMarkIcon } from "../components/ui/icons";
import { useLanguage } from "../context/LanguageContext";

export function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <LeafMarkIcon className="mb-4 h-10 w-10 text-forest" />
      <p className="font-display text-6xl text-ink">404</p>
      <h1 className="mt-2 font-display text-2xl text-ink">{t.notFound.heading}</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">{t.notFound.description}</p>
      <Button to="/" variant="secondary" className="mt-6">
        {t.notFound.backHome}
      </Button>
    </div>
  );
}
