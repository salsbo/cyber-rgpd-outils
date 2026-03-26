// DNS Benchmark - Client-side via DNS-over-HTTPS (DoH)
// Compare les résolveurs DNS publics + le DNS actuel du client

export interface DnsResolver {
	id: string;
	name: string;
	ip: string;
	description: string;
	simpleDescription: string;
	color: string;
	security: string;
	isCurrent?: boolean;
}

export interface ResolverResult {
	resolver: DnsResolver;
	avgMs: number;
	minMs: number;
	maxMs: number;
	medianMs: number;
	times: number[];
	errors: number;
	rank: number;
}

export interface ConnectionInfo {
	ip: string;
	location: string;
	datacenter: string;
	isp: string;
	raw: Record<string, string>;
}

export interface BenchResult {
	resolvers: ResolverResult[];
	connection: ConnectionInfo | null;
	timestamp: number;
}

export interface BenchProgress {
	phase: "idle" | "detect" | "running" | "done" | "error";
	progress: number;
	message: string;
	detail?: string;
}

export const DNS_RESOLVERS: DnsResolver[] = [
	{
		id: "cloudflare",
		name: "Cloudflare",
		ip: "1.1.1.1",
		description: "Cloudflare DNS (1.1.1.1) - rapide, vie privée, pas de filtrage",
		simpleDescription: "Rapide et respectueux de la vie privée",
		color: "#f48120",
		security: "Chiffré, pas de logs conservés",
	},
	{
		id: "cloudflare-family",
		name: "Cloudflare Famille",
		ip: "1.1.1.3",
		description: "Cloudflare for Families (1.1.1.3) - bloque malwares + contenu adulte",
		simpleDescription: "Protège toute la famille (bloque les sites dangereux et adultes)",
		color: "#f48120",
		security: "Filtrage malwares + contenu adulte",
	},
	{
		id: "google",
		name: "Google",
		ip: "8.8.8.8",
		description: "Google Public DNS (8.8.8.8) - infrastructure mondiale, très fiable",
		simpleDescription: "Le plus connu, fiable et rapide",
		color: "#4285f4",
		security: "Chiffré, logs anonymisés après 48h",
	},
	{
		id: "cloudflare-security",
		name: "Cloudflare Sécurité",
		ip: "1.1.1.2",
		description: "Cloudflare for Security (1.1.1.2) - bloque les domaines malveillants",
		simpleDescription: "Bloque automatiquement les sites dangereux",
		color: "#f48120",
		security: "Filtrage malwares uniquement",
	},
];

const TEST_DOMAINS = ["microsoft.com", "github.com", "amazon.com", "apple.com"];
// Domains for measuring user's native DNS (cache-busting with random subpath)
const NATIVE_TEST_URLS = [
	"https://www.microsoft.com/favicon.ico",
	"https://www.github.com/favicon.ico",
	"https://www.amazon.com/favicon.ico",
	"https://www.apple.com/favicon.ico",
];
const ROUNDS = 2;
const QUERY_TIMEOUT = 2500;

// --- DoH queries ---

async function queryCloudflareStyle(host: string, domain: string): Promise<number> {
	const start = performance.now();
	const res = await fetch(
		`https://${host}/dns-query?name=${domain}&type=A`,
		{ headers: { Accept: "application/dns-json" }, cache: "no-store" }
	);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	await res.json();
	return Math.round(performance.now() - start);
}

async function queryGoogle(domain: string): Promise<number> {
	const start = performance.now();
	const res = await fetch(
		`https://dns.google/resolve?name=${domain}&type=A`,
		{ cache: "no-store" }
	);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	await res.json();
	return Math.round(performance.now() - start);
}

async function queryResolver(resolver: DnsResolver, domain: string): Promise<number> {
	if (resolver.id === "google") return queryGoogle(domain);
	const host =
		resolver.id === "cloudflare" ? "cloudflare-dns.com" :
		resolver.id === "cloudflare-family" ? "family.cloudflare-dns.com" :
		resolver.id === "cloudflare-security" ? "security.cloudflare-dns.com" :
		"cloudflare-dns.com";
	return queryCloudflareStyle(host, domain);
}

async function timedQuery(resolver: DnsResolver, domain: string): Promise<number> {
	try {
		return await Promise.race([
			queryResolver(resolver, domain),
			new Promise<number>((_, reject) =>
				setTimeout(() => reject(new Error("timeout")), QUERY_TIMEOUT)
			),
		]);
	} catch {
		return -1;
	}
}

// --- Measure user's native DNS via fetch timing ---
async function measureNativeDns(url: string): Promise<number> {
	const cacheBust = `?_cb=${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const start = performance.now();
	try {
		await Promise.race([
			fetch(url + cacheBust, { mode: "no-cors", cache: "no-store" }),
			new Promise((_, reject) => setTimeout(() => reject(), QUERY_TIMEOUT)),
		]);
		return Math.round(performance.now() - start);
	} catch {
		return -1;
	}
}

// --- Detect connection info ---
async function detectConnection(): Promise<ConnectionInfo | null> {
	try {
		const res = await fetch("https://1.1.1.1/cdn-cgi/trace", { cache: "no-store" });
		const text = await res.text();
		const data: Record<string, string> = {};
		for (const line of text.split("\n")) {
			const eq = line.indexOf("=");
			if (eq > 0) data[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
		}

		// Guess ISP from IP range (French ISPs)
		const ip = data.ip || "";
		let isp = "Fournisseur inconnu";
		if (/^(90\.|86\.|92\.|80\.1[2-5])/.test(ip)) isp = "Orange / Sosh";
		else if (/^(82\.64|88\.1[2-9]|78\.2)/.test(ip)) isp = "Free / Freebox";
		else if (/^(176\.1[3-9]|109\.2[1-9])/.test(ip)) isp = "SFR";
		else if (/^(2\.3|193\.25)/.test(ip)) isp = "Bouygues Telecom";
		else if (/^(51\.|52\.|54\.)/.test(ip)) isp = "AWS / Cloud";
		else if (/^(34\.|35\.)/.test(ip)) isp = "Google Cloud";
		else if (/^(213\.32|51\.2)/.test(ip)) isp = "OVH";

		return {
			ip: data.ip || "inconnu",
			location: data.loc || "inconnu",
			datacenter: data.colo || "inconnu",
			isp,
			raw: data,
		};
	} catch {
		return null;
	}
}

// --- Main benchmark ---

export async function runDnsBench(
	onProgress: (p: BenchProgress) => void
): Promise<BenchResult> {
	// Phase 0: Detect connection
	onProgress({
		phase: "detect",
		progress: 2,
		message: "Identification de votre connexion",
		detail: "Détection de votre adresse IP, fournisseur internet et résolveur DNS...",
	});

	const connection = await detectConnection();

	onProgress({
		phase: "detect",
		progress: 8,
		message: "Connexion identifiée",
		detail: connection
			? `${connection.ip} - ${connection.isp} - datacenter ${connection.datacenter}`
			: "Détection non disponible",
	});

	// Phase 1: Measure user's current DNS
	onProgress({
		phase: "running",
		progress: 10,
		message: "Mesure de votre DNS actuel",
		detail: "Résolution de domaines via votre configuration actuelle...",
	});

	const nativeTimes: number[] = [];
	for (const url of NATIVE_TEST_URLS) {
		const ms = await measureNativeDns(url);
		if (ms >= 0) nativeTimes.push(ms);
	}
	// Second round
	for (const url of NATIVE_TEST_URLS) {
		const ms = await measureNativeDns(url);
		if (ms >= 0) nativeTimes.push(ms);
	}

	// Phase 2: Warm up DoH resolvers
	onProgress({
		phase: "running",
		progress: 18,
		message: "Préparation des résolveurs alternatifs",
		detail: "Établissement des connexions sécurisées...",
	});

	await Promise.all(DNS_RESOLVERS.map((r) => timedQuery(r, "example.com")));

	// Phase 3: Benchmark DoH resolvers
	const results: Map<string, number[]> = new Map();
	const errors: Map<string, number> = new Map();
	for (const r of DNS_RESOLVERS) {
		results.set(r.id, []);
		errors.set(r.id, 0);
	}

	const totalOps = DNS_RESOLVERS.length * TEST_DOMAINS.length * ROUNDS;
	let completed = 0;

	for (let round = 0; round < ROUNDS; round++) {
		for (const domain of TEST_DOMAINS) {
			const promises = DNS_RESOLVERS.map(async (resolver) => {
				const ms = await timedQuery(resolver, domain);
				if (ms >= 0) {
					results.get(resolver.id)!.push(ms);
				} else {
					errors.set(resolver.id, (errors.get(resolver.id) || 0) + 1);
				}
				completed++;

				const pct = Math.round((completed / totalOps) * 70) + 22;
				onProgress({
					phase: "running",
					progress: pct,
					message: `Test en cours - tour ${round + 1}/${ROUNDS}`,
					detail: `Résolution de ${domain} via ${resolver.name}...`,
				});
			});

			await Promise.all(promises);
		}
	}

	// Build results with user's DNS included
	const currentDnsResolver: DnsResolver = {
		id: "current",
		name: "Votre connexion actuelle",
		ip: connection?.isp || " -",
		description: `Temps de chargement réel mesuré via ${connection?.isp || "votre fournisseur"} (DNS + connexion)`,
		simpleDescription: `Ce que vous obtenez aujourd'hui avec ${connection?.isp || "votre fournisseur internet"}`,
		color: "#a855f7",
		security: "",
		isCurrent: true,
	};

	// Stats for all resolvers
	const allResolvers = [...DNS_RESOLVERS, currentDnsResolver];
	results.set("current", nativeTimes);
	errors.set("current", NATIVE_TEST_URLS.length * 2 - nativeTimes.length);

	const resolverResults: ResolverResult[] = allResolvers.map((resolver) => {
		const times = results.get(resolver.id) || [];
		const sorted = [...times].sort((a, b) => a - b);

		const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 9999;
		const min = sorted[0] ?? 9999;
		const max = sorted[sorted.length - 1] ?? 9999;
		const median = sorted[Math.floor(sorted.length / 2)] ?? 9999;

		return {
			resolver,
			avgMs: Math.round(avg),
			minMs: min,
			maxMs: max,
			medianMs: median,
			times: sorted,
			errors: errors.get(resolver.id) || 0,
			rank: 0,
		};
	});

	resolverResults.sort((a, b) => a.medianMs - b.medianMs);
	resolverResults.forEach((r, i) => { r.rank = i + 1; });

	onProgress({ phase: "done", progress: 100, message: "Benchmark terminé" });

	return {
		resolvers: resolverResults,
		connection,
		timestamp: Date.now(),
	};
}
