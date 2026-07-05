import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdComPilot — MBA Consultant & AdCom",
  description:
    "AI MBA admissions consultant: school research, fit profiling, story discovery, and essays in your own voice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
