import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "ShipTest — Real humans test your app in hours",
  description: "Post a test job, set your budget, and real humans matched to your audience will test your app. Screen recordings, bug reports, honest feedback.",
  metadataBase: new URL("https://shiptest.dev"),
  openGraph: {
    title: "ShipTest — Real humans test your app in hours",
    description: "Post a test job. Set your budget. Matched humans test your app. Results in hours.",
    type: "website",
    siteName: "ShipTest",
  },
  twitter: { card: "summary_large_image" },
  keywords: ["user testing", "app testing", "beta testing", "QA testing", "human testers", "vibe coding", "indie dev"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-[family-name:var(--font-inter)] antialiased">
        <div className="mesh-bg" />
        {children}
      </body>
    </html>
  );
}
