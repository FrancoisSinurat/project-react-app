"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarDesktop } from "@/components/sidebar-desktop";
import { Home } from 'lucide-react';
import { Sidebar } from "@/components/sidebar";
import { MyProvider } from './context/context';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MyProvider>
          <Sidebar />
          <main className="ml-[230px] w-[80%] py-5">{children}</main>
        </MyProvider>
      </body>
    </html>
  );
}
