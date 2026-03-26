"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Mail } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  metierSlug?: string;
  metierLabel?: string;
  initialMessage?: string;
  height?: string;
}

const DEFAULT_INITIAL = "Bonjour ! Je suis l'assistant DAHOUSE. Je suis là pour comprendre votre situation et identifier comment on pourrait vous aider. Pas de formulaire, pas de cases à cocher — on discute.\n\nQu'est-ce qui vous amène aujourd'hui ?";

export default function ChatWidget({
  metierSlug,
  metierLabel,
  initialMessage,
  height = "550px",
}: ChatWidgetProps) {
  const greeting = initialMessage || (metierLabel
    ? `Bonjour ! Je suis l'assistant DAHOUSE, spécialisé dans l'accompagnement des professionnels du secteur ${metierLabel.toLowerCase()}.\n\nDites-moi ce qui vous préoccupe au quotidien côté informatique — une lenteur, un outil qui manque, une inquiétude sur la sécurité ?`
    : DEFAULT_INITIAL);

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailCollected, setEmailCollected] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendConversationByEmail = async (email: string) => {
    const conversationSummary = messages
      .map((m) => `${m.role === "user" ? "Vous" : "DAHOUSE"}: ${m.content}`)
      .join("\n\n");

    try {
      // Send to oscar@dahouse.fr (lead notification)
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Lead Chat",
          lastName: metierLabel || "Page contact",
          email,
          subject: metierLabel ? `Chat IA — ${metierLabel}` : "Chat IA — Contact",
          message: conversationSummary,
          metier: metierSlug || "contact",
        }),
      });

      // Send recap to the prospect
      await fetch("/api/chat-recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, conversation: conversationSummary }),
      });

      setEmailSent(true);

      // Google Ads conversion tracking
      if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "conversion", {
          send_to: "AW-17887383937/Wq3UCN6i9OwbEIGjr9FC",
          value: 1.0,
          currency: "EUR",
        });
      }
    } catch {
      // Silent fail
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Track first message as Google Ads conversion (lead intent)
    if (messages.length === 1 && typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-17887383937/Wq3UCN6i9OwbEIGjr9FC",
      });
    }

    // Check if user provided an email
    const emailMatch = trimmed.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    if (emailMatch && !emailCollected) {
      setEmailCollected(true);
      await sendConversationByEmail(emailMatch[0]);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          metierSlug,
        }),
      });

      if (!response.ok) throw new Error("Erreur API");

      const data = await response.json();
      const newMessages = [...updatedMessages, { role: "assistant" as const, content: data.message }];
      setMessages(newMessages);

      // After 4+ exchanges (8+ messages), suggest email if not collected
      if (newMessages.length >= 8 && !emailCollected && !showEmailPrompt) {
        setShowEmailPrompt(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, je rencontre un souci technique. Vous pouvez nous écrire directement à contact@dahouse.fr.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden flex flex-col"
      style={{ height }}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Assistant DAHOUSE</p>
          <p className="text-[11px] text-muted-foreground">
            IA de qualification — un humain vous recontacte ensuite
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-blue-500" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white/5 text-white/90 border border-white/5 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-white/60" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {emailSent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-300 text-center flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Récapitulatif envoyé — un membre de l&apos;équipe vous recontacte rapidement.
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez votre situation..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white text-sm resize-none placeholder:text-white/30"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
          Assistant IA — vos échanges servent uniquement à qualifier votre besoin
        </p>
      </div>
    </div>
  );
}
