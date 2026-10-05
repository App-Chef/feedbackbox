import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { themeScript } from "@/components/ui/theme-toggle";
import { env } from "@/lib/env";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: "Feedbackbox — Simple Feedback Widget for Developers | Collect User Feedback Easily",
    template: "%s · Feedbackbox",
  },
  description: "Lightweight feedback widget for solo developers and small products. One-line install, anonymous submissions, contextual data capture. Open-source alternative to UserVoice, Canny, and Hotjar feedback. Start collecting user feedback in minutes.",
  keywords: [
    "feedback widget",
    "user feedback tool",
    "customer feedback software",
    "feedback collection",
    "open source feedback",
    "feedback button",
    "user feedback widget",
    "feedback management",
    "product feedback",
    "website feedback tool",
    "feedback for developers",
    "lightweight feedback widget",
    "anonymous feedback",
    "Next.js feedback",
    "Supabase feedback",
    "self-hosted feedback",
    "feedback inbox",
    "feedback dashboard",
    "collect user feedback",
    "embed feedback widget",
  ],
  authors: [{ name: "Feedbackbox" }],
  creator: "Feedbackbox",
  publisher: "Feedbackbox",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: env.appUrl,
    title: "Feedbackbox — Simple Feedback Widget for Developers",
    description: "Lightweight open-source feedback widget. One-line install, anonymous submissions, contextual data. Perfect for solo developers and small products.",
    siteName: "Feedbackbox",
    images: [
      {
        url: `${env.appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Feedbackbox - Simple Feedback Widget for Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feedbackbox — Simple Feedback Widget for Developers",
    description: "Lightweight feedback widget. One-line install, anonymous submissions, contextual data. Open-source.",
    images: [`${env.appUrl}/og-image.png`],
    creator: "@feedbackbox",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: env.appUrl,
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0e" },
  ],
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Feedbackbox",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "150",
  },
  description: "Lightweight open-source feedback widget for developers. Collect user feedback with one line of code.",
  featureList: [
    "One-line installation",
    "Anonymous feedback collection",
    "Contextual data capture (browser, OS, screen size)",
    "Triage dashboard",
    "Multiple projects support",
    "Dark mode support",
    "Open source (MIT licensed)",
    "Self-hostable",
  ],
  softwareVersion: "1.0",
  author: {
    "@type": "Organization",
    name: "Feedbackbox",
  },
  url: env.appUrl,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-dvh bg-bg font-sans text-fg antialiased"
      >
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:border focus:border-line"
        >
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
