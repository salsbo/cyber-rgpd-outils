// WebRTC Quality Test - Client-side
// Measures: latency, jitter, packet loss, NAT type, CDN vs server latency
// Calculates MOS (ITU-T G.107 E-model)
// Security: token-based access

export type TestPhase = "idle" | "token" | "cdn" | "nat" | "connecting" | "measuring" | "done" | "error";

export type NatType = "open" | "full-cone" | "restricted" | "symmetric" | "unknown";

export type QualityLevel = "excellent" | "good" | "degraded" | "unusable";

export interface ScoreBreakdown {
	latencyPenalty: number;
	jitterPenalty: number;
	packetLossPenalty: number;
}

export interface QualityMetrics {
	latency: number;
	minLatency: number; // best RTT = pure network propagation
	localOverhead: number; // avg - min = local network overhead (WiFi, switch, etc.)
	jitter: number;
	packetLoss: number;
	bandwidth: number;
	natType: NatType;
	mos: number;
	quality: QualityLevel;
	samples: number;
	cdnLatency: number;
	breakdown: ScoreBreakdown;
}

export interface TestProgress {
	phase: TestPhase;
	progress: number;
	message: string;
	detail?: string;
	metrics?: QualityMetrics;
	error?: string;
}

interface TokenResponse {
	token: string;
	wsUrl: string;
	expiresIn: number;
}

const STUN_SERVERS = [
	"stun:stun.l.google.com:19302",
	"stun:stun1.l.google.com:19302",
];

const TEST_DURATION_MS = 10_000;
const PACKET_INTERVAL_MS = 20;
const PACKET_SIZE = 160;

// --- MOS Calculation (ITU-T G.107 E-model simplified) ---
export function calculateMOS(
	latencyMs: number,
	jitterMs: number,
	packetLossPercent: number
): { mos: number; quality: QualityLevel; breakdown: ScoreBreakdown } {
	const effectiveLatency = latencyMs + 2 * jitterMs + 10;

	// Start from ideal R=93.2 (MOS ~4.4)
	let R = 93.2;

	// Latency penalty
	let latencyPenalty: number;
	if (effectiveLatency < 160) {
		latencyPenalty = effectiveLatency / 40;
	} else {
		latencyPenalty = (effectiveLatency - 120) / 10;
	}
	R -= latencyPenalty;

	// Packet loss penalty
	const packetLossPenalty = 2.5 * packetLossPercent;
	R -= packetLossPenalty;

	// Jitter is embedded in effectiveLatency, extract its contribution
	const jitterPenalty = (2 * jitterMs) / 40;

	R = Math.max(0, Math.min(100, R));

	let mos: number;
	if (R <= 0) mos = 1.0;
	else if (R >= 100) mos = 4.5;
	else mos = 1 + 0.035 * R + R * (R - 60) * (100 - R) * 7e-6;

	mos = Math.round(mos * 10) / 10;
	mos = Math.max(1.0, Math.min(5.0, mos));

	let quality: QualityLevel;
	if (mos >= 4.0) quality = "excellent";
	else if (mos >= 3.5) quality = "good";
	else if (mos >= 2.5) quality = "degraded";
	else quality = "unusable";

	return {
		mos,
		quality,
		breakdown: {
			latencyPenalty: Math.round(latencyPenalty * 100) / 100,
			jitterPenalty: Math.round(jitterPenalty * 100) / 100,
			packetLossPenalty: Math.round(packetLossPenalty * 100) / 100,
		},
	};
}

// --- CDN latency test (measures path to nearest Cloudflare edge) ---
async function measureCdnLatency(): Promise<number> {
	const pings: number[] = [];
	for (let i = 0; i < 5; i++) {
		const start = performance.now();
		try {
			await fetch("https://1.1.1.1/cdn-cgi/trace", {
				mode: "no-cors",
				cache: "no-store",
			});
			pings.push(performance.now() - start);
		} catch {
			// skip failed pings
		}
	}
	if (pings.length === 0) return -1;
	// Remove highest and lowest, average the rest
	pings.sort((a, b) => a - b);
	const trimmed = pings.length >= 3 ? pings.slice(1, -1) : pings;
	return Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
}

// --- NAT Type Detection ---
async function detectNatType(): Promise<NatType> {
	return new Promise((resolve) => {
		const pc = new RTCPeerConnection({
			iceServers: [{ urls: STUN_SERVERS }],
		});

		const candidates: RTCIceCandidate[] = [];
		const timeout = setTimeout(() => {
			pc.close();
			resolve(analyzeNat(candidates));
		}, 5000);

		pc.onicecandidate = (e) => {
			if (e.candidate) {
				candidates.push(e.candidate);
			} else {
				clearTimeout(timeout);
				pc.close();
				resolve(analyzeNat(candidates));
			}
		};

		pc.createDataChannel("nat-detect");
		pc.createOffer().then((offer) => pc.setLocalDescription(offer));
	});
}

function analyzeNat(candidates: RTCIceCandidate[]): NatType {
	const types = candidates.map((c) => c.type).filter(Boolean);
	const hasHost = types.includes("host");
	const hasSrflx = types.includes("srflx");
	const hasRelay = types.includes("relay");

	const srflxIps = new Set(
		candidates
			.filter((c) => c.type === "srflx" && c.address)
			.map((c) => c.address)
	);

	if (!hasSrflx && !hasRelay) {
		if (hasHost) return "open";
		return "unknown";
	}
	if (hasSrflx) {
		if (srflxIps.size > 1) return "symmetric";
		return "full-cone";
	}
	if (hasRelay && !hasSrflx) return "symmetric";
	return "restricted";
}

// --- Token request ---
async function requestToken(apiUrl: string): Promise<TokenResponse> {
	const res = await fetch(`${apiUrl}/token`, { method: "POST" });
	if (!res.ok) throw new Error("Serveur de test indisponible");
	return res.json();
}

// --- Main test flow ---
export async function runQualityTest(
	apiUrl: string,
	onProgress: (progress: TestProgress) => void
): Promise<QualityMetrics> {
	// Phase 0: Token
	onProgress({
		phase: "token",
		progress: 2,
		message: "Préparation du test",
		detail: "Demande d\u2019un accès sécurisé au serveur de mesure...",
	});

	let tokenData: TokenResponse;
	try {
		tokenData = await requestToken(apiUrl);
	} catch {
		onProgress({
			phase: "error",
			progress: 0,
			message: "Serveur indisponible",
			error: "Le serveur de test ne répond pas. Réessayez dans quelques instants.",
		});
		throw new Error("Token request failed");
	}

	onProgress({
		phase: "token",
		progress: 5,
		message: "Accès autorisé",
		detail: "Le serveur de test est prêt.",
	});

	// Phase 1: CDN latency
	onProgress({
		phase: "cdn",
		progress: 8,
		message: "Test de votre accès internet",
		detail: "Mesure du temps de réponse vers internet (5 essais)...",
	});

	const cdnLatency = await measureCdnLatency();

	onProgress({
		phase: "cdn",
		progress: 15,
		message: "Accès internet mesuré",
		detail: cdnLatency > 0
			? `Temps de réponse internet : ${cdnLatency} ms`
			: "Mesure internet non disponible",
	});

	// Phase 2: NAT Detection
	onProgress({
		phase: "nat",
		progress: 18,
		message: "Analyse de votre réseau local",
		detail: "Détection du type de pare-feu et de routeur entre vous et internet...",
	});

	let natType: NatType;
	try {
		natType = await detectNatType();
	} catch {
		natType = "unknown";
	}

	onProgress({
		phase: "nat",
		progress: 22,
		message: "Réseau analysé",
		detail: natTypeLabel(natType),
	});

	// Phase 3: Connect
	onProgress({
		phase: "connecting",
		progress: 25,
		message: "Connexion au serveur de test",
		detail: "Établissement d\u2019une liaison directe (comme un appel Teams ou Zoom)...",
	});

	let ws: WebSocket;
	let pc: RTCPeerConnection;
	let dataChannel: RTCDataChannel;

	try {
		ws = new WebSocket(tokenData.wsUrl);
		await waitForOpen(ws);

		onProgress({
			phase: "connecting",
			progress: 28,
			message: "Négociation en cours",
			detail: "Échange des paramètres de connexion avec le serveur...",
		});

		pc = new RTCPeerConnection({
			iceServers: [{ urls: STUN_SERVERS }],
		});

		dataChannel = pc.createDataChannel("quality-test", { ordered: false });

		pc.onicecandidate = (e) => {
			if (e.candidate) {
				ws.send(JSON.stringify({ type: "ice", candidate: e.candidate }));
			}
		};

		ws.onmessage = async (event) => {
			const msg = JSON.parse(event.data);
			if (msg.type === "answer") {
				await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
			} else if (msg.type === "ice" && msg.candidate) {
				await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
			}
		};

		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);
		ws.send(JSON.stringify({ type: "offer", sdp: pc.localDescription }));

		await waitForDataChannel(dataChannel);

		onProgress({
			phase: "connecting",
			progress: 32,
			message: "Liaison établie",
			detail: "Connexion directe active - le test va commencer.",
		});
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : "Connexion impossible";
		onProgress({
			phase: "error",
			progress: 0,
			message: "Connexion impossible",
			error: errorMsg,
		});
		throw new Error(errorMsg);
	}

	// Phase 4: Measurement
	const measurePhases = [
		{ at: 0, msg: "Envoi de paquets audio simulés", detail: "Simulation d\u2019un appel vocal : 50 paquets/seconde pendant 10 secondes..." },
		{ at: 15, msg: "Mesure du temps de réponse", detail: "Calcul du délai aller-retour entre votre PC et le serveur..." },
		{ at: 40, msg: "Test de la stabilité", detail: "Analyse des variations de délai (gigue) - un indicateur clé de la qualité audio..." },
		{ at: 65, msg: "Vérification de la fiabilité", detail: "Comptage des paquets perdus en route - même 1% peut dégrader un appel..." },
		{ at: 85, msg: "Calcul du score final", detail: "Application du modèle MOS (Mean Opinion Score) utilisé par les opérateurs télécoms..." },
	];

	let currentPhaseIdx = 0;

	const metrics = await measureQuality(dataChannel, natType, cdnLatency, (pct) => {
		// Update sub-phase messages
		while (currentPhaseIdx < measurePhases.length - 1 && pct >= measurePhases[currentPhaseIdx + 1].at) {
			currentPhaseIdx++;
		}
		const phase = measurePhases[currentPhaseIdx];
		const progress = 32 + Math.round(pct * 0.58);
		onProgress({
			phase: "measuring",
			progress,
			message: phase.msg,
			detail: phase.detail,
		});
	});

	// Cleanup
	dataChannel.close();
	pc.close();
	ws.close();

	// Phase 5: Done
	onProgress({
		phase: "done",
		progress: 100,
		message: qualityMessage(metrics.quality),
		metrics,
	});

	return metrics;
}

async function measureQuality(
	dc: RTCDataChannel,
	natType: NatType,
	cdnLatency: number,
	onProgress: (pct: number) => void
): Promise<QualityMetrics> {
	return new Promise((resolve) => {
		const sentPackets = new Map<number, number>();
		const rtts: number[] = [];
		let seq = 0;
		let received = 0;
		const startTime = Date.now();

		dc.onmessage = (event) => {
			const data = new Uint8Array(event.data as ArrayBuffer);
			const view = new DataView(data.buffer);
			const echoSeq = view.getUint32(0);
			const sentTime = sentPackets.get(echoSeq);
			if (sentTime !== undefined) {
				rtts.push(Date.now() - sentTime);
				received++;
				sentPackets.delete(echoSeq);
			}
		};

		const sendInterval = setInterval(() => {
			const elapsed = Date.now() - startTime;

			if (elapsed >= TEST_DURATION_MS) {
				clearInterval(sendInterval);

				setTimeout(() => {
					const totalSent = seq;
					const packetLoss = totalSent > 0 ? ((totalSent - received) / totalSent) * 100 : 0;
					const avgLatency = rtts.length > 0 ? rtts.reduce((a, b) => a + b, 0) / rtts.length : 999;

					let jitter = 0;
					if (rtts.length > 1) {
						let totalDiff = 0;
						for (let i = 1; i < rtts.length; i++) {
							totalDiff += Math.abs(rtts[i] - rtts[i - 1]);
						}
						jitter = totalDiff / (rtts.length - 1);
					}

					const durationSec = elapsed / 1000;
					const bandwidth = (received * PACKET_SIZE * 8) / durationSec / 1000;

					// Min RTT = pure propagation delay (best case, no queuing)
					// Avg - Min = overhead added by local network (WiFi contention, switch, etc.)
					const sortedRtts = [...rtts].sort((a, b) => a - b);
					// Use 5th percentile as min to filter outliers
					const p5Index = Math.floor(sortedRtts.length * 0.05);
					const minRtt = sortedRtts.length > 0 ? sortedRtts[Math.max(0, p5Index)] : avgLatency;
					const localOverhead = Math.max(0, Math.round(avgLatency - minRtt));

					const { mos, quality, breakdown } = calculateMOS(avgLatency / 2, jitter, packetLoss);

					resolve({
						latency: Math.round(avgLatency),
						minLatency: Math.round(minRtt),
						localOverhead,
						jitter: Math.round(jitter * 10) / 10,
						packetLoss: Math.round(packetLoss * 10) / 10,
						bandwidth: Math.round(bandwidth),
						natType,
						mos,
						quality,
						samples: rtts.length,
						cdnLatency,
						breakdown,
					});
				}, 1000);
				return;
			}

			const buffer = new ArrayBuffer(PACKET_SIZE);
			const view = new DataView(buffer);
			view.setUint32(0, seq);
			sentPackets.set(seq, Date.now());

			try { dc.send(buffer); } catch { /* closing */ }

			seq++;
			onProgress((elapsed / TEST_DURATION_MS) * 100);
		}, PACKET_INTERVAL_MS);
	});
}

// --- Helpers ---
function waitForOpen(ws: WebSocket): Promise<void> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error("Timeout connexion")), 10000);
		ws.onopen = () => { clearTimeout(timeout); resolve(); };
		ws.onerror = () => { clearTimeout(timeout); reject(new Error("Erreur WebSocket")); };
	});
}

function waitForDataChannel(dc: RTCDataChannel): Promise<void> {
	return new Promise((resolve, reject) => {
		if (dc.readyState === "open") { resolve(); return; }
		const timeout = setTimeout(() => reject(new Error("Timeout data channel")), 15000);
		dc.onopen = () => { clearTimeout(timeout); resolve(); };
		dc.onerror = () => { clearTimeout(timeout); reject(new Error("Erreur data channel")); };
	});
}

function natTypeLabel(nat: NatType): string {
	switch (nat) {
		case "open": return "Réseau ouvert - aucune restriction";
		case "full-cone": return "Réseau compatible - NAT standard";
		case "restricted": return "Réseau restreint - limitations possibles";
		case "symmetric": return "Réseau restrictif - peut poser problème en visio";
		default: return "Type de réseau non déterminé";
	}
}

function qualityMessage(quality: QualityLevel): string {
	switch (quality) {
		case "excellent": return "Votre connexion est excellente pour la visioconférence";
		case "good": return "Votre connexion est bonne pour la visioconférence";
		case "degraded": return "Votre connexion est instable - risque de coupures";
		case "unusable": return "Votre connexion ne permet pas une visioconférence correcte";
	}
}

// --- Labels for UI ---
export function mosLabel(mos: number): string {
	if (mos >= 4.0) return "Excellente";
	if (mos >= 3.5) return "Bonne";
	if (mos >= 2.5) return "Dégradée";
	return "Inutilisable";
}

export function natLabel(nat: NatType): string {
	switch (nat) {
		case "open": return "Ouvert";
		case "full-cone": return "Compatible";
		case "restricted": return "Restreint";
		case "symmetric": return "Restrictif";
		default: return "Inconnu";
	}
}

export function natSimpleDescription(nat: NatType): string {
	switch (nat) {
		case "open": return "Votre réseau laisse passer les flux vidéo sans restriction.";
		case "full-cone": return "Votre réseau est compatible avec la plupart des outils de visioconférence.";
		case "restricted": return "Certains appels pourraient nécessiter un relais. La qualité peut varier.";
		case "symmetric": return "Votre réseau est très restrictif. Les appels passent souvent par un relais, ce qui peut dégrader la qualité.";
		default: return "Impossible de déterminer la configuration réseau.";
	}
}
