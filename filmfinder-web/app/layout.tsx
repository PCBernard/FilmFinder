import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
const head = Space_Grotesk({ subsets: ["latin"], variable: "--font-head" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
export const metadata = { title: "Filmfinder" };
export default function Root({ children }: { children: ReactNode }) {
  return <html lang="de" className={`${head.variable} ${body.variable}`}><body>{children}</body></html>;
}
