import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quant Research Dashboard",
  description: "MVP workspace for financial and macro research"
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
