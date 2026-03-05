import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";

const body = DM_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"] });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Flinchify — Find the flinch before your users do",
  description: "Real humans matched to your audience test your app and find every friction point. Screen recordings, bug reports, UX feedback — delivered in hours.",
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
    title: "Flinchify — Find the flinch before your users do",
    description: "Post a test job. Set your budget. Matched humans find every flinch moment in your app.",
    type: "website",
    siteName: "Flinchify",
  },
  twitter: { card: "summary_large_image" },
  keywords: ["user testing", "app testing", "beta testing", "human testers", "QA testing", "flinch moments", "UX feedback"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${sora.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
