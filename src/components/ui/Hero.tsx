"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
	return (
		<section className="relative pt-32 pb-12 md:pt-48 md:pb-20 px-6 overflow-hidden">
			<div className="max-w-5xl mx-auto text-center relative z-10">
				{/* Tagline */}
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6"
				>
					Prestataire informatique pour PME — Saint-Cloud
				</motion.p>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
					className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.05]"
				>
					On g&egrave;re votre informatique.<br /><span className="gradient-text">Vous g&eacute;rez votre activit&eacute;.</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
					className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light"
				>
					R&eacute;seau, s&eacute;curit&eacute;, applications m&eacute;tier, supervision — une seule &eacute;quipe qui couvre tout, pour que vous n&apos;ayez plus &agrave; y penser.
				</motion.p>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.7, delay: 0.4 }}
					className="flex flex-col sm:flex-row items-center justify-center gap-4"
				>
					<Link
						href="/contact"
						className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/5"
					>
						Parlez-nous de votre situation
						<ArrowRight className="w-4 h-4" />
					</Link>
					<button
						onClick={() => document.getElementById("votre-secteur")?.scrollIntoView({ behavior: "smooth" })}
						className="text-sm text-muted-foreground hover:text-white transition-colors underline underline-offset-4"
					>
						Voir par secteur d&apos;activité
					</button>
				</motion.div>
			</div>
		</section>
	);
}
