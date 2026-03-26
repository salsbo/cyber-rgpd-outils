"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface FtthMapProps {
	center: [number, number];
	imbCode: string | null;
}

export default function FtthMap({ center, imbCode }: FtthMapProps) {
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
			zoomControl: false,
			attributionControl: false,
			dragging: false,
			scrollWheelZoom: false,
			doubleClickZoom: false,
			touchZoom: false,
		}).setView(center, 17);

		L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
			maxZoom: 19,
		}).addTo(map);

		// Building marker
		const icon = L.divIcon({
			className: "",
			html: `<div style="position:relative;width:20px;height:20px;">
				<div style="
					position:absolute;top:0;left:0;
					width:20px;height:20px;
					background:rgba(16,185,129,0.3);
					border-radius:50%;
					animation:ftthPulse 2s ease-in-out infinite;
				"></div>
				<div style="
					position:absolute;top:4px;left:4px;
					width:12px;height:12px;
					background:#10b981;
					border:2px solid rgba(255,255,255,0.5);
					border-radius:50%;
					box-shadow:0 0 10px rgba(16,185,129,0.5);
				"></div>
			</div>
			<style>
				@keyframes ftthPulse {
					0%,100% { transform:scale(1); opacity:0.5; }
					50% { transform:scale(2); opacity:0; }
				}
			</style>`,
			iconSize: [20, 20],
			iconAnchor: [10, 10],
		});

		L.marker(center, { icon })
			.bindPopup(`<b>Votre bâtiment</b>${imbCode ? `<br/>IMB : ${imbCode}` : ""}`)
			.addTo(map);

		mapInstanceRef.current = map;

		return () => {
			map.remove();
			mapInstanceRef.current = null;
		};
	}, [center, imbCode]);

	return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
