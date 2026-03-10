import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";

const body = DM_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"] });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Flinchify | Hire Real Users to Test Your App | Usability Testing Marketplace",
  description: "Hire real users to test your app and find every friction point. Get paid to test websites. The usability testing marketplace for indie builders — real humans, honest feedback, delivered in hours.",
  metadataBase: new URL("https://flinchify.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Flinchify | Hire Real Users to Test Your App | Usability Testing Marketplace",
    description: "Hire real users to test your app. Get paid to test websites. Pay-per-tester usability testing marketplace — no subscriptions, real feedback in hours.",
    type: "website",
    siteName: "Flinchify",
  },
  twitter: { card: "summary_large_image" },
  keywords: ["hire real users to test your app", "get paid to test websites", "usability testing marketplace", "user testing platform", "pay testers to test my app", "app testing", "beta testing", "UX feedback", "website usability testing", "remote user testing", "human testers"],
};

import GlobalAuth from "@/components/GlobalAuth";
import SupportChat from "@/components/SupportChat";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${sora.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased overflow-x-hidden">
        {children}
        <GlobalAuth />
        <SupportChat />
      </body>
    </html>
  );
}
