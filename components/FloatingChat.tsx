"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  BotMessageSquare,
  ChevronRight,
  ImagePlus,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Message = { id: number; text: string; sender: "user" | "ai"; image?: string };

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! Ada yang bisa saya bantu terkait paket foto wedding atau wisuda?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() && !imagePreview) return;
    
    const userMsg: Message = { 
        id: Date.now(), 
        text: input, 
        sender: "user",
        image: imagePreview || undefined 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setImagePreview(null);
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = "Terima kasih! Saya sedang memproses data paket tersebut untuk Anda.";
      if (input.toLowerCase().includes("harga")) {
        aiResponse = "Tentu! Ini adalah daftar harga paket unggulan kami:";
      } else if (imagePreview) {
        aiResponse = "Foto referensi diterima! Konsepnya sangat menarik. Paket 'Wedding Luxury' kami memiliki tone warna yang senada dengan ini. Mau saya buatkan draf booking-nya?";
      }

      const aiMsg: Message = { id: Date.now() + 1, text: aiResponse, sender: "ai" };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed right-3 bottom-3 left-3 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6 sm:left-auto sm:gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            className="w-full sm:w-auto"
          >
            <Card className="flex h-[min(78vh,38rem)] w-full max-w-none flex-col overflow-hidden rounded-[2rem] border border-sky-100 bg-white/95 shadow-[0_30px_100px_-36px_rgba(14,116,144,0.55)] backdrop-blur-xl sm:h-[600px] sm:w-[430px] sm:max-w-[430px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-sky-50 pb-4">
                <div>
                  <CardTitle className="text-xl font-bold text-sky-700">
                    Potreed Assist
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    Tanya paket, jadwal, atau referensi mood sesi.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="size-5" />
                </Button>
              </CardHeader>
              
              <CardContent
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
              >
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-3xl p-4 text-sm leading-6 sm:text-[15px] ${
                        m.sender === "user"
                          ? "rounded-br-md bg-sky-600 text-white"
                          : "rounded-bl-md bg-sky-50 text-slate-700"
                      }`}
                    >
                      {m.image && (
                        <Image
                          src={m.image}
                          width={320}
                          height={180}
                          unoptimized
                          className="mb-2 max-h-40 w-full rounded-2xl object-cover"
                          alt="upload"
                        />
                      )}
                      {m.text}
                      {m.sender === "ai" && m.text.includes("daftar harga") && (
                        <div className="mt-4 rounded-2xl border border-sky-100 bg-white/80 p-3">
                          <div className="flex justify-between border-b border-sky-100 pb-2 text-sm font-bold">
                            <span>Paket</span>
                            <span>Harga</span>
                          </div>
                          <div className="mt-2 flex justify-between text-sm">
                            <span>Wisuda Signature</span>
                            <span>Rp 3,25jt</span>
                          </div>
                          <div className="mt-1 flex justify-between text-sm">
                            <span>Wedding Grand Story</span>
                            <span>Rp 12,5jt</span>
                          </div>
                          <Link
                            href="/packages"
                            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700"
                          >
                            Lihat daftar lengkap
                            <ChevronRight className="size-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-3xl rounded-bl-md bg-sky-50 p-4">
                      <Loader2 className="size-5 animate-spin text-sky-500" />
                    </div>
                  </div>
                )}
              </CardContent>

              <div className="flex flex-col gap-2 border-t border-sky-50 bg-white p-3 sm:p-4">
                {imagePreview && (
                  <div className="relative h-16 w-16">
                    <Image
                      src={imagePreview}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-full w-full rounded-2xl border object-cover"
                      alt="preview"
                    />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-0.5 text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <label className="cursor-pointer rounded-2xl p-3 transition-colors hover:bg-slate-100">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <ImagePlus className="size-5 text-slate-500" />
                  </label>
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Ketik pesan..."
                  />
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-2xl bg-sky-600 hover:bg-sky-700"
                  >
                    <Send className="size-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-2 rounded-full bg-sky-600 text-white shadow-lg shadow-sky-200/80 transition-all hover:bg-sky-700 ${
          isOpen ? "w-14 h-14 px-0 py-0" : "w-14 h-14 px-0 py-0 sm:w-auto sm:px-6 sm:py-4"
        }`}
      >
        <BotMessageSquare className="size-5 sm:size-6" />
        {!isOpen ? (
          <span className="hidden font-bold text-sm sm:inline-flex">Tanya PotreedAssist</span>
        ) : null}
      </motion.button>
    </div>
  );
}
