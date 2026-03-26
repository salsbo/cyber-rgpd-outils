import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
			<div className="relative z-10 text-center max-w-lg mx-auto">
				<h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-400 font-mono tracking-tighter mb-4">
					404
				</h1>

				<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-display">
					Page introuvable
				</h2>

				<p className="text-gray-500 mb-10 text-lg leading-relaxed">
					Cette page n&apos;existe pas ou a ete deplacee. <br />
					Revenons aux outils.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link
						href="/outils"
						className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
					>
						<Home className="w-4 h-4" />
						Outils
					</Link>
					<Link
						href="/outils"
						className="px-8 py-3 bg-gray-100 text-gray-900 border border-gray-200 rounded-full font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Retour
					</Link>
				</div>
			</div>
		</main>
	);
}
