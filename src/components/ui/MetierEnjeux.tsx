// src/components/ui/MetierEnjeux.tsx
"use client";

import { motion } from "framer-motion";
import type { Enjeu } from "@/content/metiers";
import LucideIcon from "@/components/ui/LucideIcon";

const severityBorder: Record<string, string> = {
  critical: "border-l-red-500",
  warning: "border-l-amber-500",
};

const accentBorder: Record<string, string> = {
  sky: "border-l-sky-500",
  amber: "border-l-amber-500",
  orange: "border-l-orange-500",
  emerald: "border-l-emerald-500",
  violet: "border-l-violet-500",
  blue: "border-l-blue-500",
};

interface MetierEnjeuxProps {
  enjeux: Enjeu[];
  accentColor: string;
}

export default function MetierEnjeux({ enjeux, accentColor }: MetierEnjeuxProps) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-3xl md:text-4xl font-display font-bold tracking-tight text-center mb-12"
        >
          Les enjeux critiques de votre activité
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enjeux.map((enjeu, i) => {
            const borderClass =
              severityBorder[enjeu.severity] ||
              accentBorder[accentColor] ||
              "border-l-blue-500";

            return (
              <motion.div
                key={enjeu.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white/[0.02] border border-white/10 rounded-2xl p-6 border-l-4 ${borderClass}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <LucideIcon name={enjeu.icon} className="w-5 h-5 text-white/70" />
                </div>
                <h3 className="mt-3 text-lg font-display font-semibold text-white">
                  {enjeu.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {enjeu.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
