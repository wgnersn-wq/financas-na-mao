import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. CONFIGURAÇÃO DOS METADADOS DO PWA (PADRÃO OFICIAL NEXT.JS)
export const metadata: Metadata = {
  title: "Finanças na Mão",
  description: "Seu controle financeiro pessoal de qualquer lugar",
  manifest: "/manifest.json", // Vincula o PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Finanças na Mão",
  },
};

// 2. CONFIGURAÇÃO VISUAL MOBILE E VIEWPORT (EXIGIDO PELO NEXT.JS EM COMPONENTES DE SERVIDOR)
export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Faz o app ocupar a área total até em telas com notch/câmera na tela
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}