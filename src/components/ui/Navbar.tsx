"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { metiers } from "@/content/metiers";
import LucideIcon from "@/components/ui/LucideIcon";

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isOffresOpen, setIsOffresOpen] = useState(false);
	const [isMobileOffresOpen, setIsMobileOffresOpen] = useState(false);
	const offresRef = useRef<HTMLDivElement>(null);
	const [isMetierOpen, setIsMetierOpen] = useState(false);
	const [isMobileMetierOpen, setIsMobileMetierOpen] = useState(false);
	const metierRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (offresRef.current && !offresRef.current.contains(event.target as Node)) {
				setIsOffresOpen(false);
			}
			if (metierRef.current && !metierRef.current.contains(event.target as Node)) {
				setIsMetierOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const simpleLinks = [
		{ name: "Blog", href: "/blog" },
		{ name: "Outils", href: "/outils" },
	];

	const offresSubLinks = [
		{ name: "Nos offres", href: "/offres" },
		{ name: "Sentinel", href: "/sentinel" },
	];

	const afterLinks = [
		{ name: "Contact", href: "/contact" },
	];

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			className={cn(
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
				isScrolled ? "bg-background/80 backdrop-blur-md border-white/5 py-4" : "bg-transparent py-6"
			)}
		>
			<div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
				<Link href="/" className="relative w-40 h-10 block">
					<Image
						src="/assets/logo-white.png"
						alt="dahouse logo"
						fill
						className="object-contain object-left"
						priority
					/>
				</Link>

				{/* Desktop Nav */}
				<div className="hidden md:flex items-center gap-8">
					{simpleLinks.map((link) => (
						<Link
							key={link.name}
							href={link.href}
							className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
						>
							{link.name}
						</Link>
					))}

					{/* Votre métier dropdown */}
					<div
						ref={metierRef}
						className="relative"
					>
						<button
							onClick={() => setIsMetierOpen(!isMetierOpen)}
							className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
						>
							Votre métier
							<ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isMetierOpen && "rotate-180")} />
						</button>

						<AnimatePresence>
							{isMetierOpen && (
								<motion.div
									initial={{ opacity: 0, y: -5, scale: 0.98 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -5, scale: 0.98 }}
									transition={{ duration: 0.12 }}
									className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-1.5 bg-[#0F1319] border border-white/10 rounded-xl shadow-xl backdrop-blur-xl w-max"
								>
									{metiers.map((m) => (
										<Link
											key={m.slug}
											href={`/votre-metier/${m.slug}`}
											onClick={() => setIsMetierOpen(false)}
											className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap"
										>
											<LucideIcon name={m.icon} className="w-4 h-4 shrink-0" />
											{m.label}
										</Link>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Offres dropdown */}
					<div
						ref={offresRef}
						className="relative"
					>
						<button
							onClick={() => setIsOffresOpen(!isOffresOpen)}
							className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
						>
							Offres
							<ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isOffresOpen && "rotate-180")} />
						</button>

						<AnimatePresence>
							{isOffresOpen && (
								<motion.div
									initial={{ opacity: 0, y: -5, scale: 0.98 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -5, scale: 0.98 }}
									transition={{ duration: 0.12 }}
									className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-1.5 bg-[#0F1319] border border-white/10 rounded-xl shadow-xl backdrop-blur-xl min-w-[180px]"
								>
									{offresSubLinks.map((sub) => (
										<Link
											key={sub.name}
											href={sub.href}
											onClick={() => setIsOffresOpen(false)}
											className="block px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
										>
											{sub.name}
										</Link>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{afterLinks.map((link) => (
						<Link
							key={link.name}
							href={link.href}
							className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
						>
							{link.name}
						</Link>
					))}

					<button
						onClick={() => window.location.href = "/client"}
						className="text-sm px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
					>
						Espace Client
					</button>
				</div>

				{/* Mobile Toggle */}
				<button
					className="md:hidden text-white"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				>
					{isMobileMenuOpen ? <X /> : <Menu />}
				</button>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="md:hidden bg-background border-b border-white/10 overflow-hidden"
					>
						<div className="flex flex-col p-6 gap-4">
							{simpleLinks.map((link) => (
								<Link
									key={link.name}
									href={link.href}
									className="text-lg font-medium text-muted-foreground hover:text-white"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{link.name}
								</Link>
							))}

							{/* Votre métier accordion mobile */}
							<div>
								<button
									onClick={() => setIsMobileMetierOpen(!isMobileMetierOpen)}
									className="text-lg font-medium text-muted-foreground hover:text-white flex items-center gap-2 w-full"
								>
									Votre métier
									<ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isMobileMetierOpen && "rotate-180")} />
								</button>
								<AnimatePresence>
									{isMobileMetierOpen && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="overflow-hidden"
										>
											<div className="pl-4 pt-2 space-y-2">
												{metiers.map((m) => (
													<Link
														key={m.slug}
														href={`/votre-metier/${m.slug}`}
														className="flex items-center gap-2 text-base text-muted-foreground hover:text-white"
														onClick={() => setIsMobileMenuOpen(false)}
													>
														<LucideIcon name={m.icon} className="w-4 h-4 shrink-0" />
														{m.label}
													</Link>
												))}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Offres accordion mobile */}
							<div>
								<button
									onClick={() => setIsMobileOffresOpen(!isMobileOffresOpen)}
									className="text-lg font-medium text-muted-foreground hover:text-white flex items-center gap-2 w-full"
								>
									Offres
									<ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isMobileOffresOpen && "rotate-180")} />
								</button>
								<AnimatePresence>
									{isMobileOffresOpen && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="overflow-hidden"
										>
											<div className="pl-4 pt-2 space-y-2">
												{offresSubLinks.map((sub) => (
													<Link
														key={sub.name}
														href={sub.href}
														className="block text-base text-muted-foreground hover:text-white"
														onClick={() => setIsMobileMenuOpen(false)}
													>
														{sub.name}
													</Link>
												))}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{afterLinks.map((link) => (
								<Link
									key={link.name}
									href={link.href}
									className="text-lg font-medium text-muted-foreground hover:text-white"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{link.name}
								</Link>
							))}
							<button
								onClick={() => {
									setIsMobileMenuOpen(false);
									window.location.href = "/client";
								}}
								className="text-center py-3 bg-white text-black rounded-lg font-bold w-full"
							>
								Espace Client
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	);
}
