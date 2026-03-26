"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import LucideIcon from "@/components/ui/LucideIcon";
import { metiers } from "@/content/metiers";

const accentColors: Record<string, string> = {
  sky: "group-hover:border-sky-500/30 group-hover:bg-sky-500/5",
  amber: "group-hover:border-amber-500/30 group-hover:bg-amber-500/5",
  orange: "group-hover:border-orange-500/30 group-hover:bg-orange-500/5",
  emerald: "group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5",
  violet: "group-hover:border-violet-500/30 group-hover:bg-violet-500/5",
  blue: "group-hover:border-blue-500/30 group-hover:bg-blue-500/5",
};

const iconColors: Record<string, string> = {
  sky: "text-sky-400",
  amber: "text-amber-400",
  orange: "text-orange-400",
  emerald: "text-emerald-400",
  violet: "text-violet-400",
  blue: "text-blue-400",
};

export default function Sectors() {
  return (
    <section id="votre-secteur" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            On parle votre langue.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chaque métier a ses contraintes IT. On les connaît — et on sait y répondre.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metiers.map((m, i) => (
            <motion.div
              key={m.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/votre-metier/${m.slug}`}
                className={`group block bg-white/[0.02] border border-white/10 rounded-2xl p-5 md:p-6 transition-all ${accentColors[m.accentColor] || ""}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${iconColors[m.accentColor] || "text-white"}`}>
                  <LucideIcon name={m.icon} className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-white text-sm md:text-base mb-1">
                  {m.label}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {m.hero.subtitle}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-white transition-colors">
                  Découvrir <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
