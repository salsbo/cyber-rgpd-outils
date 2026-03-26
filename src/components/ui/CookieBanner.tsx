"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { initializeAnalytics } from "@/lib/analytics";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptCookies = (all: boolean) => {
    localStorage.setItem("cookieConsent", all ? "all" : "essential");
    setShowBanner(false);

    // Initialize analytics if user accepted all cookies
    if (all) {
      initializeAnalytics();
      // Reload page to activate Google Analytics
      window.location.reload();
    }
  };

  const rejectCookies = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

              <div className="relative p-6 md:p-8">
                {/* Close button */}
                <button
                  onClick={rejectCookies}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      Nous utilisons des cookies
                    </h3>

                    {!showDetails ? (
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">
                        Nous utilisons des cookies pour améliorer votre expérience de navigation et analyser le trafic sur notre site. En cliquant sur "Tout accepter", vous acceptez notre utilisation des cookies.
                      </p>
                    ) : (
                      <div className="text-sm text-muted-foreground font-light leading-relaxed space-y-4">
                        <div>
                          <h4 className="text-white font-medium mb-2">Cookies essentiels</h4>
                          <p className="mb-1">Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.</p>
                          <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                            <li>Mémorisation de vos préférences de cookies</li>
                            <li>Sécurité et protection contre les attaques</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-2">Cookies analytiques (optionnels)</h4>
                          <p className="mb-1">Ces cookies nous aident à comprendre comment vous utilisez notre site pour l'améliorer.</p>
                          <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                            <li>Analyse du trafic et des pages visitées</li>
                            <li>Statistiques d'utilisation anonymisées</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-white/70 hover:text-white underline transition-colors"
                      >
                        {showDetails ? "Moins de détails" : "Plus de détails"}
                      </button>
                      <span className="text-white/30">•</span>
                      <Link
                        href="/confidentialite"
                        className="text-white/70 hover:text-white underline transition-colors"
                      >
                        Politique de confidentialité
                      </Link>
                      <span className="text-white/30">•</span>
                      <Link
                        href="/cgu"
                        className="text-white/70 hover:text-white underline transition-colors"
                      >
                        CGU
                      </Link>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-shrink-0">
                    <button
                      onClick={() => acceptCookies(false)}
                      className="px-6 py-3 rounded-full text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-all whitespace-nowrap"
                    >
                      Essentiel uniquement
                    </button>
                    <button
                      onClick={() => acceptCookies(true)}
                      className="px-6 py-3 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 transition-all whitespace-nowrap"
                    >
                      Tout accepter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
