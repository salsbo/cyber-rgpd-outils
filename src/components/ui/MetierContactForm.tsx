// src/components/ui/MetierContactForm.tsx
"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { TURNSTILE_SITE_KEY } from "@/lib/constants";

interface MetierContactFormProps {
  metierSlug: string;
  metierLabel: string;
  cta: {
    title: string;
    placeholder: string;
  };
}

export default function MetierContactForm({ metierSlug, metierLabel, cta }: MetierContactFormProps) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const initTurnstile = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(""),
          'error-callback': () => setTurnstileToken(""),
          theme: 'dark',
        });
      }
    };

    if (window.turnstile) {
      initTurnstile();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          initTurnstile();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const resetTurnstile = useCallback(() => {
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken("");
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    const honeypot = formData.get("website") as string;
    if (honeypot) {
      setFormState("success");
      return;
    }

    if (!turnstileToken) {
      setFormState("error");
      setErrorMessage("Veuillez compléter la vérification de sécurité");
      return;
    }

    const data = {
      firstName: (formData.get("firstName") as string || "").trim(),
      lastName: (formData.get("lastName") as string || "").trim(),
      email: (formData.get("email") as string || "").trim(),
      subject: metierLabel,
      message: (formData.get("message") as string || "").trim(),
      metier: metierSlug,
      turnstileToken,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Une erreur est survenue");

      setFormState("success");
      form.reset();
      resetTurnstile();
    } catch (error) {
      setFormState("error");
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue");
      resetTurnstile();
    }
  };

  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-center mb-8">
          {cta.title}
        </h2>

        <div className="bg-white/[0.03] border border-white/10 p-8 md:p-10 rounded-3xl backdrop-blur-xl">
          {formState === "success" ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Message reçu !</h3>
              <p className="text-muted-foreground">On revient vers vous rapidement.</p>
              <button
                onClick={() => setFormState("idle")}
                className="mt-8 text-sm text-white underline underline-offset-4 hover:text-white/80"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] opacity-0 h-0 w-0"
                aria-hidden="true"
              />

              {formState === "error" && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 ml-1">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 ml-1">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 ml-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                  placeholder="jean@exemple.fr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 ml-1">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  maxLength={5000}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white resize-none placeholder:text-white/20"
                  placeholder={cta.placeholder}
                />
              </div>

              <div ref={turnstileRef} className="flex justify-center" />

              <button
                disabled={formState === "submitting"}
                type="submit"
                className="w-full py-4 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all hover:scale-[1.01] shadow-lg shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {formState === "submitting" ? "Envoi en cours..." : "Envoyer"}
                {formState === "idle" && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}
