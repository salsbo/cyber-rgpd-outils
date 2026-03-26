"use client";

import { motion } from "framer-motion";
import { Ear, Eye, Rocket, ShieldCheck, RefreshCw } from "lucide-react";

const steps = [
	{
		number: "1",
		icon: <Ear className="w-5 h-5" />,
		title: "On comprend",
		description: "Vos usages, vos contraintes, ce qui bloque"
	},
	{
		number: "2",
		icon: <Eye className="w-5 h-5" />,
		title: "On montre",
		description: "Une maquette pour valider avant de développer"
	},
	{
		number: "3",
		icon: <Rocket className="w-5 h-5" />,
		title: "On livre",
		description: "Une première version utilisable, rapidement"
	},
	{
		number: "4",
		icon: <ShieldCheck className="w-5 h-5" />,
		title: "On fiabilise",
		description: "Sécurité, performance, montée en charge"
	},
	{
		number: "5",
		icon: <RefreshCw className="w-5 h-5" />,
		title: "On maintient",
		description: "Corrections, évolutions, surveillance"
	},
];

export default function Methodology() {
	return (
		<section className="py-32 px-6 relative border-t border-white/5">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
					<div>
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white"
						>
							Notre approche.
						</motion.h2>
						<p className="text-muted-foreground font-light max-w-md">
							Pas de projet tunnel de 6 mois. On avance par étapes courtes, avec vous.
						</p>
					</div>
				</div>

				<div className="relative">
					{/* Connecting Line (Desktop) */}
					<motion.div
						initial={{ scaleX: 0, opacity: 0 }}
						whileInView={{ scaleX: 1, opacity: 1 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 1.5, ease: "easeInOut" }}
						className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent origin-left"
					/>

					<div className="grid md:grid-cols-5 gap-6 relative z-10">
						{steps.map((step, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ delay: i * 0.15, duration: 0.5 }}
								className="group"
							>
								<div className="mb-8 flex items-center justify-center md:justify-start">
									<div className="w-24 h-24 rounded-full bg-[#0B0F14] border border-white/10 flex items-center justify-center relative group-hover:border-white/30 transition-all duration-500 shadow-2xl shadow-black/50 overflow-hidden">
										<span className="font-mono text-xs text-white/30 absolute top-4">0{step.number}</span>
										<div className="text-white/60 group-hover:text-white transition-colors">
											{step.icon}
										</div>
									</div>
								</div>

								<div className="text-center md:text-left">
									<h3 className="text-lg font-bold text-white mb-2 font-display">
										{step.title}
									</h3>
									<p className="text-sm text-muted-foreground font-light leading-relaxed">
										{step.description}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
