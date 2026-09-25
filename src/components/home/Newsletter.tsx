import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";
import { LeafMarkIcon } from "../ui/icons";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    setStatus("loading");
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setStatus("idle");
    showToast("Welcome to TAMJIT — check your inbox for 10% off.", "success");
    setEmail("");
  };

  return (
    <section className="container-shop py-16 sm:py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-cream-dark px-6 py-14 text-center sm:px-16">
          <LeafMarkIcon className="mx-auto mb-4 h-8 w-8 text-forest" />
          <h2 className="font-display text-3xl text-ink sm:text-4xl">{t.home.newsletterTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">{t.home.newsletterBody}</p>

          <form onSubmit={handleSubmit} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              {t.checkout.emailAddress}
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.home.newsletterPlaceholder}
              className="w-full rounded-full border border-ink/15 bg-white px-5 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest focus:outline-none"
            />
            <Button type="submit" isLoading={status === "loading"} className="shrink-0">
              {t.home.newsletterButton}
            </Button>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
