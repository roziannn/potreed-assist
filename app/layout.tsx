import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import { ToastProvider } from "@/components/ui/toast-provider";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import "./globals.css";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Potreed | Jasa foto dan videographer",
  description: "Dilengkapi dengan Asisten AI cerdas untuk bantu kebutuhanmu.",
   other: {
    "dicoding:email": "usherkentt@gmail.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>
          <AnalyticsTracker />
          {children}
        </ToastProvider>
          <Footer />

      </body>
    </html>
  );
}