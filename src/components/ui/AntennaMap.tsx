"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { AntennaResult } from "@/lib/eligibilite";

interface AntennaMapProps {
	center: [number, number];
	antennas: AntennaResult[];
	getColor: (operator: string) => string;
}

const ZOOM_DISTANCE: Record<number, number> = {
	18: 500, 17: 800, 16: 1200, 15: 2000, 14: 3000, 13: 5000, 12: 8000, 11: 15000, 10: 30000,
};

function maxDistForZoom(zoom: number): number {
	if (zoom >= 18) return 500;
	if (zoom <= 10) return 30000;
	return ZOOM_DISTANCE[zoom] || 5000;
}

export default function AntennaMap({ center, antennas, getColor }: AntennaMapProps) {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<L.Map | null>(null);

	useEffect(() => {
		if (!mapRef.current) return;

		if (!document.querySelector('link[href*="leaflet"]')) {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
			document.head.appendChild(link);
		}

		if (mapInstanceRef.current) {
			mapInstanceRef.current.remove();
			mapInstanceRef.current = null;
		}

		const map = L.map(mapRef.current, {
			zoomControl: true,
			attributionControl: false,
			dragging: false,
			scrollWheelZoom: true,
			doubleClickZoom: true,
			touchZoom: true,
		}).setView(center, 15);

		L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
			maxZoom: 19,
		}).addTo(map);

		// Site marker (pulsing)
		const siteIcon = L.divIcon({
			className: "",
			html: `<div style="position:relative;width:24px;height:24px;">
				<div style="
					position:absolute;top:0;left:0;width:24px;height:24px;
					background:rgba(99,102,241,0.3);border-radius:50%;
					animation:sitePulse 2s ease-in-out infinite;
				"></div>
				<div style="
					position:absolute;top:4px;left:4px;width:16px;height:16px;
					background:white;border:3px solid rgba(99,102,241,0.9);
					border-radius:50%;box-shadow:0 0 12px rgba(99,102,241,0.6);
				"></div>
			</div>
			<style>
				@keyframes sitePulse {
					0%,100%{transform:scale(1);opacity:0.6;}
					50%{transform:scale(1.8);opacity:0;}
				}
			</style>`,
			iconSize: [24, 24],
			iconAnchor: [12, 12],
		});

		L.marker(center, { icon: siteIcon })
			.bindPopup("<b>Votre site</b>")
			.addTo(map);

		const layerGroup = L.layerGroup().addTo(map);

		function renderAntennas() {
			layerGroup.clearLayers();
			const zoom = map.getZoom();
			const maxDist = maxDistForZoom(zoom);
			const visible = antennas.filter(ant => ant.distance <= maxDist);

			// Offset overlapping — spread by index at same position
			const posCount = new Map<string, number>();

			for (const ant of visible) {
				const color = getColor(ant.operator);
				const posKey = `${ant.lat.toFixed(3)}-${ant.lon.toFixed(3)}`;
				const idx = posCount.get(posKey) || 0;
				posCount.set(posKey, idx + 1);

				// Offset in different directions
				const angle = (idx * Math.PI * 2) / 5 + Math.PI / 6;
				const offsetDist = idx > 0 ? 0.0008 : 0;
				const antLat = ant.lat + Math.sin(angle) * offsetDist;
				const antLon = ant.lon + Math.cos(angle) * offsetDist;
				const antPos: [number, number] = [antLat, antLon];

				// Line
				L.polyline([center, antPos], {
					color,
					weight: 1.5,
					opacity: 0.35,
					dashArray: "5, 8",
				}).addTo(layerGroup);

				// Antenna marker
				const gens = ant.generation.split("+");
				const genLabel = gens.join("/");
				const distText = ant.distance < 1000 ? `${ant.distance}m` : `${(ant.distance / 1000).toFixed(1)}km`;

				L.marker(antPos, {
					icon: L.divIcon({
						className: "",
						html: `<div style="
							width:14px;height:14px;
							background:${color};
							border:2px solid rgba(255,255,255,0.4);
							border-radius:50%;
							box-shadow:0 0 8px ${color}80;
						"></div>`,
						iconSize: [14, 14],
						iconAnchor: [7, 7],
					}),
				})
				.bindPopup(`
					<b style="color:${color}">${ant.operator}</b><br/>
					${genLabel} — ${ant.technology}<br/>
					Distance : ${distText}<br/>
					Hauteur : ${ant.height}m<br/>
					${ant.address || ""}
				`)
				.addTo(layerGroup);
			}

			// Fit bounds
			if (visible.length > 0) {
				const bounds = L.latLngBounds([center]);
				visible.forEach(ant => bounds.extend([ant.lat, ant.lon]));
				map.fitBounds(bounds, { padding: [50, 50], animate: true });
			}
		}

		renderAntennas();
		map.on("zoomend", renderAntennas);

		mapInstanceRef.current = map;

		return () => {
			map.remove();
			mapInstanceRef.current = null;
		};
	}, [center, antennas, getColor]);

	return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
