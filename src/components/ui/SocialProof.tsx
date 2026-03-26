"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "On avait deux coupures réseau par mois. Depuis qu’ils ont repris l’infra, zéro coupure en 18 mois.",
    role: "Gérant — Concession automobile, 2 sites",
    metric: "0 coupure",
    metricLabel: "depuis 18 mois",
  },
  {
    quote: "Ils ont trouvé des failles qu’on ne soupçonnait pas. Le mot de passe de la direction était sur le dark web.",
    role: "Directeur — Sous-traitant industriel",
    metric: "7 failles",
    metricLabel: "corrigées avant exploitation",
  },
  {
    quote: "L’app a remplacé nos 3 fichiers Excel. Les techniciens terrain l’ont adoptée en une semaine.",
    role: "Responsable exploitation — Télécoms",
    metric: "15 min",
    metricLabel: "gagnées par intervention",
  },
];

export default function SocialProof() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            Ce qu&apos;ils en disent.
          </h2>
          <p className="text-muted-foreground">
            Quelques retours de missions récentes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col"
            >
              <Quote className="w-5 h-5 text-blue-500/50 mb-4" />
              <p className="text-sm text-white/80 leading-relaxed mb-4 flex-1">
                &laquo; {t.quote} &raquo;
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {t.role}
              </p>
              <div className="pt-4 border-t border-white/5">
                <p className="text-2xl font-display font-bold text-white">{t.metric}</p>
                <p className="text-xs text-muted-foreground">{t.metricLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
