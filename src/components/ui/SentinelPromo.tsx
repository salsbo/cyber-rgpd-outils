"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Wifi,
  Bell,
  LayoutDashboard,
  Network,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function SentinelPromo() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-red-500/5 via-blue-500/10 to-purple-500/5 border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />

          <div className="relative grid lg:grid-cols-2 gap-6 md:gap-8 p-6 md:p-10 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-4 md:mb-5">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-medium text-red-300">Fini le Cluedo</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 font-display">
                <span className="text-white">Quand ça plante,</span>{" "}
                <span className="gradient-text">vous savez quoi.</span>
              </h2>

              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                Vous gérez plusieurs sites sans équipe IT ? DAHOUSE Sentinel surveille tout ce qui est connecté
                et un spécialiste s'en occupe quand ça coince.
              </p>

              <ul className="space-y-2 mb-5 md:mb-6">
                {[
                  "Tout ce qui est connecté, surveillé",
                  "Alertes instantanées sur iPhone",
                  "Un humain qui prend le relais",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-white/80"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs md:text-sm">{item}</span>
                  </motion.li>
                ))}
              </ul>

              <Link
                href="/sentinel"
                className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all hover:scale-105 text-xs md:text-sm"
              >
                Découvrir Sentinel
                <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Link>
            </motion.div>

            {/* Mini iPhone Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative flex justify-center"
            >
              <div className="relative scale-90 md:scale-100">
                {/* Phone Frame */}
                <div className="relative w-[180px] md:w-[200px] h-[380px] md:h-[420px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[35px] md:rounded-[40px] p-2 shadow-2xl shadow-blue-500/30 border border-white/10">
                  <div className="w-full h-full bg-[#0B0F14] rounded-[30px] md:rounded-[34px] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-20 h-4 md:h-5 bg-black rounded-b-lg md:rounded-b-xl z-10" />

                    {/* App Content */}
                    <div className="pt-6 md:pt-7 px-2 md:px-2.5 h-full">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center text-[7px] md:text-[8px] text-white/60 mb-2">
                        <span>9:41</span>
                        <div className="flex gap-1 items-center">
                          <Wifi className="w-2 h-2" />
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="mb-2 md:mb-3">
                        <h3 className="text-white font-bold text-[10px] md:text-xs">Mes Sites</h3>
                        <p className="text-white/50 text-[7px] md:text-[8px]">3 sites</p>
                      </div>

                      {/* Site Cards */}
                      <div className="space-y-1.5">
                        {[
                          { name: "Concession Lyon", status: "ok" },
                          { name: "Magasin Grenoble", status: "warning" },
                          { name: "Agence Annecy", status: "critical" },
                        ].map((site, i) => (
                          <motion.div
                            key={site.name}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="bg-white/5 rounded-md md:rounded-lg p-1.5 md:p-2 border border-white/5"
                          >
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                site.status === "ok" ? "bg-emerald-400" :
                                site.status === "warning" ? "bg-amber-400" :
                                "bg-red-400"
                              } animate-pulse`} />
                              <span className="text-white text-[8px] md:text-[9px] font-medium">{site.name}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Alert notification */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                        className="mt-2 md:mt-3 bg-red-500/10 border border-red-500/20 rounded-md p-1.5 md:p-2"
                      >
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-400" />
                          <span className="text-[7px] md:text-[8px] text-white">Internet coupé</span>
                        </div>
                      </motion.div>

                      {/* Bottom Nav */}
                      <div className="absolute bottom-4 md:bottom-5 left-2 md:left-2.5 right-2 md:right-2.5 bg-white/5 rounded-lg md:rounded-xl p-1.5 flex justify-around border border-white/5">
                        <LayoutDashboard className="w-3 h-3 text-blue-500" />
                        <Network className="w-3 h-3 text-white/40" />
                        <Bell className="w-3 h-3 text-white/40" />
                        <Activity className="w-3 h-3 text-white/40" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating "C'est géré" badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="absolute -right-2 md:-right-3 bottom-20 md:bottom-24 bg-[#0F1319] border border-emerald-500/30 rounded-lg p-1.5 md:p-2 shadow-xl"
                >
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] md:text-[9px] text-white font-medium">C'est géré</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
