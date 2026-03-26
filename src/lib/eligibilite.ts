// Éligibilité Fibre & 4G/5G - via backend OVH
// Geocoding BAN (client-side) + backend pour ARCEP + ANFR

const ELIG_API = process.env.NEXT_PUBLIC_ELIG_API || "https://eligibilite.dahouse.fr";

export interface GeocodedAddress {
	label: string;
	id: string; // BAN address code (e.g. "92064_0123_00012")
	housenumber: string;
	street: string;
	postcode: string;
	city: string;
	citycode: string;
	lat: number;
	lon: number;
}

export interface FtthOperator {
	name: string;
	technology: string;
	technologyLabel: string;
	downloadClass: string;
	uploadClass: string;
}

export interface AntennaResult {
	operator: string;
	technology: string;
	generation: string;
	lat: number;
	lon: number;
	distance: number;
	address: string;
	height: string;
	status: string;
}

export interface EligibiliteResult {
	address: GeocodedAddress;
	ftth: {
		available: boolean;
		operators: FtthOperator[];
		otherTechs: FtthOperator[];
		imbCode: string | null;
		nbLogements: number | null;
		imbType: string | null;
		imbSource: string | null;
		imbAddress: string | null;
		oi: string | null;
	};
	antennas: AntennaResult[];
	timestamp: number;
}

export interface EligProgress {
	phase: "idle" | "geocoding" | "checking" | "done" | "error";
	progress: number;
	message: string;
	detail?: string;
}

// --- Geocoding via BAN ---
export async function geocodeAddress(query: string): Promise<GeocodedAddress[]> {
	// Try housenumber first, fallback to any type
	let res = await fetch(
		`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&type=housenumber`
	);
	if (!res.ok) throw new Error("Erreur de géocodage");
	let data = await res.json();

	if (data.features.length === 0) {
		res = await fetch(
			`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
		);
		if (!res.ok) throw new Error("Erreur de géocodage");
		data = await res.json();
	}

	return data.features.map((f: { properties: Record<string, string>; geometry: { coordinates: number[] } }) => ({
		label: f.properties.label,
		id: f.properties.id || "",
		housenumber: f.properties.housenumber || "",
		street: f.properties.street || "",
		postcode: f.properties.postcode || "",
		city: f.properties.city || "",
		citycode: f.properties.citycode || "",
		lat: f.geometry.coordinates[1],
		lon: f.geometry.coordinates[0],
	}));
}

// --- Main eligibility check via backend ---
export async function runEligibilite(
	address: GeocodedAddress,
	onProgress: (p: EligProgress) => void
): Promise<EligibiliteResult> {
	onProgress({
		phase: "checking",
		progress: 20,
		message: "Vérification en cours",
		detail: "Interrogation des bases ARCEP et ANFR...",
	});

	const res = await fetch(`${ELIG_API}/eligibilite`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			lat: address.lat,
			lon: address.lon,
			postcode: address.postcode,
			citycode: address.citycode,
			addr_code: address.id,
		}),
	});

	if (!res.ok) {
		throw new Error("Erreur lors de la vérification d'éligibilité");
	}

	const data = await res.json();

	onProgress({ phase: "done", progress: 100, message: "Bilan terminé" });

	return {
		address,
		ftth: data.ftth,
		antennas: data.antennas,
		timestamp: Date.now(),
	};
}
