"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

const apps = [
  {
    name: "EasyNetPulse",
    description: "Visualisation graphique de la latence réseau (Ping, DNS, HTTP) avec interface style ECG.",
    icon: "/assets/easynetpulse-icon.png",
    appStoreUrl: "https://apps.apple.com/us/app/easynetpulse/id6754982118",
    price: "Gratuit",
    category: "Utilitaires",
  },
  {
    name: "Wifi Pulse",
    description: "Diagnostic Wi-Fi professionnel : monitoring RSSI, bruit, débit, MCS en temps réel.",
    icon: "/assets/wifipulse-icon.png",
    appStoreUrl: "https://apps.apple.com/us/app/wifi-pulse/id6751362204",
    price: "4,99 €",
    category: "Outils Dev",
  },
  {
    name: "Find my LAN device",
    description: "Scanner réseau local : détection des appareils, ports ouverts et latence, sans configuration.",
    icon: "/assets/findmylan-icon.png",
    appStoreUrl: "https://apps.apple.com/us/app/find-my-lan-device/id6751510229",
    price: "3,99 €",
    category: "Utilitaires",
  },
];

export default function AppShowcase() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-4 block">
            App Store
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Nos applications
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Des outils que nous utilisons au quotidien, disponibles sur l'App Store.
          </p>
        </motion.div>

        {/* Apps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app, index) => (
            <motion.a
              key={app.name}
              href={app.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                {/* App Icon */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg shadow-black/20 flex-shrink-0">
                  <Image
                    src={app.icon}
                    alt={`${app.name} icon`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* App Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {app.name}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                      {app.category}
                    </span>
                    <span className="text-xs text-indigo-400 font-medium">
                      {app.price}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* App Store badge */}
              <div className="mt-4 flex justify-end">
                <span className="text-xs text-muted-foreground group-hover:text-white transition-colors flex items-center gap-1">
                  Voir sur l'App Store
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
