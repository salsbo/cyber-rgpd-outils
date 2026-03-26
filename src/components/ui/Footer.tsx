import Link from "next/link";

export default function Footer() {
	return (
		<footer className="py-12 px-6 border-t border-white/5 bg-black/20 backdrop-blur-3xl">
			<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
				<div className="flex items-center gap-2">
					<span className="text-xl font-medium tracking-tight text-white">
						dahouse
					</span>
					<span className="text-muted-foreground text-sm ml-4 border-l border-white/10 pl-4 font-light">
						© {new Date().getFullYear()} Tous droits réservés.
					</span>
				</div>

				<div className="flex flex-wrap gap-6 md:gap-8 justify-center md:justify-end">
					<Link href="/sentinel" className="text-sm text-muted-foreground hover:text-white transition-colors">
						Sentinel
					</Link>
					<Link href="/mentions-legales" className="text-sm text-muted-foreground hover:text-white transition-colors">
						Mentions légales
					</Link>
					<Link href="/cgu" className="text-sm text-muted-foreground hover:text-white transition-colors">
						CGU
					</Link>
					<Link href="/confidentialite" className="text-sm text-muted-foreground hover:text-white transition-colors">
						Confidentialité
					</Link>
					<Link href="/contact" className="text-sm text-muted-foreground hover:text-white transition-colors">
						Contact
					</Link>
				</div>
			</div>
		</footer>
	);
}
