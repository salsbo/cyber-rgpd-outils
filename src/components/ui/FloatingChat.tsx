"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import ChatWidget from "@/components/ui/ChatWidget";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show on /contact (chat is already there) or on /votre-metier/* (chat is inline)
  if (pathname === "/contact" || pathname.startsWith("/votre-metier/")) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Ouvrir le chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]"
          >
            <ChatWidget height="480px" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
