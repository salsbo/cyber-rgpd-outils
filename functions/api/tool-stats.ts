// Cloudflare Pages Function — Tool stats (usage counts + ratings)
// Uses Cloudflare KV REST API directly (no binding needed)

function corsOrigin(request: Request): string {
	const origin = request.headers.get("Origin") || "";
	const allowed = ["https://dahouse.fr", "https://outils.cyber-rgpd.com"];
	return allowed.includes(origin) ? origin : allowed[0];
}

function corsHeaders(request: Request) {
	return {
		"Access-Control-Allow-Origin": corsOrigin(request),
		"Content-Type": "application/json",
	};
}

const CF_ACCOUNT_ID = "8f4ca2fd779c71617abe3fabda706cd8";
const KV_NAMESPACE_ID = "360ae513ef2843e7aa178878a6c4a43b";

const BASE_COUNTS: Record<string, number> = {
	"audit-email": 0,
	"test-visio": 0,
	"scan-ports": 0,
	"dns-bench": 0,
	"eligibilite": 0,
	"diagnostic": 0,
	"easynetpulse": 0,
	"test-4g": 0,
	"simulation-wifi": 0,
	"cyberarnaques": 0,
};

const VALID_TOOLS = new Set(Object.keys(BASE_COUNTS));

// KV REST API helpers
const kvUrl = (key: string) =>
	`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;

async function kvGet(key: string, apiToken: string): Promise<string | null> {
	const res = await fetch(kvUrl(key), {
		headers: { Authorization: `Bearer ${apiToken}` },
	});
	if (!res.ok) return null;
	return res.text();
}

async function kvPut(key: string, value: string, apiToken: string, expirationTtl?: number): Promise<void> {
	const url = expirationTtl
		? `${kvUrl(key)}?expiration_ttl=${expirationTtl}`
		: kvUrl(key);
	await fetch(url, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${apiToken}`,
			"Content-Type": "text/plain",
		},
		body: value,
	});
}

async function kvDelete(key: string, apiToken: string): Promise<void> {
	await fetch(kvUrl(key), {
		method: "DELETE",
		headers: { Authorization: `Bearer ${apiToken}` },
	});
}

// GET /api/tool-stats — return all stats
export async function onRequestGet(context: any) {
	const { request, env } = context;
	const apiToken = env.CF_KV_API_TOKEN;

	// Fallback: try binding first, then REST API
	const kv = env.TOOL_STATS;

	if (!kv && !apiToken) {
		return new Response(JSON.stringify({ error: "KV not configured" }), {
			status: 503,
			headers: corsHeaders(request),
		});
	}

	const stats: Record<string, { usage: number; up: number; down: number }> = {};
	const slugs = Object.keys(BASE_COUNTS);
	const get = (key: string) => kv ? kv.get(key) : kvGet(key, apiToken);

	// All reads in parallel — single burst instead of sequential loop
	const keys = slugs.flatMap(s => [`usage:${s}`, `rating:${s}:up`, `rating:${s}:down`]);
	const values = await Promise.all(keys.map(k => get(k)));

	for (let i = 0; i < slugs.length; i++) {
		const slug = slugs[i];
		stats[slug] = {
			usage: (BASE_COUNTS[slug] || 0) + parseInt(values[i * 3] || "0", 10),
			up: parseInt(values[i * 3 + 1] || "0", 10),
			down: parseInt(values[i * 3 + 2] || "0", 10),
		};
	}

	return new Response(JSON.stringify(stats), {
		status: 200,
		headers: { ...corsHeaders(request), "Cache-Control": "public, max-age=30" },
	});
}

// POST /api/tool-stats — increment usage or rate
export async function onRequestPost(context: any) {
	const { request, env } = context;
	const apiToken = env.CF_KV_API_TOKEN;
	const kv = env.TOOL_STATS;

	if (!kv && !apiToken) {
		return new Response(JSON.stringify({ error: "KV not configured" }), {
			status: 503,
			headers: corsHeaders(request),
		});
	}

	const data = await request.json();
	const { action, tool } = data;

	if (!tool || !VALID_TOOLS.has(tool)) {
		return new Response(JSON.stringify({ error: "Invalid tool" }), {
			status: 400,
			headers: corsHeaders(request),
		});
	}

	const ip = request.headers.get("CF-Connecting-IP") || "unknown";

	// Helper functions that work with either binding or REST API
	const get = (key: string) => kv ? kv.get(key) : kvGet(key, apiToken);
	const put = (key: string, value: string, opts?: { expirationTtl?: number }) =>
		kv ? kv.put(key, value, opts) : kvPut(key, value, apiToken, opts?.expirationTtl);
	const del = (key: string) => kv ? kv.delete(key) : kvDelete(key, apiToken);

	if (action === "usage") {
		const usageIpKey = `usage-ip:${tool}:${ip}`;
		const alreadyCounted = await get(usageIpKey);

		if (alreadyCounted) {
			const current = parseInt((await get(`usage:${tool}`)) || "0", 10);
			return new Response(
				JSON.stringify({ usage: BASE_COUNTS[tool] + current }),
				{ status: 200, headers: corsHeaders(request) }
			);
		}

		const key = `usage:${tool}`;
		const current = parseInt((await get(key)) || "0", 10);
		await put(key, (current + 1).toString());
		await put(usageIpKey, "1", { expirationTtl: 86400 });

		return new Response(
			JSON.stringify({ usage: BASE_COUNTS[tool] + current + 1 }),
			{ status: 200, headers: corsHeaders(request) }
		);
	}

	if (action === "rate") {
		const { vote } = data;
		const voteIpKey = `vote-ip:${tool}:${ip}`;
		const existingVote = await get(voteIpKey);

		if (existingVote === vote) {
			return new Response(JSON.stringify({ ok: true, already: true }), {
				status: 200,
				headers: corsHeaders(request),
			});
		}

		if (existingVote) {
			const prevKey = `rating:${tool}:${existingVote}`;
			const prevVal = parseInt((await get(prevKey)) || "0", 10);
			if (prevVal > 0) {
				await put(prevKey, (prevVal - 1).toString());
			}
		}

		if (vote === "up" || vote === "down") {
			const key = `rating:${tool}:${vote}`;
			const current = parseInt((await get(key)) || "0", 10);
			await put(key, (current + 1).toString());
			await put(voteIpKey, vote);
		} else {
			await del(voteIpKey);
		}

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: corsHeaders(request),
		});
	}

	return new Response(JSON.stringify({ error: "Invalid action" }), {
		status: 400,
		headers: corsHeaders(request),
	});
}

// CORS preflight
export async function onRequestOptions(context: any) {
	const { request } = context;
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": corsOrigin(request),
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}
