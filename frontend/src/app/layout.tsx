import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "VedaAI - Assessment Creator",
  description: "AI Assessment Creator for Teachers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px", marginLeft: "280px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
