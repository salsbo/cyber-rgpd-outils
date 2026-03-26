"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { TURNSTILE_SITE_KEY } from "@/lib/constants";

export default function ContactForm() {
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
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => setTurnstileToken(""),
          theme: "dark",
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
    if (formData.get("website")) {
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
      subject: (formData.get("subject") as string || "Contact").trim(),
      message: (formData.get("message") as string || "").trim(),
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

      // Google Ads conversion tracking
      if (typeof window !== "undefined" && typeof (window as unknown as Record<string, unknown>).gtag === "function") {
        (window as unknown as Record<string, (cmd: string, evt: string, params: Record<string, unknown>) => void>).gtag("event", "conversion", {
          send_to: "AW-17887383937/Wq3UCN6i9OwbEIGjr9FC",
          value: 1.0,
          currency: "EUR",
        });
      }
    } catch (error) {
      setFormState("error");
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue");
      resetTurnstile();
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden p-6 md:p-8" style={{ minHeight: "600px" }}>
      {formState === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-full py-20"
        >
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Message envoyé !</h3>
          <p className="text-muted-foreground mb-8">On revient vers vous rapidement.</p>
          <button
            onClick={() => setFormState("idle")}
            className="text-sm text-white underline underline-offset-4 hover:text-white/80"
          >
            Envoyer un autre message
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="grid md:grid-cols-2 gap-5">
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
            <label className="text-sm font-medium text-foreground/80 ml-1">Sujet</label>
            <input
              type="text"
              name="subject"
              required
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
              placeholder="Mon projet, une question, un besoin..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 ml-1">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              maxLength={5000}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white resize-none placeholder:text-white/20"
              placeholder="Décrivez votre situation en quelques lignes..."
            />
          </div>

          <div ref={turnstileRef} className="flex justify-center" />

          <button
            disabled={formState === "submitting"}
            type="submit"
            className="w-full py-4 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all hover:scale-[1.01] shadow-lg shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {formState === "submitting" ? "Envoi en cours..." : "Envoyer le message"}
            {formState === "idle" && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      )}
    </div>
  );
}
