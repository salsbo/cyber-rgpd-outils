"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Thumbs up / down rating - localStorage + API avec protection IP    */
/* ------------------------------------------------------------------ */

interface ToolRatingProps {
	slug: string;
}

export default function ToolRating({ slug }: ToolRatingProps) {
	const [vote, setVote] = useState<"up" | "down" | null>(null);
	const [counts, setCounts] = useState({ up: 0, down: 0 });
	const [mounted, setMounted] = useState(false);

	const voteKey = `tool-vote-${slug}`;
	const countsKey = `tool-counts-${slug}`;

	useEffect(() => {
		setMounted(true);
		const savedVote = localStorage.getItem(voteKey);
		if (savedVote === "up" || savedVote === "down") {
			setVote(savedVote);
		}
		const savedCounts = localStorage.getItem(countsKey);
		if (savedCounts) {
			try {
				setCounts(JSON.parse(savedCounts));
			} catch {}
		}
	}, [voteKey, countsKey]);

	function handleVote(v: "up" | "down") {
		const newVote = vote === v ? null : v;
		const newCounts = { ...counts };

		if (vote) newCounts[vote] = Math.max(0, newCounts[vote] - 1);
		if (newVote) newCounts[newVote] = newCounts[newVote] + 1;

		setVote(newVote);
		setCounts(newCounts);

		if (newVote) {
			localStorage.setItem(voteKey, newVote);
		} else {
			localStorage.removeItem(voteKey);
		}
		localStorage.setItem(countsKey, JSON.stringify(newCounts));

		// API avec protection IP (fire-and-forget)
		fetch("/api/tool-stats", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: "rate", tool: slug, vote: newVote, previousVote: vote }),
		}).catch(() => {});
	}

	if (!mounted) return null;

	const total = counts.up + counts.down;
	const upPercent = total > 0 ? Math.round((counts.up / total) * 100) : null;
	// Afficher le % dominant : vert si positif, rouge si negatif, gris si 50/50
	const displayPercent = upPercent !== null ? (upPercent >= 50 ? upPercent : 100 - upPercent) : null;
	const percentColor = upPercent !== null
		? upPercent > 50 ? "text-emerald-600" : upPercent < 50 ? "text-red-600" : "text-gray-500"
		: "";

	return (
		<div
			className="flex flex-col items-center gap-0.5"
			onClick={(e) => e.preventDefault()}
		>
			<div className="flex items-center gap-0.5">
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleVote("up");
					}}
					className={`p-1 rounded-md transition-all ${
						vote === "up"
							? "text-emerald-600 bg-emerald-50 scale-110"
							: "text-emerald-400 hover:text-emerald-600 hover:bg-gray-100"
					}`}
					aria-label="Utile"
				>
					<ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
				</button>
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleVote("down");
					}}
					className={`p-1 rounded-md transition-all ${
						vote === "down"
							? "text-red-600 bg-red-50 scale-110"
							: "text-red-400 hover:text-red-600 hover:bg-gray-100"
					}`}
					aria-label="Pas utile"
				>
					<ThumbsDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
				</button>
			</div>
			{displayPercent !== null && (
				<span className={`text-[10px] font-mono leading-none ${percentColor}`}>
					{displayPercent}%
				</span>
			)}
		</div>
	);
}
