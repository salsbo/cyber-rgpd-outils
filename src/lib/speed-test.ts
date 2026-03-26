// Bilan de performance Internet - Client-side
// Mesure : latence, débit descendant, débit montant, chargement sites, DNS

export type TestPhase = "idle" | "detect" | "latency" | "download" | "upload" | "sites" | "dns" | "done" | "error";

export interface ConnectionInfo {
	ip: string;
	location: string;
	datacenter: string;
	isp: string;
	connectionType: string; // wifi, ethernet, 4g, unknown
	effectiveType: string; // slow-2g, 2g, 3g, 4g
}

export interface SpeedResult {
	latency: { avg: number; min: number; max: number; jitter: number };
	download: { mbps: number; bytes: number; durationMs: number };
	upload: { mbps: number; bytes: number; durationMs: number };
	sites: SiteResult[];
	dns: DnsResult[];
	connection: ConnectionInfo | null;
	score: number; // 0-100
	grade: string; // A+ à F
	timestamp: number;
}

export interface SiteResult {
	name: string;
	url: string;
	ttfbMs: number;
	status: "ok" | "slow" | "error";
}

export interface DnsResult {
	name: string;
	ip: string;
	medianMs: number;
}

export interface TestProgress {
	phase: TestPhase;
	progress: number;
	message: string;
	detail?: string;
}

// --- Reference grids ---
export const GRADE_THRESHOLDS = [
	{ grade: "A+", minScore: 90, label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", desc: "Connexion fibre optimale" },
	{ grade: "A", minScore: 80, label: "Très bon", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", desc: "Très bonne connexion" },
	{ grade: "B", minScore: 65, label: "Bon", color: "text-amber-300", bg: "bg-amber-300/10 border-amber-300/20", desc: "Connexion correcte pour la plupart des usages" },
	{ grade: "C", minScore: 50, label: "Moyen", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", desc: "Suffisant pour la navigation, limite pour la visio HD" },
	{ grade: "D", minScore: 30, label: "Faible", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", desc: "Connexion lente - ADSL ou 3G" },
	{ grade: "F", minScore: 0, label: "Insuffisant", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", desc: "Connexion très limitée" },
];

export const REFERENCE_PROFILES = [
	{ name: "Fibre FTTH", download: 300, upload: 100, latency: 10, score: 95 },
	{ name: "Fibre FTTB/coax", download: 100, upload: 30, latency: 15, score: 85 },
	{ name: "VDSL2", download: 50, upload: 8, latency: 25, score: 70 },
	{ name: "ADSL2+", download: 15, upload: 1, latency: 40, score: 50 },
	{ name: "4G mobile", download: 30, upload: 10, latency: 50, score: 55 },
	{ name: "3G", download: 3, upload: 0.5, latency: 100, score: 25 },
];

const SPEED_API = "https://speed-test.dahouse.fr";

const TEST_SITES = [
	{ name: "Google", url: "https://www.google.com/favicon.ico" },
	{ name: "Microsoft", url: "https://www.microsoft.com/favicon.ico" },
	{ name: "Amazon", url: "https://www.amazon.com/favicon.ico" },
	{ name: "GitHub", url: "https://github.com/favicon.ico" },
];

const DOH_RESOLVERS = [
	{ name: "Cloudflare", ip: "1.1.1.1", host: "cloudflare-dns.com" },
	{ name: "Google", ip: "8.8.8.8", host: "dns.google" },
];

// --- Detection ---
async function detectConnection(): Promise<ConnectionInfo | null> {
	try {
		const res = await fetch("https://1.1.1.1/cdn-cgi/trace", { cache: "no-store" });
		const text = await res.text();
		const data: Record<string, string> = {};
		for (const line of text.split("\n")) {
			const eq = line.indexOf("=");
			if (eq > 0) data[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
		}

		const ip = data.ip || "";
		let isp = "Fournisseur inconnu";
		if (/^(90\.|86\.|92\.|80\.1[2-5])/.test(ip)) isp = "Orange / Sosh";
		else if (/^(82\.64|88\.1[2-9]|78\.2)/.test(ip)) isp = "Free / Freebox";
		else if (/^(176\.1[3-9]|109\.2[1-9])/.test(ip)) isp = "SFR";
		else if (/^(2\.3|193\.25)/.test(ip)) isp = "Bouygues Telecom";
		else if (/^(51\.|52\.|54\.)/.test(ip)) isp = "AWS";
		else if (/^(213\.32|51\.2)/.test(ip)) isp = "OVH";

		// Network Information API
		const nav = navigator as Navigator & { connection?: { type?: string; effectiveType?: string } };
		const conn = nav.connection;

		return {
			ip: data.ip || "inconnu",
			location: data.loc || "inconnu",
			datacenter: data.colo || "inconnu",
			isp,
			connectionType: conn?.type || "unknown",
			effectiveType: conn?.effectiveType || "unknown",
		};
	} catch {
		return null;
	}
}

// --- Latency test (10 pings) ---
async function measureLatency(onDetail: (s: string) => void): Promise<SpeedResult["latency"]> {
	const times: number[] = [];
	for (let i = 0; i < 10; i++) {
		onDetail(`Ping ${i + 1}/10...`);
		const start = performance.now();
		try {
			await fetch(`${SPEED_API}/ping?_=${Date.now()}`, { cache: "no-store" });
			times.push(Math.round(performance.now() - start));
		} catch {
			// skip
		}
	}

	if (times.length === 0) return { avg: 999, min: 999, max: 999, jitter: 999 };

	const sorted = [...times].sort((a, b) => a - b);
	const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
	const min = sorted[0];
	const max = sorted[sorted.length - 1];

	let jitter = 0;
	if (times.length > 1) {
		let total = 0;
		for (let i = 1; i < times.length; i++) total += Math.abs(times[i] - times[i - 1]);
		jitter = Math.round(total / (times.length - 1));
	}

	return { avg, min, max, jitter };
}

// --- Download speed ---
async function measureDownload(onDetail: (s: string) => void): Promise<SpeedResult["download"]> {
	onDetail("Téléchargement de 5 Mo...");
	const start = performance.now();
	try {
		const res = await fetch(`${SPEED_API}/download?_=${Date.now()}`, { cache: "no-store" });
		const blob = await res.blob();
		const durationMs = Math.round(performance.now() - start);
		const bytes = blob.size;
		const mbps = Math.round(((bytes * 8) / (durationMs / 1000)) / 1_000_000 * 10) / 10;
		return { mbps, bytes, durationMs };
	} catch {
		return { mbps: 0, bytes: 0, durationMs: 0 };
	}
}

// --- Upload speed ---
async function measureUpload(onDetail: (s: string) => void): Promise<SpeedResult["upload"]> {
	onDetail("Envoi de 2 Mo...");
	// Fill with a simple pattern instead of random (avoids crypto.getRandomValues 64KB limit)
	const data = new Uint8Array(2 * 1024 * 1024);
	for (let i = 0; i < data.length; i++) data[i] = i & 0xff;
	const start = performance.now();
	try {
		await fetch(`${SPEED_API}/upload`, {
			method: "POST",
			body: data,
			headers: { "Content-Type": "application/octet-stream" },
		});
		const durationMs = Math.round(performance.now() - start);
		const bytes = data.byteLength;
		const mbps = Math.round(((bytes * 8) / (durationMs / 1000)) / 1_000_000 * 10) / 10;
		return { mbps, bytes, durationMs };
	} catch {
		return { mbps: 0, bytes: 0, durationMs: 0 };
	}
}

// --- Site TTFB ---
async function measureSites(onDetail: (s: string) => void): Promise<SiteResult[]> {
	const results: SiteResult[] = [];
	for (const site of TEST_SITES) {
		onDetail(`Chargement de ${site.name}...`);
		const start = performance.now();
		try {
			await Promise.race([
				fetch(site.url + `?_=${Date.now()}`, { mode: "no-cors", cache: "no-store" }),
				new Promise((_, rej) => setTimeout(() => rej(), 5000)),
			]);
			const ms = Math.round(performance.now() - start);
			results.push({
				name: site.name,
				url: site.url,
				ttfbMs: ms,
				status: ms < 500 ? "ok" : "slow",
			});
		} catch {
			results.push({ name: site.name, url: site.url, ttfbMs: 9999, status: "error" });
		}
	}
	return results;
}

// --- DNS benchmark (simplified) ---
async function measureDns(onDetail: (s: string) => void): Promise<DnsResult[]> {
	const results: DnsResult[] = [];
	const domains = ["microsoft.com", "github.com", "amazon.com"];

	for (const resolver of DOH_RESOLVERS) {
		onDetail(`Test DNS ${resolver.name}...`);
		const times: number[] = [];
		for (const domain of domains) {
			const start = performance.now();
			try {
				const url = resolver.host === "dns.google"
					? `https://dns.google/resolve?name=${domain}&type=A`
					: `https://${resolver.host}/dns-query?name=${domain}&type=A`;
				const headers = resolver.host !== "dns.google"
					? { Accept: "application/dns-json" }
					: undefined;
				await Promise.race([
					fetch(url, { headers, cache: "no-store" }),
					new Promise((_, rej) => setTimeout(() => rej(), 3000)),
				]);
				times.push(Math.round(performance.now() - start));
			} catch { /* skip */ }
		}
		const sorted = [...times].sort((a, b) => a - b);
		const median = sorted[Math.floor(sorted.length / 2)] ?? 9999;
		results.push({ name: resolver.name, ip: resolver.ip, medianMs: median });
	}

	return results.sort((a, b) => a.medianMs - b.medianMs);
}

// --- Score calculation ---
function calculateScore(
	latency: SpeedResult["latency"],
	download: SpeedResult["download"],
	upload: SpeedResult["upload"],
	sites: SiteResult[],
): { score: number; grade: string } {
	// Latency score (0-25 points)
	let latencyScore = 25;
	if (latency.avg > 200) latencyScore = 5;
	else if (latency.avg > 100) latencyScore = 10;
	else if (latency.avg > 50) latencyScore = 18;
	else if (latency.avg > 20) latencyScore = 22;

	// Download score (0-35 points)
	let dlScore = 35;
	if (download.mbps < 1) dlScore = 2;
	else if (download.mbps < 5) dlScore = 8;
	else if (download.mbps < 15) dlScore = 15;
	else if (download.mbps < 50) dlScore = 22;
	else if (download.mbps < 100) dlScore = 28;

	// Upload score (0-20 points)
	let ulScore = 20;
	if (upload.mbps < 0.5) ulScore = 2;
	else if (upload.mbps < 2) ulScore = 6;
	else if (upload.mbps < 5) ulScore = 10;
	else if (upload.mbps < 20) ulScore = 15;

	// Site loading score (0-20 points)
	const avgTtfb = sites.filter(s => s.status !== "error").reduce((a, s) => a + s.ttfbMs, 0) /
		Math.max(1, sites.filter(s => s.status !== "error").length);
	let siteScore = 20;
	if (avgTtfb > 1000) siteScore = 4;
	else if (avgTtfb > 500) siteScore = 8;
	else if (avgTtfb > 300) siteScore = 12;
	else if (avgTtfb > 150) siteScore = 16;

	const score = Math.min(100, latencyScore + dlScore + ulScore + siteScore);
	const gradeEntry = GRADE_THRESHOLDS.find(g => score >= g.minScore) || GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1];

	return { score, grade: gradeEntry.grade };
}

// --- Main test ---
export async function runSpeedTest(
	onProgress: (p: TestProgress) => void
): Promise<SpeedResult> {
	// Detect
	onProgress({ phase: "detect", progress: 2, message: "Identification de votre connexion", detail: "Détection de votre adresse IP et fournisseur internet..." });
	const connection = await detectConnection();
	onProgress({ phase: "detect", progress: 8, message: "Connexion identifiée", detail: connection ? `${connection.isp} - ${connection.ip}` : undefined });

	// Latency
	onProgress({ phase: "latency", progress: 10, message: "Test de latence", detail: "10 mesures aller-retour vers le serveur..." });
	const latency = await measureLatency((d) => onProgress({ phase: "latency", progress: 18, message: "Test de latence", detail: d }));
	onProgress({ phase: "latency", progress: 22, message: `Latence : ${latency.avg} ms`, detail: `Min ${latency.min}ms - Max ${latency.max}ms - Gigue ${latency.jitter}ms` });

	// Download
	onProgress({ phase: "download", progress: 25, message: "Test de débit descendant", detail: "Téléchargement d'un fichier de 5 Mo..." });
	const download = await measureDownload((d) => onProgress({ phase: "download", progress: 40, message: "Débit descendant", detail: d }));
	onProgress({ phase: "download", progress: 50, message: `Débit descendant : ${download.mbps} Mbps` });

	// Upload
	onProgress({ phase: "upload", progress: 52, message: "Test de débit montant", detail: "Envoi de 2 Mo vers le serveur..." });
	const upload = await measureUpload((d) => onProgress({ phase: "upload", progress: 65, message: "Débit montant", detail: d }));
	onProgress({ phase: "upload", progress: 70, message: `Débit montant : ${upload.mbps} Mbps` });

	// Sites
	onProgress({ phase: "sites", progress: 72, message: "Test de chargement de sites", detail: "Mesure du temps de réponse de sites populaires..." });
	const sites = await measureSites((d) => onProgress({ phase: "sites", progress: 82, message: "Chargement de sites", detail: d }));

	// DNS
	onProgress({ phase: "dns", progress: 85, message: "Test des résolveurs DNS", detail: "Comparaison Cloudflare vs Google..." });
	const dns = await measureDns((d) => onProgress({ phase: "dns", progress: 92, message: "Test DNS", detail: d }));

	// Score
	const { score, grade } = calculateScore(latency, download, upload, sites);

	onProgress({ phase: "done", progress: 100, message: "Bilan terminé" });

	return {
		latency,
		download,
		upload,
		sites,
		dns,
		connection,
		score,
		grade,
		timestamp: Date.now(),
	};
}

export function getGradeInfo(grade: string) {
	return GRADE_THRESHOLDS.find(g => g.grade === grade) || GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1];
}
