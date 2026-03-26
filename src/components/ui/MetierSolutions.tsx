// src/components/ui/MetierSolutions.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Solution } from "@/content/metiers";

const accentText: Record<string, string> = {
  sky: "text-sky-400",
  amber: "text-amber-400",
  orange: "text-orange-400",
  emerald: "text-emerald-400",
  violet: "text-violet-400",
  blue: "text-blue-400",
};

interface MetierSolutionsProps {
  solutions: Solution[];
  accentColor: string;
}

export default function MetierSolutions({ solutions, accentColor }: MetierSolutionsProps) {
  const linkColor = accentText[accentColor] || "text-blue-400";

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-3xl md:text-4xl font-display font-bold tracking-tight text-center mb-12"
        >
          Ce qu&apos;on fait pour vous
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((solution, i) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/20 transition-all"
            >
              <h3 className="text-lg font-display font-semibold text-white">
                {solution.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {solution.description}
              </p>
              {solution.linkTo && (
                <Link
                  href={solution.linkTo}
                  className={`inline-block mt-4 text-sm font-medium ${linkColor} hover:underline`}
                >
                  En savoir plus →
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
