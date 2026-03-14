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
    title: "Flinchify — The Human Signal Layer for AI-Built Products",
    description: "AI builds the product. Humans find the friction. Real testers deliver screen recordings, bug reports, and every flinch moment — in hours, not weeks.",
    type: "website",
    siteName: "Flinchify",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Flinchify — The human signal layer for startups" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] },
  keywords: ["hire real users to test your app", "get paid to test websites", "usability testing marketplace", "user testing platform", "pay testers to test my app", "app testing", "beta testing", "UX feedback", "website usability testing", "remote user testing", "human testers"],
};

import GlobalAuth from "@/components/GlobalAuth";
import SupportChat from "@/components/SupportChat";
import { Analytics } from "@vercel/analytics/next";
import { WAITLIST_MODE } from "@/lib/config";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${sora.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Flinchify",
              "url": "https://flinchify.com",
              "description": "The human signal layer for AI-built products. Real humans test your app and find every friction point — screen recordings, bug reports, and honest feedback delivered in hours.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "5",
                "priceCurrency": "USD",
                "description": "Pay per tester, starting at $5 per test"
              },
              "creator": {
                "@type": "Organization",
                "name": "Flinchify",
                "url": "https://flinchify.com",
                "sameAs": [
                  "https://x.com/Flinchify",
                  "https://www.linkedin.com/in/flinchify-undefined-60b4123b6/"
                ]
              }
            }),
          }}
        />
        {children}
        {!WAITLIST_MODE && <GlobalAuth />}
        {!WAITLIST_MODE && <SupportChat />}
        <Analytics />
      </body>
    </html>
  );
}
