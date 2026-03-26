// src/components/ui/MetierHero.tsx
"use client";

import { motion } from "framer-motion";
import type { Metier } from "@/content/metiers";
import LucideIcon from "@/components/ui/LucideIcon";

const accentStyles: Record<string, { gradient: string; blob: string }> = {
  sky: { gradient: "from-sky-400 to-sky-600", blob: "bg-sky-500/10" },
  amber: { gradient: "from-amber-400 to-amber-600", blob: "bg-amber-500/10" },
  orange: { gradient: "from-orange-400 to-orange-600", blob: "bg-orange-500/10" },
  emerald: { gradient: "from-emerald-400 to-emerald-600", blob: "bg-emerald-500/10" },
  violet: { gradient: "from-violet-400 to-violet-600", blob: "bg-violet-500/10" },
  blue: { gradient: "from-blue-400 to-blue-600", blob: "bg-blue-500/10" },
};

export default function MetierHero({ metier }: { metier: Metier }) {
  const style = accentStyles[metier.accentColor] || accentStyles.blue;

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Gradient blob background */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full ${style.blob} blur-3xl animate-float pointer-events-none`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl mx-auto text-center"
      >
        {/* Mono label */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <LucideIcon name={metier.icon} className="w-4 h-4" />
          <span className="text-[10px] font-mono uppercase tracking-widest">
            {metier.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight">
          {metier.hero.title}
          <br />
          <span className={`bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
            {metier.hero.titleAccent}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          {metier.hero.subtitle}
        </p>
      </motion.div>
    </section>
  );
}
