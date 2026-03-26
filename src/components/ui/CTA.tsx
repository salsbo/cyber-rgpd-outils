"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
	return (
		<section className="py-32 px-6 relative overflow-hidden">
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />

			<div className="max-w-4xl mx-auto text-center relative z-10">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-white"
				>
					Pr&ecirc;t &agrave; en parler ?
				</motion.h2>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light"
				>
					R&eacute;ponse sous 48h avec une premi&egrave;re recommandation — gratuite et sans engagement.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
					className="flex justify-center"
				>
					<Link
						href="/contact"
						className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium text-lg hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
					>
						Parlez-nous de votre situation
						<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
