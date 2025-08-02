import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "College Football Fantasy | Power 4 Conferences",
  description: "Play fantasy football with the Power 4 conferences. Only elite matchups count - AP Top 25 & conference games!",
  keywords: "college football, fantasy football, SEC, ACC, Big 12, Big Ten, Power 4",
  authors: [{ name: "College Football Fantasy" }],
  openGraph: {
    title: "College Football Fantasy",
    description: "Elite college football fantasy with Power 4 conferences",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
