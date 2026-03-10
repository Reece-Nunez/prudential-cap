import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prudential Capital | Business Loans Made Simple",
  description:
    "Prudential Capital provides fast, flexible business funding solutions. Working capital loans, business lines of credit, and equipment financing from $2,000 to $2,000,000. Approvals in as little as 12 hours.",
  keywords: [
    "business loans",
    "working capital",
    "business line of credit",
    "equipment financing",
    "small business funding",
    "fast business loans",
    "Prudential Capital",
    "Las Vegas business loans",
  ],
  authors: [{ name: "Prudential Capital" }],
  openGraph: {
    title: "Prudential Capital | Business Loans Made Simple",
    description:
      "Fast, flexible business funding from $2,000 to $2,000,000. Same-day approvals, funding in 24 hours.",
    type: "website",
    locale: "en_US",
    siteName: "Prudential Capital",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prudential Capital | Business Loans Made Simple",
    description:
      "Fast, flexible business funding from $2,000 to $2,000,000. Same-day approvals, funding in 24 hours.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://www.prudentialcap.com" />
        <meta name="theme-color" content="#0f79be" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
