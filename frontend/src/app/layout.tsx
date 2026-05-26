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
      <body className="appBody">
        <Sidebar />
        <main className="mainContent">
          {children}
        </main>
      </body>
    </html>
  );
}
