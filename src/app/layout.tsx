import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "TrafficDuck — Find where your customers are talking",
  description:
    "TrafficDuck finds the conversations your customers are having on Reddit, X, and LinkedIn—so you can join in, get traffic, and validate demand.",
  openGraph: {
    title: "TrafficDuck — Find where your customers are talking",
    description:
      "TrafficDuck finds the conversations your customers are having on Reddit, X, and LinkedIn—so you can join in, get traffic, and validate demand.",
    images: ["/duck-og.jpeg"],
    type: "website",
    siteName: "TrafficDuck",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrafficDuck — Find where your customers are talking",
    description:
      "TrafficDuck finds the conversations your customers are having on Reddit, X, and LinkedIn—so you can join in, get traffic, and validate demand.",
    images: ["/duck-og.jpeg"],
    creator: "@trafficduck",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
