"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const principles = [
	{
		title: "Pensé pour l'usage",
		description: "Si les équipes n'adoptent pas, on recommence."
	},
	{
		title: "Pensé pour l'exploitation",
		description: "Logs, supervision, sécurité, sauvegardes, documentation."
	},
	{
		title: "Pensé pour durer",
		description: "Architecture claire, évolutions simples, dette technique minimisée."
	},
];

export default function Stats() {
	return (
		<section className="py-24 px-6 border-y border-white/5 bg-white/[0.02]">
			<div className="max-w-5xl mx-auto">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight"
				>
					Pas une "solution". <span className="text-white">Un système exploitable.</span>
				</motion.h2>

				<div className="grid md:grid-cols-3 gap-8">
					{principles.map((principle, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
							className="text-center group"
						>
							<div className="flex justify-center mb-4">
								<div className="p-3 rounded-full bg-white/5 border border-white/5 group-hover:border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10 shadow-lg shadow-black/20">
									<CheckCircle2 className="w-6 h-6 text-white group-hover:text-indigo-300 transition-colors" />
								</div>
							</div>
							<h3 className="text-lg font-semibold text-white mb-2 font-display">
								{principle.title}
							</h3>
							<p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs mx-auto">
								{principle.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
