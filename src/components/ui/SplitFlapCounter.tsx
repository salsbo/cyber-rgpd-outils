"use client";

import { motion } from "framer-motion";

function SplitFlapDigit({ digit }: { digit: string }) {
	return (
		<div className="relative w-[22px] h-[30px] sm:w-[26px] sm:h-[34px]">
			{/* Card background */}
			<div className="absolute inset-0 bg-gray-100 rounded-[4px] border border-gray-200 overflow-hidden">
				{/* Split line */}
				<div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 z-20" />
				<div className="absolute top-1/2 left-0 right-0 h-px bg-white z-20 translate-y-px" />
			</div>

			{/* Static digit */}
			<div className="absolute inset-0 flex items-center justify-center z-10">
				<span className="text-sm sm:text-base font-mono font-bold text-gray-900 leading-none select-none">
					{digit}
				</span>
			</div>
		</div>
	);
}

interface SplitFlapCounterProps {
	value: number;
	label?: string;
	minDigits?: number;
}

export default function SplitFlapCounter({
	value,
	label = "utilisations",
	minDigits = 4,
}: SplitFlapCounterProps) {
	const digits = value.toString().padStart(minDigits, "0").split("");

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex items-center gap-1.5"
		>
			<div className="flex items-center gap-[2px]">
				{digits.map((d, i) => (
					<SplitFlapDigit key={`${i}-pos`} digit={d} />
				))}
			</div>
			{label && (
				<span className="text-[10px] sm:text-xs text-muted-foreground font-mono whitespace-nowrap">
					{label}
				</span>
			)}
		</motion.div>
	);
}
